require 'state_machine'

class Starship < Sequel::Model
  # state_machine :initial => :parked do
  #   before_transition :parked => any - :parked, :do => :put_on_seatbelt
  #   after_transition any => :parked do |transition|
  #     self.seatbelt = 'off' # self is the record
  #   end
  #   around_transition :benchmark

  #   event :ignite do
  #     transition :parked => :idling
  #   end

  #   state :first_gear, :second_gear do
  #     validates_presence_of :seatbelt_on
  #   end
  # end

  # def put_on_seatbelt
  #   ...
  # end

  # def benchmark
  #   ...
  #   yield
  #   ...
  # end
end