# Данные и API

## Services (`src/services/`)

| Service              | Методы                                                                                                                                           |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `api.ts`             | axios instance; `refreshAuthSession()`; интерцепторы (см. [[Auth]])                                                                              |
| `authService`        | `register`, `login`, `refresh`, `logout`, `oauthStartUrl`, `getApiErrorMessage`                                                                  |
| `userService`        | `getMyProfile`, `updateProfile`, `confirmEmail`, `getAll`, `getLookingForTeam`, `getById`                                                        |
| `projectService`     | `getAll`, `getById`, `getMy`, `create`, `update`, `remove`, `addPosition`, `updatePosition`, `deletePosition`, `closePosition`, `reopenPosition` |
| `applicationService` | `create`, `getMy`, `getByProject`, `updateStatus`, `withdraw`                                                                                    |
| `lookupService`      | `getRoles`, `getTechnologies`, `createTechnology`, `getProjectStatuses`, `getApplicationStatuses`                                                |
| `fileService`        | `upload` (multipart → `{ url }`)                                                                                                                 |

Все пути — `/api/...` (полный список endpoints: `WorkTogetherBack/vault/API.md`).

## Hooks (`src/hooks/`)

| Hook                                         | Роль                                                 |
| -------------------------------------------- | ---------------------------------------------------- |
| `use-auth.tsx`                               | AuthProvider + useAuth                               |
| `use-profile-query` / `use-profile-mutation` | мой профиль (чтение/обновление)                      |
| `use-user-query`                             | публичный профиль по id                              |
| `use-students-query`                         | looking-for-team список                              |
| `use-projects-query`                         | list / detail / my                                   |
| `use-project-mutations`                      | create/update/remove + позиции (CRUD, close, reopen) |
| `use-applications-query`                     | my + byProject                                       |
| `use-application-mutations`                  | apply / updateStatus / withdraw                      |
| `use-lookups-query`                          | справочники (долгий staleTime)                       |

После мутаций — `queryClient.invalidateQueries` затронутых ключей.

## Query keys (`lib/query/keys.ts`)

```
users:        all / me / lookingForTeam(filters) / detail(id)
projects:     all / list(filters) / detail(id) / my
applications: all / my / byProject(projectId)
lookups:      roles / technologies / projectStatuses / applicationStatuses
```

QueryClient: staleTime 60s, gcTime 10m (`lib/query/client.ts`).

## Types (`src/types/`)

| Файл             | Типы                                                                                                           |
| ---------------- | -------------------------------------------------------------------------------------------------------------- |
| `User.ts`        | `PublicUser`, `PrivateUser` (extends + userEmail, cv), `UserListItem`, `UpdateUserProfileDto`, `UserFilters`   |
| `Project.ts`     | `ProjectListItem`, `ProjectDetail`, `PositionDto`, Create/Update DTOs, `ProjectFilters`                        |
| `Application.ts` | `ApplicationDto` (**appliedAt**, attachmentUrl, message), `CreateApplicationDto`, `UpdateApplicationStatusDto` |
| `Lookup.ts`      | `Role`, `Technology`, `ProjectStatus`, `ApplicationStatus`                                                     |
| `Common.ts`      | `PagedResult<T>`, `ErrorResponse`, `PaginationParams`                                                          |

Поля camelCase — 1:1 с JSON backend. При изменении DTO на бэке — синхронизировать типы.

## Файлы

- `fileService.upload(file)` → `{ url: "/api/files/{name}" }`
- Для отображения — `resolveFileUrl(url)` из `lib/files.ts` (добавляет API origin)
- Используется: аватар, CV-вложение заявки (обязательное), вложения rich-text
