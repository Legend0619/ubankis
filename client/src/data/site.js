// All marketing copy lives here so it can be edited without touching layout code.
// Names, clients, stats and testimonials are placeholders.

export const COMPANY = {
  name: "Ubenkis",
  legalName: "Ubenkis LLC",
  email: "support@ubenkis.com",
  phone: "(240) 685-2368",
  hours: "Mon–Fri, 9am–6pm CT",
  address: ["600 Congress Ave", "Austin, TX 78701"],
  socials: [
    ["LinkedIn", "https://www.linkedin.com/"],
    ["Instagram", "https://www.instagram.com/"],
    ["Facebook", "https://www.facebook.com/"],
  ],
};

export const SERVICES = [
  {
    slug: "web-design-development",
    name: "Web Design & Development",
    short: "Web Design",
    icon: "monitor",
    tagline: "Websites that turn visitors into customers.",
    summary: "Fast, conversion-focused websites built on the platform that fits your business.",
    description:
      "Your website is your hardest-working salesperson. We design and build sites that load fast, rank well and make it easy for visitors to call, book or buy, then keep them secure and up to date.",
    includes: [
      "Custom UX/UI design and brand-aligned visuals",
      "Responsive builds on WordPress, Webflow, Shopify or custom React",
      "E-commerce, booking and lead-capture flows",
      "Technical SEO, Core Web Vitals and accessibility",
      "Analytics, conversion tracking and A/B testing",
      "Managed hosting, security updates and support",
    ],
    outcomes: [["2.1×", "average lift in conversion rate"], ["<1.5s", "typical page load"], ["6–8 wks", "from kickoff to launch"]],
    faqs: [
      ["How long does a new website take?", "Most marketing sites launch in 6–8 weeks. E-commerce and custom builds typically take 8–14 weeks depending on integrations."],
      ["Can you redesign my existing site?", "Yes. We audit what's working today, keep your SEO equity through careful redirects, and rebuild around your goals."],
      ["Who owns the website?", "You do. You own the domain, design files and code, and can host it wherever you like."],
    ],
  },
  {
    slug: "digital-marketing",
    name: "Digital Marketing",
    short: "Digital Marketing",
    icon: "megaphone",
    tagline: "Campaigns measured by revenue, not clicks.",
    summary: "Paid search, paid social, SEO and email managed against the numbers that matter.",
    description:
      "We plan, launch and optimize multi-channel campaigns with transparent reporting. Every dollar is tracked from first click to closed deal so you know exactly what's working.",
    includes: [
      "Google Ads search, Performance Max and YouTube",
      "Meta (Facebook & Instagram) ads and creative testing",
      "SEO content strategy and on-page optimization",
      "Local SEO and Google Business Profile management",
      "Email and SMS campaigns and automations",
      "Monthly reporting with a dedicated strategist",
    ],
    outcomes: [["3.4×", "average return on ad spend"], ["−28%", "cost per lead in 90 days"], ["Weekly", "optimization cycles"]],
    faqs: [
      ["What budget do I need?", "We recommend at least $2,000/month in ad spend for paid campaigns to gather enough data to optimize. SEO and email have no minimum spend."],
      ["Are there long-term contracts?", "No. We work month to month after an initial 90-day ramp-up period."],
      ["Do I keep my ad accounts?", "Always. Campaigns run in accounts you own; we work as authorized partners."],
    ],
  },
  {
    slug: "influencer-marketing",
    name: "Influencer Marketing",
    short: "Influencer Marketing",
    icon: "users",
    tagline: "Authentic creators. Measurable reach.",
    summary: "Creator partnerships and UGC that build trust and drive sales.",
    description:
      "We match your brand with creators whose audiences actually buy, manage the campaign end to end, and turn the best content into high-performing ads.",
    includes: [
      "Creator discovery and audience-quality vetting",
      "Campaign strategy, briefs and creative direction",
      "Contracts, usage rights and FTC-compliant disclosures",
      "UGC production for ads and product pages",
      "Whitelisting and paid amplification",
      "Tracking links, promo codes and ROI reporting",
    ],
    outcomes: [["1,200+", "vetted creators in our network"], ["4.8%", "average engagement rate"], ["30 days", "to first live content"]],
    faqs: [
      ["Micro or macro influencers?", "Usually micro-creators (10k–100k followers) — they're more affordable and their audiences tend to engage and convert better."],
      ["Can we use the content in ads?", "Yes. We negotiate usage rights up front so you can run creator content in paid campaigns."],
      ["How do you measure results?", "Unique links and codes per creator, plus lift in branded search and direct traffic during campaigns."],
    ],
  },
  {
    slug: "ai-workforce",
    name: "AI Workforce Solutions",
    short: "AI Workforce",
    icon: "cpu",
    tagline: "AI agents that work alongside your team.",
    summary: "Automate the repetitive work so your people can focus on customers.",
    description:
      "We design, deploy and maintain AI agents that answer calls and chats, qualify leads, process documents and keep your systems in sync — trained on your business and supervised by your team.",
    includes: [
      "AI receptionists for phone, web chat and SMS",
      "Lead qualification and appointment booking",
      "Workflow automation across your existing tools",
      "Document intake, extraction and data entry",
      "Internal knowledge assistants for staff",
      "Monitoring, guardrails and ongoing tuning",
    ],
    outcomes: [["24/7", "coverage for inbound requests"], ["60%", "of routine tasks automated"], ["−18%", "average operating cost"]],
    faqs: [
      ["Will AI replace my staff?", "No — it takes on repetitive, high-volume tasks so your team can spend more time on work that needs a human."],
      ["Is customer data secure?", "Agents run with role-based access and encrypted storage, and we can deploy within your existing cloud for sensitive industries."],
      ["How long does a rollout take?", "A first agent is usually live in 2–4 weeks, starting with a pilot on one workflow."],
    ],
  },
  {
    slug: "software-development",
    name: "Software Development & Integrations",
    short: "Software & Integrations",
    icon: "plug",
    tagline: "Custom software that connects your business.",
    summary: "Web apps, dashboards and integrations that remove manual work.",
    description:
      "When off-the-shelf tools don't fit, we build what you need: customer portals, internal tools, dashboards and the integrations that connect your CRM, ERP, payments and marketing stack.",
    includes: [
      "Custom web applications and customer portals",
      "API design and third-party integrations",
      "CRM, ERP and accounting system sync",
      "Reporting dashboards and data pipelines",
      "Mobile-ready progressive web apps",
      "Maintenance, monitoring and support plans",
    ],
    outcomes: [["40+", "platforms integrated"], ["99.9%", "uptime on managed apps"], ["2-week", "delivery sprints"]],
    faqs: [
      ["Which technologies do you use?", "Mostly TypeScript, React, Node.js and Python on AWS, Azure or Google Cloud — chosen to fit your team and existing systems."],
      ["Do you work with our in-house developers?", "Yes. We can lead a project or extend your team, with shared repositories and code reviews."],
      ["What happens after launch?", "We offer support plans covering monitoring, security patches and continued feature work."],
    ],
  },
];

export const MARKETING_CHANNELS = [
  { name: "Google Ads", icon: "search", text: "Capture high-intent customers at the moment they search.", to: "digital-marketing" },
  { name: "Meta Ads", icon: "target", text: "Reach your ideal audience on Facebook and Instagram.", to: "digital-marketing" },
  { name: "SEO", icon: "trending", text: "Earn compounding organic traffic with content that ranks.", to: "digital-marketing" },
  { name: "Local SEO", icon: "pin", text: "Own the map pack and win customers in your area.", to: "digital-marketing" },
  { name: "Influencer Marketing", icon: "users", text: "Borrow trust from creators your customers follow.", to: "influencer-marketing" },
  { name: "Email Marketing", icon: "mail", text: "Turn subscribers into repeat customers on autopilot.", to: "digital-marketing" },
];

export const AI_DEV_ITEMS = [
  { name: "Web Design", icon: "monitor", text: "High-converting sites and landing pages.", to: "web-design-development" },
  { name: "Software Development", icon: "code", text: "Custom apps, portals and internal tools.", to: "software-development" },
  { name: "AI & Programmatic Resources", icon: "cpu", text: "AI agents and automated workflows that scale.", to: "ai-workforce" },
  { name: "APIs & Integrations", icon: "plug", text: "Connect your CRM, ERP, payments and more.", to: "software-development" },
];

export const INDUSTRIES = [
  { name: "Health & Wellness", icon: "heart", text: "Clinics, med spas, telehealth and wellness brands." },
  { name: "Industrial", icon: "factory", text: "Manufacturers, distributors and B2B suppliers." },
  { name: "E-commerce", icon: "cart", text: "DTC brands and online retailers." },
  { name: "Construction", icon: "hardhat", text: "Builders, remodelers and specialty contractors." },
  { name: "IT Companies", icon: "server", text: "MSPs, SaaS and technology service providers." },
  { name: "Home Services", icon: "home", text: "HVAC, plumbing, roofing, cleaning and more." },
];

// Fictional client names, styled as text logos.
export const CLIENTS = [
  ["Northwind Clinics", "serif"], ["HARBOR & PINE", "wide"], ["atlas build co.", "mono"], ["Brightline Dental", "sans"],
  ["SUMMIT HVAC", "bold"], ["Kestrel Logistics", "serif"], ["lumen skin studio", "light"], ["RIDGEWAY SUPPLY", "wide"],
  ["Copperleaf Home", "serif"], ["VERTEX IT", "bold"], ["Bluewater Plumbing", "sans"], ["meridian health", "mono"],
];

export const STATS = [
  ["250+", "businesses served"],
  ["$40M+", "client revenue influenced"],
  ["4.9★", "average client rating"],
  ["9 yrs", "in business"],
];

export const TESTIMONIALS = [
  { name: "Maria L.", role: "Owner, Brightline Dental", text: "New-patient bookings are up 70% since Ubenkis rebuilt our site and took over Google Ads. Reporting is clear and they're always reachable." },
  { name: "James C.", role: "GM, Summit HVAC", text: "Their AI receptionist answers every after-hours call and books the job. We stopped losing emergency calls to competitors overnight." },
  { name: "Priya S.", role: "Founder, Lumen Skin Studio", text: "The creator campaign sold out our launch inventory in nine days, and we're still running the UGC as ads." },
];

export const PROCESS = [
  ["Discover", "We learn your business, goals and numbers, and audit what's already in place."],
  ["Strategize", "You get a clear plan with priorities, timeline, budget and the KPIs we'll be measured on."],
  ["Build & launch", "Our team executes in short sprints with regular check-ins and no surprises."],
  ["Measure & grow", "Transparent reporting and continuous optimization to compound results."],
];

export const BUDGETS = ["Under $2,500/mo", "$2,500–$5,000/mo", "$5,000–$10,000/mo", "$10,000+/mo", "Not sure yet"];

export const serviceBySlug = (slug) => SERVICES.find((s) => s.slug === slug);
