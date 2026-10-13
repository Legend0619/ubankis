import bcrypt from "bcryptjs";

const SAMPLE_LEADS = [
  ["analysis", "Maria Lopez", "maria@brightlinedental.example", "(512) 555-0110", "Brightline Dental", "https://brightlinedental.example",
    ["digital-marketing", "web-design-development"], "$2,500–$5,000/mo", "Three locations, want more new-patient bookings from Google."],
  ["contact", "James Carter", "james@summithvac.example", null, "Summit HVAC", null,
    ["ai-workforce"], null, "Interested in an AI receptionist to answer after-hours calls and book service visits."],
  ["analysis", "Priya Shah", "priya@lumenskin.example", "(646) 555-0187", "Lumen Skin Studio", "https://lumenskin.example",
    ["influencer-marketing", "digital-marketing"], "$5,000–$10,000/mo", "Launching a new skincare line in spring."],
];

export function seed(db) {
  db.prepare("INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES (?, ?, ?, ?, 'admin')")
    .run("admin@ubenkis.com", bcrypt.hashSync("admin1234", 10), "Ada", "Admin");
  const insert = db.prepare(`INSERT INTO leads (source, name, email, phone, company, website, services, budget, message)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  for (const [source, name, mail, phone, company, website, services, budget, message] of SAMPLE_LEADS) {
    insert.run(source, name, mail, phone, company, website, JSON.stringify(services), budget, message);
  }
}
