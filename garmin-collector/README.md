# Life OS Garmin Collector

Private collector design for Dre After Dark Life OS.

Primary path: Garmin Connect -> private Python collector -> Supabase -> Life OS.
Complementary path: Venu 3 Connect IQ -> near-live device signals; FIT -> completed workout reconciliation.

## Normalized targets
- health_measurements: timestamped scalar measurements
- health_daily: daily summaries and Garmin-derived metrics
- health_activities: activities/FIT summaries
- health_scores: Life OS transparent scores

## Scheduling
- daytime wellness reconciliation: 10-15 minutes
- likely sleep window: 30-60 minutes
- post-wake reconciliation: once shortly after waking, then one correction pass
- active workout: 5 minutes when server data is actually changing
- derived/training metrics: a few times daily
- historical repair: nightly

## Safety
Credentials and Garmin tokens must be supplied as runtime secrets, never committed. Upserts use source/source_id so Connect IQ, FIT, and Garmin Connect can reconcile rather than duplicate.
