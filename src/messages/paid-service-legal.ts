import type { LegalSection } from "./types";

export const paidTerms: Record<"en" | "uk" | "pl", LegalSection> = {
  en: {
    heading: "15. Paid Pro access",
    body: [
      "The free plan allows recruitment for one active project and two applications per local calendar week (Monday to Monday). Other owned projects remain stored but inactive. Pro removes those two limits for the paid access period; it does not guarantee applicants, acceptance, teammates, or a project outcome.",
      "Pro is sold as a one-time prepaid period without automatic renewal: 1 month for PLN 20, 3 months for PLN 60, 6 months for PLN 100, or 12 months for PLN 180. The total price and period are shown again before the payment obligation is created. Web payments are securely processed by Stripe; we do not receive full payment-card details.",
      "Pro starts only after verified payment. If you expressly request immediate performance during the withdrawal period, access starts immediately and we send confirmation of the contract, price, access dates, and your request by email. When Pro ends, stored projects are not deleted; if more than one is recruiting, one remains active and the others are paused until you choose one or buy another period.",
      "A consumer who contracts at a distance generally has 14 days to withdraw. If you requested immediate performance and withdraw after access started, we may retain or request a proportionate amount for the service supplied up to withdrawal. Send a clear withdrawal statement to support@worktogether.app. Refunds are normally made to the original payment method. Nothing in this section limits mandatory consumer remedies, including rights for a non-conforming digital service.",
      "Purchases offered inside a native mobile app may be processed by Apple or Google and are also subject to the applicable store's checkout, billing, cancellation, and refund terms shown before purchase.",
    ],
  },
  uk: {
    heading: "15. Платний доступ Pro",
    body: [
      "Безкоштовний план дозволяє набір в один активний проєкт і дві заявки за локальний календарний тиждень (від понеділка до понеділка). Інші власні проєкти зберігаються неактивними. Pro знімає ці два обмеження на оплачений період, але не гарантує заявки, прийняття, учасників чи результат проєкту.",
      "Pro продається як одноразовий передплачений період без автоматичного продовження: 1 місяць за 20 PLN, 3 місяці за 60 PLN, 6 місяців за 100 PLN або 12 місяців за 180 PLN. Загальна ціна та період повторно показуються до виникнення обов’язку оплатити. Веб-платежі безпечно обробляє Stripe; ми не отримуємо повних даних платіжної картки.",
      "Pro починається лише після перевіреного платежу. Якщо ви прямо просите негайно почати надання послуги протягом строку відмови, доступ починається одразу, а підтвердження договору, ціни, дат доступу та вашого запиту надсилається email. Після завершення Pro проєкти не видаляються: якщо набір відкрито в кількох, один залишається активним, а решта призупиняються.",
      "Споживач, який уклав дистанційний договір, зазвичай має 14 днів для відмови. Якщо ви попросили негайно почати послугу й відмовляєтесь після активації, може бути пропорційно врахована частина послуги, вже надана до відмови. Надішліть однозначну заяву на support@worktogether.app. Повернення зазвичай здійснюється тим самим способом оплати. Цей розділ не обмежує обов’язкових прав споживача.",
      "Покупки в нативному мобільному застосунку можуть обробляти Apple або Google; до них також застосовуються умови оплати, скасування та повернення відповідного магазину, показані до покупки.",
    ],
  },
  pl: {
    heading: "11. Płatny dostęp Pro",
    body: [
      "Plan bezpłatny pozwala prowadzić rekrutację do jednego aktywnego projektu i wysłać dwa zgłoszenia w lokalnym tygodniu kalendarzowym (od poniedziałku do poniedziałku). Pozostałe własne projekty pozostają zapisane jako nieaktywne. Pro znosi te dwa limity na opłacony okres, lecz nie gwarantuje zgłoszeń, przyjęcia, członków zespołu ani wyniku projektu.",
      "Pro jest jednorazowym okresem opłaconym z góry, bez automatycznego odnowienia: 1 miesiąc za 20 PLN, 3 miesiące za 60 PLN, 6 miesięcy za 100 PLN albo 12 miesięcy za 180 PLN. Łączną cenę i okres pokazujemy ponownie przed powstaniem obowiązku zapłaty. Płatności internetowe bezpiecznie obsługuje Stripe; nie otrzymujemy pełnych danych karty płatniczej.",
      "Pro rozpoczyna się dopiero po zweryfikowanej płatności. Jeżeli wyraźnie zażądasz natychmiastowego rozpoczęcia usługi w okresie na odstąpienie, dostęp ruszy od razu, a potwierdzenie umowy, ceny, dat dostępu i Twojego żądania wyślemy emailem. Po zakończeniu Pro projekty nie są usuwane; jeżeli rekrutacja trwa w kilku, jeden pozostaje aktywny, a pozostałe zostają wstrzymane.",
      "Konsument zawierający umowę na odległość ma co do zasady 14 dni na odstąpienie. Jeżeli zażądałeś(-aś) natychmiastowego rozpoczęcia i odstąpisz po aktywacji, możemy rozliczyć proporcjonalnie usługę spełnioną do chwili odstąpienia. Jednoznaczne oświadczenie wyślij na support@worktogether.app. Zwrot wykonujemy co do zasady tą samą metodą płatności. Ten punkt nie ogranicza bezwzględnie obowiązujących praw konsumenta, w tym uprawnień przy niezgodności usługi cyfrowej z umową.",
      "Zakupy oferowane wewnątrz natywnej aplikacji mobilnej mogą obsługiwać Apple lub Google; stosują się również zasady płatności, anulowania i zwrotów danego sklepu pokazane przed zakupem.",
    ],
  },
};

export const paidPrivacy: Record<"en" | "uk" | "pl", LegalSection> = {
  en: {
    heading: "Payments and billing records",
    body: [
      "For a Pro purchase we process the selected package, amount, currency, payment status, provider identifiers, access dates, account email, and the recorded request for immediate performance. Stripe processes web card payments; Apple, Google, and RevenueCat may process or verify native purchases. WorkTogether does not store full card numbers or card security codes.",
      "We use this data to perform the paid contract, prevent fraud, handle refunds and complaints, prove consent, and meet accounting or legal duties. Billing records are restricted and retained only for the period required by applicable tax, accounting, limitation, and consumer-protection rules.",
    ],
  },
  uk: {
    heading: "Платежі та платіжні записи",
    body: [
      "Для покупки Pro ми обробляємо обраний пакет, суму, валюту, статус платежу, ідентифікатори провайдера, дати доступу, email акаунта та зафіксований запит на негайний початок послуги. Stripe обробляє веб-платежі карткою; Apple, Google і RevenueCat можуть обробляти або перевіряти мобільні покупки. WorkTogether не зберігає повні номери карток чи коди безпеки.",
      "Ці дані потрібні для виконання платного договору, запобігання шахрайству, повернень і скарг, підтвердження згоди та виконання бухгалтерських чи правових обов’язків. Доступ до платіжних записів обмежений, а строк зберігання визначається податковими, бухгалтерськими, позовними та споживчими вимогами.",
    ],
  },
  pl: {
    heading: "Płatności i zapisy rozliczeniowe",
    body: [
      "Przy zakupie Pro przetwarzamy wybrany pakiet, kwotę, walutę, status płatności, identyfikatory dostawcy, daty dostępu, email konta oraz zapis żądania natychmiastowego rozpoczęcia usługi. Stripe obsługuje internetowe płatności kartą; Apple, Google i RevenueCat mogą obsługiwać lub weryfikować zakupy mobilne. WorkTogether nie przechowuje pełnych numerów kart ani kodów zabezpieczających.",
      "Dane służą wykonaniu odpłatnej umowy, zapobieganiu oszustwom, obsłudze zwrotów i reklamacji, wykazaniu zgody oraz obowiązkom księgowym lub prawnym. Dostęp do zapisów jest ograniczony, a okres przechowywania wynika z właściwych przepisów podatkowych, rachunkowych, terminów przedawnienia i ochrony konsumenta.",
    ],
  },
};
