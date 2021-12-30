define(['jquery', 'jquery/ui'], function ($) {
    'use strict';
    var countryId = '';
    var countryName = '';
    var postalCode = '';
    var stateName = '';
    var addressData = '';
    $.widget('google_map_address.mapjs', {
        _create: function () {
            var apiKey = this.options.ApiKey;
            if (apiKey != '') {
                // google.maps.event.addDomListener(window, 'load', initAutocomplete);
                var field = '';
                var postal = $('#zip').val();
                var city = $('#city').val();
                var countryCode = $('#country').val();
                var country = $(
                    "#country option[value='" + countryCode + "']"
                ).text();
                var state = $('#region').val();
                // var geocoder = new google.maps.Geocoder();
                var latitude = $('#latitude').val();
                var longitude = $('#longitude').val();
                var latLng = {
                    lat: latitude ? parseFloat(latitude) : '',
                    lng: longitude ? parseFloat(longitude) : '',
                };
                var address = city + ',' + country;
                if (latLng.lat != '') {
                    address = null;
                } else {
                    latLng = '';
                }
                var myLatLng = {
                    lat: latitude ? parseFloat(latitude) : -25.33333,
                    lng: longitude ? parseFloat(longitude) : 131.044,
                };
                if (address != null) {
                    geoCoderLocationGatebyAddress(address);
                }

                var map = new google.maps.Map(document.getElementById('map'), {
                    zoom: 4,
                    center: myLatLng,
                });
                var marker = new google.maps.Marker({
                    position: myLatLng,
                    map: map,
                    title: 'PinDrop',
                    draggable: true,
                });
                google.maps.event.addListener(
                    marker,
                    'dragend',
                    function (event) {
                        var latit = this.getPosition().lat();
                        var longi = this.getPosition().lng();
                        $('#latitude').val(latit);
                        $('#longitude').val(longi);
                        latLng = { lat: latit, lng: longi };
                        geoCoderLocationGate(latLng);
                    }
                );
                function geoCoderLocationGate(latLng) {
                    var geocoder = new google.maps.Geocoder();
                    geocoder.geocode(
                        {
                            latLng: latLng,
                        },
                        function (results, status) {
                            if (status == google.maps.GeocoderStatus.OK) {
                                if (results[0]) {
                                    var streetAddress = '';
                                    var addrComp =
                                        results[0].address_components;
                                    for (
                                        var i = addrComp.length - 1;
                                        i >= 0;
                                        i--
                                    ) {
                                        if (addrComp[i].types[0] == 'country') {
                                            country = addrComp[i].short_name;
                                            $(
                                                '#country option[value="' +
                                                    country +
                                                    '"]'
                                            ).attr('selected', true);
                                            $('#country').trigger('change');
                                        } else if (
                                            addrComp[i].types[0] ==
                                            'administrative_area_level_1'
                                        ) {
                                            state = addrComp[i].long_name;
                                            if (
                                                $('#region_id').is(':disabled')
                                            ) {
                                                $('#region').val(state);
                                                $('#region').attr(
                                                    'value',
                                                    state
                                                );
                                            } else {
                                                $(
                                                    '#region_id option:contains("' +
                                                        state +
                                                        '")'
                                                ).attr('selected', true);
                                                $('#region').attr('value', '');
                                                $('#region_id').trigger(
                                                    'change'
                                                );
                                            }
                                        } else if (
                                            addrComp[i].types[0] ==
                                            'administrative_area_level_2'
                                        ) {
                                            city = addrComp[i].long_name;
                                            $('#city').val(city);
                                        } else if (
                                            addrComp[i].types[0] ==
                                            'postal_code'
                                        ) {
                                            postal = addrComp[i].long_name;
                                            $('#zip').val(postal);
                                        } else if (
                                            addrComp[i].types[0] ==
                                            'street_number'
                                        ) {
                                            streetAddress =
                                                addrComp[i].long_name +
                                                ', ' +
                                                streetAddress;
                                        } else if (
                                            addrComp[i].types[0] == 'route'
                                        ) {
                                            streetAddress =
                                                addrComp[i].long_name +
                                                ', ' +
                                                streetAddress;
                                        } else if (
                                            addrComp[i].types[0] ==
                                            'neighborhood'
                                        ) {
                                            streetAddress =
                                                addrComp[i].long_name +
                                                ', ' +
                                                streetAddress;
                                        } else if (
                                            addrComp[i].types[0] ==
                                            'sublocality_level_3'
                                        ) {
                                            streetAddress =
                                                addrComp[i].long_name +
                                                ', ' +
                                                streetAddress;
                                        } else if (
                                            addrComp[i].types[0] ==
                                            'sublocality_level_2'
                                        ) {
                                            streetAddress =
                                                addrComp[i].long_name +
                                                ', ' +
                                                streetAddress;
                                        } else if (
                                            addrComp[i].types[0] ==
                                            'sublocality_level_1'
                                        ) {
                                            streetAddress =
                                                addrComp[i].long_name +
                                                ', ' +
                                                streetAddress;
                                        } else if (
                                            addrComp[i].types[0] == 'locality'
                                        ) {
                                            streetAddress =
                                                addrComp[i].long_name +
                                                ', ' +
                                                streetAddress;
                                        }
                                    }
                                    if (streetAddress != '') {
                                        streetAddress = streetAddress.trim();
                                        streetAddress = streetAddress.substring(
                                            0,
                                            streetAddress.length - 1
                                        );
                                        $('#street_1').val(streetAddress);
                                    }
                                } else {
                                    alert('No results found');
                                }
                            } else {
                                alert('Geocoder failed due to: ' + status);
                            }
                        }
                    );
                }
                function geoCoderLocationGatebyAddress(address) {
                    var geocoder = new google.maps.Geocoder();
                    geocoder.geocode(
                        {
                            address: address,
                        },
                        function (results, status) {
                            if (status == google.maps.GeocoderStatus.OK) {
                                if (results[0]) {
                                    var addrLatitude =
                                        results[0].geometry.location.lat();
                                    var addrLongitude =
                                        results[0].geometry.location.lng();
                                    var latLangByAddress = {
                                        lat: addrLatitude,
                                        lng: addrLongitude,
                                    };
                                    $('#latitude').val(addrLatitude);
                                    $('#longitude').val(addrLongitude);
                                    marker.setPosition(latLangByAddress);
                                    map.setCenter(latLangByAddress);
                                    geoCoderLocationGate(latLangByAddress);
                                } else {
                                    alert('No results found');
                                }
                            } else {
                                alert('Geocoder failed due to: ' + status);
                            }
                        }
                    );
                }

                function getAddress(address) {
                    geoCoderLocationGatebyAddress(address);
                    countryId = '';
                    countryName = '';
                    postalCode = '';
                    stateName = '';
                    addressData = '';
                }
                $('#country').focusout(function () {
                    countryId = $(this).val();
                    countryName = $(
                        "#country option[value='" + countryId + "']"
                    ).text();
                    if (countryName && postalCode && stateName) {
                        addressData =
                            stateName + ' ' + postalCode + ', ' + countryName;
                        getAddress(addressData);
                    }
                });
                $('#region_id').focusout(function () {
                    stateName = $('#region_id option:selected').text();
                    if (countryName && postalCode && stateName) {
                        addressData =
                            stateName + ' ' + postalCode + ', ' + countryName;
                        getAddress(addressData);
                    }
                });
                $('#region').focusout(function () {
                    stateName = $(this).val();
                    if (countryName && postalCode && stateName) {
                        addressData =
                            stateName + ' ' + postalCode + ', ' + countryName;
                        getAddress(addressData);
                    }
                });
                $('#zip').focusout(function () {
                    postalCode = $(this).val();
                    if (countryName && postalCode && stateName) {
                        addressData =
                            stateName + ' ' + postalCode + ', ' + countryName;
                        getAddress(addressData);
                    }
                });
                // var placeSearch, autocomplete;

                // function initAutocomplete() {
                //   autocomplete = new google.maps.places.Autocomplete(
                //       $('#street_1'), {types: ['geocode']});
                //   autocomplete.setFields(['address_component']);
                //   // When the user selects an address from the drop-down, populate the
                //   // address fields in the form.
                //   autocomplete.addListener('place_changed', fillInAddress);
                // }

                // function fillInAddress() {
                //   // Get the place details from the autocomplete object.
                //   var place = autocomplete.getPlace();
                //   var streetAddress = '';
                //   postal = '';
                //   // Get each component of the address from the place details,
                //   // and then fill-in the corresponding field on the form.
                //   for (var i = place.address_components.length-1; i >= 0; i--) {
                //           var addressType = place.address_components[i].types[0];
                //                  if (addressType == "country") {
                //                      country = place.address_components[i].short_name;
                //                      $('#country option[value="'+country+'"]').attr("selected",true);
                //                      $('#country').trigger('change');
                //                   } else if (addressType == "administrative_area_level_1") {
                //                      state = place.address_components[i].long_name;
                //                      if($('#region_id').is(':disabled')){
                //                       $('#region').val(state);
                //                       $('#region').attr("value",state);
                //                     } else {
                //                       $('#region_id option:contains("'+state+'")').attr("selected",true);
                //                       $('#region').attr("value",'');
                //                       $('#region_id').trigger('change');
                //                     }
                //                   } else if (addressType == "administrative_area_level_2") {
                //                      city = place.address_components[i].long_name;
                //                      $('#city').val(city);
                //                   } else if (addressType == "postal_code") {
                //                      postal = place.address_components[i].long_name;
                //                      $('#zip').val(postal);
                //                   } else if (addressType == 'street_number') {
                //                     streetAddress = place.address_components[i].long_name +", "+ streetAddress;
                //                   } else if (addressType == 'route') {
                //                     streetAddress = place.address_components[i].long_name +", "+ streetAddress;
                //                   } else if (addressType == 'neighborhood') {
                //                     streetAddress = place.address_components[i].long_name +", "+ streetAddress;
                //                   } else if (addressType == 'sublocality_level_3') {
                //                     streetAddress = place.address_components[i].long_name +", "+ streetAddress;
                //                   } else if (addressType == 'sublocality_level_2') {
                //                     streetAddress = place.address_components[i].long_name +", "+ streetAddress;
                //                   } else if (addressType == 'sublocality_level_1') {
                //                     streetAddress = place.address_components[i].long_name +", "+ streetAddress;
                //                   } else if (addressType == 'locality') {
                //                     streetAddress = place.address_components[i].long_name+", "+ streetAddress;
                //                   }
                //      }
                //   if (streetAddress != '') {
                //     $("#street_1").val(streetAddress);
                //   }
                //   if (country && city && state && postal) {
                //      address =  city+","+state+" "+postal+","+country;
                //       getAddress(address);
                //   }
                // }

                // function geolocate() {
                //   if (navigator.geolocation) {
                //     navigator.geolocation.getCurrentPosition(function(position) {
                //       var geolocation = {
                //         lat: position.coords.latitude,
                //         lng: position.coords.longitude
                //       };
                //       var circle = new google.maps.Circle(
                //           {center: geolocation, radius: position.coords.accuracy});
                //       autocomplete.setBounds(circle.getBounds());
                //     });
                //   }
                // }
                // $("#street_1").focus(function() {
                //   geolocate();
                // });
            }
        },
    });
    return $.google_map_address.mapjs;
});
