export function formatDate(sqlDate, withTime = false) {
  // SQLite CURRENT_TIMESTAMP is UTC without a zone marker.
  const d = new Date(sqlDate.includes("T") ? sqlDate : `${sqlDate.replace(" ", "T")}Z`);
  return d.toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
  });
}
