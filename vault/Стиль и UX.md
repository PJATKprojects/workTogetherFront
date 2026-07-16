# Стиль и UX

## Визуальный язык

- Tailwind CSS 4, mobile-first
- Dark/light через next-themes — каждый цвет с `dark:`-вариантом
- Карточки: `rounded-xl border shadow-sm`
- «Campus startup» эстетика: градиенты, pill-кнопки, `ambient-background`
- Анимации: `reveal-on-scroll`, параллакс на login

## Статус-бейджи

| Статус      | Цвет       |
| ----------- | ---------- |
| Open        | green      |
| In Progress | blue       |
| Finished    | gray       |
| Pending     | yellow     |
| Accepted    | green/blue |
| Rejected    | red        |

Компонент: `applications/application-status-badge.tsx`, `ui/badge.tsx`.

## Состояния экранов

Каждый список/деталь обязан иметь:

1. **Loading** — skeleton (`ui/loading-skeleton`)
2. **Empty** — `ui/empty-state` + CTA («Создайте первый проект»)
3. **Error** — сообщение + retry (refetch)
4. **Success** — данные

## Формы

- Zod-схема в файле формы
- Ошибки валидации под полями
- Серверные ошибки — из `getApiError()` (`lib/api-error.ts`)
- Submit disabled во время мутации
- Никакого optimistic UI

## Лимиты полей (Zod, синхронно с backend)

| Поле            | Max  |
| --------------- | ---- |
| userName        | 80   |
| userDescription | 1000 |
| projectName     | 120  |
| description     | 5000 |
| requirements    | 2000 |
| URL-поля        | 2048 |
