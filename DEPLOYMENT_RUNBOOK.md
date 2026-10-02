# Life OS - Production Runbook

## Automated / code-complete gates
- PWA shell and offline cache
- Google/Supabase identity and cloud snapshot
- Google Calendar integration
- WordPress read integration
- IndexedDB media storage
- selective Care clinician report
- normalized health schema, RLS, health dashboard and score persistence
- Garmin Connect collector, backfill and activity normalization
- FIT decoder utility
- Connect IQ companion prototype
- runtime release-readiness checks

## Secrets that must never be committed
Configure these only in the private runtime / GitHub Actions secrets:
- GARMIN_EMAIL
- GARMIN_PASSWORD
- SUPABASE_SERVICE_ROLE_KEY
- LIFEOS_USER_ID

The browser uses only the Supabase publishable key. Never put the service-role key in client JavaScript.

## Garmin activation
1. Configure SUPABASE_URL plus the four secrets above.
2. Run one collector day.
3. Verify one health_daily row and any same-day health_activities.
4. Run BACKFILL_DAYS=30 once for baseline calibration.
5. Confirm Care / Wearable Dashboard shows real values and Recovery confidence increases as baseline history accumulates.
6. Only then enable recurring collection.

## Final device regression
On the installed Android PWA verify:
- Today: completed Vertical stays hidden after reload.
- Habits: Start survives rerender; Finish records duration and completes ritual once.
- Journal: image/GIF/Bitmoji picker persists media after reload; Export / Share opens.
- Life Lab: no duplicate legacy Personal Labs.
- Care: selection/filter/sort affect report; branded report print/save works; wearable dashboard renders.
- Settings: Release Readiness shows all runtime wiring gates green.
- Offline: open once online, disable network, relaunch installed PWA and navigate core views.
- Cloud: sync, reload, and verify state is restored.

## Known external/account-level gates
- Supabase leaked-password protection is an account setting.
- Garmin credentials are required before real Garmin data can be validated.
- Connect IQ source still requires Garmin SDK compilation/device testing.
- Android/Gboard rich GIF insertion into a browser textarea is not exposed reliably; Journal uses the system file/image picker instead.


## Whole-app final acceptance
The user-dependent checkpoint is intentionally broader than Care/Garmin. After all repository-only work is green, perform one installed-Android-PWA acceptance sweep across the complete product:

- Today / Adaptive Today / Vertical: capacity, command summary, completion persistence and reload behavior.
- Habits: add ritual, start/finish timing, completion correction, curriculum rendering and no duplicate event.
- Journal: create/edit/search/filter, GIF/image/Bitmoji file picker, IndexedDB media reload, native Share fallback, Markdown/TXT and print/PDF.
- Archive / Chronicle / Search: range filters, correction, chronology and universal retrieval.
- Conservatory: search/organization, specimen journal edits, care actions, photos and long-list usability.
- House / Estate: household workflows, independent cleaner/poop-scoop controls and history.
- Kitchen: Pantry, Groceries, Leftovers, Meal Prep, Recipe Library, scaling, recipe-to-grocery/prep flows and Meal Intelligence against saved data.
- Life Lab / Personal Labs: all planned domains render once, save/reopen/delete records, target dates and planning summaries.
- I&I: reading/idea/publishing/intelligence/hypothesis/completion views and certified WordPress data remain intact.
- Care: clinician selection/filter/sort/report, BP/cycle signals, Wearable Dashboard, recovery score and recent activities.
- Calendar / Cloud: Google identity persists, sync/read-back works, Calendar read/create remains connected.
- Backup / Privacy: export, validated restore path, media inventory and destructive confirmations.
- PWA / mobile: update prompt, standalone mode, offline navigation, touch targets, no blank reload and acceptable real-device performance.
- Settings: canonical Release Readiness authority is green and final read-only smoke test passes.

Repository-only gates must be green before this sweep. Failures discovered here return to implementation; subjective UX approval remains a user acceptance gate.

## Intentionally external / excluded
- Instagram/Meta authorization remains excluded from the release target by product decision.
- Automated image/recipe recognition requires a real secure vision/import backend and must not be represented as complete.
- Android/Gboard rich GIF insertion into a browser textarea is not reliably exposed by the platform; Journal supports file/image picker and image URL instead.
