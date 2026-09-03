import {
  Bot,
  CandlestickChart,
  Globe,
  Megaphone,
  type LucideIcon,
} from "lucide-react";

export type ServiceAccent = "indigo" | "cyan";

export type Service = {
  slug: string;
  code: string;
  name: string;
  short: string;
  hook: string;
  icon: LucideIcon;
  accent: ServiceAccent;
  heroTitle: string;
  heroSub: string;
  problemTitle: string;
  problem: string[];
  symptoms: string[];
  approach: { title: string; body: string }[];
  deliverables: string[];
  stats: { value: string; label: string }[];
  seoTitle: string;
  seoDescription: string;
};

export const SERVICES: Service[] = [
  {
    slug: "custom-ai-agents",
    code: "SVC_01",
    name: "Custom AI Agents",
    short: "Custom AI Agents",
    hook: "Tailored AI automation built around your business's specific workflows and requirements.",
    icon: Bot,
    accent: "indigo",
    heroTitle: "AI agents built for your exact workflow — not someone else's template.",
    heroSub:
      "Off-the-shelf AI tools solve generic problems. I build custom agents that understand your data, your edge cases, and your processes — then automate them end to end with guardrails you control.",
    problemTitle: "Generic AI tools break the moment your workflow gets specific.",
    problem: [
      "Every business has processes that are almost standard but not quite. That gap is where off-the-shelf tools fail, where manual workarounds multiply, and where productivity leaks compound over months.",
      "Custom agents solve this by operating inside your actual systems — with your permissions, your data, and your approval gates — rather than forcing your process into a vendor's rigid mould.",
    ],
    symptoms: [
      "You've tried AI tools but had to work around them constantly",
      "Repetitive tasks that eat hours despite 'automation' being available",
      "Processes that require one person who holds all the context",
      "Copy-paste between systems that nobody has fixed for years",
    ],
    approach: [
      {
        title: "Process archaeology",
        body: "I shadow the workflow, document every branch and edge case, and quantify the time and error rate before writing a single line of code.",
      },
      {
        title: "Agent build with guardrails",
        body: "Agents run inside explicit permission scopes, with approval gates and full audit logging. Every action is replayable and explainable.",
      },
      {
        title: "Handoff & runbooks",
        body: "You get the code, the docs, the credentials and a runbook. I train your team to operate it without me — that's the whole point.",
      },
    ],
    deliverables: [
      "Process map & automation ROI model",
      "Production agents with permission scopes",
      "Approval gates & audit logging",
      "Human-in-the-loop exception handling",
      "Observability dashboard",
      "Runbooks + team training",
    ],
    stats: [
      { value: "60–80%", label: "of workflow steps typically automated" },
      { value: "100%", label: "of agent actions logged and replayable" },
      { value: "2–3 wk", label: "from kickoff to first agent in production" },
    ],
    seoTitle: "Custom AI Agents — bespoke workflow automation",
    seoDescription:
      "Custom AI agents built around your specific workflows: permission scopes, approval gates, audit logs and human-in-the-loop exception handling. Built by Larptech.",
  },
  {
    slug: "trading-agents",
    code: "SVC_02",
    name: "Trading Agents",
    short: "Trading Agents",
    hook: "AI-driven algorithmic trading systems and automation for financial markets.",
    icon: CandlestickChart,
    accent: "cyan",
    heroTitle: "Research velocity and risk discipline, automated for trading teams.",
    heroSub:
      "I build the AI research stack for trading teams: data pipelines, backtesting harnesses, signal monitoring and risk guardrails. Research and decision support — never blind auto-execution.",
    problemTitle: "Alpha research is 80% plumbing, not insight.",
    problem: [
      "Cleaning data, wiring backtests and monitoring drift consume most of a researcher's week. The best ideas stay ideas because the infrastructure to test them properly doesn't exist yet.",
      "Undisciplined risk is how strategies die quietly: without automated guardrails and regime monitoring, a strategy that worked last quarter bleeds this one — noticed in the P&L, not in the monitoring.",
    ],
    symptoms: [
      "Backtests take days of manual wiring to run",
      "Data quality issues discovered after a position is already on",
      "Strategy drift noticed in the P&L, not in monitoring",
      "Research thesis lives in someone's head, not a documented system",
    ],
    approach: [
      {
        title: "Data & backtest harness",
        body: "One pipeline for ingestion, cleaning and point-in-time correct backtests — a new idea goes from hypothesis to result in hours, not days.",
      },
      {
        title: "Signal research copilot",
        body: "AI-assisted factor research, literature scanning and hypothesis generation — with strict leakage checks before anything touches capital.",
      },
      {
        title: "Risk & drift guardrails",
        body: "Live monitoring of exposure, drawdown and regime drift, with hard stops and human sign-off gates. The system advises; people decide.",
      },
    ],
    deliverables: [
      "Point-in-time data pipeline",
      "Backtesting harness with leakage checks",
      "Signal monitoring & drift alerts",
      "Risk dashboard with hard limits",
      "Research knowledge base",
      "Thesis docs + handoff training",
    ],
    stats: [
      { value: "days→hrs", label: "hypothesis-to-backtest turnaround" },
      { value: "100%", label: "of exposure inside monitored risk limits" },
      { value: "0", label: "auto-executed trades without human sign-off" },
    ],
    seoTitle: "Trading Agents — AI research, signal & risk systems",
    seoDescription:
      "Point-in-time data pipelines, backtesting harnesses, signal monitoring and risk guardrails for systematic trading teams. Advice, never blind execution. Built by Larptech.",
  },
  {
    slug: "marketing-agents",
    code: "SVC_03",
    name: "Marketing Agents",
    short: "Marketing Agents",
    hook: "AI-powered content, campaign, and marketing automation tools built for your brand.",
    icon: Megaphone,
    accent: "indigo",
    heroTitle: "A marketing engine that runs in your brand voice, not a generic one.",
    heroSub:
      "I build AI content and campaign systems tuned to your specific voice, wired to your attribution, and measured on pipeline — not impressions or follower counts.",
    problemTitle: "Generic AI content sounds like everyone else.",
    problem: [
      "Most businesses treating AI as a content shortcut end up with output that's technically correct but tonally off — indistinguishable from the flood of AI-generated noise their audience already ignores.",
      "The fix isn't more prompting — it's a voice model built from your best-performing assets, with a feedback loop that learns what actually converts in your specific market.",
    ],
    symptoms: [
      "Campaign cadence collapses whenever one person is out",
      "AI content feels generic and doesn't match your brand voice",
      "No clear line between content spend and revenue",
      "Each channel has its own tool, login and disconnected report",
    ],
    approach: [
      {
        title: "Revenue-first audit",
        body: "I map your current funnel and identify the two channels with the fastest pipeline payback — no forty-channel boondoggle, no vanity metrics.",
      },
      {
        title: "Brand-voice content engine",
        body: "I tune a generation pipeline on your best-performing assets, with human review gates where they matter — and none where they don't.",
      },
      {
        title: "Closed-loop optimisation",
        body: "Performance data flows back into the system weekly. The engine learns what actually converts instead of guessing forever.",
      },
    ],
    deliverables: [
      "Brand-voice tuned content engine",
      "Programmatic SEO page system",
      "Email nurture sequences with auto-iteration",
      "Ad creative testing loop",
      "Weekly AI performance digest",
      "Attribution dashboard tied to revenue",
    ],
    stats: [
      { value: "3–5×", label: "content volume at the same headcount" },
      { value: "weekly", label: "ship cadence, enforced by the system" },
      { value: "1", label: "dashboard for every channel you run" },
    ],
    seoTitle: "Marketing Agents — AI content & campaign automation",
    seoDescription:
      "AI marketing systems built in your brand voice: content engines, programmatic SEO and nurture loops measured on pipeline. Built by Larptech.",
  },
  {
    slug: "website-development",
    code: "SVC_04",
    name: "Website Development",
    short: "Website Dev",
    hook: "Custom, modern websites designed and built end-to-end for your business.",
    icon: Globe,
    accent: "indigo",
    heroTitle: "A website that works as hard as your business — not a template dressed up.",
    heroSub:
      "I design and build fast, modern, conversion-focused websites from scratch: no page-builders, no template hacks, no bloated plugins. Just clean code that loads fast and represents your brand properly.",
    problemTitle: "Most websites look fine and perform poorly.",
    problem: [
      "A template site gets you online but rarely gets you customers. When every competitor uses the same Webflow or WordPress starter, differentiation disappears and performance becomes an afterthought.",
      "Speed, mobile experience and conversion architecture aren't nice-to-haves — they're the difference between a visitor bouncing and a lead captured. These are engineering decisions, not design tweaks.",
    ],
    symptoms: [
      "Your site is slow on mobile (Core Web Vitals failing)",
      "Visitors bounce without converting, but you don't know why",
      "The current site is a template you've outgrown",
      "You can't easily update content without breaking something",
    ],
    approach: [
      {
        title: "Conversion architecture",
        body: "Before any design, I map your visitor journey, identify the primary conversion action and structure the page hierarchy around it — not around what looks impressive.",
      },
      {
        title: "Design & build",
        body: "Custom design in Figma, then production-grade code (Next.js or equivalent). Mobile-first, accessible, and optimised for Core Web Vitals from day one.",
      },
      {
        title: "Handoff & CMS",
        body: "You get the codebase, a CMS for the content you need to update, deployment docs and a guide. No dependency on me to change a headline.",
      },
    ],
    deliverables: [
      "Full custom design (Figma source)",
      "Production-ready codebase (Next.js / React)",
      "Mobile-first, Core Web Vitals optimised",
      "CMS integration for editable content",
      "Basic SEO setup & meta tags",
      "Deployment + handoff docs",
    ],
    stats: [
      { value: "<2s", label: "target LCP on mobile (Core Web Vitals)" },
      { value: "100%", label: "custom — zero template components" },
      { value: "3–4 wk", label: "typical design-to-deploy timeline" },
    ],
    seoTitle: "Website Development — custom Next.js websites",
    seoDescription:
      "Custom, fast, conversion-focused websites built from scratch: Next.js, mobile-first, Core Web Vitals optimised, with full handoff. Built by Larptech.",
  },
];

export function getService(slug: string): Service | undefined {
  return SERVICES.find((s) => s.slug === slug);
}

export const SERVICE_OPTIONS: { value: string; label: string }[] = [
  ...SERVICES.map((s) => ({ value: s.slug, label: s.name })),
  { value: "not-sure", label: "Not sure yet — help me pick" },
];
