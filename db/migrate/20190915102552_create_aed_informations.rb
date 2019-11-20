class CreateAedInformations < ActiveRecord::Migration[5.2]
  def change
    # create_table :aed_informations, :options => 'ENGINE=InnoDB ROW_FORMAT=DYNAMIC' do |t|
    create_table :aed_informations do |t|
      t.float :latitude, null: false
      t.float :longitude, null: false
      t.string :facility, null: false
      t.string :installation_location, null: false
      t.string :aed_image_id, null: false
      t.boolean :registration_status, default: false

      t.string :postal_code
      t.string :prefecture
      t.string :address
      t.string :phone_number
      t.string :business_day
      t.date :installation_date
      t.date :expiration_date
      t.time :start_time
      t.time :end_time

      t.timestamps
    end
  end
end
