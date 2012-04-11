
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

jug.meta = {starship_id: 0, client_id: 0};

jug.on("connect", function(){ log("Connected") });
jug.on("disconnect", function(){ log("Disconnected") });
jug.on("reconnect", function(){ log("Reconnecting") });
