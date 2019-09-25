require 'csv'

CSV.generate do |csv|
  original_column_names = AedInformation.column_names
  column_name_list = {"id": 'id', "latitude": '緯度', "longitude": '経度',
   "facility": '施設名', "installation_location": '設置場所', "postal_code": '郵便番号',
   "prefecture": '都道府県', "address": '住所', "phone_number": '電話番号',
   "business_day": '営業日', "installation_date": '設置日', "expiration_date": '有効期限',
   "start_time": '開始時間', "end_time": '終了時間', "created_at": '登録日時', "updated_at": '更新日時'}
  exclude_column_array = ["aed_image_id", "registration_status"]

  exclude_column_array.each do |column|
    original_column_names.delete(column)
  end

  column_name_array = []
  original_column_names.each do |column|
    column_name_array.push(column_name_list[column.to_sym])
  end

  csv << column_name_array

  business_index = original_column_names.find_index('business_day').to_i
  id_index = original_column_names.find_index('id').to_i
  date_array = %w(月 火 水 木 金 土 日 祝日)
  AedInformation.pluck(original_column_names).each do |data|
    if AedInformation.find(data[id_index].to_i)["registration_status"]

      update_data = data

      unless data[business_index].nil?
        date = ''
        data[business_index].chars.each_with_index do |flag, i|
          if flag.to_i == 1
            date = date + date_array[i]
          end
        end
        update_data[business_index] = date
      end

      csv << update_data
    end

  end
end