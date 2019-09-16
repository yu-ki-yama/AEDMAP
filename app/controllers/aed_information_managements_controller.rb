class AedInformationManagementsController < ApplicationController
  def index

  end

  def create
    CSV.read(params[:file].path, headers: true).each do |row|
      if AedInformation.where(facility: row['施設名']).where(installation_location: row['設置位置']).blank?
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

    redirect_to aed_information_managements_path
  end
end
