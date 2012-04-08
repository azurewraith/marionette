function BlockMove(event) {
  // Tell Safari not to move the window.
  event.preventDefault() ;
}

// -----------------------------------------------
// Get Client ID
// -----------------------------------------------
askForClientID = function() {
  var clientID = 0;
  jQuery.ajaxSetup({async:false});
  $.post('/clients/new', [], function(data){
    sessionStorage.setItem('client_id', data);
    clientID = parseInt(data);
  }, "text");
  jQuery.ajaxSetup({async:true});
  return clientID;
}

var client_id;
if (sessionStorage.getItem('client_id') == null) {
  client_id = askForClientID()
} else {
  client_id = parseInt(sessionStorage.getItem('client_id'));
}
jug.meta.client_id = client_id;

//***************************************
// Initialize WebSQL
//***************************************

var dbSize = 5 * 1024 * 1024; // 5MB
var db = openDatabase('spatio', '1.0', 'spatio-temporal client data', dbSize);

db.onError = function(tx, e) {
  alert("There has been an error: " + e.message);
}

db.transaction(function (tx) {
  tx.executeSql('CREATE TABLE IF NOT EXISTS events_emitted (id INTEGER PRIMARY KEY ASC, client_id INTEGER, json TEXT)');
  tx.executeSql('CREATE TABLE IF NOT EXISTS unanswered_queries (id INTEGER PRIMARY KEY ASC, client_id INTEGER, json TEXT)');
});

log("Subscribing to global");

jug.subscribe("global", function(data){
  r = processData(data);
  log("Got a " + r.getName());
});

log("Subscribing to zones");

jug.subscribe("zones", function(data){
  r = processData(data);
  log("Got a " + r.getName());
});

log("Subscribing to clients/" + client_id);

jug.subscribe("clients/" + client_id, function(data){
  r = processData(data);
  log("Got a " + r.getName());
});

var zone_id = 1;
log("Subscribing to zones/" + zone_id);

jug.subscribe("zones/" + zone_id, function(data){
  r = processData(data);
  log("Got a " + r.getName());
});

// test query
db.transaction(function (tx) {
  id = 2
  tx.executeSql('SELECT * FROM unanswered_queries WHERE id=?', [id], function (tx, results) {
    var len = results.rows.length, i;
    for (i = 0; i < len; i++) {
      //log(results.rows.item(i).json);
    }
  }, db.onError);
});

/* data handling */

sendNewEvent = function(e) {
  $.post('/events/new', e, function(data){
    // should only be ServerMessage, maybe some robustness is in order
    r = processData(data)
    log("Server Says: " + r.message);
    e.event_id = r.callback_id;
    //store in an events_emitted table
    db.transaction(function (tx) {
      tx.executeSql('INSERT INTO events_emitted (id, client_id, json) VALUES (?, ?, ?)', [e.event_id, 1, JSON.stringify(e)]);
    });
  }, "text");
  return e;
}

sendNewQuery = function(q) {
  $.post('/query', q, function(data){
      // should only be ServerMessage, maybe some robustness is in order
      r = processData(data)
      log("Server Says: " + r.message);
      q.query_id = r.callback_id;

      //store in a unanswered_queries table
      db.transaction(function (tx) {
        tx.executeSql('INSERT INTO unanswered_queries (id, client_id, json) VALUES (?, ?, ?)', [q.query_id, 1, JSON.stringify(q)]);
      });

      //TBD: some sort of JS callback mechanism
    }, "text");
}

jQuery(window).ready(function(){  
  jQuery("#btnNewEvent").click(function() {
    //event_id, client_id, location, range, time, duration, object, meta
    e = new GSEvent(0, 2, [3,4], 5, 6, 7, 8, 9)
    e = sendNewEvent(e);
  });
});

jQuery(window).ready(function(){  
  jQuery("#btnNewQuery").click(function() {
    //query_id, client_id, location, range, object_type
    q = new Query(0, 2, [3,4], 5, 6)
    q = sendNewQuery(q);
  });
}); 