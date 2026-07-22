import { notFound } from "next/navigation";

import { PwaInstallPage, type PwaInstallPageLabels } from "@/components/pwa-install-page";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getMessages } from "@/i18n/config";
import { isLocale, type Locale } from "@/i18n/locales";

const labels: Record<Locale, PwaInstallPageLabels> = {
  en: {
    eyebrow: "Optional website shortcut",
    title: "Add WorkTogether to your device",
    body: "This adds the website as a shortcut with its own window. There is no separate App Store or Google Play download.",
    install: "Add WorkTogether",
    installing: "Opening browser prompt…",
    installed: "WorkTogether is already added to this device.",
    unavailableTitle: "Use your browser menu",
    unavailableBody:
      "This browser is not offering one-click installation right now. You can keep using the website normally.",
    desktopHint:
      "Chrome or Edge: open the browser menu and choose “Install WorkTogether” or “Install app”.",
    iosHint: "iPhone or iPad: tap Share, then choose “Add to Home Screen”.",
  },
  uk: {
    eyebrow: "Необов’язковий ярлик сайту",
    title: "Додайте WorkTogether на свій пристрій",
    body: "Сайт буде додано як ярлик і відкриватиметься в окремому вікні. Окремого завантаження з App Store чи Google Play немає.",
    install: "Додати WorkTogether",
    installing: "Відкриваємо запит браузера…",
    installed: "WorkTogether уже додано на цей пристрій.",
    unavailableTitle: "Скористайтеся меню браузера",
    unavailableBody:
      "Зараз браузер не пропонує встановлення однією кнопкою. Сайтом можна й надалі користуватися як звичайно.",
    desktopHint:
      "Chrome або Edge: відкрийте меню браузера й виберіть «Установити WorkTogether» або «Установити застосунок».",
    iosHint: "iPhone або iPad: натисніть «Поділитися», потім «На початковий екран».",
  },
  pl: {
    eyebrow: "Opcjonalny skrót strony",
    title: "Dodaj WorkTogether do urządzenia",
    body: "Strona zostanie dodana jako skrót i będzie otwierana we własnym oknie. Nie ma osobnej aplikacji w App Store ani Google Play.",
    install: "Dodaj WorkTogether",
    installing: "Otwieranie komunikatu przeglądarki…",
    installed: "WorkTogether jest już dodany do tego urządzenia.",
    unavailableTitle: "Użyj menu przeglądarki",
    unavailableBody:
      "Przeglądarka nie oferuje teraz instalacji jednym kliknięciem. Nadal możesz normalnie korzystać ze strony.",
    desktopHint:
      "Chrome lub Edge: otwórz menu przeglądarki i wybierz „Zainstaluj WorkTogether” albo „Zainstaluj aplikację”.",
    iosHint: "iPhone lub iPad: stuknij Udostępnij, a potem „Dodaj do ekranu początkowego”.",
  },
};

export default async function InstallPage({
  params,
}: Readonly<{ params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const messages = getMessages(locale);

  return (
    <>
      <SiteHeader locale={locale} nav={messages.nav} />
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto flex w-full max-w-6xl flex-1 items-center px-4 py-12 sm:px-6 sm:py-20"
      >
        <PwaInstallPage labels={labels[locale]} />
      </main>
      <SiteFooter footer={messages.footer} locale={locale} />
    </>
  );
}
