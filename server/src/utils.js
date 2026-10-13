export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export const badRequest = (message) => new HttpError(400, message);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Trimmed string field; throws a 400 naming the field when it's missing or too long. */
export function str(value, label, { required = true, max = 200, min = 0 } = {}) {
  const s = typeof value === "string" ? value.trim() : "";
  if (!s) {
    if (required) throw badRequest(`${label} is required`);
    return "";
  }
  if (s.length < min) throw badRequest(`${label} must be at least ${min} characters`);
  if (s.length > max) throw badRequest(`${label} must be at most ${max} characters`);
  return s;
}

export function email(value) {
  const s = str(value, "Email", { max: 254 }).toLowerCase();
  if (!EMAIL_RE.test(s)) throw badRequest("Please enter a valid email address");
  return s;
}

export function intParam(value) {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) throw new HttpError(404, "Not found");
  return n;
}
