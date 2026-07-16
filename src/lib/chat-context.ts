import type { Locale } from "@/i18n/locales";
import { withLocale } from "@/i18n/paths";
import type { SiteMessages } from "@/messages/types";
import type { ChatContext } from "@/types";

export function chatContextLabel(context: ChatContext, labels: SiteMessages["chat"]): string {
  if (context.type === "project") {
    return labels.projectContext.replace("{project}", context.projectName || `#${context.id}`);
  }
  if (context.type === "application") {
    return labels.applicationContext
      .replace("{role}", context.roleName || "—")
      .replace("{project}", context.projectName || `#${context.id}`);
  }
  return labels.directContext;
}

export function chatContextHref(context: ChatContext, otherUserId: number, locale: Locale): string {
  if (context.projectId) return withLocale(locale, `/projects/${context.projectId}`);
  return withLocale(locale, `/users/${otherUserId}`);
}
