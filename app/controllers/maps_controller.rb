class MapsController < ApplicationController
  def index
    if request.xhr?

      if params['mode'] == "detail"

        @aed_inf = AedInformation.find(params['className'].split('marker')[1].to_i)

        if @aed_inf['aed_image_id'] == '' || !@aed_inf['registration_status']
          @image = helpers.asset_url("noimage.png")
        else
          @image = Refile.attachment_url(@aed_inf, :aed_image, :fill, 268, 201, format: "jpeg")
        end

        @created_at = @aed_inf['created_at'].strftime('%Y/%m/%d')

        # 認証前のデータを改変
        unless @aed_inf['registration_status']
          @aed_inf["facility"] = '未承認'
          @aed_inf["installation_location"] = '未承認'
          @aed_inf["address"] = '未承認'
          @aed_inf["phone_number"] = '未承認'
        end

        if @aed_inf['phone_number'].nil?
          @aed_inf['phone_number'] = '未登録'
        end
        if @aed_inf['address'].nil?
          @aed_inf['address'] = '未登録'
        end

      elsif params['mode'] == 'find'
        @response = AedInformation.where(:prefecture => params['search_word'])

      elsif params['mode'] == 'init'
        #緯度経度から住所取得
        base_url = 'https://map.yahooapis.jp/geoapi/V1/reverseGeoCoder'
        request = {
            'appid' => ENV['YAHOO_CLIENT_ID'],
            'lat' => params['lat'],
            'lon' => params['lng'],
            'output' => 'json'
        }
        url = base_url + '?' + URI.encode_www_form(request)
        json = open(url).read
        data = JSON.parse(json)

        prefecture = data['Feature'][0]['Property']['AddressElement'][0]['Name']
        coordinateArray = AedInformation.where(:prefecture => prefecture)
        @response = {prefecture: prefecture, coordinateArray: coordinateArray}
      end


    else
      #サイト読み込み時
    end
  end

  def new
    @aed_inf = AedInformation.new
  end

  def create
    #緯度経度から住所取得
    base_url = 'https://map.yahooapis.jp/geoapi/V1/reverseGeoCoder'
    request = {
        'appid' => ENV['YAHOO_CLIENT_ID'],
        'lat' => aed_params[:latitude],
        'lon' => aed_params[:longitude],
        'output' => 'json'
    }
    url = base_url + '?' + URI.encode_www_form(request)
    json = open(url).read
    data = JSON.parse(json)

    prefecture = data['Feature'][0]['Property']['AddressElement'][0]['Name']

    create_params = aed_params
    create_params[:aed_image] = StringIO.new(Base64.decode64(aed_params[:image_url]))
    create_params.delete(:image_url)
    create_params['prefecture'] = prefecture
    AedInformation.new(create_params).save

    redirect_to maps_path

  end

  def about
    @aed_inf = AedInformation.all
  end

  def download
    respond_to do |format|
      format.html do

      end
      format.csv do
        send_data render_to_string, filename: "投稿情報.csv"
      end
    end
  end

  private
  def aed_params
    params.require(:aed_information).permit(:latitude, :aed_image, :longitude, :facility, :installation_location, :image_url)
  end

end
