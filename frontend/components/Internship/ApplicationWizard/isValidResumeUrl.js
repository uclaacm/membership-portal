export default function isValidResumeUrl(value) {
  const trimmed = (value ?? "").trim();
  if (!trimmed) return false;

  // require a literal http:// or https:// prefix
  if (!/^https?:\/\//i.test(trimmed)) return false;

  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
