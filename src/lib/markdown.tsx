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
            className="text-[#2F6F6A] underline"
          />
        ),
        h1: (props) => <h1 className="text-xl font-bold my-3" {...props} />,
        h2: (props) => <h2 className="text-lg font-bold my-2" {...props} />,
        h3: (props) => <h3 className="text-base font-bold my-2" {...props} />,
        blockquote: (props) => (
          <blockquote
            className="border-l-4 border-[#2F6F6A] pl-4 italic my-2"
            {...props}
          />
        ),
        code: (props) => {
          const isInline = !String(props.children).includes("\n");
          if (isInline) {
            return (
              <code className="bg-gray-100 px-1 py-0.5 rounded text-sm" {...props} />
            );
          }
          return <code {...props} />;
        },
        pre: (props) => (
          <pre
            className="bg-gray-100 p-3 rounded overflow-x-auto my-2"
            {...props}
          />
        ),
        table: (props) => (
          <table
            className="min-w-full border-collapse border border-gray-300 my-2"
            {...props}
          />
        ),
        th: (props) => (
          <th
            className="border border-gray-300 px-2 py-1 bg-gray-50 text-left"
            {...props}
          />
        ),
        td: (props) => (
          <td className="border border-gray-300 px-2 py-1" {...props} />
        ),
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
