# This file goes in domain.com/config.ru
require 'rubygems'
require 'sinatra'
 
set :run, false
set :env, :production
 
require './game.rb'
run Sinatra::Application
