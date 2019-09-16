// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, or any plugin's
// vendor/assets/javascripts directory can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file. JavaScript code in this file should be added after the last require_* statement.
//
// Read Sprockets README (https://github.com/rails/sprockets#sprockets-directives) for details
// about supported directives.
//
//= require jquery
//= require rails-ujs
//= require activestorage
//= require turbolinks
//= require_tree .

$(document).on("turbolinks:load", function() {

    if($('#map').length) {

        $(document).on("mouseenter", ".place_detail_facility", function (e) {
            $('.' + e.currentTarget.className).append('<div class="all_sentence">' + $('.' + e.currentTarget.className).text() + '</div>')
        });
        $(document).on("mouseleave", ".place_detail_facility", function () {
            $('.all_sentence').remove()
        });

        $(document).on("mouseenter", ".place_detail_address", function (e) {
            $('.' + e.currentTarget.className).append('<div class="all_sentence_address">' + $('.' + e.currentTarget.className).text() + '</div>')
        });
        $(document).on("mouseleave", ".place_detail_address", function () {
            $('.all_sentence_address').remove()
        });

        $(document).on("mouseenter", ".place_detail_set", function (e) {
            $('.' + e.currentTarget.className).append('<div class="all_sentence_set">' + $('.' + e.currentTarget.className).text() + '</div>')
        });
        $(document).on("mouseleave", ".place_detail_set", function () {
            $('.all_sentence_set').remove()
        });

        $(document).on("mouseenter", ".all_sentence", function (e) {
            $('.all_sentence').remove()
        });
        $(document).on("mouseenter", ".all_sentence_address", function (e) {
            $('.all_sentence_address').remove()
        });
        $(document).on("mouseenter", ".all_sentence_set", function (e) {
            $('.all_sentence_set').remove()
        });

        $(function () {
            const STARTZOOMLEVEL = 17
            const LIMITRADIUS = 800

            function getCoordinate(callback) {
                //ユーザーの端末がGeoLocation APIに対応しているかの判定
                if (navigator.geolocation) {
                    // 現在地を取得
                    navigator.geolocation.getCurrentPosition(
                        function (position) {
                            let data = position.coords
                            let latitude = data.latitude
                            let longitude = data.longitude
                            let map = callback(latitude, longitude)
                            //TODO モックデータ
                            console.log(gon.aed_inf)
                            coordinateArray = [{
                                'latitude': latitude,
                                'longitude': longitude
                            }, {'latitude': latitude + 0.001, 'longitude': longitude + 0.001}]
                            circleAbleAED(map, coordinateArray)
                        },
                        function (error) {
                            var errorInfo = [
                                "原因不明のエラーが発生しました…。",
                                "位置情報の取得が許可されませんでした…。",
                                "電波状況などで位置情報が取得できませんでした…。",
                                "位置情報の取得に時間がかかりタイムアウトしました…。"
                            ]
                            var errorNo = error.code
                            var errorMessage = "[エラー番号: " + errorNo + "]\n" + errorInfo[errorNo]
                            alert(errorMessage)
                        },
                        {
                            "enableHighAccuracy": false,
                            "timeout": 8000,
                            "maximumAge": 2000
                        })

                } else {
                    var errorMessage = "お使いの端末は、GeoLacation APIに対応していません。"
                    alert(errorMessage)
                }
            }

            function mapInit(latitude, longitude) {
                //地図の初期設定
                let map = L.map('map').setView([latitude, longitude], STARTZOOMLEVEL);
                //地図のタイル設定
                L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://maps.gsi.go.jp/development/ichiran.html">国土地理院</a>'
                }).addTo(map);
                //地図のスケール表示
                L.control.scale({imperial: false}).addTo(map);
                return map
            }

            function circleAbleAED(map, coordinateArray) {
                let markers = L.markerClusterGroup();
                coordinateArray.forEach(function (coordinateList, index) {
                    //マーカー表示
                    let marker = L.marker([coordinateList['latitude'], coordinateList['longitude']]).addTo(map).bindPopup("<div class=marker" + index + ">読み込み中...</div>")
                    markers.addLayer(marker)
                    let clickEvent = marker.on('click', function (e) {
                        clickEvt(e);
                    })
                    clickEvent.className = "marker" + index;
                    clickEvent.latitude = coordinateList['latitude']
                    clickEvent.longitude = coordinateList['longitude']

                    //円で塗りつぶし
                    let circle = L.circleMarker([coordinateList['latitude'], coordinateList['longitude']], {
                        radius: LIMITRADIUS * map.getZoomScale(STARTZOOMLEVEL, 18),
                        fillColor: 'blue',
                        fillOpacity: 0.5,
                        stroke: ""
                    }).addTo(map)
                    //スケールに応じて円の大きさを調整
                    map.on('zoomend', function () {
                        let currentZoomLevel = map.getZoom();
                        circle.setRadius(LIMITRADIUS * map.getZoomScale(currentZoomLevel, 18));
                    });

                    //ポップアップをクリックした時のイベント
                    function clickEvt(e) {
                        map.setView([e.target.latitude, e.target.longitude])
                        $.ajax({
                            type: 'GET',
                            url: '/maps',
                            data: {className: e.target.className},
                            dataType: 'json'

                        }).done(function (data) {
                            $('.' + e.target.className).text("")
                            $('.' + e.target.className).append('<img src=' + data['image'] + ' width="200" height="200" class="place_image">');
                            $('.' + e.target.className).css({
                                'width': '550px',
                                'height': '270px',
                                'position': 'relative'
                            })
                            $('.' + e.target.className).append('' +

                                '<h3 class="margin0">施設名</h3>' +
                                '<div class="place_detail_facility">テストテストテストテストテストテストテストテストテストテスト</div>' +
                                '<div class="place_detail">' +
                                '<h3 class="margin0">設置場所</h3>' +
                                '<div class="place_detail_set">テストテストテストテストテストテストテスト</div>' +
                                '<h3 class="margin0">住所</h3>' +
                                '<div class="place_detail_address">テストテストテストテストテストテストテストテスト</div>' +
                                '<div class="inline-block tel-title">電話番号</div><div class="inline-block tel-num">077777777</div><br>' +
                                '<div class="inline-block create-title">投稿日</div><div class="inline-block create-at">077777777</div><br>' +

                                '</div>')


                        }).fail(function () {
                            alert('情報の取得に失敗しました')
                        })
                    }
                })
                map.addLayer(markers)
            }

            getCoordinate(mapInit)

        })
    }

    if($('#video').length) {

        $(function() {
            let localstream
            //ユーザーの端末がGeoLocation APIに対応しているかの判定
            if (navigator.geolocation) {
                // 現在地を取得
                navigator.geolocation.getCurrentPosition(function (position) {
                    let data = position.coords
                    let latitude = data.latitude
                    let longitude = data.longitude

                    navigator.mediaDevices.getUserMedia({video: true, audio: false}).then(function (stream) { // success
                        localstream = stream
                        document.getElementById('video').srcObject = stream;
                    }).catch(function (error) {
                        console.error('mediaDevice.getUserMedia() error:', error);
                        return;
                    });

                    $('#aed_information_latitude').val(latitude)
                    $('#aed_information_longitude').val(longitude)

                },function (error) {
                    var errorInfo = [
                        "原因不明のエラーが発生しました…。",
                        "位置情報の取得が許可されませんでした…。",
                        "電波状況などで位置情報が取得できませんでした…。",
                        "位置情報の取得に時間がかかりタイムアウトしました…。"
                    ]
                    var errorNo = error.code
                    var errorMessage = "[エラー番号: " + errorNo + "]\n" + errorInfo[errorNo]
                    alert(errorMessage)
                },{
                    "enableHighAccuracy": false,
                    "timeout": 8000,
                    "maximumAge": 2000
                })

            } else {
                var errorMessage = "お使いの端末は、GeoLacation APIに対応していません。"
                alert(errorMessage)
            }

            $('#shutter').on('click',function(){
                var canvas = document.getElementById('canvas');
                var ctx = canvas.getContext('2d');
                var w = video.offsetWidth;
                var h = video.offsetHeight;
                canvas.setAttribute('width', w);
                canvas.setAttribute('height', h);
                ctx.drawImage(video, 0, 0, w, h);
                canvas.toBlob(function(blob) {
                    var img = document.getElementById('image');
                    img.src = window.URL.createObjectURL(blob);

                })
                localstream.getTracks()[0].enabled = false;
                $('#shutter').css("display","none")
                $('#retry').css("display","inline-block")
                $('#video').css("display","none")
            });

            $('#retry').on('click',function(){
                localstream.getTracks()[0].enabled = true;
                $('#shutter').css("display","inline-block")
                $('#retry').css("display","none")
                $('#video').css("display","block")
                $('#image').removeAttr('src');
            });

            $('#aed_inf_confirm').on('click',function(){
                let canvas = document.getElementById("canvas");
                //Base64は先頭のminetype(data:image/png;base64,の部分）は不要なため削除
                let canvas_data = canvas.toDataURL("image/jpeg").replace(/^.*,/, '');
                $("#aed_information_image_url").val(canvas_data);
                $('#aed_inf_form').submit()
            });


        });
    }

    $(function() {
        $('.menu-trigger').on('click',function(){
            if($(this).hasClass('active')){
                $(this).removeClass('active');
                $('main').removeClass('open');
                $('nav').removeClass('open');
                $('.overlay').removeClass('open');
            } else {
                $(this).addClass('active');
                $('main').addClass('open');
                $('nav').addClass('open');
                $('.overlay').addClass('open');
            }
        });
        $('.overlay').on('click',function(){
            if($(this).hasClass('open')){
                $(this).removeClass('open');
                $('.menu-trigger').removeClass('active');
                $('main').removeClass('open');
                $('nav').removeClass('open');
            }
        });
    });

})




