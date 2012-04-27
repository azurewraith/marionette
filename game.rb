require 'rubygems'
require 'bundler/setup'

require 'sinatra/sequel'
require 'sinatra'
require 'haml'
require 'juggernaut'
require 'json'
require 'json/add/core'
  
get '/' do
  haml :loadin
end

event_count = 1;

post '/events/new' do
  client_id   = params[:client_id].to_i
  location    = params[:location].map{|i| i.to_i}
  range       = params[:range].to_i
  time        = params[:time]
  duration    = params[:duration].to_i
  object      = params[:object]
  meta        = params[:meta]

  # assign a loose numerical identifier to it
  event_id = event_count
  event_count = event_count + 1

  e = Event.new(event_id, client_id, location, range, time, duration, object, meta)

  # determine what neighborhood location is in, publish to that neighborhood
  zone = "global"

  Juggernaut.publish(zone, e.to_json, :except => request.env["HTTP_X_SESSION_ID"])
  m = ServerMessage.new(event_id, "Event #{event_id} was published to zone #{zone}")
  m.to_json
end

query_count = 1;

# takes location, range, object_type
post '/query' do
  client_id   = params[:client_id].to_i
  location    = params[:location].map{|i| i.to_i}
  range       = params[:range].to_i
  object_type = params[:object_type] 

  query_id = query_count
  query_count = query_count + 1

  q = Query.new(query_id, client_id, location, range, object_type)

  # determine neighborhoods where range intersects from location
  zones = ["global"]

  Juggernaut.publish(zones, q.to_json, :except => request.env["HTTP_X_SESSION_ID"])
  m = ServerMessage.new(query_id, "We asked #{zones} about #{object_type}s")
  m.to_json
end

client_count = 0
post '/clients/new' do
  client_count = client_count + 1
  client_count.to_s
end

# takes client_id, location
post '/starships/new' do
  captain  = params[:client_id]
  location = params[:location]
  s = Starship.new(captain, location, 5, 5, 20, 100)
  s.to_json
end

Thread.new do
  Juggernaut.subscribe do |event, data|
    case event
    when :subscribe
      # new fish
      # add client to neighborhood, calculate new zones, if area of new zone > threshold then push update
      # if refreshing, :unsubscribe and :subscribe are nearly instantaneous, maybe buffer in a queue that waits?
      puts "subscribing #{data.inspect}"
    when :unsubscribe
      # fish out of water
      # remove client from neighborhood, if a super client disconnected recalculate zones
      puts "unsubscribing #{data.inspect}"
    else
      puts "unknown event: #{event}"
    end
  end
end

# An Array of points
# 
# Most methods from:
# http://jakescruggs.blogspot.com/2009/07/point-inside-polygon-in-ruby.html
class Polygon < Array

  def include?(point)
    return false if outside_bounding_box?(point)
    contains_point = false
    i = -1
    j = self.size - 1
    while (i += 1) < self.size
      a_point_on_polygon = self[i]
      trailing_point_on_polygon = self[j]
      if point_is_between_the_ys_of_the_line_segment?(point, a_point_on_polygon, trailing_point_on_polygon)
        if ray_crosses_through_line_segment?(point, a_point_on_polygon, trailing_point_on_polygon)
          contains_point = !contains_point
        end
      end
      j = i
    end
    return contains_point
  end

private

  def point_is_between_the_ys_of_the_line_segment?(point, a_point_on_polygon, trailing_point_on_polygon)
    (a_point_on_polygon.y <= point.y && point.y < trailing_point_on_polygon.y) || 
    (trailing_point_on_polygon.y <= point.y && point.y < a_point_on_polygon.y)
  end

  def ray_crosses_through_line_segment?(point, a_point_on_polygon, trailing_point_on_polygon)
    (point.x < (trailing_point_on_polygon.x - a_point_on_polygon.x) * (point.y - a_point_on_polygon.y) / 
               (trailing_point_on_polygon.y - a_point_on_polygon.y) + a_point_on_polygon.x)
  end

  def outside_bounding_box?(point)
    bb_point_1, bb_point_2 = bounding_box
    max_x = [bb_point_1.x, bb_point_2.x].max
    max_y = [bb_point_1.y, bb_point_2.y].max
    min_x = [bb_point_1.x, bb_point_2.x].min
    min_y = [bb_point_1.y, bb_point_2.y].min
    
    point.x < min_x || point.x > max_x || point.y < min_y || point.y > max_y
  end
end

class ServerMessage
  attr_accessor :callback_id, :message, :error

  def initialize(callback_id, message="", error="")
    @callback_id = callback_id
    @message     = message
    @error       = error
  end

  def to_json(*a)
    {
      'json_class'   => self.class.name,
      'data'         => [callback_id, message, error]
    }.to_json(*a)
  end

  def self.json_create(o)
    new(*o['data'])
  end
end

class Query
  attr_accessor :query_id, :client_id, :location, :range, :object_type

  def initialize(query_id, client_id, location, range, object_type)
    @query_id    = query_id 
    @client_id   = client_id
    @location    = location
    @range       = range
    @object_type = object_type
  end

  def to_json(*a)
    {
      'json_class'   => self.class.name,
      'data'         => [query_id, client_id, location, range, object_type ]
    }.to_json(*a)
  end

  def self.json_create(o)
    new(*o['data'])
  end
end

class Event
  attr_accessor :event_id, :client_id, :location, :range, :time, :duration, :object, :meta

  def initialize(event_id, client_id, location, range, time, duration, object, meta)
    @client_id = client_id
    @event_id  = event_id
    @location  = location
    @range     = range
    @time      = time
    @duration  = duration
    @object    = object
    @meta      = meta
  end

  def to_json(*a)
    {
      'json_class'   => self.class.name,
      'data'         => [event_id, client_id, location, range, time, duration, object, meta]
    }.to_json(*a)
  end

  def self.json_create(o)
    new(*o['data'])
  end
end

class WeaponFired < Event
end

class Starship
  attr_accessor :captain, :location, :weapons, :armor, :sensors, :hit_points

  def initialize(captain, location, weapons, armor, sensors, hit_points)
    @captain    = captain
    @location   = location
    @weapons    = weapon
    @armor      = armor
    @sensors    = sensors
    @hit_points = hit_points
  end

  def to_json(*a)
    {
      'json_class'   => self.class.name,
      'data'         => [captain, location, weapons, armor, sensors, hit_points]
    }.to_json(*a)
  end

  def self.json_create(o)
    new(*o['data'])
  end
end