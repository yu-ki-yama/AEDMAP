class MapsController < ApplicationController
  def index
    if request.xhr?
      @target_image = helpers.asset_url("cat53.jpg")
    else

    end
  end

  def new
    @aed_inf = AedInformation.new
  end

  def create
    create_params = aed_params
    create_params[:aed_image] = StringIO.new(Base64.decode64(aed_params[:image_url]))
    create_params.delete(:image_url)
    AedInformation.new(create_params).save

    redirect_to maps_path

  end

  def about
    @aed_inf = AedInformation.all
  end

  private

  def aed_params
    params.require(:aed_information).permit(:latitude, :aed_image, :longitude, :facility, :installation_location, :image_url)
  end

end
