require 'rubygems'
require 'bundler/setup'

require 'sqlite3'
require 'sinatra/sequel'
require 'sinatra'
require 'juggernaut'
set :database, 'sqlite://data.db'

#require 'models/models.rb'
#require 'models/migrations.rb'
  
get '/' do
  haml :loadin
end

post '/events/new' do
  Juggernaut.publish("channel1", "new event: #{params[:will]} - #{params[:you]}")
end

post '/query' do
  Juggernaut.publish("channel1", "query: #{params[:will]} - #{params[:you]}")
end