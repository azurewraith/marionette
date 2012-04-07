require 'rubygems'
require 'bundler/setup'

require 'sqlite3'
require 'sinatra/sequel'
require 'sinatra'
require 'haml'
require 'juggernaut'
require 'json'
require 'json/add/core'

set :database, 'sqlite://data.db'

#require 'models/models.rb'
#require 'models/migrations.rb'
  
get '/' do
  haml :loadin
end

event_count = 0;

# takes location, range, time, duration, type
post '/events/new' do
  location = params[:location].first.split('.').map{|i| i.to_i}
  range    = params[:range].to_i
  time     = params[:time]
  duration = params[:duration].to_i
  type     = params[:type]

  # assign a loose numerical identifier to it
  id = event_count
  event_count = event_count + 1

  e = Event.new(id, location, range, time, duration, type)

  # determine what neighborhood location is in, publish to that neighborhood
  zone = "blah"

  Juggernaut.publish("global", e.to_json)
  "Event #{id} was published to zone #{zone}"
end

# takes location, range, so_and_so
post '/query' do
  location  = params[:location]
  range     = params[:range]
  so_and_so = "strongbad and spaceships"

  # determine neighborhoods where range intersects from location
  zones = []

  Juggernaut.publish("global", "query: #{params[:will]} - #{params[:you]}")
  "We asked #{zones} about #{so_and_so}"
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

class Event
  attr_accessor :query_id, :location, :range, :time, :duration, :type

  def initialize(id, location, range, time, duration, type)
    @query_id = id
    @location = location
    @range    = range
    @time     = time
    @duration = duration
    @type     = type
  end

  def to_json(*a)
    {
      'json_class'   => self.class.name,
      'data'         => [ query_id, location, range, time, duration, type ]
    }.to_json(*a)
  end

  def self.json_create(o)
    new(*o['data'])
  end
end

# class FireEvent < Event
#   def initialize(source_starship, destination_starship)
#
#   end
# end

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
      'data'         => [ captain, location, weapons, armor, sensors, hit_points]
    }.to_json(*a)
  end

  def self.json_create(o)
    new(*o['data'])
  end
end


# >> e = Event.new(1, [23, 34], 3, 'asdf', 30, "typhoon")
# => #<Event:0x106e6b8e0 @query_id=1, @time="asdf", @range=3, @type="typhoon", @location=[23, 34], @duration=30>
# >> json = e.to_json
# => "{\"data\":[1,[23,34],3,\"asdf\",30,\"typhoon\"],\"json_class\":\"Event\"}"
# >> e2 = JSON.parse(json)
# => #<Event:0x106e5cf70 @query_id=1, @time="asdf", @range=3, @type="typhoon", @location=[23, 34], @duration=30>