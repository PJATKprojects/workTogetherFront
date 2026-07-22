export const MIN_PASSWORD_LENGTH = 8;

export function isPasswordValid(password: string) {
  return password.length >= MIN_PASSWORD_LENGTH;
}
