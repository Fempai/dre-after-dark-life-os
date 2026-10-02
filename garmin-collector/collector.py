"""Life OS Garmin Connect collector. Runtime secrets only; never commit credentials."""
import os,json,hashlib
from datetime import date,datetime,timezone,timedelta
from garminconnect import Garmin
from supabase import create_client

URL=os.environ["SUPABASE_URL"]; KEY=os.environ["SUPABASE_SERVICE_ROLE_KEY"]; USER=os.environ["LIFEOS_USER_ID"]
EMAIL=os.environ["GARMIN_EMAIL"]; PASSWORD=os.environ["GARMIN_PASSWORD"]
sb=create_client(URL,KEY); api=Garmin(EMAIL,PASSWORD); api.login()

def num(v):
    try:return float(v) if v is not None else None
    except (TypeError,ValueError):return None
def integer(v):
    try:return int(v) if v is not None else None
    except (TypeError,ValueError):return None
def pick(d,*keys):
    for k in keys:
        if isinstance(d,dict) and d.get(k) is not None:return d[k]
    return None
def nested(d,*path):
    for k in path:
        if not isinstance(d,dict):return None
        d=d.get(k)
    return d
def sleep_score(sleep):
    dto=sleep.get("dailySleepDTO",{}) if isinstance(sleep,dict) else {}
    for v in (dto.get("sleepScore"),nested(dto,"sleepScores","overall","value"),nested(dto,"sleepScores","overallScore"),nested(sleep,"sleepScores","overall","value")):
        n=num(v)
        if n is not None:return n
    return None
def safe(fn,*args):
    try:return fn(*args) or {}
    except Exception as e:return {"_collector_error":str(e)}
def collect(day=None):
    day=day or date.today().isoformat()
    stats=safe(api.get_stats,day); stress=safe(api.get_stress_data,day); sleep=safe(api.get_sleep_data,day)
    hrv=safe(api.get_hrv_data,day) if hasattr(api,"get_hrv_data") else {}
    dto=sleep.get("dailySleepDTO",{}) if isinstance(sleep,dict) else {}
    sleep_seconds=integer(pick(dto,"sleepTimeSeconds"))
    body={
      "user_id":USER,"day":day,"source":"garmin_connect",
      "steps":integer(pick(stats,"totalSteps","steps")),
      "calories_active":num(pick(stats,"activeKilocalories","activeCalories")),
      "calories_total":num(pick(stats,"totalKilocalories","totalCalories")),
      "active_minutes":integer(pick(stats,"moderateIntensityMinutes","activeMinutes")),
      "resting_hr":num(pick(stats,"restingHeartRate","restingHR")),
      "min_hr":num(pick(stats,"minHeartRate","minHr")),
      "max_hr":num(pick(stats,"maxHeartRate","maxHr")),
      "stress_avg":num(pick(stress,"avgStressLevel","averageStressLevel")),
      "body_battery_min":num(pick(stats,"bodyBatteryLowestValue","bodyBatteryMin")),
      "body_battery_max":num(pick(stats,"bodyBatteryHighestValue","bodyBatteryMax")),
      "respiration_avg":num(pick(stats,"averageRespirationValue","avgWakingRespirationValue")),
      "sleep_minutes":sleep_seconds//60 if sleep_seconds else None,
      "sleep_score":sleep_score(sleep),
      "hrv_ms":num(pick(hrv,"lastNightAvg","weeklyAvg")),
      "vo2_max":num(pick(stats,"vO2MaxValue","vo2Max")),
      "training_readiness":num(pick(stats,"trainingReadinessScore","trainingReadiness")),
      "training_status":pick(stats,"trainingStatus"),
      "payload":{"stats":stats,"stress":stress,"sleep":sleep,"hrv":hrv},
      "updated_at":datetime.now(timezone.utc).isoformat()
    }
    sb.table("health_daily").upsert(body,on_conflict="user_id,day,source").execute()
    return {"day":day,"written":True,"fields":sum(v is not None for k,v in body.items() if k not in ("payload","updated_at","user_id","day","source"))}
def backfill(days):
    out=[]
    for i in range(max(1,min(days,90))):
        out.append(collect((date.today()-timedelta(days=i)).isoformat()))
    return out
if __name__=="__main__":
    days=integer(os.getenv("BACKFILL_DAYS")) or 1
    print(json.dumps(backfill(days) if days>1 else collect(),default=str))
