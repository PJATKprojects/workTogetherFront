import type { Locale } from "./locales";

const roles: Record<string, Record<Locale, string>> = {
  frontend_developer: {
    en: "Frontend developer",
    uk: "Frontend-розробник",
    pl: "Frontend developer",
  },
  backend_developer: {
    en: "Backend developer",
    uk: "Backend-розробник",
    pl: "Backend developer",
  },
  fullstack_developer: {
    en: "Full-stack developer",
    uk: "Full-stack розробник",
    pl: "Full-stack developer",
  },
  ui_ux_designer: {
    en: "UI/UX designer",
    uk: "UI/UX дизайнер",
    pl: "Projektant UI/UX",
  },
  qa_engineer: { en: "QA engineer", uk: "QA інженер", pl: "Inżynier QA" },
  project_manager: {
    en: "Project manager",
    uk: "Менеджер проєкту",
    pl: "Kierownik projektu",
  },
  devops_engineer: {
    en: "DevOps engineer",
    uk: "DevOps інженер",
    pl: "Inżynier DevOps",
  },
  mobile_developer: {
    en: "Mobile developer",
    uk: "Мобільний розробник",
    pl: "Programista aplikacji mobilnych",
  },
  data_scientist: {
    en: "Data scientist",
    uk: "Data scientist",
    pl: "Data scientist",
  },
  ml_engineer: { en: "ML engineer", uk: "ML інженер", pl: "Inżynier ML" },
  data_analyst: { en: "Data analyst", uk: "Аналітик даних", pl: "Analityk danych" },
  security_engineer: {
    en: "Security engineer",
    uk: "Інженер безпеки",
    pl: "Inżynier bezpieczeństwa",
  },
  game_developer: {
    en: "Game developer",
    uk: "Розробник ігор",
    pl: "Programista gier",
  },
  business_analyst: {
    en: "Business analyst",
    uk: "Бізнес-аналітик",
    pl: "Analityk biznesowy",
  },
  product_designer: {
    en: "Product designer",
    uk: "Продуктовий дизайнер",
    pl: "Projektant produktu",
  },
  content_writer: {
    en: "Content writer",
    uk: "Автор контенту",
    pl: "Autor treści",
  },
  marketing_specialist: {
    en: "Marketing specialist",
    uk: "Маркетолог",
    pl: "Specjalista ds. marketingu",
  },
};

const statuses: Record<string, Record<Locale, string>> = {
  open: { en: "Open", uk: "Відкритий", pl: "Otwarty" },
  in_progress: { en: "In progress", uk: "У роботі", pl: "W trakcie" },
  finished: { en: "Finished", uk: "Завершений", pl: "Zakończony" },
  sent: { en: "Sent", uk: "Надіслано", pl: "Wysłane" },
  accepted: { en: "Accepted", uk: "Прийнято", pl: "Przyjęte" },
  rejected: { en: "Rejected", uk: "Відхилено", pl: "Odrzucone" },
  draft: { en: "Draft", uk: "Чернетка", pl: "Szkic" },
  viewed: { en: "Viewed", uk: "Переглянуто", pl: "Wyświetlone" },
  shortlisted: {
    en: "Shortlisted",
    uk: "У короткому списку",
    pl: "Krótka lista",
  },
  interview: { en: "Interview", uk: "Співбесіда", pl: "Rozmowa" },
  trial: { en: "Trial", uk: "Пробний період", pl: "Okres próbny" },
  withdrawn: { en: "Withdrawn", uk: "Відкликано", pl: "Wycofane" },
  expired: { en: "Expired", uk: "Прострочено", pl: "Wygasłe" },
};

export function localizeRole(role: { code?: string; name: string }, locale: Locale) {
  const code =
    role.code ||
    Object.entries(roles).find(
      ([, labels]) => labels.en.toLowerCase() === role.name.trim().toLowerCase()
    )?.[0];
  return (code && roles[code]?.[locale]) || role.name;
}

export function localizeStatus(
  status: { code?: string; name?: string; statusName?: string },
  locale: Locale
) {
  const fallback = status.name || status.statusName || "";
  const normalized = fallback.trim().toLowerCase().replaceAll(" ", "_");
  const code =
    status.code ||
    (normalized === "pending" ? "sent" : undefined) ||
    Object.entries(statuses).find(
      ([, labels]) => labels.en.toLowerCase().replaceAll(" ", "_") === normalized
    )?.[0];
  return (code && statuses[code]?.[locale]) || fallback;
}
