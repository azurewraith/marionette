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

function GSEvent(json) 
{ 
  //id, location, range, time, duration, type
  switch (typeof arguments[0]) {
    case 'number' : GSEvent.$args.apply(this, arguments); break;
    case 'string' : GSEvent.$json.apply(this, arguments); break;
    default: /*NOP*/
  } 
}

GSEvent.$args = function(id, location, range, time, duration, type)
{
  this.id = id;
  this.location = location;
  this.range = range;
  this.time = time;
  this.duration = duration;
  this.type = type;
}

GSEvent.$json = function(json)
{
  json = JSON.parse(json)
  if (json.data != null) {
    this.id = json.data[0];
    this.location = json.data[1];
    this.range = json.data[2];
    this.time = json.data[3];
    this.duration = json.data[4];
    this.type = json.data[5];
  } else {
    $.extend(this, json);
  }
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
    case "Event":
      rval = new GSEvent(json)
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
  log("Got json: " + data);
  log("Got data: " + xinspect(r));
});

log("Subscribing to zones");

jug.subscribe("zones", function(data){
  log("Got data: " + data);
});

/* data handling */

$(document).ready(function() {
  $('#new_event').submit(function() {
    e = new GSEvent(1, [2.3], 4, 5, 6, 7)
    $.post($(this).attr('action'), e, function(data){
      log("got stuff: " + data);
    }, "text");
    return false;
  });
});

$(document).ready(function() {
  $('#new_query').submit(function() {
    $.post($(this).attr('action'), $(this).serialize(), function(data){
      log("got stuff: " + data)
    }, "text");
    return false;
  });
});