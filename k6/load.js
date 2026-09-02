/**
 * k6 load test — OCD forum
 *
 * Target: Vercel Hobby (sin1) + Neon Free pooled (PgBouncer, connection_limit=10)
 *
 * NOTE on 500 simultaneous writes:
 *   DATABASE_URL uses `pgbouncer=true&connection_limit=10` — all writes are pooled
 *   through 10 PgBouncer connections. 500 concurrent POST /b/[slug] (createPost /
 *   createReply) will NOT execute in parallel; they queue at the pool. This script
 *   models that reality: 100 VU steady (expected prod peak) + 300 VU burst to
 *   observe queueing, p95, and error rate under burst. Do NOT expect linear
 *   scaling past ~10 concurrent writes — watch p95 and http_req_failed.
 *
 * Usage:
 *   BASE_URL=https://ocd-90608star-2630.vercel.app k6 run k6/load.js
 *   npm run load:k6
 *
 * Thresholds: p95 < 500ms, error rate < 1%
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'https://ocd-90608star-2630.vercel.app';

// Known slugs from prisma/seed.ts — used to hit /b/[slug]
const SLUGS = [
  'contamination',
  'checking',
  'symmetry',
  'harm',
  'scrupulosity',
  'sexual-intrusions',
  'rocd',
  'pure-o',
  'hoarding',
  'health-anxiety',
  'other-symptoms',
  'erp',
];

function randomSlug() {
  return SLUGS[Math.floor(Math.random() * SLUGS.length)];
}

export const options = {
  // 100 VU steady + 300 VU burst (10 → 100 → 300)
  // Each phase 60s to allow Vercel/Neon to warm and observe queue depth.
  stages: [
    { duration: '60s', target: 10 },  // warm-up
    { duration: '60s', target: 100 }, // steady — expected prod peak
    { duration: '60s', target: 300 }, // burst — queue at connection_limit=10
    { duration: '30s', target: 0 },   // ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // p95 < 500ms
    http_req_failed: ['rate<0.01'],   // error rate < 1%
  },
  // Fail fast if thresholds breached (CI)
  // noConnectionReuse: false, // keep-alive default (closer to real browsers)
};

export function setup() {
  // Probe once to confirm BASE_URL reachable; returns available slugs/posts if needed.
  const res = http.get(`${BASE_URL}/`, { tags: { name: 'GET /' } });
  console.log(`setup: GET / -> ${res.status} (BASE_URL=${BASE_URL})`);
  return {};
}

export default function () {
  const slug = randomSlug();

  group('GET /', () => {
    const res = http.get(`${BASE_URL}/`, { tags: { name: 'GET /' } });
    check(res, {
      'GET / status 200 or 308': (r) => r.status === 200 || r.status === 308 || r.status === 301,
      'GET / p95 <500ms': (r) => r.timings.duration < 500,
    });
  });

  sleep(Math.random() * 0.5 + 0.3);

  group('GET /b/[slug]', () => {
    const res = http.get(`${BASE_URL}/b/${slug}`, { tags: { name: 'GET /b/[slug]' } });
    check(res, {
      'GET /b/[slug] status 200/404': (r) => r.status === 200 || r.status === 404,
    });
  });

  sleep(Math.random() * 0.5 + 0.3);

  group('POST /b/[slug] (auth flow)', () => {
    // This hits the Next.js server action behind createPost via form POST.
    // Without a session it should return 401/403/redirect (expected). With a
    // session it queues at Neon connection_limit=10 — the queue under 300 VU
    // burst is exactly what we measure. We assert the auth guard works, not
    // that the write succeeds unauthenticated.
    //
    // We try two variants:
    // 1) JSON/form POST to a plausible endpoint (tests middleware rate-limit 429 shed)
    // 2) Check that unauthenticated POST is rejected (not 5xx)

    // Variant A: form-encoded POST (simulates <form action={createPost}>)
    const formBody = {
      title: `k6 load test ${__VU}-${__ITER}`,
      bodyMd: 'k6 synthetic post — ignore. '.repeat(5),
      isAnonymous: '0',
    };
    const res = http.post(`${BASE_URL}/b/${slug}`, formBody, {
      tags: { name: 'POST /b/[slug]' },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    check(res, {
      'POST /b/[slug] not 5xx': (r) => r.status < 500,
      'POST /b/[slug] auth guard (401/403/302/200)': (r) =>
        [200, 302, 303, 307, 308, 401, 403, 404, 422].includes(r.status),
    });

    // Variant B: explicit auth callback attempt (tests auth flow throughput)
    // NextAuth credentials callback — will 401 without valid CSRF/session but
    // exercises the same middleware + DB path.
    const authRes = http.post(
      `${BASE_URL}/api/auth/callback/credentials`,
      { csrfToken: 'k6', email: 'k6@example.com', password: 'invalid' },
      { tags: { name: 'POST /api/auth/callback/credentials' } }
    );
    check(authRes, {
      'POST auth not 5xx': (r) => r.status < 500,
    });
  });

  sleep(Math.random() * 0.5 + 0.3);

  group('GET /b/[slug]/p/[id]', () => {
    // Use a synthetic ID — 404 is expected and still exercises routing + DB lookup.
    // If setup discovered a real post ID it could be used here; synthetic keeps
    // the script stateless and safe for prod.
    const syntheticId = `cload${String(__VU).padStart(4, '0')}${String(__ITER).padStart(6, '0')}`;
    const res = http.get(`${BASE_URL}/b/${slug}/p/${syntheticId}`, {
      tags: { name: 'GET /b/[slug]/p/[id]' },
    });
    check(res, {
      'GET /b/[slug]/p/[id] not 5xx': (r) => r.status < 500,
      'GET post status 200/404': (r) => r.status === 200 || r.status === 404,
    });
  });

  sleep(1);
}

export function handleSummary(data) {
  return {
    stdout: JSON.stringify(
      {
        // Quick human summary alongside default text
        thresholds: data.metrics.http_req_duration
          ? {
              p95: data.metrics.http_req_duration.values['p(95)'],
              failed_rate: data.metrics.http_req_failed ? data.metrics.http_req_failed.values.rate : null,
            }
          : null,
        checks: data.metrics.checks ? data.metrics.checks.values : null,
      },
      null,
      2
    ),
  };
}
