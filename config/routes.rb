Rails.application.routes.draw do

  devise_for :admins
  resources :maps do
    get 'about', :on => :collection
  end

  resources :aed_information_managements
end
