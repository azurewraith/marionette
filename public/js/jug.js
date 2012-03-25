var logElement = jQuery("#log");
logElement.val("hello");

var log = function(data){
  logElement.val( logElement.val() + data + "\n");
  logElement.scrollTop(
    logElement[0].scrollHeight - logElement.height() - 24
  );
};

var jug = new Juggernaut({
  secure: ('https:' == document.location.protocol),
  host: document.location.hostname,
  port: 8080
});

//jQuery.beforeSend(function(xhr){
//  xhr.setRequestHeader("X-Session-ID", jug.sessionID);
//});

jug.on("connect", function(){ log("Connected") });
jug.on("disconnect", function(){ log("Disconnected") });
jug.on("reconnect", function(){ log("Reconnecting") });

log("Subscribing to channel1");

jug.subscribe("channel1", function(data){
  log("Got data: " + data);
});

/* data handling */

$(document).ready(function() {
  $('#new_event').submit(function() {
    $.post($(this).attr('action'), $(this).serialize(), function(data){
      log("got stuff: " + data);
    }, "text");
    return false;
  });
});

$(document).ready(function() {
  $('#new_query').submit(function() {
    $.post($(this).attr('action'), $(this).serialize(), function(data){
      $('#message').append("<p>" + data + "</p>");
      $('#new_message').each(function(){this.reset();});
    }, "text");
    return false;
  });
});