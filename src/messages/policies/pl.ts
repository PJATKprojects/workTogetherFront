import type { SiteMessages } from "../types";

export const plPolicyMessages = {
  cookies: {
    metaTitle: "Pliki cookies i pamięć przeglądarki — WorkTogether",
    metaDescription:
      "Niezbędna pamięć przeglądarki i opcjonalna anonimowa analityka urządzeń WorkTogether.",
    title: "Pliki cookies i pamięć przeglądarki",
    updated: "23 lipca 2026",
    intro:
      "WorkTogether korzysta z niezbędnej własnej pamięci przeglądarki oraz — wyłącznie po Twojej zgodzie — z minimalnej analityki urządzeń. Nie używamy cookies reklamowych, śledzenia między witrynami ani zewnętrznej analityki.",
    sections: [
      {
        heading: "1. Co zapisujemy",
        body: ["Poniższe elementy są własne i zapisywane przez WorkTogether w przeglądarce."],
        bullets: [
          "wt_refresh: plik HttpOnly służący do uwierzytelniania, zwykle przechowywany do 14 dni, rotowany przy odświeżeniu sesji oraz usuwany lub unieważniany po wylogowaniu.",
          "wt_locale: wybrany język interfejsu, przechowywany do jednego roku.",
          "theme w localStorage: wybór jasnego, ciemnego lub systemowego wyglądu, przechowywany do czasu usunięcia danych witryny.",
          "Wersjonowane szkice projektu, zgłoszenia i wiadomości w localStorage: do 30 dni; usuwane po udanym wysłaniu albo świadomym odrzuceniu. Pliki nigdy nie trafiają do szkicu.",
          "wt_privacy_choice_v1 w localStorage: zapisuje zgodę albo odmowę opcjonalnej analityki, czas wyboru i wersję polityki. Dzięki temu nie pytamy na każdej stronie; wpis pozostaje do zmiany wyboru lub usunięcia danych witryny.",
          "Subskrypcja push: tworzona dopiero po włączeniu powiadomień; przechowywana przez przeglądarkę, dostawcę push i WorkTogether do wyłączenia lub unieważnienia.",
        ],
      },
      {
        heading: "2. Opcjonalna anonimowa analityka urządzeń",
        body: [
          "Przy pierwszej wizycie baner daje równorzędny wybór: tylko pamięć niezbędna albo dodatkowa analityka. Analityka pozostaje wyłączona do chwili aktywnej zgody.",
          "Po zgodzie wysyłane jest jedno zdarzenie na sesję przeglądarki. Serwer od razu klasyfikuje żądanie i zapisuje wyłącznie czas zdarzenia, ogólną kategorię urządzenia (komputer, telefon, tablet lub inne), system operacyjny, rodzinę przeglądarki i wersję polityki zgody.",
        ],
        bullets: [
          "W zdarzeniach nie zapisujemy adresu IP, pełnego ciągu user agent, ID konta, identyfikatora reklamowego ani trwałego identyfikatora odwiedzającego.",
          "Statystyki służą wyłącznie do priorytetyzacji testów przeglądarek, urządzeń i responsywnego interfejsu.",
          "Zdarzenia przechowujemy do 180 dni, a administratorzy widzą wyłącznie zagregowane wykresy.",
        ],
      },
      {
        heading: "3. Twój wybór i wycofanie zgody",
        body: [
          "Akceptacja i odmowa są dostępne w pierwszym banerze w tej samej liczbie kroków. Wybór możesz zmienić w każdej chwili za pomocą ustawień na tej stronie.",
          "Wycofanie zatrzymuje przyszłe zdarzenia analityczne i nie wpływa na logowanie ani podstawowe funkcje. Ponieważ wcześniejsze zdarzenia nie zawierają ID odwiedzającego ani konta, nie można ich powiązać z Tobą w celu indywidualnego usunięcia.",
        ],
      },
      {
        heading: "4. Pamięć niezbędna i ustawienia przeglądarki",
        body: [
          "Możesz się wylogować, aby unieważnić aktywną sesję, wyłączyć push w profilu lub przeglądarce, odrzucić pojedynczy szkic albo usunąć dane WorkTogether w ustawieniach przeglądarki.",
          "Zablokowanie wszystkich niezbędnych cookies może uniemożliwić logowanie i działanie zamówionych funkcji.",
        ],
      },
      {
        heading: "5. Zmiany i kontakt",
        body: [
          "Aktualizujemy tę stronę po zmianie celu, dostawcy lub okresu przechowywania. Pytania: support@worktogether.app.",
        ],
      },
    ],
  },
  safety: {
    metaTitle: "Bezpieczeństwo, moderacja i nielegalne treści — WorkTogether",
    metaDescription:
      "Zgłoszenia społeczności, zawiadomienia DSA, decyzje moderacji i możliwości odwoławcze.",
    title: "Bezpieczeństwo, moderacja i nielegalne treści",
    updated: "18 lipca 2026",
    intro:
      "Ta polityka opisuje sposób zgłaszania ryzyka, podejmowania decyzji moderacyjnych oraz przekazywania przez dowolną osobę lub podmiot zawiadomienia o treści, która może być nielegalna.",
    sections: [
      {
        heading: "1. Wybierz właściwą ścieżkę",
        body: [
          "Zalogowany użytkownik może zgłosić osobę, projekt, wiadomość lub załącznik z odpowiedniego ekranu i może zablokować kontakt.",
          "Każdy, również bez konta, może użyć formularza poniżej do precyzyjnego zawiadomienia o treści hostowanej przez WorkTogether, którą uważa za nielegalną. Pomoc z kontem, żądania RODO i zwykłe reklamacje kieruj na support@worktogether.app.",
        ],
      },
      {
        heading: "2. Co powinno zawierać zawiadomienie",
        body: [
          "Podaj dokładny adres URL WorkTogether i konkretne wyjaśnienie, dlaczego treść jest nielegalna. Podaj imię i nazwisko, email oraz potwierdź prawdziwość i dobrą wiarę zgłoszenia.",
          "Przy podejrzeniu seksualnego wykorzystywania dziecka imię, nazwisko i email są opcjonalne. Nie załączaj, nie kopiuj i nie rozpowszechniaj nielegalnego materiału; wskaż jedynie lokalizację i dane potrzebne do identyfikacji.",
        ],
      },
      {
        heading: "3. Sposób rozpatrywania",
        body: [
          "Jeśli podasz email, potwierdzamy odbiór, zapisujemy numer i correlation ID oraz umieszczamy zawiadomienie w ograniczonej kolejce moderacji.",
          "Automatyczne zabezpieczenia mogą priorytetyzować oczywisty spam, ograniczać nadużycia albo wskazywać podobne sygnały, lecz końcową decyzję podejmuje moderator. Działamy terminowo, starannie, obiektywnie i bez arbitralności, uwzględniając kontekst, prawo, wagę ryzyka i prawa użytkowników.",
        ],
      },
      {
        heading: "4. Możliwe działania i uzasadnienie",
        body: [
          "Możemy nie podejmować działania, ograniczyć widoczność, usunąć treść, ograniczyć funkcję, zawiesić lub zamknąć konto, zabezpieczyć dowody albo zawiadomić właściwy organ, gdy wymaga tego prawo.",
          "Użytkownik, którego dotyczy decyzja, oraz zgłaszający — gdy mamy kontakt i prawo na to pozwala — otrzymują wynik, główne fakty i podstawę prawną lub regulaminową, informację o istotnym użyciu automatyzacji oraz dostępnych środkach odwoławczych. Możemy pominąć dane, których ujawnienie stwarza ryzyko prawne lub bezpieczeństwa.",
        ],
      },
      {
        heading: "5. Ponowne rozpatrzenie i nadużycia",
        body: [
          "O ponowne rozpatrzenie można poprosić ścieżką wskazaną w decyzji. Właściwy sąd, organ publiczny i certyfikowany organ pozasądowego rozstrzygania sporów pozostają dostępne, jeżeli przewiduje to prawo.",
          "Świadomie fałszywe, nadużyciowe lub powtarzalne zgłoszenia mogą zostać ograniczone. Zgłoszenie w dobrej wierze nie prowadzi do sankcji.",
        ],
      },
      {
        heading: "6. Bezpośrednie zagrożenie",
        body: [
          "WorkTogether nie jest służbą ratunkową. Jeżeli komuś grozi bezpośrednie niebezpieczeństwo, najpierw skontaktuj się z numerem alarmowym 112 lub Policją. Nie przesyłaj w formularzu haseł, dokumentów tożsamości, danych kart ani kopii nielegalnego materiału.",
        ],
      },
    ],
  },
  accessibility: {
    metaTitle: "Deklaracja dostępności — WorkTogether",
    metaDescription:
      "Cel dostępności WorkTogether, wspierane wzorce, braki w walidacji i kanał informacji zwrotnej.",
    title: "Deklaracja dostępności",
    updated: "18 lipca 2026",
    intro:
      "Dążymy do zgodności responsywnej aplikacji z WCAG 2.2 na poziomie AA. Jest to cel i stałe zobowiązanie, a nie deklaracja, że każda podstrona przeszła już niezależną i ręczną certyfikację z technologiami asystującymi.",
    sections: [
      {
        heading: "1. Projektowane wsparcie",
        body: [
          "Główne procesy projektujemy pod obsługę klawiaturą, widoczny fokus, semantyczne nagłówki i landmarki, etykiety, podsumowania błędów, komunikaty statusu, ograniczony ruch, wysoki kontrast oraz reflow przy wąskim ekranie i powiększeniu.",
          "Responsywna aplikacja webowa i PWA pozostają podstawowym produktem; do korzystania z głównych funkcji nie jest wymagana aplikacja natywna.",
        ],
      },
      {
        heading: "2. Edytor i treści użytkowników",
        body: [
          "Edytor tekstu, natywne listy wyboru, dialogi i obsługa plików są objęte testami dostępności. Właściciel projektu odpowiada za czytelny tekst, znaczące linki oraz dostępność przesłanych dokumentów i obrazów.",
        ],
      },
      {
        heading: "3. Stan weryfikacji",
        body: [
          "Automatyczne testy i przygotowane scenariusze wspierają rozwój, ale przed startem nadal wymagamy realnych przebiegów Chromium, Firefox i WebKit oraz ręcznych testów Safari z VoiceOver i przeglądarek Windows z NVDA lub JAWS.",
          "Renderowanie emaili, zoom 200–400%, tryb wysokiego kontrastu oraz długie teksty polskie i ukraińskie pozostają bramkami wydania do czasu zapisania dowodów.",
        ],
      },
      {
        heading: "4. Zgłoś barierę",
        body: [
          "Napisz na support@worktogether.app, podając URL, wykonywaną czynność, przeglądarkę i technologię asystującą oraz oczekiwany rezultat. Nie przesyłaj haseł ani kodów odzyskiwania.",
          "Potwierdzimy zgłoszenie, nadamy priorytet blokadom logowania i głównych procesów współpracy oraz opiszemy obejście, jeżeli natychmiastowa poprawka nie będzie możliwa.",
        ],
      },
    ],
  },
  policyHub: {
    metaTitle: "Polityki i bezpieczeństwo — WorkTogether",
    metaDescription:
      "Regulamin, prywatność, cookies, zasady społeczności, moderacja i dostępność dla pilotażu WorkTogether w Polsce.",
    eyebrow: "Start w Polsce",
    title: "Polityki, prawa i bezpieczeństwo",
    intro:
      "W jednym miejscu zebraliśmy zasady konta, danych, współpracy i moderacji. Punktem wyjścia są przepisy polskie i standardy UE; tam, gdzie ma to zastosowanie, zachowujesz również bezwzględnie obowiązujące prawa swojego kraju.",
    launchTitle: "Zakres pilotażu",
    launchBody:
      "Usługa na starcie jest bezpłatna, dostępna wyłącznie dla osób 18+ i działa jako responsywna aplikacja webowa. WorkTogether łączy współpracowników; nie jest pracodawcą, agencją zatrudnienia, dostawcą płatności ani stroną umów zespołu.",
    cards: {
      terms: {
        title: "Regulamin",
        description: "Umowa o konto, wymagania techniczne, zasady współpracy i reklamacje.",
        badge: "Umowa",
      },
      privacy: {
        title: "Polityka prywatności",
        description: "Cele i podstawy RODO, odbiorcy, retencja oraz prawa osób.",
        badge: "RODO",
      },
      cookies: {
        title: "Cookies i pamięć",
        description: "Niezbędne cookies, szkice lokalne, motyw i opcjonalny web push.",
        badge: "PKE",
      },
      community: {
        title: "Zasady społeczności",
        description: "Szacunek, uczciwe role, bezpieczeństwo, sankcje i odwołania.",
        badge: "Społeczność",
      },
      safety: {
        title: "Bezpieczeństwo i nielegalne treści",
        description: "Zgłoszenia, zawiadomienia DSA, decyzje moderacji i odwołania.",
        badge: "DSA",
      },
      accessibility: {
        title: "Deklaracja dostępności",
        description: "Cel WCAG, wspierane wzorce, braki w weryfikacji i kontakt.",
        badge: "Cel WCAG 2.2 AA",
      },
    },
  },
  illegalContentForm: {
    title: "Zawiadom o potencjalnie nielegalnej treści",
    intro:
      "Użyj formularza wyłącznie dla treści hostowanej przez WorkTogether. Dokładny URL i konkretne uzasadnienie umożliwiają sprawną decyzję.",
    emergency:
      "To nie jest kanał alarmowy. Jeżeli komuś grozi bezpośrednie niebezpieczeństwo, najpierw zadzwoń pod 112 lub skontaktuj się z Policją.",
    childSafetyNote:
      "Przy podejrzeniu seksualnego wykorzystywania dziecka imię, nazwisko i email są opcjonalne. Nigdy nie przesyłaj, nie kopiuj ani nie rozpowszechniaj materiału.",
    name: "Imię i nazwisko",
    nameHint: "Wymagane poza zawiadomieniem dotyczącym bezpieczeństwa dziecka.",
    email: "Email",
    emailHint:
      "Wymagany poza zawiadomieniem dotyczącym dziecka; służy do potwierdzenia i przekazania decyzji.",
    contentUrl: "Dokładny URL treści w WorkTogether",
    contentUrlHint: "Na przykład adres projektu lub profilu. Nie wklejaj zewnętrznej witryny.",
    category: "Kategoria",
    categories: {
      childSafety: "Bezpieczeństwo dziecka / podejrzenie wykorzystywania",
      threats: "Groźby lub nawoływanie do przemocy",
      hate: "Nielegalna mowa nienawiści",
      fraud: "Oszustwo",
      privacy: "Prywatność lub bezprawne ujawnienie",
      intellectualProperty: "Własność intelektualna",
      other: "Inna potencjalnie nielegalna treść",
    },
    legalReason: "Dlaczego uważasz treść za nielegalną",
    legalReasonHint:
      "Wskaż treść, istotne fakty i — jeśli znasz — naruszone prawo. Minimum 20 znaków.",
    goodFaith:
      "Potwierdzam, że według mojej najlepszej wiedzy zawiadomienie jest dokładne, kompletne i składane w dobrej wierze.",
    submit: "Wyślij zawiadomienie",
    submitting: "Wysyłanie…",
    successTitle: "Zawiadomienie przyjęte",
    successBody:
      "Zachowaj numer poniżej. Jeżeli podałeś(-aś) email, wysłaliśmy również potwierdzenie i przekażemy na niego decyzję.",
    referenceLabel: "Numer referencyjny",
    another: "Wyślij kolejne zawiadomienie",
    errors: {
      summary: "Popraw wskazane pola:",
      name: "Wpisz imię i nazwisko albo wybierz kategorię bezpieczeństwa dziecka.",
      email: "Wpisz poprawny email albo wybierz kategorię bezpieczeństwa dziecka.",
      contentUrl: "Wpisz dokładny adres http lub https w domenie WorkTogether.",
      legalReason: "Opisz potencjalną nielegalność w co najmniej 20 znakach.",
      goodFaith: "Potwierdź oświadczenie o dobrej wierze.",
      generic: "Nie udało się wysłać zawiadomienia. Sprawdź pola i spróbuj ponownie.",
    },
  },
} satisfies Pick<
  SiteMessages,
  "cookies" | "safety" | "accessibility" | "policyHub" | "illegalContentForm"
>;
