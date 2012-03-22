  var logElement = jQuery("#log");
  logElement.val("hello");

  var log = function(data){
    logElement.val( logElement.val() + data + "\n");
    logElement.scrollTop(
      logElement[0].scrollHeight - logElement.height()
    );
  };

  var jug = new Juggernaut({
    secure: ('https:' == document.location.protocol),
    host: document.location.hostname,
    port: 8080
  });

  jug.on("connect", function(){ log("Connected") });
  jug.on("disconnect", function(){ log("Disconnected") });
  jug.on("reconnect", function(){ log("Reconnecting") });

  log("Subscribing to channel1");

  jug.subscribe("channel1", function(data){
    log("Got data: " + data);
  });