"""Life OS Garmin Connect collector. Runtime secrets only; never commit credentials."""
import os, json, hashlib
from datetime import date, datetime, timezone
from garminconnect import Garmin
from supabase import create_client

URL=os.environ["SUPABASE_URL"]; KEY=os.environ["SUPABASE_SERVICE_ROLE_KEY"]; USER=os.environ["LIFEOS_USER_ID"]
EMAIL=os.environ["GARMIN_EMAIL"]; PASSWORD=os.environ["GARMIN_PASSWORD"]
sb=create_client(URL,KEY); api=Garmin(EMAIL,PASSWORD); api.login()

def sid(metric,day): return hashlib.sha256(f"garmin:{metric}:{day}".encode()).hexdigest()[:32]
def num(v):
    try:return float(v) if v is not None else None
    except:return None
def pick(d,*keys):
    for k in keys:
        if isinstance(d,dict) and d.get(k) is not None:return d[k]
    return None
def collect(day=None):
    day=day or date.today().isoformat()
    stats=api.get_stats(day) or {}
    stress=api.get_stress_data(day) or {}
    sleep=api.get_sleep_data(day) or {}
    hrv={}
    try: hrv=api.get_hrv_data(day) or {}
    except Exception: pass
    body={
      "user_id":USER,"day":day,"source":"garmin_connect",
      "steps":pick(stats,"totalSteps","steps"),"calories_active":num(pick(stats,"activeKilocalories","activeCalories")),
      "calories_total":num(pick(stats,"totalKilocalories","totalCalories")),
      "resting_hr":num(pick(stats,"restingHeartRate","restingHR")),
      "stress_avg":num(pick(stress,"avgStressLevel","averageStressLevel")),
      "sleep_minutes":pick(sleep.get("dailySleepDTO",{}),"sleepTimeSeconds")//60 if pick(sleep.get("dailySleepDTO",{}),"sleepTimeSeconds") else None,
      "sleep_score":num(pick(sleep.get("dailySleepDTO",{}),"sleepScores","sleepScore")),
      "hrv_ms":num(pick(hrv,"lastNightAvg","weeklyAvg")),
      "payload":{"stats":stats,"stress":stress,"sleep":sleep,"hrv":hrv},
      "updated_at":datetime.now(timezone.utc).isoformat()
    }
    sb.table("health_daily").upsert(body,on_conflict="user_id,day,source").execute()
    return {"day":day,"written":True}
if __name__=="__main__": print(json.dumps(collect(),default=str))
