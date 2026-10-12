import bcrypt from "bcryptjs";
import { tx } from "./db.js";

const CATEGORIES = [
  {
    slug: "testosterone", name: "Testosterone", icon: "⚡", tint: "#c9a45c",
    tagline: "Restore your energy, drive and strength.",
    description: "Low testosterone can quietly drain your energy, focus, libido and motivation. Our physicians use comprehensive labs to build a hormone protocol around your biology — then monitor and adjust it as you progress.",
    benefits: [
      { title: "More energy", text: "Wake up rested and stay sharp through the afternoon." },
      { title: "Lean muscle", text: "Better recovery and strength gains from the same training." },
      { title: "Libido & drive", text: "Restore desire, confidence and motivation." },
      { title: "Mood & focus", text: "Less brain fog, steadier mood, clearer thinking." },
    ],
    faqs: [
      ["How do I know if I have low T?", "Symptoms like fatigue, low libido and difficulty building muscle are common signs, but only bloodwork can confirm it. Every TRT plan starts with a lab panel."],
      ["Injections or oral?", "Most patients start on weekly injections, which offer the most stable levels. Enclomiphene is an oral option that supports your body's own production and preserves fertility."],
      ["How quickly will I feel a difference?", "Many patients notice better energy and mood within 3–6 weeks; body composition changes typically follow over 3–6 months."],
    ],
  },
  {
    slug: "weight-loss", name: "Weight Loss", icon: "🔥", tint: "#e0785a",
    tagline: "Medical weight loss that actually lasts.",
    description: "GLP-1 medications reduce appetite and cravings while improving blood sugar control. Paired with physician check-ins and nutrition guidance, patients lose an average of 15–20% of body weight.",
    benefits: [
      { title: "Fewer cravings", text: "Feel full sooner and stay satisfied longer." },
      { title: "Steady progress", text: "Doses are titrated gradually to minimize side effects." },
      { title: "Metabolic health", text: "Improved blood sugar, blood pressure and cholesterol." },
      { title: "Real support", text: "Monthly provider check-ins and nutrition coaching." },
    ],
    faqs: [
      ["Am I eligible for GLP-1 treatment?", "Generally adults with a BMI of 27+ with a weight-related condition, or 30+ without one. Your provider confirms eligibility during your consult."],
      ["Semaglutide or tirzepatide?", "Both are highly effective. Tirzepatide acts on two hormone pathways and shows greater average loss in trials; your provider will recommend the best fit."],
      ["What about side effects?", "Nausea is the most common and usually fades as your body adjusts. We start low and increase slowly."],
    ],
  },
  {
    slug: "peptides", name: "Peptides", icon: "🧬", tint: "#4fd1c5",
    tagline: "Recover faster. Sleep deeper. Perform better.",
    description: "Peptides are short chains of amino acids that signal specific processes in the body. Our providers prescribe evidence-informed protocols for recovery, sleep quality and body composition.",
    benefits: [
      { title: "Faster recovery", text: "Support tissue repair after training or injury." },
      { title: "Deeper sleep", text: "Support natural growth hormone release overnight." },
      { title: "Body composition", text: "Support fat loss and lean mass." },
      { title: "Pharmacy-grade", text: "Compounded by licensed U.S. 503A pharmacies." },
    ],
    faqs: [
      ["Are peptides safe?", "Prescribed peptides are compounded by licensed pharmacies and dosed by a physician who reviews your history and labs."],
      ["How are they taken?", "Most are small subcutaneous injections with an insulin-style needle. We include supplies and step-by-step video instructions."],
      ["Can I stack peptides?", "Some protocols combine peptides. Your provider will design a stack and schedule for your goals."],
    ],
  },
  {
    slug: "sexual-health", name: "Sexual Health", icon: "❤️", tint: "#d0577a",
    tagline: "Confidence when it counts.",
    description: "Clinically proven, FDA-approved ED treatments and libido support — prescribed online and delivered in discreet packaging.",
    benefits: [
      { title: "Proven results", text: "The same active ingredients as Viagra® and Cialis®." },
      { title: "Discreet", text: "Plain packaging and a private online consult." },
      { title: "Flexible", text: "Daily or as-needed options." },
      { title: "Affordable", text: "Generic pricing up to 90% less than brand." },
    ],
    faqs: [
      ["Daily or as-needed?", "Daily low-dose tadalafil keeps you ready anytime; sildenafil is taken about an hour before activity. Your provider can help you choose."],
      ["Is it safe with my other medications?", "ED medications can interact with nitrates and some blood pressure medicines. Always list your medications during intake."],
      ["How is it shipped?", "In unbranded packaging, typically within 48 hours of approval."],
    ],
  },
  {
    slug: "hair", name: "Hair Restoration", icon: "💈", tint: "#8a9bff",
    tagline: "Keep the hair you have. Regrow what you've lost.",
    description: "Finasteride and minoxidil are the two most studied treatments for male pattern hair loss. We offer oral and topical formulas, alone or combined.",
    benefits: [
      { title: "Stops shedding", text: "Finasteride blocks DHT, the main driver of hair loss." },
      { title: "Regrowth", text: "Minoxidil stimulates follicles to grow thicker hair." },
      { title: "Topical option", text: "Topical finasteride for lower systemic exposure." },
      { title: "Visible change", text: "Most see results within 3–6 months." },
    ],
    faqs: [
      ["When will I see results?", "Shedding typically slows in 2–3 months, with visible regrowth at 4–6 months. Consistency matters most."],
      ["Do I have to use it forever?", "Hair loss treatments work while you use them. Stopping usually means gradual return to your baseline."],
      ["What about side effects?", "Sexual side effects are uncommon (around 1–2%). Topical finasteride may reduce that risk further."],
    ],
  },
  {
    slug: "longevity", name: "Longevity", icon: "⏳", tint: "#9ad16b",
    tagline: "Invest in your healthspan.",
    description: "Comprehensive biomarker testing plus targeted therapies and supplements to help you feel better now and age well later.",
    benefits: [
      { title: "Know your numbers", text: "40+ biomarkers tracked over time." },
      { title: "Cellular energy", text: "NAD+ supports mitochondrial function." },
      { title: "Metabolic support", text: "Evidence-based options like metformin." },
      { title: "Daily foundations", text: "Third-party tested supplements." },
    ],
    faqs: [
      ["What's included in the lab panel?", "Hormones, thyroid, lipids, metabolic, inflammation, vitamins and a complete blood count — over 40 markers."],
      ["Do I need a prescription for supplements?", "No. Supplements ship right away; prescription items require a provider review."],
      ["How often should I test?", "We recommend a full panel every 6–12 months, or quarterly while adjusting a treatment."],
    ],
  },
];

// [slug, category, name, shortDesc, description, priceCents, unit, rx, best, rating, reviewCount, form, benefits, usage]
const PRODUCTS = [
  ["testosterone-cypionate", "testosterone", "Testosterone Cypionate", "Weekly injectable TRT with ongoing provider monitoring.",
    "Our most popular hormone therapy. Testosterone cypionate is a bioidentical testosterone delivered by a small weekly injection, keeping levels stable and predictable. Your plan includes dosing guidance, injection supplies and follow-up labs.",
    14900, "mo", 1, 1, 4.9, 2140, "vial",
    ["Bioidentical testosterone", "Injection supplies included", "Follow-up labs every 90 days", "Dose adjusted to your results"],
    "Inject subcutaneously or intramuscularly once or twice weekly as directed by your provider."],
  ["enclomiphene", "testosterone", "Enclomiphene Citrate", "Oral option that boosts your body's own testosterone.",
    "Enclomiphene signals your pituitary to produce more LH and FSH, increasing natural testosterone production while preserving fertility. A good fit for younger men or those who prefer to avoid injections.",
    9900, "mo", 1, 0, 4.8, 980, "bottle",
    ["No injections", "Preserves fertility", "Supports natural production", "Once-daily capsule"],
    "Take one capsule daily, or as directed by your provider."],
  ["hcg-therapy", "testosterone", "hCG Therapy", "Maintains testicular function and fertility on TRT.",
    "Human chorionic gonadotropin mimics LH to keep natural testosterone production and fertility active. Often prescribed alongside TRT.",
    12900, "mo", 1, 0, 4.7, 512, "vial",
    ["Supports fertility", "Pairs with TRT", "Maintains natural function", "Supplies included"],
    "Inject subcutaneously 2–3 times weekly as directed."],
  ["anastrozole", "testosterone", "Estrogen Balance", "Low-dose anastrozole to keep estradiol in range.",
    "When labs show elevated estradiol on TRT, a low dose of anastrozole can help restore balance and reduce side effects like water retention.",
    3900, "mo", 1, 0, 4.6, 301, "bottle",
    ["Lab-guided dosing", "Reduces water retention", "Supports mood stability", "Only when labs indicate"],
    "Take as directed by your provider, typically once or twice weekly."],
  ["semaglutide", "weight-loss", "Compounded Semaglutide", "Once-weekly GLP-1 for appetite control and steady loss.",
    "Semaglutide mimics the GLP-1 hormone to reduce appetite, slow digestion and improve blood sugar control. Doses are titrated gradually with monthly provider check-ins.",
    24900, "mo", 1, 1, 4.9, 3320, "vial",
    ["Once-weekly injection", "Average 15% body-weight loss", "Gradual dose titration", "Monthly provider check-ins"],
    "Inject subcutaneously once weekly on the same day each week."],
  ["tirzepatide", "weight-loss", "Compounded Tirzepatide", "Dual GIP/GLP-1 action for greater average loss.",
    "Tirzepatide activates both GIP and GLP-1 receptors. In clinical trials it produced an average of up to 20% body-weight loss.",
    34900, "mo", 1, 0, 4.9, 1870, "vial",
    ["Dual-hormone action", "Up to 20% average loss", "Once-weekly injection", "Nutrition coaching included"],
    "Inject subcutaneously once weekly as directed."],
  ["glp1-support-pack", "weight-loss", "GLP-1 Support Pack", "Electrolytes, fiber and protein to feel your best on GLP-1s.",
    "A monthly pack designed to reduce common GLP-1 side effects and protect lean mass: sugar-free electrolytes, prebiotic fiber and a clean whey isolate.",
    4900, "mo", 0, 0, 4.7, 820, "box",
    ["Reduces nausea & fatigue", "Protects lean muscle", "Supports digestion", "No prescription needed"],
    "Mix one electrolyte stick daily; one scoop protein and fiber as needed."],
  ["bpc-157", "peptides", "BPC-157", "Peptide researched for tissue repair and recovery.",
    "BPC-157 is a peptide studied for its role in supporting healing of tendons, ligaments, muscle and the gut lining.",
    12900, "mo", 1, 0, 4.7, 640, "vial",
    ["Supports tissue repair", "Gut health support", "Popular with athletes", "Supplies included"],
    "Inject subcutaneously once daily as directed, typically in 4–6 week cycles."],
  ["sermorelin", "peptides", "Sermorelin", "Supports natural growth hormone release, sleep and recovery.",
    "Sermorelin stimulates your pituitary to release growth hormone naturally, supporting deeper sleep, recovery and body composition.",
    17900, "mo", 1, 1, 4.8, 720, "vial",
    ["Deeper sleep", "Faster recovery", "Supports lean mass", "Natural GH release"],
    "Inject subcutaneously at bedtime, 5 nights per week."],
  ["cjc-ipamorelin", "peptides", "CJC-1295 / Ipamorelin", "A synergistic GH-releasing peptide blend.",
    "This blend pairs a GHRH analog with a selective GH secretagogue for a stronger, more sustained natural growth hormone pulse.",
    19900, "mo", 1, 0, 4.8, 455, "vial",
    ["Synergistic blend", "Recovery & sleep", "Body composition", "Supplies included"],
    "Inject subcutaneously at bedtime as directed."],
  ["tadalafil-daily", "sexual-health", "Tadalafil Daily", "Low-dose daily tablet for always-ready confidence.",
    "Daily tadalafil (the active ingredient in Cialis®) keeps you ready at any time without planning ahead, and may also ease urinary symptoms.",
    3900, "mo", 1, 1, 4.8, 1510, "bottle",
    ["Ready anytime", "Lasts up to 36 hours", "Generic pricing", "Discreet shipping"],
    "Take one tablet daily at about the same time."],
  ["sildenafil", "sexual-health", "Sildenafil", "Fast-acting, as-needed ED treatment.",
    "Sildenafil (the active ingredient in Viagra®) works in about 30–60 minutes and lasts 4–6 hours.",
    2900, "mo", 1, 0, 4.7, 1290, "bottle",
    ["Works in 30–60 min", "As-needed dosing", "Generic pricing", "Discreet shipping"],
    "Take one tablet about an hour before sexual activity. No more than once daily."],
  ["pt-141", "sexual-health", "PT-141", "Peptide that supports desire and arousal.",
    "PT-141 (bremelanotide) acts on the nervous system rather than blood flow to increase desire and arousal.",
    14900, "mo", 1, 0, 4.6, 388, "vial",
    ["Increases desire", "Works centrally", "As-needed use", "Supplies included"],
    "Inject subcutaneously 45 minutes before activity as directed."],
  ["hair-restore-kit", "hair", "Hair Restore Kit", "Oral finasteride + topical minoxidil serum.",
    "The two most proven hair loss treatments in one kit: finasteride to stop shedding and minoxidil serum to stimulate regrowth.",
    5900, "mo", 1, 1, 4.8, 1105, "kit",
    ["Two-pronged approach", "Stops shedding", "Stimulates regrowth", "Results in 3–6 months"],
    "Take one finasteride tablet daily; apply 1 mL serum to scalp twice daily."],
  ["topical-fin-min", "hair", "Topical Finasteride + Minoxidil", "Combination spray with lower systemic exposure.",
    "A compounded topical that combines finasteride and minoxidil in one spray for patients who prefer to avoid oral medication.",
    4900, "mo", 1, 0, 4.7, 640, "bottle",
    ["One daily spray", "No pills", "Lower systemic exposure", "Fast-drying formula"],
    "Apply 6–8 sprays to affected areas of the scalp once daily."],
  ["nad-injection", "longevity", "NAD+ Injection", "Cellular energy support for focus and vitality.",
    "NAD+ is a coenzyme involved in energy production and DNA repair that declines with age. Injectable NAD+ supports energy and mental clarity.",
    19900, "mo", 1, 0, 4.7, 430, "vial",
    ["Cellular energy", "Mental clarity", "Supports healthy aging", "Supplies included"],
    "Inject subcutaneously 2–3 times weekly as directed."],
  ["metformin", "longevity", "Metformin", "Metabolic support studied for healthy aging.",
    "Metformin improves insulin sensitivity and is being studied for its potential effects on aging. Prescribed after a review of your labs.",
    2900, "mo", 1, 0, 4.6, 260, "bottle",
    ["Insulin sensitivity", "Lab-guided", "Decades of safety data", "Low cost"],
    "Take with your evening meal as directed."],
  ["foundation-stack", "longevity", "Daily Foundation Stack", "Vitamin D3/K2, magnesium, zinc and omega-3.",
    "The essentials most adults are low in, in one monthly pack. Third-party tested for purity and potency.",
    4900, "mo", 0, 0, 4.8, 2210, "bottle",
    ["Third-party tested", "Covers common gaps", "Supports sleep & immunity", "No prescription needed"],
    "Take one daily packet with food."],
  ["at-home-lab-panel", "longevity", "Comprehensive Lab Panel", "40+ biomarkers including hormones, lipids and metabolic.",
    "Get a complete picture of your health at a partner lab or with an at-home kit. Results are reviewed with a licensed physician.",
    12900, "one-time", 0, 1, 4.9, 3010, "kit",
    ["40+ biomarkers", "At-home or in-lab", "Physician review included", "Results in 3–5 days"],
    "Schedule a lab visit or use the at-home kit; fasting for 8–12 hours is recommended."],
];

const PLANS = [
  ["essential", "Essential", "Get started with expert care and lab-guided treatment.", 4900,
    ["Initial physician consult", "Annual lab panel", "Treatment plan & refills", "Secure messaging"]],
  ["optimize", "Optimize", "Our most popular plan for ongoing optimization.", 9900,
    ["Everything in Essential", "Quarterly labs & follow-ups", "Dedicated care coordinator", "10% off all treatments", "Free 2-day shipping"]],
  ["elite", "Elite", "Concierge-level longevity and performance care.", 19900,
    ["Everything in Optimize", "Unlimited provider visits", "Advanced biomarker testing", "Custom peptide protocols", "20% off all treatments"]],
];

const REVIEWS = [
  ["testosterone-cypionate", "Marcus T.", 5, "Feel ten years younger", "I didn't realize how low my energy had been. Labs, consult and meds were all handled online and the dosing has been dialed in perfectly."],
  ["testosterone-cypionate", "Ryan P.", 5, "Professional and fast", "Provider was thorough, explained my labs line by line. First shipment arrived in two days."],
  ["semaglutide", "Jenna R.", 5, "Down 34 lbs", "The provider adjusted my dose when I had nausea and it went away. Monthly check-ins keep me on track."],
  ["semaglutide", "Chris L.", 4, "Works, be patient", "Slow start while titrating but by month three the results were obvious."],
  ["sermorelin", "David K.", 5, "Sleep is night and day", "Recovery after training is so much better. Packaging is discreet and support replies quickly."],
  ["tadalafil-daily", "Anonymous", 5, "Exactly what I needed", "Easy consult, generic price, and it just works."],
  ["hair-restore-kit", "Sam W.", 5, "Shedding stopped", "Four months in and my crown is visibly fuller."],
  ["at-home-lab-panel", "Priya N.", 5, "So much detail", "The physician walked me through every marker. Worth it."],
];

export function seed(db) {
  const adminHash = bcrypt.hashSync("admin1234", 10);
  const demoHash = bcrypt.hashSync("demo1234", 10);

  tx(() => {
    const insCat = db.prepare(`INSERT INTO categories (slug, name, icon, tint, tagline, description, benefits, faqs, sort)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    CATEGORIES.forEach((c, i) =>
      insCat.run(c.slug, c.name, c.icon, c.tint, c.tagline, c.description, JSON.stringify(c.benefits), JSON.stringify(c.faqs), i));

    const insProd = db.prepare(`INSERT INTO products
      (slug, kind, category_slug, name, short_desc, description, price_cents, unit, plan_key, rx, best_seller, rating, review_count, form, benefits, usage, sort)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    PRODUCTS.forEach(([slug, cat, name, short, desc, price, unit, rx, best, rating, count, form, benefits, usage], i) =>
      insProd.run(slug, "product", cat, name, short, desc, price, unit, null, rx, best, rating, count, form, JSON.stringify(benefits), usage, i));

    PLANS.forEach(([key, name, desc, monthly, perks], i) => {
      const annual = Math.round((monthly * 12 * 0.8) / 100) * 100;
      insProd.run(`${key}-monthly`, "membership", null, `${name} Membership`, desc, desc, monthly, "mo", key, 0, key === "optimize" ? 1 : 0, 5, 0, "card", JSON.stringify(perks), "", i);
      insProd.run(`${key}-annual`, "membership", null, `${name} Membership (Annual)`, desc, desc, annual, "yr", key, 0, key === "optimize" ? 1 : 0, 5, 0, "card", JSON.stringify(perks), "", i);
    });

    const insReview = db.prepare(`INSERT INTO reviews (product_id, author, rating, title, body)
      VALUES ((SELECT id FROM products WHERE slug = ?), ?, ?, ?, ?)`);
    REVIEWS.forEach((r) => insReview.run(...r));

    const insUser = db.prepare(`INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES (?, ?, ?, ?, ?)`);
    insUser.run("admin@ubankis.com", adminHash, "Ada", "Admin", "admin");
    insUser.run("demo@ubankis.com", demoHash, "Demo", "Patient", "customer");
  });
}
