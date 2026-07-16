let accessToken: string | null = null;

type TokenListener = (token: string | null) => void;
const listeners = new Set<TokenListener>();

export const tokenStore = {
  get: () => accessToken,
  set: (token: string | null) => {
    accessToken = token;
    listeners.forEach((listener) => listener(token));
  },
  clear: () => {
    accessToken = null;
    listeners.forEach((listener) => listener(null));
  },
  subscribe: (listener: TokenListener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
