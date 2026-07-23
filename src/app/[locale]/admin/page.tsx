import { notFound } from "next/navigation";

import { AdminControlCenter } from "@/components/admin/admin-control-center";
import { AdminGuard } from "@/components/guards/admin-guard";
import { isLocale } from "@/i18n/locales";

const adminTabs = [
  "overview",
  "analytics",
  "moderation",
  "audit",
  "delivery",
  "jobs",
  "users",
  "deleted-users",
] as const;
type AdminTab = (typeof adminTabs)[number];

function isAdminTab(value: string | undefined): value is AdminTab {
  return adminTabs.some((tab) => tab === value);
}

export default async function AdminPage({
  params,
  searchParams,
}: Readonly<{
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ section?: string }>;
}>) {
  const { locale: rawLocale } = await params;
  const { section } = await searchParams;
  if (!isLocale(rawLocale)) notFound();

  return (
    <AdminGuard locale={rawLocale}>
      <AdminControlCenter
        locale={rawLocale}
        initialTab={isAdminTab(section) ? section : "overview"}
      />
    </AdminGuard>
  );
}
