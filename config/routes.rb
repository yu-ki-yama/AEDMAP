Rails.application.routes.draw do
  root to: 'maps#index'

  devise_for :admins, skip: :all
  devise_scope :admin do
    get 'admin/sign_in' , to: 'admins/sessions#new', as: :new_admin_session
    post 'admin/sign_in' , to: 'admins/sessions#create', as: :admin_session
    delete 'admin/sign_out' , to: 'admins/sessions#destroy', as: :destroy_admin_session
  end

  resources :maps, :except => [:destroy, :update, :show, :edit] do
    get 'about', :on => :collection
    get 'download', :on => :collection
  end

  resources :aed_information_managements , :except => [:new, :show] do
    get 'csv_import', :on => :collection
    get 'search', :on => :collection
  end

end
