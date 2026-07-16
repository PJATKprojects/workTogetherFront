import Link from "next/link";

import { ChatLauncher } from "@/components/chat/chat-launcher";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/ui/user-avatar";
import type { Locale } from "@/i18n/locales";
import { withLocale } from "@/i18n/paths";
import type { SiteMessages } from "@/messages/types";
import type { UserListItem } from "@/types";

export function StudentCard({
  student,
  labels,
  chatLabels,
  locale,
}: Readonly<{
  student: UserListItem;
  labels: SiteMessages["students"];
  chatLabels: SiteMessages["chat"];
  locale: Locale;
}>) {
  return (
    <article className="group relative flex h-full flex-col rounded-3xl border border-border bg-surface/80 p-5 transition duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_25px_55px_-30px_rgb(37_99_235/0.35)]">
      <div className="flex items-start justify-between gap-3">
        <UserAvatar
          name={student.userName}
          avatarUrl={student.avatarUrl}
          className="size-11 rounded-2xl"
        />
        <Badge tone="green">{labels.lookingForTeam}</Badge>
      </div>
      <h2 className="mt-4 text-xl font-semibold transition-colors duration-200 group-hover:text-primary-text">
        <Link
          href={withLocale(locale, `/users/${student.id}`)}
          className="focus-ring rounded-md after:absolute after:inset-0 after:content-['']"
        >
          {student.userName}
        </Link>
      </h2>
      <p className="mt-2 line-clamp-4 text-sm leading-6 text-muted-foreground">
        {student.userDescription}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {student.technologies.map((technology) => (
          <span
            key={technology}
            className="rounded-full bg-primary-soft px-2.5 py-1 text-xs text-primary-soft-foreground"
          >
            {technology}
          </span>
        ))}
      </div>
      <div className="relative z-10 mt-auto flex flex-wrap items-center gap-2 pt-5">
        <ChatLauncher
          recipientUserId={student.id}
          recipientName={student.userName}
          contextType="user"
          locale={locale}
          labels={chatLabels}
          compact
        />
        {student.githubProfile ? (
          <a
            href={student.githubProfile}
            target="_blank"
            rel="noreferrer"
            className="px-2 text-sm font-semibold text-primary-text hover:underline"
          >
            {labels.github} ↗
          </a>
        ) : null}
      </div>
    </article>
  );
}
