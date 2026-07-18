# Browser and accessibility release gate

The CI status check name is `browser-accessibility`. Configure branch protection
for `main`/`master` to require it together with `quality` and `supply-chain`.

Automated on every pull request:

- stable Google Chrome, Playwright Firefox and Playwright WebKit;
- auth, OAuth error, reset, application, report/block, accepted next steps;
- exact onboarding fields, consent-gated GitHub/CV previews and three immediate matches;
- project templates, readiness suggestions, preview/publish and Polish long strings;
- localized manifest icons, shortcuts and EN/UK/PL offline shells;
- 320 px viewport, 200% text, 400%-equivalent reflow, keyboard focus,
  reduced motion and forced-colors checks;
- programmatic field-error associations and error summaries for long forms;
- the separate administration console, including moderation and destructive-action focus handling.

Local verification:

```powershell
npm run test:e2e -- --retries=0
```

The current suite contains 54 checks (18 scenarios in each browser project), including a
real service-worker registration and deterministic localized fallback navigation in every engine.
To retain successful visual evidence for the localized 320 px/200% login and
project preview scenarios:

```powershell
$env:PLAYWRIGHT_VISUAL_EVIDENCE = "1"
npx playwright test --project=chrome --project=webkit --grep "long Ukrainian|project template"
```

API smoke contexts deliberately block service workers because an active PWA
worker bypasses `page.route()` in Firefox/WebKit. PWA installation and offline
behavior are tested separately from mocked auth/application flows.

Manual release evidence (real hardware; attach OS/browser/AT versions):

- current macOS Safari + VoiceOver;
- Windows Chrome and Firefox + NVDA, plus JAWS when licensed;
- editor, native selects and browser zoom at 200%, 300% and 400%;
- Gmail and Outlook rendering for transactional templates;
- passkey register/login/delete and TOTP/recovery on the production HTTPS RP
  using Windows Hello, Android, iCloud Keychain/Safari and an external key.

Playwright WebKit is a repeatable Safari-engine proxy, not evidence for macOS
Safari, VoiceOver, iCloud Keychain or hardware authenticators.
