import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";

const allowedElements = [
  "p",
  "h1",
  "h2",
  "h3",
  "ul",
  "ol",
  "li",
  "code",
  "pre",
  "blockquote",
  "a",
  "strong",
  "em",
  "hr",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
];

const sanitizeSchema = {
  ...defaultSchema,
  tagNames: allowedElements,
  attributes: {
    ...defaultSchema.attributes,
    a: ["href", "title"],
    code: ["className"],
  },
  protocols: {
    ...defaultSchema.protocols,
    href: ["http", "https", "mailto"],
  },
};

export function Markdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[[rehypeSanitize, sanitizeSchema]]}
      components={{
        a: (props) => (
          <a
            {...props}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="text-accent underline underline-offset-2 hover:text-accent-hover break-words"
          />
        ),
        h1: (props) => <h1 className="text-xl font-bold mt-6 mb-2 first:mt-0" {...props} />,
        h2: (props) => <h2 className="text-lg font-bold mt-5 mb-2 first:mt-0" {...props} />,
        h3: (props) => <h3 className="text-base font-bold mt-4 mb-1.5 first:mt-0" {...props} />,
        blockquote: (props) => (
          <blockquote
            className="border-l-[3px] border-accent/50 bg-surface-2 rounded-r-lg pl-4 pr-3 py-2 my-3 text-muted"
            {...props}
          />
        ),
        code: (props) => {
          const isInline = !String(props.children).includes("\n");
          if (isInline) {
            return (
              <code
                className="mono rounded bg-surface-3 px-1.5 py-0.5 text-[0.85em]"
                {...props}
              />
            );
          }
          return <code className="mono" {...props} />;
        },
        pre: (props) => (
          <pre
            className="mono my-3 overflow-x-auto rounded-lg border border-line bg-surface-2 p-3 leading-relaxed"
            {...props}
          />
        ),
        table: (props) => (
          <table className="my-3 w-full border-collapse text-sm" {...props} />
        ),
        th: (props) => (
          <th
            className="border border-line bg-surface-3 px-2.5 py-1.5 text-left font-medium"
            {...props}
          />
        ),
        td: (props) => <td className="border border-line px-2.5 py-1.5" {...props} />,
        hr: (props) => <hr className="my-5 border-line" {...props} />,
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
