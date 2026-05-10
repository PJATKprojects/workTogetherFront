import type { SiteMessages } from "./types";

/** Default site locale — canonical copy. */
export const en: SiteMessages = {
  meta: {
    title: "WorkTogether — teams for your projects",
    description:
      "For builders who want a team around their idea, and makers who want to join projects that already have direction — projects, roles, and applications in one place.",
  },
  nav: {
    brandWordmark: "WorkTogether",
    projects: "Projects",
    howItWorks: "How it works",
    login: "Log in",
    signUp: "Sign up",
    themeToggleAria: "Switch between light and dark theme",
    localeMenuButtonAria: "Language",
    localeEnglishAria: "English",
    localeUkrainianAria: "Ukrainian",
  },
  home: {
    heroPill: "Where ideas meet teammates",
    heroTitle: "Build your crew or join a project you believe in",
    heroSubtitle:
      "One space for founders looking for collaborators — and for people who can't wait to ship on someone else's great idea.",
    ctaPublish: "Publish an idea",
    ctaBrowse: "Browse projects",
    stats: {
      one: { value: "24/7", label: "Explore roles and open projects anytime" },
      two: { value: "Profiles", label: "Skills and expectations in one place" },
      three: { value: "Direct", label: "No middlemen—you align expectations together" },
    },
    paths: {
      title: "Two journeys, one outcome",
      subtitle: "Pitch your own build or attach to something that's already underway.",
      founder: {
        title: "I have an idea",
        body: "Outline the vision, roles, and what you're looking for — from design to backend.",
        link: "Create a project",
      },
      teammate: {
        title: "I want find a team",
        body: "Skim active projects, check stack and involvement style, apply where goals match.",
        link: "Find a project",
      },
    },
    how: {
      title: "A calm start — no needless noise",
      subtitle:
        "We don't replace conversations; we structure them so it's faster to spot a good mutual fit.",
      steps: {
        projectCard: {
          title: "Project brief",
          body: "Goal, stage, roles, responsibilities — surfaced in one card.",
        },
        expectations: {
          title: "Clear expectations",
          body: "Time commitment, compensation, remote or on-site — up front.",
        },
        applications: {
          title: "Short applications",
          body: "Bite-sized responses with relevant experience.",
        },
      },
    },
    sampleCard: {
      label: "Sample listing",
      title: "Freelancer crew SaaS",
      description:
        "Looking for a frontend engineer (React) and product designer — MVP in two months, equity.",
      tags: ["React", "TypeScript", "Remote", "Part-time"],
      replies: "3 replies this week",
      details: "Details",
    },
    ctaBanner: {
      title: "Ready to team up?",
      subtitle:
        "Create an account, fill out your profile, then publish a project or apply to something that fits.",
      primary: "Create account",
      secondary: "Open the showcase",
    },
  },
  footer: {
    tagline: "Better together.",
    projects: "Projects",
    login: "Log in",
    signUp: "Sign up",
  },
  authLogin: {
    metaTitle: "Log in — WorkTogether",
    metaDescription:
      "Sign in to publish projects, apply to teams, and keep your collaborations in sync.",
    eyebrow: "Welcome back",
    title: "Log in to your space",
    subtitle: "Ideas move faster when the right people find each other—pick up where you left off.",
    emailLabel: "Email",
    emailPlaceholder: "you@company.com",
    passwordLabel: "Password",
    passwordPlaceholder: "Enter your password",
    showPassword: "Show password",
    hidePassword: "Hide password",
    forgotPassword: "Forgot password?",
    submit: "Sign in",
    divider: "Or continue with",
    google: "Google",
    github: "GitHub",
    oauthSoon: "Soon",
    noAccount: "New here?",
    signUpCta: "Create an account",
    backHome: "← Back to home",
    panelLine1: "Ship together.",
    panelLine2: "One dashboard for projects, teammates, and momentum.",
    illustrationAlt: "Abstract product preview with dashboard frame and teammate avatars",
    heroChipLive: "Live collab",
    heroChipMatched: "Roles aligned",
  },
  authForgot: {
    metaTitle: "Forgot password — WorkTogether",
    metaDescription:
      "Request a reset link once account recovery goes live—we are wiring the backend next.",
    title: "Password reset coming soon",
    hint: "We will send a recovery link by email once the API endpoint is hooked up.",
    backToLogin: "Back to log in",
  },
};
