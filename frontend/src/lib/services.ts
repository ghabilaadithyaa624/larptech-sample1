import {
  Bot,
  CandlestickChart,
  Megaphone,
  ShieldCheck,
  ShoppingBag,
  Target,
  type LucideIcon,
} from "lucide-react";

export type ServiceAccent = "indigo";

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
    slug: "marketing-ai",
    code: "SVC_01",
    name: "Marketing AI",
    short: "Marketing AI",
    hook: "Content, campaigns and nurture that ship themselves — in your brand voice.",
    icon: Megaphone,
    accent: "indigo",
    heroTitle: "A marketing engine that ships every week, not every quarter.",
    heroSub:
      "We build AI content and campaign systems tuned to your brand voice, wired to your attribution, and measured on pipeline — not impressions.",
    problemTitle: "Marketing teams aren't short on tools. They're short on output.",
    problem: [
      "Every campaign needs a copywriter, a designer, an analyst and three approvals — so the calendar slips, the channel goes quiet, and growth becomes a function of whoever has bandwidth this week.",
      "Meanwhile, generic AI content makes brands sound like everyone else. Without a voice model and a feedback loop, more volume just means more noise at a lower standard.",
    ],
    symptoms: [
      "Campaign cadence collapses whenever one person is busy",
      "Content volume is capped by headcount, not by ideas",
      "No clear line between spend and pipeline",
      "Every channel has its own tool, login and report",
    ],
    approach: [
      {
        title: "Revenue-first audit",
        body: "We map your current funnel and pick the two channels with the fastest payback. No forty-channel boondoggle, no vanity metrics.",
      },
      {
        title: "Brand-voice content engine",
        body: "We tune a generation pipeline on your best-performing assets, with human review gates where they matter — and none where they don't.",
      },
      {
        title: "Closed-loop optimization",
        body: "Performance data flows back into the system weekly, so the engine learns what actually converts instead of guessing forever.",
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
    seoTitle: "Marketing AI — AI content & campaign systems",
    seoDescription:
      "LarpTech builds AI marketing systems: brand-voice content engines, programmatic SEO and nurture loops measured on pipeline, not impressions.",
  },
  {
    slug: "sales-ai",
    code: "SVC_02",
    name: "Sales AI",
    short: "Sales AI",
    hook: "An AI SDR that researches, qualifies and books while your closers close.",
    icon: Target,
    accent: "indigo",
    heroTitle: "Pipeline discipline without hiring more SDRs.",
    heroSub:
      "Signal-based prospecting, AI-drafted outreach with human approval, and a CRM that updates itself — so your sellers talk to buyers instead of doing data entry.",
    problemTitle: "Your sellers spend two days a week not selling.",
    problem: [
      "Research, CRM hygiene and follow-up drafts consume roughly 40% of a rep's week. That is time stolen directly from conversations that close revenue.",
      "And leads go cold fast: a prospect who waits 48 hours for a first touch is mostly gone. Speed-to-lead is a property of your systems, not of your team's motivation.",
    ],
    symptoms: [
      "Follow-ups slip the moment the quarter gets busy",
      "Reps rebuild the same account research from scratch every call",
      "The CRM reads like fiction by month end",
      "Speed-to-lead measured in days, not minutes",
    ],
    approach: [
      {
        title: "Signal model",
        body: "We define what a real buying signal looks like for your ICP — intent data, product usage, hiring, funding — and wire those triggers into a single prioritized queue.",
      },
      {
        title: "AI SDR with human gates",
        body: "Drafting, sequencing and qualification run on AI. Anything sent to a human being passes an approval step you control, until you decide otherwise.",
      },
      {
        title: "Self-writing CRM",
        body: "Calls summarized, fields updated, next steps scheduled automatically. Forecast accuracy stops depending on individual rep discipline.",
      },
    ],
    deliverables: [
      "ICP signal & lead scoring model",
      "AI SDR outreach sequences",
      "Meeting booking automation",
      "Call summarization & CRM autopilot",
      "Forecast & pipeline digest",
      "Playbook docs + team training",
    ],
    stats: [
      { value: "<5 min", label: "speed-to-lead on inbound, by design" },
      { value: "+30%", label: "meetings booked per rep (engagement target)" },
      { value: "0", label: "CRM fields filled in by hand" },
    ],
    seoTitle: "Sales AI — AI SDR, scoring & CRM autopilot",
    seoDescription:
      "Signal-based prospecting, AI-drafted outreach with human approval and a self-writing CRM. LarpTech builds sales AI systems that book pipeline.",
  },
  {
    slug: "ai-agents",
    code: "SVC_03",
    name: "AI Agents",
    short: "AI Agents",
    hook: "Custom agents that run back-office workflows end to end, with guardrails.",
    icon: Bot,
    accent: "indigo",
    heroTitle: "Hand the boring 60% of operations to agents.",
    heroSub:
      "We map your highest-cost repetitive workflows and build custom AI agents that execute them end to end — with approvals, audit logs and a human on the exceptions.",
    problemTitle: "Your ops team runs on half-finished automation and tribal knowledge.",
    problem: [
      "Every operations team has a graveyard of half-automated workflows: a Zapier here, a spreadsheet macro there, and one person who remembers how the invoicing edge cases work.",
      "Off-the-shelf bots break on the first exception. Without guardrails and observability, automation just becomes another thing someone has to babysit.",
    ],
    symptoms: [
      "One person is a single point of failure for a critical process",
      "Copy-paste between systems eats hours every day",
      "Errors surface days later, during reconciliation",
      "Past automation attempts abandoned at the first edge case",
    ],
    approach: [
      {
        title: "Workflow archaeology",
        body: "We shadow the process, document every branch and edge case, and quantify the hours and error rate before touching anything.",
      },
      {
        title: "Agent build with guardrails",
        body: "Agents execute inside explicit permissions, spending limits and approval gates. Every action is logged and replayable.",
      },
      {
        title: "Exception handoff",
        body: "When confidence drops, the agent escalates to a human with full context instead of guessing. You automate the 60%; humans own the 40% that needs judgment.",
      },
    ],
    deliverables: [
      "Process map & automation ROI model",
      "Production agents with permission scopes",
      "Approval gates & audit logging",
      "Human-in-the-loop exception queue",
      "Observability dashboard",
      "Runbooks + team training",
    ],
    stats: [
      { value: "60–80%", label: "of workflow steps typically automated" },
      { value: "100%", label: "of agent actions logged and replayable" },
      { value: "2–3 wk", label: "from kickoff to first agent in production" },
    ],
    seoTitle: "AI Agents — custom back-office automation with guardrails",
    seoDescription:
      "Custom AI agents built around your specific workflows: permission scopes, approval gates, audit logs and human-in-the-loop exception handling.",
  },
  {
    slug: "security-mssp",
    code: "SVC_04",
    name: "Security MSSP",
    short: "Security MSSP",
    hook: "24/7 AI-monitored security operations without enterprise MSSP pricing.",
    icon: ShieldCheck,
    accent: "indigo",
    heroTitle: "A security operations team that never blinks — at SMB cost.",
    heroSub:
      "AI-driven monitoring, triage and response across your cloud, endpoints and identity layer, with human-verified escalation on anything that matters.",
    problemTitle: "Breaches don't check your headcount.",
    problem: [
      "A 40-person company carries the same exposure surface as a 4,000-person one — with zero analysts watching it at 2am. Cloud misconfigurations and identity gaps are the norm, not the exception.",
      "Traditional MSSPs charge enterprise retainers and drown you in ticket noise. Alert fatigue is exactly why real incidents get missed.",
    ],
    symptoms: [
      "No one owns security outside of annual pen tests",
      "Cloud audit logs nobody has ever read",
      "Alerts from five tools and no triage process",
      "Compliance deadlines approaching with no evidence trail",
    ],
    approach: [
      {
        title: "Baseline & instrument",
        body: "We map your asset, identity and data surface, then instrument logging across cloud, SaaS and endpoints so detection has real signal to work with.",
      },
      {
        title: "AI triage at machine speed",
        body: "Detection models correlate and de-duplicate alerts, auto-contain known-bad patterns, and cut the noise before a human ever sees it.",
      },
      {
        title: "Human-verified response",
        body: "Anything with real severity reaches a named responder with a full timeline — contained, documented and ready for your compliance auditor.",
      },
    ],
    deliverables: [
      "24/7 monitoring & AI triage",
      "Auto-containment playbooks",
      "Identity & cloud posture reviews",
      "Incident response runbooks",
      "Compliance evidence pack (SOC 2 / ISO 27001)",
      "Monthly posture report",
    ],
    stats: [
      { value: "24/7", label: "monitoring coverage from day one" },
      { value: "−90%", label: "alert noise after AI triage (typical)" },
      { value: "<15 min", label: "to human escalation on critical severity" },
    ],
    seoTitle: "Security MSSP — AI-monitored security operations",
    seoDescription:
      "24/7 AI-driven monitoring, triage and response across cloud, endpoints and identity — with human-verified escalation and compliance-ready evidence.",
  },
  {
    slug: "ecommerce-ai",
    code: "SVC_05",
    name: "E-commerce AI",
    short: "E-commerce AI",
    hook: "Personalization, search and merchandising that adapt per shopper.",
    icon: ShoppingBag,
    accent: "indigo",
    heroTitle: "A storefront that rearranges itself for every shopper.",
    heroSub:
      "AI personalization across search, recommendations, pricing and merchandising — trained on your catalog and your margin, not on a generic playbook.",
    problemTitle: "Every visitor gets the same storefront. No two visitors have the same intent.",
    problem: [
      "Static merchandising leaves conversion and average order value on the table in every single session: irrelevant search results, 'best sellers' for everyone, and promos that discount margin on products that never needed it.",
      "And legacy personalization vendors want a six-month integration plus a revenue share. Most storefronts can't wait that long to fix a leaking funnel.",
    ],
    symptoms: [
      "Site search returns irrelevant or zero-result pages",
      "Recommendations are 'best sellers' for every shopper",
      "Promotions discount margin that didn't need discounting",
      "Cart abandonment with no recovery loop",
    ],
    approach: [
      {
        title: "Funnel telemetry",
        body: "We instrument session-level behavior to find where intent dies — search, PDP, cart, checkout — quantified before any model work begins.",
      },
      {
        title: "Shopper-level personalization",
        body: "Semantic search, dynamic recommendations and merchandising ranks that adapt per session, weighted by your margin data rather than raw clicks.",
      },
      {
        title: "Margin-aware promotion engine",
        body: "Discounts and bundles are proposed where they change behavior and suppressed where they only eat margin.",
      },
    ],
    deliverables: [
      "Semantic site search",
      "Per-shopper recommendation ranks",
      "Dynamic merchandising & sorting",
      "Margin-aware promo engine",
      "Cart & browse abandonment loops",
      "Experiment dashboard with revenue readout",
    ],
    stats: [
      { value: "+15–25%", label: "conversion lift target on personalized surfaces" },
      { value: "0", label: "zero-result search pages left behind" },
      { value: "weekly", label: "experiment cadence with automated readouts" },
    ],
    seoTitle: "E-commerce AI — personalization, search & merchandising",
    seoDescription:
      "Semantic search, per-shopper recommendations and margin-aware promotions. LarpTech builds e-commerce AI that lifts conversion and AOV.",
  },
  {
    slug: "trading-ai",
    code: "SVC_06",
    name: "Trading AI",
    short: "Trading AI",
    hook: "Research, signal and risk systems for systematic trading teams.",
    icon: CandlestickChart,
    accent: "indigo",
    heroTitle: "Research velocity and risk discipline, automated.",
    heroSub:
      "We build the AI research stack for trading teams: data pipelines, backtesting harnesses, signal monitoring and risk guardrails. Research and decision support — never blind auto-execution.",
    problemTitle: "Alpha research is 80% plumbing.",
    problem: [
      "Cleaning data, wiring backtests and monitoring drift consume most of a researcher's week. Your best minds spend their days on infrastructure instead of ideas.",
      "And undisciplined risk is how funds die: without automated guardrails and drift monitoring, a strategy that worked last quarter quietly bleeds this one.",
    ],
    symptoms: [
      "Backtests take days of manual wiring to run",
      "Data quality issues discovered after a position is on",
      "Strategy drift noticed in the P&L, not in monitoring",
      "Research thesis lives in someone's head",
    ],
    approach: [
      {
        title: "Data & backtest harness",
        body: "One pipeline for ingestion, cleaning and point-in-time correct backtests, so a new idea goes from hypothesis to result in hours.",
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
    seoTitle: "Trading AI — research, signal & risk systems",
    seoDescription:
      "Point-in-time data pipelines, backtesting harnesses, signal monitoring and risk guardrails for systematic trading teams. Advice, never blind execution.",
  },
];

export function getService(slug: string): Service | undefined {
  return SERVICES.find((s) => s.slug === slug);
}

export const SERVICE_OPTIONS: { value: string; label: string }[] = [
  ...SERVICES.map((s) => ({ value: s.slug, label: s.name })),
  { value: "not-sure", label: "Not sure yet — help me pick" },
];
