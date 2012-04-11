require 'rubygems'
require 'bundler/setup'
require 'watir-webdriver'
require 'pry'
require 'thread'

browser_count = 3
tabs          = 5

mutex = []
browser_count.times do |i|
  mutex[i] = Mutex.new
end

url = "http://localhost:4567"

def open_new_window(driver, url)
  a = driver.execute_script("var d=document,a=d.createElement('a');a.target='_blank';a.href=arguments[0];a.innerHTML='.';d.body.appendChild(a);return a", url)
  a.click
  driver.switch_to.window(driver.window_handles.last)
end

def coin_flip
  [true,false].shuffle.shift
end

client_id = 1;
browsers = []
browser_count.times do |i|
  query_str = "/?x=#{rand(100)}&y=#{rand(100)}&client_id=#{client_id}"
  browsers[i] = Watir::Browser.new :chrome
  browsers[i].goto(url + query_str)
  client_id = client_id + 1

  tabs.times do |j|
    query_str = "/?x=#{rand(100)}&y=#{rand(100)}&client_id=#{client_id}"
    open_new_window(browsers[i].driver, url + query_str)
    client_id = client_id + 1
  end
end

outer_threads = []

browser_count.times do |k|
  outer_threads[k] = Thread.new {
    threads = []
    # number of logged entries will be roughly 8-10x
    80.times do |i|
      sleep rand(10)/10.0
      threads[i] = Thread.new {
        20.times do |j|
          mutex[k].synchronize do
            browsers[k].windows[rand(6)].use do
              browsers[k].div(:id,"btnNewQuery").click if coin_flip
              browsers[k].div(:id,"btnNewEvent").click if coin_flip
            end
          end
        end
      }
    end
  }
end

outer_threads.each.map{|t| t.join}