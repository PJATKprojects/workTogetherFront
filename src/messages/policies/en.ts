import type { SiteMessages } from "../types";

export const enPolicyMessages = {
  cookies: {
    metaTitle: "Cookies and browser storage — WorkTogether",
    metaDescription:
      "The strictly necessary cookies, local storage and optional push data used by WorkTogether.",
    title: "Cookies and browser storage",
    updated: "July 18, 2026",
    intro:
      "WorkTogether currently uses only storage needed to deliver a feature you request or remember your choices. We do not use advertising cookies or third-party analytics cookies.",
    sections: [
      {
        heading: "1. What we store",
        body: ["The following items are first-party and are set by WorkTogether in your browser."],
        bullets: [
          "wt_refresh: an HttpOnly authentication cookie, normally kept for up to 14 days, rotated during refresh and removed or revoked on logout.",
          "wt_locale: your interface language, kept for up to one year.",
          "theme in localStorage: your light, dark or system appearance choice, kept until you clear it.",
          "Versioned project, application and message drafts in localStorage: kept for up to 30 days, removed after a successful submission or explicit discard. Files are never stored in these drafts.",
          "A push subscription: created only after you enable notifications; it is stored by the browser, push provider and WorkTogether until you disable or revoke it.",
        ],
      },
      {
        heading: "2. Why no consent banner appears",
        body: [
          "Polish electronic communications law permits storage or access that is necessary to transmit a communication or provide an electronic service explicitly requested by the user. The current items are limited to those purposes.",
          "A banner that offers only necessary storage would not create a meaningful choice. We explain the storage here instead.",
        ],
      },
      {
        heading: "3. No advertising or optional analytics",
        body: [
          "We do not currently set advertising, cross-site tracking or third-party analytics cookies.",
          "If we introduce non-essential analytics or marketing technology, it will remain off until you opt in. Rejecting it will be as easy as accepting it, and withdrawing consent will not affect core service access.",
        ],
      },
      {
        heading: "4. Your controls",
        body: [
          "You can sign out to revoke the active refresh session, disable push in your profile or browser, discard individual drafts, or clear WorkTogether site data in browser settings.",
          "Blocking all necessary cookies can prevent login and other requested features from working.",
        ],
      },
      {
        heading: "5. Changes and contact",
        body: [
          "We update this page when storage purposes, providers or retention periods change. Questions can be sent to support@worktogether.app.",
        ],
      },
    ],
  },
  safety: {
    metaTitle: "Safety, moderation and illegal content — WorkTogether",
    metaDescription:
      "How WorkTogether handles community reports, DSA illegal-content notices, moderation decisions and redress.",
    title: "Safety, moderation and illegal content",
    updated: "July 18, 2026",
    intro:
      "This policy explains how to report risk, how moderation decisions are made, and how any person or entity can notify us of allegedly illegal content hosted on WorkTogether.",
    sections: [
      {
        heading: "1. Choose the right route",
        body: [
          "Signed-in users can report a user, project, message or attachment from the relevant screen and can block unwanted contact.",
          "Anyone, including a person without an account, can use the form below for a precise notice of content believed to be illegal. Account support, privacy requests and ordinary product complaints should be sent to support@worktogether.app.",
        ],
      },
      {
        heading: "2. What an illegal-content notice needs",
        body: [
          "Provide the exact WorkTogether URL and a specific explanation of why the content is illegal. Include your name and email and confirm the notice is accurate and made in good faith.",
          "For notices concerning suspected child sexual abuse, name and email are optional. Do not attach, copy or redistribute illegal material; provide only the location and information needed to identify it.",
        ],
      },
      {
        heading: "3. Review process",
        body: [
          "We confirm receipt when an email is provided, preserve the reference and correlation ID, and place the notice in a restricted moderation queue.",
          "Automated controls may prioritize obvious spam, rate-limit abuse or surface matching signals, but a moderator makes the final content decision. We assess the notice in a timely, careful, objective and non-arbitrary way, considering context, applicable law, severity and users' rights.",
        ],
      },
      {
        heading: "4. Possible actions and reasons",
        body: [
          "Depending on the evidence, we may take no action, reduce visibility, remove content, restrict a feature, suspend or terminate an account, preserve evidence, or notify competent authorities where legally required.",
          "The affected user and the notifier, where contact is available and law permits, receive the outcome, the main facts and legal or contractual ground, whether automation materially influenced the decision, and available redress. We may omit information where disclosure would create a safety or legal risk.",
        ],
      },
      {
        heading: "5. Reconsideration and abuse",
        body: [
          "A recipient can request reconsideration through the appeal route shown with the decision. Courts, competent authorities and certified out-of-court dispute settlement bodies remain available where applicable.",
          "Knowingly false, abusive or repetitive notices may be limited. Good-faith reporting does not lead to a sanction.",
        ],
      },
      {
        heading: "6. Immediate danger",
        body: [
          "WorkTogether is not an emergency service. If someone is in immediate danger, contact local emergency services or police first. Do not use the form to send passwords, identity documents, payment card data or copies of illegal material.",
        ],
      },
    ],
  },
  accessibility: {
    metaTitle: "Accessibility statement — WorkTogether",
    metaDescription:
      "WorkTogether's accessibility target, supported interaction patterns, known validation gaps and feedback route.",
    title: "Accessibility statement",
    updated: "July 18, 2026",
    intro:
      "WorkTogether aims for WCAG 2.2 level AA across the responsive web application. This is a target and ongoing commitment, not a claim that every route has completed independent or manual assistive-technology certification.",
    sections: [
      {
        heading: "1. What we build for",
        body: [
          "Core flows are designed for keyboard use, visible focus, semantic headings and landmarks, labelled controls, error summaries, status messages, reduced motion, high contrast and reflow on narrow screens and browser zoom.",
          "The responsive web application and PWA remain the primary product; a native app is not required to access core functionality.",
        ],
      },
      {
        heading: "2. Editor and uploaded content",
        body: [
          "The rich-text editor, native selects, dialogs and file workflows are included in accessibility checks. Project owners remain responsible for clear text, meaningful links and accessible uploaded documents or images.",
        ],
      },
      {
        heading: "3. Current validation status",
        body: [
          "Automated checks and prepared browser scenarios support development, but launch still requires real Chromium, Firefox and WebKit runs plus manual Safari with VoiceOver and Windows browser testing with NVDA or JAWS.",
          "Email rendering, 200–400% zoom, high-contrast mode and long Polish and Ukrainian strings remain explicit release gates until evidence is recorded.",
        ],
      },
      {
        heading: "4. Report a barrier",
        body: [
          "Email support@worktogether.app with the page URL, what you tried, your browser and assistive technology, and the result you expected. Do not include passwords or recovery codes.",
          "We will acknowledge the report, prioritize blockers in authentication and core collaboration flows, and explain a workaround when an immediate fix is not possible.",
        ],
      },
    ],
  },
  policyHub: {
    metaTitle: "Policies and safety — WorkTogether",
    metaDescription:
      "Terms, privacy, cookies, community rules, moderation and accessibility for the Poland-first WorkTogether pilot.",
    eyebrow: "Poland-first launch",
    title: "Policies, rights and safety",
    intro:
      "One place for the rules behind your account, data, collaboration and moderation. Polish law and EU standards are the launch baseline; mandatory protections in your country still apply where relevant.",
    launchTitle: "Pilot scope",
    launchBody:
      "The initial service is free, for adults aged 18+, and operated as a responsive web application. WorkTogether connects collaborators; it is not an employer, recruitment agency, payment provider or party to project-team agreements.",
    cards: {
      terms: {
        title: "Terms of Service",
        description:
          "Account contract, technical requirements, collaboration rules and complaints.",
        badge: "Contract",
      },
      privacy: {
        title: "Privacy Policy",
        description: "GDPR purposes, legal bases, recipients, retention and data rights.",
        badge: "GDPR",
      },
      cookies: {
        title: "Cookies and storage",
        description: "Necessary cookies, local drafts, theme and optional push subscriptions.",
        badge: "PKE",
      },
      community: {
        title: "Community Guidelines",
        description: "Respect, honest roles, safety expectations, sanctions and appeals.",
        badge: "Community",
      },
      safety: {
        title: "Safety and illegal content",
        description: "Reports, DSA notices, moderation decisions and redress.",
        badge: "DSA",
      },
      accessibility: {
        title: "Accessibility statement",
        description: "WCAG target, supported patterns, known validation gaps and feedback.",
        badge: "WCAG 2.2 AA target",
      },
    },
  },
  illegalContentForm: {
    title: "Notify us of allegedly illegal content",
    intro:
      "Use this form only for content hosted on WorkTogether. A precise URL and legal explanation help us make a timely decision.",
    emergency:
      "Not for emergencies. If someone is in immediate danger, contact local emergency services or police first.",
    childSafetyNote:
      "For suspected child sexual abuse, your name and email are optional. Never upload, copy or redistribute the material.",
    name: "Your name",
    nameHint: "Required except for a child-safety notice.",
    email: "Email",
    emailHint: "Required except for a child-safety notice; used for receipt and decision.",
    contentUrl: "Exact WorkTogether content URL",
    contentUrlHint: "For example, a project or public profile URL. Do not paste an external site.",
    category: "Category",
    categories: {
      childSafety: "Child safety / suspected sexual abuse",
      threats: "Threats or incitement to violence",
      hate: "Illegal hate content",
      fraud: "Fraud or scam",
      privacy: "Privacy or unlawful disclosure",
      intellectualProperty: "Intellectual property",
      other: "Other allegedly illegal content",
    },
    legalReason: "Why you believe the content is illegal",
    legalReasonHint:
      "Identify the content, relevant facts and, if known, the law or right involved. Minimum 20 characters.",
    goodFaith:
      "I confirm that this notice is accurate and complete to the best of my knowledge and submitted in good faith.",
    submit: "Send notice",
    submitting: "Sending…",
    successTitle: "Notice received",
    successBody:
      "Keep the reference below. If you supplied an email, we also sent a receipt and will use it for the decision.",
    referenceLabel: "Reference",
    another: "Submit another notice",
    errors: {
      summary: "Correct the highlighted fields:",
      name: "Enter your name, or select the child-safety category.",
      email: "Enter a valid email, or select the child-safety category.",
      contentUrl: "Enter an exact WorkTogether http or https URL.",
      legalReason: "Explain the alleged illegality in at least 20 characters.",
      goodFaith: "Confirm the good-faith statement.",
      generic: "The notice could not be sent. Check the fields and try again.",
    },
  },
} satisfies Pick<
  SiteMessages,
  "cookies" | "safety" | "accessibility" | "policyHub" | "illegalContentForm"
>;
