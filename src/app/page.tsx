import Link from "next/link";
import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Footer";

const FEATURES = [
  {
    title: "Semantic Search",
    description:
      "Search by meaning, not keywords. pgvector-powered similarity search finds the right passage even when your question doesn't match the document's exact wording.",
    icon: (
      <path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm9 2-4.35-4.35" />
    ),
  },
  {
    title: "Grounded, Cited Answers",
    description:
      "Every answer is generated strictly from retrieved passages, with clear source citations. If it isn't in your documents, DocuMind says so instead of guessing.",
    icon: (
      <>
        <path d="M12 3 4 6v6c0 5 3.5 8.5 8 9 4.5-.5 8-4 8-9V6l-8-3Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
  },
  {
    title: "PDF & DOCX Support",
    description:
      "Upload PDFs and Word documents directly. DocuMind extracts the text, splits it into chunks, and embeds it automatically — no manual prep required.",
    icon: (
      <>
        <path d="M6 3h9l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
        <path d="M15 3v5h5" />
        <path d="M8.5 13.5h7M8.5 17h4.5" />
      </>
    ),
  },
  {
    title: "Built for Teams",
    description:
      "Multi-tenant from the ground up. Each organization's documents, conversations, and usage stay isolated, with role-based access for admins and members.",
    icon: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
        <circle cx="17.5" cy="9.5" r="2.3" />
        <path d="M15.8 13.3A5.2 5.2 0 0 1 21.5 18.5" />
      </>
    ),
  },
  {
    title: "Real-time Streaming",
    description:
      "Answers stream in token by token as they're generated, powered by Google Gemini — so you're reading a response, not staring at a spinner.",
    icon: <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" />,
  },
  {
    title: "Usage Visibility",
    description:
      "Track embedding and chat token usage per organization, with rate limiting built in from day one to keep costs predictable.",
    icon: (
      <>
        <path d="M4 20V10M12 20V4M20 20v-7" />
      </>
    ),
  },
];

const STEPS = [
  {
    step: "01",
    title: "Upload",
    description: "Drag and drop a PDF or Word document into your workspace.",
  },
  {
    step: "02",
    title: "Ingest & Embed",
    description:
      "DocuMind extracts the text, splits it into overlapping chunks, and generates a vector embedding for each one.",
  },
  {
    step: "03",
    title: "Ask",
    description: "Type a question in plain language, right alongside the document.",
  },
  {
    step: "04",
    title: "Get a Cited Answer",
    description:
      "DocuMind retrieves the most relevant passages and streams back an answer with clear source citations.",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-full flex-col bg-white text-foreground dark:bg-black">
      <Nav />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(120,120,255,0.12),transparent)]" />
          <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 sm:py-28 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="inline-flex items-center rounded-full border border-black/[.08] px-3 py-1 text-xs font-medium text-zinc-600 dark:border-white/[.145] dark:text-zinc-400">
                AI-powered document intelligence
              </span>
              <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
                Ask your documents anything.
                <br />
                Get answers you can trust.
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-8 text-zinc-600 dark:text-zinc-400">
                DocuMind turns your team&apos;s PDFs and Word docs into a searchable
                knowledge base. Ask questions in plain language and get grounded
                answers with citations — no hallucinations, no digging through files.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/sign-in"
                  className="flex h-12 items-center justify-center rounded-full bg-foreground px-6 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
                >
                  Get Started
                </Link>
                <a
                  href="#how-it-works"
                  className="flex h-12 items-center justify-center rounded-full border border-black/[.08] px-6 text-sm font-medium transition-colors hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-white/[.06]"
                >
                  See how it works
                </a>
              </div>
            </div>

            {/* Mock chat preview */}
            <div className="relative">
              <div className="rounded-2xl border border-black/[.08] bg-zinc-50 p-4 shadow-xl shadow-black/5 dark:border-white/[.08] dark:bg-zinc-950">
                <div className="flex items-center gap-2 border-b border-black/[.06] pb-3 dark:border-white/[.08]">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                  <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
                  <div className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
                  <span className="ml-2 text-xs font-medium text-zinc-500">
                    Q3-vendor-agreement.pdf
                  </span>
                </div>
                <div className="mt-4 flex justify-end">
                  <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-foreground px-4 py-2 text-sm text-background">
                    What&apos;s our notice period for cancellation?
                  </div>
                </div>
                <div className="mt-3 max-w-[85%] rounded-2xl rounded-tl-sm border border-black/[.06] bg-white px-4 py-3 text-sm leading-6 dark:border-white/[.08] dark:bg-black">
                  Either party may cancel with{" "}
                  <span className="font-medium">60 days&apos; written notice</span>{" "}
                  before the renewal date.
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                      Source 1 · §4.2
                    </span>
                    <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                      Source 2 · §4.4
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What we're building */}
        <section className="border-y border-black/[.08] bg-zinc-50 dark:border-white/[.08] dark:bg-zinc-950/50">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
              <div>
                <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  What we&apos;re building
                </h2>
                <p className="mt-4 text-zinc-600 dark:text-zinc-400">
                  A multi-tenant SaaS where organizations upload internal documents
                  and their team members ask questions in natural language —
                  and get answers grounded in those documents, with source citations.
                </p>
              </div>
              <div className="space-y-4">
                <div className="rounded-xl border border-black/[.08] bg-white p-5 dark:border-white/[.08] dark:bg-black">
                  <h3 className="font-medium text-red-600 dark:text-red-400">
                    The problem
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                    Teams have knowledge locked inside unstructured documents.
                    Keyword search fails the moment your phrasing doesn&apos;t
                    match the document&apos;s phrasing — so answers stay buried.
                  </p>
                </div>
                <div className="rounded-xl border border-black/[.08] bg-white p-5 dark:border-white/[.08] dark:bg-black">
                  <h3 className="font-medium text-emerald-600 dark:text-emerald-400">
                    The solution
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                    DocuMind uses semantic vector search to match by meaning, not
                    keywords, then feeds the matching chunks to an LLM to generate
                    a grounded, cited answer — no hallucinations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="mx-auto max-w-6xl px-6 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Everything you need to chat with your documents
            </h2>
            <p className="mt-4 text-zinc-600 dark:text-zinc-400">
              Built on retrieval-augmented generation, so every answer stays
              tethered to your team&apos;s actual documents.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-black/[.08] p-6 transition-colors hover:border-black/[.16] dark:border-white/[.08] dark:hover:border-white/[.2]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {feature.icon}
                  </svg>
                </div>
                <h3 className="mt-4 font-medium">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section
          id="how-it-works"
          className="border-y border-black/[.08] bg-zinc-50 dark:border-white/[.08] dark:bg-zinc-950/50"
        >
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                How it works
              </h2>
              <p className="mt-4 text-zinc-600 dark:text-zinc-400">
                From upload to answer in four steps.
              </p>
            </div>

            <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((item) => (
                <div key={item.step} className="relative">
                  <span className="text-sm font-semibold text-zinc-400 dark:text-zinc-600">
                    {item.step}
                  </span>
                  <h3 className="mt-2 font-medium">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-6xl px-6 py-20">
          <div className="flex flex-col items-center gap-6 rounded-3xl bg-foreground px-6 py-16 text-center text-background sm:px-16">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Ready to put your documents to work?
            </h2>
            <p className="max-w-xl text-zinc-300 dark:text-zinc-700">
              Sign in, upload your first document, and start asking questions —
              grounded, cited, and ready in minutes.
            </p>
            <Link
              href="/sign-in"
              className="flex h-12 items-center justify-center rounded-full bg-background px-6 text-sm font-medium text-foreground transition-opacity hover:opacity-90"
            >
              Get Started
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
