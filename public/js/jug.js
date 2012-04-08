function xinspect(o,i){
    if(typeof i=='undefined')i='';
    if(i.length>50)return '[MAX ITERATIONS]';
    var r=[];
    for(var p in o){
        var t=typeof o[p];
        r.push(i+'"'+p+'" ('+t+') => '+(t=='object' ? 'object:'+xinspect(o[p],i+'  ') : o[p]+''));
    }
    return r.join(i+'\n');
}

//===========================Class ServerMessage=================================

function ServerMessage(json) 
{ 
  //callback_id, message, error
  switch (typeof arguments[0]) {
    case 'number' : ServerMessage.$args.apply(this, arguments); break;
    case 'string' : ServerMessage.$json.apply(this, arguments); break;
    default: /*NOP*/
  } 
}

ServerMessage.$args = function(callback_id, message, error)
{
  this.callback_id = callback_id;
  this.message     = message;
  this.error       = error;
}

ServerMessage.$json = function(json)
{
  json = JSON.parse(json)
  if (json.data != null) {
    this.callback_id = json.data[0];
    this.message     = json.data[1];
    this.error       = json.data[2];
  } else {
    $.extend(this, json);
  }
}

//===========================Class Query=================================

function Query(json) 
{ 
  //query_id, client_id, location, range, object_type
  switch (typeof arguments[0]) {
    case 'number' : Query.$args.apply(this, arguments); break;
    case 'string' : Query.$json.apply(this, arguments); break;
    default: /*NOP*/
  } 
}

Query.$args = function(query_id, client_id, location, range, object_type)
{
  this.query_id    = query_id;
  this.client_id   = client_id;
  this.location    = location;
  this.range       = range;
  this.object_type = object_type;
}

Query.$json = function(json)
{
  json = JSON.parse(json)
  if (json.data != null) {
    this.query_id    = json.data[0];
    this.client_id   = json.data[1];
    this.location    = json.data[2];
    this.range       = json.data[3];
    this.object_type = json.data[4];
  } else {
    $.extend(this, json);
  }
}

//===========================Class GSEvent=================================

function GSEvent(json) 
{ 
  //event_id, client_id, location, range, time, duration, object, meta
  switch (typeof arguments[0]) {
    case 'number' : GSEvent.$args.apply(this, arguments); break;
    case 'string' : GSEvent.$json.apply(this, arguments); break;
    default: /*NOP*/
  } 
}

GSEvent.$args = function(event_id, client_id, location, range, time, duration, object, meta)
{
  this.event_id  = event_id;
  this.client_id = client_id;
  this.location  = location;
  this.range     = range;
  this.time      = time;
  this.duration  = duration;
  this.object    = object;
  this.meta      = meta;
}

GSEvent.$json = function(json)
{
  json = JSON.parse(json)
  if (json.data != null) {
    this.event_id  = json.data[0];
    this.client_id = json.data[1];
    this.location  = json.data[2];
    this.range     = json.data[3];
    this.time      = json.data[4];
    this.duration  = json.data[5];
    this.object    = json.data[6];
    this.meta      = json.data[7];
  } else {
    $.extend(this, json);
  }
}

//===========================Class WeaponFired=================================
/* 
 * Simple sub-class of Event
 */
WeaponFired.prototype = new GSEvent;
WeaponFired.prototype.constructor = WeaponFired;

function WeaponFired()
{
  GSEvent.apply(this, arguments);
}

var logElement = jQuery("#log");

var log = function(data){
  logElement.val( logElement.val() + data + "\n");
  logElement.scrollTop(
    logElement[0].scrollHeight - logElement.height() - 24
  );
};

var processData = function(json) {
  obj  = JSON.parse(json)
  rval = null;
  switch(obj.json_class)
  {
    case "ServerMessage":
      rval = new ServerMessage(json) 
      break;
    case "Query":
      rval = new Query(json) 
      break;
    case "Event":
      rval = new GSEvent(json)
      break;
    case "WeaponFired":
      rval = new WeaponFired(json)
      break;
    default:
      rval = obj;
  }
  return rval;
}

var jug = new Juggernaut({
  secure: ('https:' == document.location.protocol),
  host: document.location.hostname,
  port: 8080
});

jQuery.ajaxSetup( {
  'beforeSend': function(xhr){
    xhr.setRequestHeader("X-Session-ID", jug.sessionID);
  }
})

//location = {lat: -32.43535345, longitude: -59.245663}
jug.meta = {starship_id: 0, client_id: 0};

jug.on("connect", function(){ log("Connected") });
jug.on("disconnect", function(){ log("Disconnected") });
jug.on("reconnect", function(){ log("Reconnecting") });

log("Subscribing to global");

jug.subscribe("global", function(data){
  r = processData(data)
  log("Got data: " + xinspect(r));
});

log("Subscribing to zones");

jug.subscribe("zones", function(data){
  log("Got data: " + data);
});

/* data handling */

$(document).ready(function() {
  $('#new_event').submit(function() {
    e = new GSEvent(1, 2, [3,4], 5, 6, 7, 8, 9)
    $.post($(this).attr('action'), e, function(data){
      // should only be ServerMessage, maybe some robustness is in order
      r = processData(data)
      log("Server Says: " + r.message);
      e.event_id = r.callback_id;
    }, "text");
    return false;
  });
});

$(document).ready(function() {
  $('#new_query').submit(function() {
    q = new Query(1, 2, [3,4], 5, 6)
    $.post($(this).attr('action'), q, function(data){
      // should only be ServerMessage, maybe some robustness is in order
      r = processData(data)
      log("Server Says: " + r.message);
      e.event_id = r.callback_id;
    }, "text");
    return false;
  });
});