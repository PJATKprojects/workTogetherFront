# Editorial localization review

Automated `npm run i18n:audit` checks catalog parity, mojibake, empty values and
basic length risks. Before release, a native Polish editor must sign off:

- natural product terminology and consistent formal/informal tone;
- long Polish and Ukrainian strings at 320 px and 200–400% reflow;
- singular/few/many plural forms with `Intl.PluralRules`;
- 12/24-hour display, DST boundaries, half-hour/quarter-hour zones and dates
  crossing midnight;
- email subject, preheader, plain text and HTML in Gmail and Outlook.

Responsive web/PWA remains the product surface. A native app is intentionally
out of scope until recurring mobile retention demonstrates a concrete need.
