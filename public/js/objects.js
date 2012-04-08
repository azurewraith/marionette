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