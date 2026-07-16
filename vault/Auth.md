# Auth на фронте

## Хранение токенов

| Токен               | Где                                                                          |
| ------------------- | ---------------------------------------------------------------------------- |
| Access JWT (15 мин) | **только память**: `lib/auth/token-store.ts` (+ подписчики для реактивности) |
| Refresh (14 дней)   | HttpOnly cookie `wt_refresh` (Path `/api/auth`) — JS его не видит            |

❌ Никакого localStorage для токенов.

## AuthProvider / useAuth

- `components/auth/auth-provider.tsx` + `hooks/use-auth.tsx`
- На mount: `POST /api/auth/refresh` (cookie уходит сама) → если ок, access в token-store + user в состояние
- API: `user`, `isAuthenticated`, `isLoading`, `login()`, `logout()`, `refreshSession()`

## Axios (`services/api.ts`)

- `withCredentials: true` — ОБЯЗАТЕЛЬНО (иначе cookie не уходит)
- Request-интерцептор: `Authorization: Bearer {tokenStore.get()}`
- 401-интерцептор: **single-flight** `refreshAuthSession()` → повтор исходного запроса; при провале — очистка token-store
- `baseURL` = `NEXT_PUBLIC_API_URL`

## Flows

### Login

`authService.login()` → `{ token, user }` → token в store, cookie поставил сервер.

### Register

`{ message, user }` **без токенов** → показать «проверьте почту». Логин возможен только после confirm.

### OAuth (Google/GitHub)

1. Кнопка → переход на `authService.oauthStartUrl(provider, returnUrl)` (API URL)
2. Провайдер → backend callback → backend ставит cookie → редирект на `/[locale]/auth/callback`
3. Страница callback вызывает `refreshSession()` → access в память → редирект на returnUrl

### Logout

`POST /api/auth/logout` → сервер чистит cookie + Redis; фронт чистит token-store.

## Backend-справка

Детали серверной стороны: `WorkTogetherBack/vault/Auth.md` (Redis-ключи, rotation, cookie-атрибуты).
