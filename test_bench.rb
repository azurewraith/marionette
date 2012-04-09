require 'rubygems'
require 'bundler/setup'
require 'watir-webdriver'
require 'pry'
require 'thread'

mutex = Mutex.new

# t = []
# 5.times do |i|
#   t[i] = b.window.new
#   b[i].goto 'http://localhost:4567'
# end
url = "http://localhost:4567"

def open_new_window(driver, url)
  a = driver.execute_script("var d=document,a=d.createElement('a');a.target='_blank';a.href=arguments[0];a.innerHTML='.';d.body.appendChild(a);return a", url)
  a.click
  driver.switch_to.window(driver.window_handles.last)
end

b = Watir::Browser.new :chrome
b.goto(url)

5.times do |i|
  open_new_window(b.driver, url)
end

threads = []
80.times do |i|
  sleep rand(10)/10.0
  threads[i] = Thread.new {
    20.times do |j|
      mutex.synchronize do
        b.windows[rand(6)].use do
          b.div(:id,"btnNewQuery").click
        end
      end
    end
  }
end