class MapsController < ApplicationController
  def index
    if request.xhr?
      @target_image = helpers.asset_url("cat53.jpg")
    else

    end
  end
end
