# Patient UI preview · 2026-09-13

Status: review only. Do not merge to main, promote, or change production aliases until Yoshimi approves the preview.

Based on production commit `c3b19a05852c8f5de508d37dc1ea673e0cdc6494`.

## Review routes

- `/preview`: desktop/390 px phone-width switch, with an interactive same-origin app frame.
- `/`: unified location/language/department search; optional booking/payment filters.
- `/hospitals`: explicit origin and radius; change filters inline; two-column desktop cards and one-column mobile cards.
- `/hospitals/[id]`: visit summary, source-backed conditions, contact links, Japanese/English reception questions and copyable Japanese address.

All 4,430 existing clinic records are retained. No clinical evidence or contact numbers are modified. Choosing a station defaults to a visible 3 km straight-line radius; location permission remains optional. Precise coordinates remain in session storage and are not added to URLs. Clinic detail return links preserve the search query.

Optional general/cosmetic care filters use only explicit specialty names in the reviewed public reports. Unknown facilities are excluded only when one of those filters is selected. A clinic can match both categories; clinic branding is not used to infer specialty.

Booking summaries prioritize reservations required for the selected language. Unconfirmed and conflicting information remains a request to check with the clinic. Public-source review does not imply live availability or a direct facility confirmation.

New interface text supports Japanese, English, Chinese, Korean and Spanish. Reception questions are deliberately bilingual Japanese/English and labeled as examples. Calls, external maps and official websites point to the real clinics; no calls are placed by the preview itself. Existing paid consultation settings remain as deployed; no payment service is activated here.

## Validation before sharing

- TypeScript and ESLint passed.
- 28 Node tests passed, including 3 new checks for language booking requirements, unknown/conflicting evidence and general/cosmetic distinctions.
- Next.js 16 production build passed locally.
- Responsive browser review on the Vercel preview is performed after deployment. A phone-width frame checks responsive layout but does not replace an actual iOS/Android device test.

No paid API, database or analytics service added. Preview notice and noindex metadata are intentional review-only settings and need to be removed or gated during a future approved production implementation.
