require 'rubygems'
require 'bundler/setup'

require 'sqlite3'
require 'sinatra/sequel'
require 'sinatra'
set :database, 'sqlite://data.db'

#require 'models/models.rb'
#require 'models/migrations.rb'
  
get '/' do
  haml :loadin
end