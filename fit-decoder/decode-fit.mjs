import fs from "node:fs"; import {Decoder,Stream} from "@garmin/fitsdk";
const file=process.argv[2]; if(!file) throw new Error("Usage: node decode-fit.mjs activity.fit");
const buf=fs.readFileSync(file),stream=Stream.fromBuffer(buf); if(!Decoder.isFIT(stream)) throw new Error("Not a FIT file");
const decoder=new Decoder(stream); if(!decoder.checkIntegrity()) throw new Error("FIT integrity/CRC check failed");
const {messages,errors}=decoder.read({mergeHeartRates:true,convertDateTimesToDates:true});
const sessions=messages.sessionMesgs||messages.session||[], records=messages.recordMesgs||messages.record||[]; const s=sessions[0]||{};
const out={source:"fit",sourceId:String(s.timestamp||s.startTime||file),startedAt:s.startTime||records[0]?.timestamp||null,endedAt:s.timestamp||records.at(-1)?.timestamp||null,sport:s.sport||s.subSport||null,durationSeconds:s.totalTimerTime||s.totalElapsedTime||null,distanceM:s.totalDistance||null,calories:s.totalCalories||null,avgHr:s.avgHeartRate||null,maxHr:s.maxHeartRate||null,records:records.length,errors};
console.log(JSON.stringify(out,null,2));
