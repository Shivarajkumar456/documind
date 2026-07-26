import type { UIMessage } from "ai";

export function ChatMessage({ message }: { message: UIMessage }) {
  const isUser = message.role === "user";
  const text = message.parts
    .filter((p): p is Extract<typeof p, { type: "text" }> => p.type === "text")
    .map((p) => p.text)
    .join("");

  if (!text) return null;

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm leading-6 ${
          isUser
            ? "rounded-tr-sm bg-foreground text-background"
            : "rounded-tl-sm border border-black/[.08] dark:border-white/[.08]"
        }`}
      >
        {text}
      </div>
    </div>
  );
}
