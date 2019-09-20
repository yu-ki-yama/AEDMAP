Rails.application.routes.draw do

  devise_for :admins, skip: :all
  devise_scope :admin do
    get 'admin/sign_in' , to: 'admins/sessions#new', as: :new_admin_session
    post 'admin/sign_in' , to: 'devise/sessions#create', as: :admin_session
    delete 'admin/sign_out' , to: 'admins/sessions#destroy', as: :destroy_admin_session
  end

  resources :maps do
    get 'about', :on => :collection
  end

  resources :aed_information_managements do
    get 'csv_import', :on => :collection
  end

end
