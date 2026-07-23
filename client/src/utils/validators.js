export function isValidEmail(email) {
  return typeof email === 'string' && email.includes('@');
}
