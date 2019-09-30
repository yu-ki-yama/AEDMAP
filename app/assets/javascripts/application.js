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
            const STARTZOOMLEVEL = 18
            const LIMITRADIUS = 600

            function getCoordinate(callback) {
                //ユーザーの端末がGeoLocation APIに対応しているかの判定
                if (navigator.geolocation) {
                    // 現在地を取得
                    navigator.geolocation.getCurrentPosition(
                        function (position) {
                            dispLoading('読み込み中...')
                            let data = position.coords
                            let latitude = data.latitude
                            let longitude = data.longitude
                            let map = callback(latitude, longitude)

                            //現在位置から都道府県判定
                            $.ajax({
                                type: 'GET',
                                url: '/maps',
                                data: {lat: latitude, lng: longitude, mode: "init"},
                                dataType: 'json'
                            }).done(function (data) {
                                removeLoading()
                                circleAbleAED(map, data['response']['coordinateArray'])
                                $('.dropdown > p').text(data['response']['prefecture'])

                            }).fail(function () {
                                removeLoading()
                                alert('情報の取得に失敗しました')
                            })

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

            //map生成
            function mapInit(latitude, longitude) {
                //地図の初期設定
                let map = L.map('map',{minZoom:6}).setView([latitude, longitude], STARTZOOMLEVEL);
                //地図のタイル設定
                L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://maps.gsi.go.jp/development/ichiran.html">国土地理院</a>'
                }).addTo(map);
                //地図のスケール表示
                L.control.scale({imperial: false}).addTo(map);
                return map
            }

            //AED適用可能範囲の円と設置場所のポップアップ表示
            function circleAbleAED(map, coordinateArray) {
                let markers = L.markerClusterGroup()
                let clickOnMarkerClass = ""
                let currentOn = ""
                let circle_array = []
                //全マーカー作成
                coordinateArray.forEach(function (coordinateList) {
                    let marker = ""
                    //マーカー表示
                    if(coordinateList['registration_status']){
                        marker = L.marker([coordinateList['latitude'], coordinateList['longitude']],{icon: L.icon({
                                iconUrl: 'https://unpkg.com/leaflet@1.3.1/dist/images/marker-icon.png',
                                className: `marker${coordinateList['id']}-img`
                            })
                        })
                    }else {
                        marker = L.marker([coordinateList['latitude'], coordinateList['longitude']],{icon: L.icon({
                                iconUrl: 'https://unpkg.com/leaflet@1.3.1/dist/images/marker-icon.png',
                                className: `marker${coordinateList['id']}-img leaflet-marker-icon-color-red`
                            })
                        })
                    }

                    marker.bindPopup("<div class=marker" + coordinateList['id'] + ">読み込み中...</div>")
                    markers.addLayer(marker)
                    let clickEvent = marker.on('click', function (e) {
                        clickEvt(e);
                    })

                    //ポップアップに情報付加
                    clickEvent.className = "marker" + coordinateList['id']
                    clickEvent.latitude = coordinateList['latitude']
                    clickEvent.longitude = coordinateList['longitude']

                    //円で塗りつぶし
                    let circle = L.circleMarker([coordinateList['latitude'], coordinateList['longitude']], {
                        radius: LIMITRADIUS * map.getZoomScale(STARTZOOMLEVEL, 18),
                        fillColor: 'blue',
                        fillOpacity: 0.1,
                        stroke: ""
                    }).addTo(map)

                    circle_array.push(circle)

                    //ポップアップをクリックした時のイベント
                    function clickEvt(e) {
                        // if(currentOn === e.target.className){
                        //     currentOn = ""
                        // }else {
                        //     currentOn = e.target.className

                            dispLoading("処理中...")

                            //マーカーの色をクリックされた時のものに変更
                            if (clickOnMarkerClass !== "") {
                                $(clickOnMarkerClass).removeClass('leaflet-marker-icon-color-white')
                            }
                            clickOnMarkerClass = `.${e.target.className}-img`
                            map.setView([e.target.latitude + 0.0012, e.target.longitude])
                            $(clickOnMarkerClass).addClass('leaflet-marker-icon-color-white')

                            //クリックされたマーカーの情報を取得
                            $.ajax({
                                type: 'GET',
                                url: '/maps',
                                data: {className: e.target.className, mode: "detail"},
                                dataType: 'json'
                            }).done(function (data) {
                                removeLoading()

                                $('.' + e.target.className).text("")
                                $('.' + e.target.className).append('<img src=' + data['image'] + ' width="268" height="201" class="place_image">');
                                $('.' + e.target.className).css({
                                    'width': '550px',
                                    'height': '270px',
                                    'position': 'relative'
                                })
                                $('.' + e.target.className).append('' +
                                    '<h3 class="margin0">施設名</h3>' +
                                    '<div class="place_detail_facility">' + data["aed"]["facility"] + '</div>' +
                                    '<div class="place_detail">' +
                                    '<h3 class="margin0">設置場所</h3>' +
                                    '<div class="place_detail_set">' + data["aed"]["installation_location"] + '</div>' +
                                    '<h3 class="margin0">住所</h3>' +
                                    '<div class="place_detail_address">' + data["aed"]["address"] + '</div>' +
                                    '<div class="inline-block tel-title">電話番号</div><div class="inline-block tel-num">' + data["aed"]["phone_number"] + '</div><br>' +
                                    '<div class="inline-block create-title">投稿日</div><div class="inline-block create-at">' + data["created_at"] + '</div><br>' +
                                    '</div>')

                            }).fail(function () {
                                removeLoading()
                                alert('情報の取得に失敗しました')
                            })
                        // }
                    }

                    //スケールに応じて円の大きさを調整
                    map.on('zoomend', function () {
                        //TODO 処理が重すぎる　サークルの大きさをスケールに合わして調整
                        let currentZoomLevel = map.getZoom()
                        circle.setRadius(LIMITRADIUS * map.getZoomScale(currentZoomLevel, 18))

                        //ポップアップを閉じる
                        map.closePopup()

                        //TODO 処理が重すぎる　ピンの位置がずれるため独自のスケールを適用して調整
                        scale = {"18":0,"17":2,"16":6,"15":12,"14":24,"13":48,"12":96,"11":220,"10":440,"9":880,"8":1760,"7":3520,"6":7040}
                        marker.setLatLng(new L.LatLng( coordinateList['latitude']+0.00009 * scale[currentZoomLevel], coordinateList['longitude']-0.00004* scale[currentZoomLevel]))
                    })
                })

                //ポップアップを閉じときに色を変更
                map.on('popupclose', function() {
                    $(clickOnMarkerClass).removeClass('leaflet-marker-icon-color-white')
                    clickOnMarkerClass = ""
                })

                // 都道府県選択ボックスを押した時
                $(".dropdown").on('click', function() {
                    $(".menu").toggleClass("showMenu")

                    $(".menu > li").on('click', function(e) {
                        dispLoading('読み込み中...')
                        $( 'html,body' ).animate( {scrollTop:0} , 'slow' ) ;

                        $(".dropdown > p").html($(this).html())
                        $(".menu").removeClass("showMenu")

                        map.removeLayer(markers)
                        circle_array.forEach(function (circle) {
                            map.removeLayer(circle)
                        })

                        $.ajax({
                            type: 'GET',
                            url: location.pathname,
                            data: {search_word: e.target.innerText, mode: "find"},
                            dataType: 'json'
                        }).done(function (data) {
                            circleAbleAED(map, data['response'])
                            map.setView([data['response'][0]['latitude'], data['response'][0]['longitude']], 10)
                            removeLoading()
                        }).fail(function () {
                            removeLoading()
                            alert('情報の取得に失敗しました')
                        })


                    })
                })

                //マップにマーカー情報反映
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
            //カメラの撮影
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
                $('#aed_inf_confirm').css("display","inline-block")
                $('#video').css("display","none")


                $('#retry').on('click',function(){
                    localstream.getTracks()[0].enabled = true;
                    $('#shutter').css("display","inline-block")
                    $('#retry').css("display","none")
                    $('#video').css("display","block")
                    $('#image').removeAttr('src');
                    $('#aed_inf_confirm').css("display","none")
                });

                $('#aed_inf_confirm').on('click',function(){
                    let canvas = document.getElementById("canvas")
                    //Base64は先頭のminetype(data:image/png;base64,の部分）は不要なため削除
                    let canvas_data = canvas.toDataURL("image/jpeg").replace(/^.*,/, '')
                    $("#aed_information_image_url").val(canvas_data)
                    $('#aed_inf_form').submit()
                })
            })
        })
    }
    //ハンバーガメニュー操作
    $(function() {
        $('.menu-trigger').on('click',function(){
            if($(this).hasClass('active')){
                $(this).removeClass('active')
                $('main').removeClass('open')
                $('nav').removeClass('open')
                $('.overlay').removeClass('open')
            } else {
                $(this).addClass('active')
                $('main').addClass('open')
                $('nav').addClass('open')
                $('.overlay').addClass('open')
            }
        })
        $('.menu-trigger-form').on('click',function(){
            if($(this).hasClass('active')){
                $(this).removeClass('active')
                $('main').removeClass('open')
                $('nav').removeClass('open')
                $('.overlay').removeClass('open')
            } else {
                $(this).addClass('active')
                $('main').addClass('open')
                $('nav').addClass('open')
                $('.overlay').addClass('open')
            }
        })

        $('.overlay').on('click',function(){
            if($(this).hasClass('open')){
                $(this).removeClass('open')
                $('.menu-trigger').removeClass('active')
                $('.menu-trigger-form').removeClass('active')
                $('main').removeClass('open')
                $('nav').removeClass('open')
            }
        })
    })

    if($('#editMap').length) {
        let STARTZOOMLEVEL = 18
        let map = mapInit(gon.aed_inf['latitude'], gon.aed_inf['longitude'])
        let marker = L.marker([gon.aed_inf['latitude'], gon.aed_inf['longitude']],{icon: L.icon({
                iconUrl: 'https://unpkg.com/leaflet@1.3.1/dist/images/marker-icon.png',
                className: 'leaflet-marker-icon-color-green'
            })}).addTo(map)
        let modification_marker = L.marker([gon.aed_inf['latitude'], gon.aed_inf['longitude']])
        let search_markers
        //緯度経度修正マーカーを設置
        map.on('dblclick', function(e) {
            map.removeLayer(modification_marker)
            modification_marker = L.marker([e.latlng.lat, e.latlng.lng],{icon: L.icon({
                    iconUrl: 'https://unpkg.com/leaflet@1.3.1/dist/images/marker-icon.png',
                    className: 'leaflet-marker-icon-color-red'
                })}).addTo(map)
            modification_marker.on('click', function (e) {
                map.setView([e.latlng.lat, e.latlng.lng], 18)
            })
        })
        marker.on('click', function (e) {
            map.setView([e.latlng.lat, e.latlng.lng], 18)
        })
        //施設名から候補をマーカー表示
        $('.search_position_submit').on('click',function(){
            dispLoading("読み込み中...")
            $('.search_position').val()
            if(typeof search_markers === 'undefined'){
                search_markers = L.markerClusterGroup()
            }else{
                search_markers.clearLayers()
            }
            $.ajax({
                type: 'GET',
                url: location.pathname,
                data: {search_word: $('.search_position').val(), mode: "position"},
                dataType: 'json'
            }).done(function (data) {
                removeLoading()
                data['response'].forEach(function (local_inf_list) {
                    let search_marker = L.marker(local_inf_list['geometry']).bindPopup(local_inf_list['name'])
                    search_markers.addLayer(search_marker)

                    search_marker.on('click', function (e) {
                       $("#editMap > div > .leaflet-popup-pane > div > .leaflet-popup-content-wrapper > .leaflet-popup-content").css({"width":"440px"})
                    })
                })

                map.addLayer(search_markers)

            }).fail(function () {
                removeLoading()
                alert('情報の取得に失敗しました')
            })
        })
        //緯度経度から郵便番号と住所を検索
        $('.search_address_submit').on('click',function(){
            dispLoading('検索中...')
            if($('#aed_information_latitude').val() === "" || $('#aed_information_longitude').val() === "" ){
                alert('緯度か経度の値が空です')
            }else{
                $.ajax({
                    type: 'GET',
                    url: location.pathname,
                    data: {search_latlon: [$('#aed_information_latitude').val(), $('#aed_information_longitude').val()], mode: "address"},
                    dataType: 'json'
                }).done(function (data) {
                    removeLoading()
                    if(window.confirm(`〒　　　　${data['response']['zipcode']}\n都道府県　${data['response']['prefecture']}\n住所　　　${data['response']['address']}`)) {
                        $('#aed_information_postal_code').val(data['response']['zipcode'])
                        $('#aed_information_prefecture').val(data['response']['prefecture'])
                        $('#aed_information_address').val(data['response']['address'])
                    }else{
                        alert('情報の反映をキャンセルしました')
                    }

                }).fail(function () {
                    removeLoading()
                    alert('情報の取得に失敗しました')
                })
            }
        })
        //住所から緯度経度を検索
        $('.search_latlon_submit').on('click',function(){
            dispLoading("検索中...")
            if($('#aed_information_address').val() === "" ){
                alert('住所の値が空です')
            }else{
                $.ajax({
                    type: 'GET',
                    url: location.pathname,
                    data: {search_address: $('#aed_information_prefecture').val()+$('#aed_information_address').val(), mode: "latlon"},
                    dataType: 'json'
                }).done(function (data) {
                    removeLoading()
                    map.removeLayer(modification_marker)
                    modification_marker = L.marker([data['response']['lat'], data['response']['lon']]).addTo(map)
                    map.setView([data['response']['lat'], data['response']['lon']], 18)

                }).fail(function () {
                    removeLoading()
                    alert('情報の取得に失敗しました')
                })
            }
        })
        //修正マーカーの位置にマーカーを設定
        $('.search_modification_latlon_submit').on('click',function(){
            if(modification_marker["_latlng"]["lat"] === marker["_latlng"]["lat"] && modification_marker["_latlng"]["lng"] === marker["_latlng"]["lng"]) {
                alert('修正用のマーカーが存在しません')
            }else{
                let lat = modification_marker['_latlng']['lat']
                let lon = modification_marker['_latlng']['lng']
                map.setView([lat, lon], 18)
                setTimeout(function(){
                    if(window.confirm('マーカーの位置と緯度経度を修正しますがよろしいでしょうか？')) {
                        map.removeLayer(modification_marker)
                        map.removeLayer(marker)
                        marker = L.marker([lat, lon],{icon: L.icon({
                                iconUrl: 'https://unpkg.com/leaflet@1.3.1/dist/images/marker-icon.png',
                                className: 'leaflet-marker-icon-color-green'
                            })}).addTo(map)
                        $('#aed_information_latitude').val(lat)
                        $('#aed_information_longitude').val(lon)
                    }else{
                        alert('情報の反映をキャンセルしました')
                    }
                }, 1500);
            }
        })
        //削除確認
        $('.edit-delete-btn').on('click',function(){
            if(confirm('本当に削除してもよろしいですか？')){
            }else{
                alert('削除しませんでした')
                return false
            }
        })

        function mapInit(latitude, longitude) {
            //地図の初期設定
            let map = L.map('editMap',{doubleClickZoom: false}).setView([latitude, longitude], STARTZOOMLEVEL);
            //地図のタイル設定
            L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://maps.gsi.go.jp/development/ichiran.html">国土地理院</a>'
            }).addTo(map);
            //地図のスケール表示
            L.control.scale({imperial: false}).addTo(map);
            return map
        }
    }

    // アイコンをクリックした場合は、ファイル選択をクリックした挙動とする.
    $('#file_select_icon').on('click', function() {
        $('#file_select').click()
    });
    // ファイル選択時に表示用テキストボックスへ値を連動させる.
    $('#file_select').parent().on('change', '#file_select', function() {
        $('#file_name').val($('#file_select').prop('files')[0].name)
    });
    // ファイル選択値をクリア.
    $('#btn_clear_file').on('click', function() {
        $('#file_select').html('<input class="form-control" style="display:none" type="file" name="file_select" id="file_select">')
        $('#file_name').val('')
    })
    //　送信ボタン制御
    $(".import_submit").on('click', function() {
        if($('#file_name').val() === ""){
            alert('ファイルが選択されていません')
            return false
        }else{
            return true
        }
    })
    //セレクトボックスで選択時
    $(".prefecture-select > select").on('change', function() {
        dispLoading('読み込み中...')
        $.ajax({
            type: 'GET',
            url: '/aed_information_managements/search',
            data: {search_prefecture: $(this).val()},
            dataType: 'script'
        }).done(function () {
            removeLoading()
        }).fail(function () {
            removeLoading()
            alert('情報の取得に失敗しました')
        })
    })
    $(window).resize(function(){
        if($(window).width() > 735){
            $('.menu-trigger').removeClass('active')
            $('main').removeClass('open')
            $('nav').removeClass('open')
            $('.overlay').removeClass('open')
        }
    })
    // ロード画面
    function dispLoading(msg){
        if( msg === undefined ){
            msg = ""
        }
        // 画面表示メッセージ
        let dispMsg = "<div class='loadingMsg'>" + msg + "</div>"
        if($("#loading").length === 0){
            $("body").append("<div id='loading'>" + dispMsg + "</div>")
        }
    }
    //　ロード画面終了
    function removeLoading(){
        $("#loading").remove()
    }
    //　ロード待機画面表示
    $(".load-event").on('click', function() {
        dispLoading("読み込み中...")
    })
})




