/**
 * Canonical copy structure. Keys are invariant across locales — only string values change.
 * Source of truth for keys: English module (`en.ts`).
 */
export type SiteMessages = {
  meta: {
    title: string;
    description: string;
  };
  nav: {
    brandWordmark: string;
    projects: string;
    howItWorks: string;
    login: string;
    signUp: string;
    themeToggleAria: string;
    localeMenuButtonAria: string;
    localeEnglishAria: string;
    localeUkrainianAria: string;
  };
  home: {
    heroPill: string;
    heroTitle: string;
    heroSubtitle: string;
    ctaPublish: string;
    ctaBrowse: string;
    stats: {
      one: { value: string; label: string };
      two: { value: string; label: string };
      three: { value: string; label: string };
    };
    paths: {
      title: string;
      subtitle: string;
      founder: {
        title: string;
        body: string;
        link: string;
      };
      teammate: {
        title: string;
        body: string;
        link: string;
      };
    };
    how: {
      title: string;
      subtitle: string;
      steps: {
        projectCard: { title: string; body: string };
        expectations: { title: string; body: string };
        applications: { title: string; body: string };
      };
    };
    sampleCard: {
      label: string;
      title: string;
      description: string;
      tags: readonly [string, string, string, string];
      replies: string;
      details: string;
    };
    ctaBanner: {
      title: string;
      subtitle: string;
      primary: string;
      secondary: string;
    };
  };
  footer: {
    tagline: string;
    login: string;
    signUp: string;
    projects: string;
  };
  authLogin: {
    metaTitle: string;
    metaDescription: string;
    eyebrow: string;
    title: string;
    subtitle: string;
    emailLabel: string;
    emailPlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    showPassword: string;
    hidePassword: string;
    forgotPassword: string;
    submit: string;
    divider: string;
    google: string;
    github: string;
    oauthSoon: string;
    noAccount: string;
    signUpCta: string;
    backHome: string;
    panelLine1: string;
    panelLine2: string;
    illustrationAlt: string;
    heroChipLive: string;
    heroChipMatched: string;
  };
  authForgot: {
    metaTitle: string;
    metaDescription: string;
    title: string;
    hint: string;
    backToLogin: string;
  };
};
