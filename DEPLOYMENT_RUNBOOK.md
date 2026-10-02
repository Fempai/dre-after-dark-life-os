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
