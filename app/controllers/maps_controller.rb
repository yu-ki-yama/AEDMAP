class MapsController < ApplicationController
  def index
    if request.xhr?
      puts '-----------'
      puts params['className'].split('marker')[1].to_i+1
      @aed_inf = AedInformation.find(params['className'].split('marker')[1].to_i+1)

      if @aed_inf['aed_image_id'] == ''
        @image = helpers.asset_url("noimage.png")
      else
        @image = Refile.attachment_url(@aed_inf, :aed_image, :fill, 268, 201, format: "jpeg")
      end

      @created_at = @aed_inf['created_at'].strftime('%Y/%m/%d')

      if @aed_inf['phone_number'].nil?
        @aed_inf['phone_number'] = '未登録'
      end

      if @aed_inf['address'].nil?
        @aed_inf['address'] = '未登録'
      end

    else
      gon.aed_inf = AedInformation.all
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
