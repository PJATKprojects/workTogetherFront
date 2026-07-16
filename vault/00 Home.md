# WorkTogether Frontend — База знаний

> Vault для AI-агентов и разработчиков. Актуально на: **2026-07-16**.
> При изменении кода — обновляй соответствующую заметку.

## Карта заметок

- [[Архитектура]] — слои, структура src/, паттерны
- [[Маршруты]] — все страницы app/[locale]
- [[Auth]] — in-memory token, cookie refresh, OAuth callback
- [[Данные и API]] — services, hooks, query keys, типы
- [[Компоненты]] — структура components/
- [[i18n]] — локали, messages, middleware
- [[Стиль и UX]] — Tailwind, бейджи, состояния
- [[Ошибки]] — обработка HTTP-ошибок
- [[Запуск]] — dev/prod, env, порты
- [[Конвенции]] — правила кода и зоны ответственности

## Стек (кратко)

| Компонент | Технология                                 |
| --------- | ------------------------------------------ |
| Framework | Next.js **16.2.6** (App Router, Turbopack) |
| UI        | React **19.2.4**, Tailwind CSS 4           |
| Данные    | TanStack Query **5** + persistence         |
| HTTP      | Axios (`withCredentials`, auto-refresh)    |
| Rich text | TipTap **3**                               |
| Валидация | Zod 4 (схемы прямо в формах)               |
| i18n      | своя система (`en` / `uk`), НЕ next-intl   |
| Тема      | next-themes (dark/light)                   |

## Связанные документы

- Спецификация: `docs/PROJECT_SPEC.md` (корень репозитория)
- Backend vault: `WorkTogetherBack/vault/`
