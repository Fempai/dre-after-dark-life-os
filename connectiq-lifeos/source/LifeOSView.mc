using Toybox.WatchUi; using Toybox.Graphics; using Toybox.ActivityMonitor; using Toybox.SensorHistory;
class LifeOSView extends WatchUi.View {
 function onUpdate(dc){
  dc.setColor(Graphics.COLOR_WHITE,Graphics.COLOR_BLACK);dc.clear();
  var info=ActivityMonitor.getInfo();
  dc.drawText(dc.getWidth()/2,36,Graphics.FONT_MEDIUM,"Life OS",Graphics.TEXT_JUSTIFY_CENTER);
  dc.drawText(16,86,Graphics.FONT_SMALL,"Steps: "+info.steps,Graphics.TEXT_JUSTIFY_LEFT);
  dc.drawText(16,116,Graphics.FONT_SMALL,"Calories: "+info.calories,Graphics.TEXT_JUSTIFY_LEFT);
  var bbText="—";
  if ((Toybox has :SensorHistory) && (Toybox.SensorHistory has :getBodyBatteryHistory)) {
   var iter=SensorHistory.getBodyBatteryHistory({:period=>1,:order=>SensorHistory.ORDER_NEWEST_FIRST});
   if(iter!=null){var sample=iter.next();if(sample!=null&&sample.data!=null){bbText=sample.data.toString();}}
  }
  dc.drawText(16,146,Graphics.FONT_SMALL,"Body Battery: "+bbText,Graphics.TEXT_JUSTIFY_LEFT);
  dc.drawText(16,186,Graphics.FONT_TINY,"Local companion preview",Graphics.TEXT_JUSTIFY_LEFT);
 }
}