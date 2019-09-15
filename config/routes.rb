Rails.application.routes.draw do

  resources :maps do
    get 'about', :on => :collection
  end

end
