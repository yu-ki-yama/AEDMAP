class ApplicationController < ActionController::Base
  before_action :authenticate_admin

  def after_sign_in_path_for(resource)
    aed_information_managements_path
  end

  def after_sign_out_path_for(resource)
    new_admin_session_path
  end

  def authenticate_admin

    if params["controller"]  == 'aed_information_managements'
      unless admin_signed_in?
        session[:login_error] = true
        session[:error] = 'ログインが必要です。ログインしてください'
        redirect_to new_admin_session_path
      end
    end
  end

end
