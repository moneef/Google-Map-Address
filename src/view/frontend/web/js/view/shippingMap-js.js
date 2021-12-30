define([
    'jquery',
    'uiComponent',
    'ko',
    'Magento_Ui/js/modal/modal',
    'Pixicommerce_GoogleMapAddress/js/model/map-config-provider',
], function ($, Component, ko, modal, mapData) {
    'use strict';
    var countryId = '';
    var countryName = '';
    var postalCode = '';
    var stateName = '';
    var addressData = '';
    var timer = '';
    var mapDataValue = mapData.getMapData();
    return Component.extend({
        // defaults: {
        //     template: 'Pixicommerce_GoogleMapAddress/form/element/elements'
        // },
        initialize: function () {
            return this._super();
        },
        initCustomEvents: function () {
            var self = this;
            $(document)
                .find(
                    "#opc-new-shipping-address div[name = 'shippingAddress.custom_attributes.longitude']"
                )
                .append($('.mapContainer'));
            if (!$(document).find('#opc-new-shipping-address').length) {
                $(document)
                    .find(
                        "div[name = 'shippingAddress.custom_attributes.longitude']"
                    )
                    .append($('.mapContainer'));
                $('.mapContainer').css({
                    height: '13%',
                    width: '500px',
                    'margin-top': '10px',
                    border: '1px solid rgb(5, 162, 253)',
                });
                if (mapDataValue['status'] != '0') {
                    if ($(document).find('.mapContainer').length) {
                        $(document)
                            .find('#opc-shipping_method')
                            .css({ 'margin-top': '278px' });
                    }
                }
            }
            $('.mapContainerBilling').hide();
        },
        onElementRender: function () {
            var self = this;
            self.initCustomEvents();
            if (mapDataValue['status'] != '0') {
                if (mapDataValue['api_key'] != null) {
                    var shipLongitude = $(document)
                        .find(
                            "div[name = 'shippingAddress.custom_attributes.longitude'] input[name = 'custom_attributes[longitude]']"
                        )
                        .val();
                    var shipLatitude = $(document)
                        .find(
                            "div[name = 'shippingAddress.custom_attributes.latitude'] input[name = 'custom_attributes[latitude]']"
                        )
                        .val();
                    var myLatLng = {
                        lat: shipLatitude
                            ? parseFloat(shipLatitude)
                            : -25.33333,
                        lng: shipLongitude
                            ? parseFloat(shipLongitude)
                            : 131.044,
                    };
                    geoCoderLocationGate(myLatLng);

                    var map = new google.maps.Map(
                        document.getElementById('map'),
                        {
                            center: myLatLng,
                            zoom: 8,
                        }
                    );
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
                            var latLng = { lat: latit, lng: longi };
                            $(document)
                                .find(
                                    "div[name = 'shippingAddress.custom_attributes.longitude'] input[name = 'custom_attributes[longitude]']"
                                )
                                .val(longi);
                            $(document)
                                .find(
                                    "div[name = 'shippingAddress.custom_attributes.longitude'] input[name = 'custom_attributes[longitude]']"
                                )
                                .trigger('keyup');
                            $(document)
                                .find(
                                    "div[name = 'shippingAddress.custom_attributes.latitude'] input[name = 'custom_attributes[latitude]']"
                                )
                                .val(latit);
                            $(document)
                                .find(
                                    "div[name = 'shippingAddress.custom_attributes.latitude'] input[name = 'custom_attributes[latitude]']"
                                )
                                .trigger('keyup');
                            geoCoderLocationGate(latLng);
                        }
                    );

                    function geoCoderLocationGate(latLng) {
                        var geocoder = new google.maps.Geocoder();
                        var streetAddress = '';
                        geocoder.geocode(
                            {
                                latLng: latLng,
                            },
                            function (results, status) {
                                if (status == google.maps.GeocoderStatus.OK) {
                                    if (results[0]) {
                                        var addrComp =
                                            results[0].address_components;
                                        for (
                                            var i = addrComp.length - 1;
                                            i >= 0;
                                            i--
                                        ) {
                                            if (
                                                addrComp[i].types[0] ==
                                                'country'
                                            ) {
                                                var country =
                                                    addrComp[i].short_name;
                                                $(document)
                                                    .find(
                                                        "div[name ='shippingAddress.country_id'] select[name='country_id'] option[value='" +
                                                            country +
                                                            "']"
                                                    )
                                                    .attr('selected', true);
                                                $(document)
                                                    .find(
                                                        "div[name ='shippingAddress.country_id'] select[name='country_id']"
                                                    )
                                                    .trigger('change');
                                            } else if (
                                                addrComp[i].types[0] ==
                                                'administrative_area_level_1'
                                            ) {
                                                var state =
                                                    addrComp[i].long_name;
                                                if (
                                                    $(document)
                                                        .find(
                                                            "div[name ='shippingAddress.region_id'] select[name = 'region_id']"
                                                        )
                                                        .is(':visible')
                                                ) {
                                                    $(document)
                                                        .find(
                                                            'div[name ="shippingAddress.region_id"] select[name = "region_id"] option:contains("' +
                                                                state +
                                                                '")'
                                                        )
                                                        .attr('selected', true);
                                                    $(document)
                                                        .find(
                                                            "div[name ='shippingAddress.region'] input[name = region]"
                                                        )
                                                        .attr('value', '');
                                                    $(document)
                                                        .find(
                                                            'div[name ="shippingAddress.region_id"] select[name = "region_id"]'
                                                        )
                                                        .trigger('change');
                                                } else {
                                                    $(document)
                                                        .find(
                                                            "div[name ='shippingAddress.region'] input[name = region]"
                                                        )
                                                        .val(state);
                                                    $(document)
                                                        .find(
                                                            "div[name ='shippingAddress.region'] input[name = region]"
                                                        )
                                                        .trigger('keyup');
                                                }
                                            } else if (
                                                addrComp[i].types[0] ==
                                                'administrative_area_level_2'
                                            ) {
                                                var city =
                                                    addrComp[i].long_name;
                                                var city = $(document)
                                                    .find(
                                                        'div[name ="shippingAddress.city"] input[name="city"]'
                                                    )
                                                    .val(city);
                                                $(document)
                                                    .find(
                                                        'div[name ="shippingAddress.city"] input[name="city"]'
                                                    )
                                                    .trigger('keyup');
                                            } else if (
                                                addrComp[i].types[0] ==
                                                'postal_code'
                                            ) {
                                                var postal =
                                                    addrComp[i].long_name;
                                                var city = $(document)
                                                    .find(
                                                        'div[name ="shippingAddress.postcode"] input[name="postcode"]'
                                                    )
                                                    .val(postal);
                                                $(document)
                                                    .find(
                                                        'div[name ="shippingAddress.postcode"] input[name="postcode"]'
                                                    )
                                                    .trigger('keyup');
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
                                                addrComp[i].types[0] ==
                                                'locality'
                                            ) {
                                                streetAddress =
                                                    addrComp[i].long_name +
                                                    ', ' +
                                                    streetAddress;
                                            }
                                        }
                                        if (streetAddress) {
                                            streetAddress =
                                                streetAddress.trim();
                                            streetAddress =
                                                streetAddress.substring(
                                                    0,
                                                    streetAddress.length - 1
                                                );
                                            $(document)
                                                .find(
                                                    "div[name = 'shippingAddress.street.0'] input[name = 'street[0]']"
                                                )
                                                .val(streetAddress);
                                            $(document)
                                                .find(
                                                    "div[name = 'shippingAddress.street.0'] input[name = 'street[0]']"
                                                )
                                                .trigger('keyup');
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
                    function geoCoderLocationGatebyCustomAddress(addressData) {
                        var geocoder = new google.maps.Geocoder();
                        geocoder.geocode(
                            {
                                address: addressData,
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
                                        $(
                                            "div[name = 'shippingAddress.custom_attributes.longitude'] input[name = 'custom_attributes[longitude]']"
                                        ).val(addrLongitude);
                                        $(
                                            "div[name = 'shippingAddress.custom_attributes.longitude'] input[name = 'custom_attributes[longitude]']"
                                        ).trigger('keyup');
                                        $(
                                            "div[name = 'shippingAddress.custom_attributes.latitude'] input[name = 'custom_attributes[latitude]']"
                                        ).val(addrLatitude);
                                        $(
                                            "div[name = 'shippingAddress.custom_attributes.latitude'] input[name = 'custom_attributes[latitude]']"
                                        ).trigger('keyup');
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
                    function loadEvent() {
                        $(document)
                            .find(
                                "div[name ='shippingAddress.country_id'] select[name='country_id']"
                            )
                            .focusout(function () {
                                countryId = $(document)
                                    .find(
                                        "div[name ='shippingAddress.country_id'] select[name='country_id']"
                                    )
                                    .val();
                                countryName = $(document)
                                    .find(
                                        "div[name ='shippingAddress.country_id'] select[name='country_id'] option[value='" +
                                            countryId +
                                            "']"
                                    )
                                    .text();

                                if (countryName && postalCode && stateName) {
                                    addressData =
                                        stateName +
                                        ' ' +
                                        postalCode +
                                        ', ' +
                                        countryName;
                                    getAddressShipping(addressData);
                                }
                            });
                        $(document)
                            .find(
                                "div[name ='shippingAddress.region_id'] select[name = 'region_id']"
                            )
                            .focusout(function () {
                                stateName = $(document)
                                    .find(
                                        "div[name ='shippingAddress.region_id'] select[name='region_id'] option:selected"
                                    )
                                    .text();

                                if (countryName && postalCode && stateName) {
                                    addressData =
                                        stateName +
                                        ' ' +
                                        postalCode +
                                        ', ' +
                                        countryName;
                                    getAddressShipping(addressData);
                                }
                            });
                        $(document)
                            .find(
                                "div[name ='shippingAddress.region'] input[name = 'region']"
                            )
                            .focusout(function () {
                                stateName = $(document)
                                    .find(
                                        "div[name ='shippingAddress.region'] input[name='region']"
                                    )
                                    .val();

                                if (countryName && postalCode && stateName) {
                                    addressData =
                                        stateName +
                                        ' ' +
                                        postalCode +
                                        ', ' +
                                        countryName;
                                    getAddressShipping(addressData);
                                }
                            });
                        $(document)
                            .find(
                                "div[name ='shippingAddress.postcode'] input[name = 'postcode']"
                            )
                            .focusout(function () {
                                postalCode = $(document)
                                    .find(
                                        "div[name ='shippingAddress.postcode'] input[name='postcode']"
                                    )
                                    .val();
                                if (countryName && postalCode && stateName) {
                                    addressData =
                                        stateName +
                                        ' ' +
                                        postalCode +
                                        ', ' +
                                        countryName;
                                    getAddressShipping(addressData);
                                }
                            });
                    }
                    $(document).on(
                        'click',
                        '.edit-address-link, .new-address-popup .action-show-popup',
                        function () {
                            loadEvent();
                        }
                    );
                    timer = setTimeout(function () {
                        if (
                            $(document).find(
                                "div[name ='shippingAddress.country_id'] select[name='country_id']"
                            ).length
                        ) {
                            loadEvent();
                            clearTimeout(timer);
                        }
                    }, 500);
                    function getAddressShipping(addressData) {
                        geoCoderLocationGatebyCustomAddress(addressData);
                        countryId = '';
                        countryName = '';
                        postalCode = '';
                        stateName = '';
                        addressData = '';
                    }
                }
            }
        },
    });
});
