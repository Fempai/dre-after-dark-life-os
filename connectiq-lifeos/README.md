# Life OS Venu 3 prototype

Prototype architecture for a Connect IQ companion. Target device: Venu 3. Background temporal events are designed around Garmin's 5-minute minimum. The companion is a near-real-time redundancy layer; Garmin Connect collector remains the primary enrichment/reconciliation path.

Planned payload: timestamp, steps, calories, available heart-rate history, Body Battery history, and device sync metadata. Completed workouts are reconciled through FIT ingestion.

No Garmin credentials belong in this repository or watch app.