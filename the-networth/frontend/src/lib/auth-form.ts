export function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isUsername(value: string) {
  return /^[a-zA-Z0-9_]{3,20}$/.test(value.trim());
}
