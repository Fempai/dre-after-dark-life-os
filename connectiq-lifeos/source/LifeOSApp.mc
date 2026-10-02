using Toybox.Application; using Toybox.System;
class LifeOSApp extends Application.AppBase { function initialize(){AppBase.initialize();} function getInitialView(){return [new LifeOSView()];} }
