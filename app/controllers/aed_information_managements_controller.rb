class AedInformationManagementsController < ApplicationController
  def index
      @aed_inf = AedInformation.where(registration_status: false)
  end

  def create
    CSV.read(params[:file_select].path, headers: true).each do |row|
      if AedInformation.where(facility: row['施設名']).where(installation_location: row['設置位置']).blank?
        unless row['緯度'].nil? || row['経度'].nil?
          if row['施設名'].nil?
            row['施設名'] = ""
          end
          if row['設置位置'].nil?
            row['設置位置'] = ""
          end

          if row['都道府県'].nil?
            row['都道府県'] = ""
          end
          if row['住所'].nil?
            row['住所'] = ""
          end
          if row['電話番号'].nil?
            row['電話番号'] = ""
          end
          AedInformation.create(
              latitude: row['緯度'],
              longitude: row['経度'],
              facility: row['施設名'],
              installation_location: row['設置位置'],
              aed_image_id: "",
              registration_status: true,
              prefecture: row['都道府県'],
              address: row['住所'],
              phone_number: row['電話番号']
          )
        end
      end
    end

    redirect_to aed_information_managements_path
  end

  def edit
    if request.xhr?
      if params['mode'] == "position"
        query = params['search_word']
        base_url = 'https://map.yahooapis.jp/search/local/V1/localSearch'
        request = {
            'appid' => ENV['YAHOO_CLIENT_ID'],
            'query' => query,
            'results' => 100,
            'detail' => 'full',
            'output' => 'json'
        }
        url = base_url + '?' + URI.encode_www_form(request)
        json = open(url).read
        data = JSON.parse(json)
        @response = []
        data['Feature'].each do |feature|
          latitude = feature['Geometry']['Coordinates'].split(",")[1].to_f
          longitude = feature['Geometry']['Coordinates'].split(",")[0].to_f
          @response.push({name: feature['Name'] , geometry: [latitude, longitude]})
        end

      elsif params['mode'] == 'address'

        #緯度経度から住所取得
        base_url = 'https://map.yahooapis.jp/geoapi/V1/reverseGeoCoder'
        request = {
            'appid' => ENV['YAHOO_CLIENT_ID'],
            'lat' => params['search_latlon'][0],
            'lon' => params['search_latlon'][1],
            'output' => 'json'
        }
        url = base_url + '?' + URI.encode_www_form(request)
        json = open(url).read
        data = JSON.parse(json)

        prefecture = data['Feature'][0]['Property']['AddressElement'][0]['Name']
        address = data['Feature'][0]['Property']['Address'].split(prefecture)[1]
        # @response = {prefecture: prefecture, address: address}

        #住所から郵便番号取得
        base_url = 'https://zipcoda.net/api'
        request = {
            'address' => data['Feature'][0]['Property']['Address']
        }
        url = base_url + '?' + URI.encode_www_form(request)
        json = open(url).read
        data = JSON.parse(json)

        @response = {prefecture: prefecture, address: address, zipcode: data['items'][0]['zipcode']}

      elsif params['mode'] == 'latlon'
        base_url = 'https://map.yahooapis.jp/geocode/V1/geoCoder'
        request = {
            'appid' => ENV['YAHOO_CLIENT_ID'],
            'query' => params['search_address'],
            'output' => 'json'
        }
        url = base_url + '?' + URI.encode_www_form(request)
        json = open(url).read
        data = JSON.parse(json)
        lonlat = data['Feature'][0]['Geometry']['Coordinates'].split(',')
        @response = {lon: lonlat[0], lat: lonlat[1]}

      end

    else
      @aed_inf = AedInformation.find(params["id"].to_i)
      gon.aed_inf = @aed_inf

      if @aed_inf['business_day'].nil?
        @business = %w("0" "0" "0" "0" "0" "0" "0" "0")
      else
        @business = @aed_inf['business_day'].chars
      end
    end
  end

  def update
    business = ""
    if aed_update_params.has_key?('business_day')
      is_zero = true
      8.times do |i|
        aed_update_params['business_day'].each do |check_num|
          if i.to_s == check_num
            business = business + "1"
            is_zero = false
            break
          end
        end
        if is_zero
          business = business + "0"
        else
          is_zero = true
        end
      end
    else
      business = "00000000"
    end


    update_prams = aed_update_params
    update_prams['registration_status'] = true
    update_prams['business_day'] = business

    AedInformation.find(params['id']).update(update_prams)
    redirect_to aed_information_managements_path
  end

  def destroy
    AedInformation.find(params['id']).destroy
    redirect_to aed_information_managements_path
  end

  def csv_import
  end

  def search
    @select_mode = params['format']
    if params['format'] == '承認済'
      @aed_inf = AedInformation.where(registration_status: true).where(prefecture: '北海道')
    elsif params['format'] == '未承認'
      @aed_inf = AedInformation.where(registration_status: false)
    else
      @select_mode = '承認済'
        @aed_inf = AedInformation.where(prefecture: params['search_prefecture'])
    end
  end

  private
  def aed_update_params
    params.require(:aed_information).permit(:latitude, :longitude, :facility,
                                            :installation_location, :postal_code,
                                            :prefecture, :address, :phone_number,
                                            :installation_date, :start_time, :end_time, :expiration_date, business_day: [])
  end
 
end
