define([
    'ko',
    'jquery',
    'uiComponent',
    'Magento_Ui/js/modal/modal',
    'Magento_Checkout/js/checkout-data',
    'Magento_Checkout/js/model/payment-service',
    'Pixiedia_GoogleMapAddress/js/view/shippingMap-js',
    'Pixiedia_GoogleMapAddress/js/model/map-config-provider',
], function (
    $,
    ko,
    modal,
    mapData,
    Component,
    magecheck,
    shippingMap,
    paymentData
) {
    'use strict';
    var i = 1;
    var markerbilling = '';
    var selectedMethod = '';
    var mapDataValue = mapData.getMapData();
    var paymentMethodList = '';

    return Component.extend({
        initCustomEvents: function () {
            paymentMethodList = paymentData.getAvailablePaymentMethods();
            var self = this;
            
            $('.billing-address-same-as-shipping-block').click(function (
                event
            ) {
                if (
                    $(this).find('input[type = checkbox]').is(':checked') ==
                    false
                ) {
                    selectedMethod = magecheck.getSelectedPaymentMethod();
                    if (selectedMethod == null) {
                        selectedMethod = paymentMethodList[0]['method'];
                    }
                    var longiDivName =
                        'billingAddress' +
                        selectedMethod +
                        '.custom_attributes.longitude';
                    var linkurl = window.location.href;
                    var res = linkurl.match(/payment/g);
                    if (res[0] == 'payment') {
                        $("div[name = '" + longiDivName + "']").append(
                            $('.mapContainerBilling')
                        );
                        $('.mapContainerBilling').show();
                        if (mapDataValue['status'] != '0') {
                            if ($('.mapContainerBilling').length) {
                                if (
                                    !$(
                                        '.billing-address-form .fieldset.address .choice.field'
                                    ).length
                                ) {
                                    $("div[name = '" + longiDivName + "']").css(
                                        { 'margin-bottom': '200px' }
                                    );
                                }
                            }
                        }
                    }
                }
            });

            $('.opc-progress-bar-item').click(function (events) {
                var linkurl = window.location.href;
                var res = linkurl.match(/shipping/g);
                if (res[0] == 'shipping') {
                    $('.mapContainerBilling').hide();
                    if (i) {
                        shippingMap().onElementRender();
                        i = 0;
                    }
                }
            });

            $('.billing-address-details .action.action-edit-address').click(
                function () {
                    selectedMethod = magecheck.getSelectedPaymentMethod();
                    if (selectedMethod == null) {
                        selectedMethod = paymentMethodList[0]['method'];
                    }
                    var longiDivName =
                        'billingAddress' +
                        selectedMethod +
                        '.custom_attributes.longitude';
                    var linkurl = window.location.href;
                    var res = linkurl.match(/payment/g);
                    if (res[0] == 'payment') {
                        $("div[name = '" + longiDivName + "']").append(
                            $('.mapContainerBilling')
                        );
                        $('.mapContainerBilling').show();
                        if (
                            !$(
                                '.billing-address-form .fieldset.address .choice.field'
                            ).length
                        ) {
                            $("div[name = '" + longiDivName + "']").css({
                                'margin-bottom': '200px',
                            });
                        }
                    }
                }
            );
        },
        _create: function () {},
        afterElementRender: function () {
            var self = this;
            if (mapDataValue['status'] != '0') {
                if (mapDataValue['api_key'] != null) {
                    self.initCustomEvents();
                    selectedMethod = magecheck.getSelectedPaymentMethod();
                    if (selectedMethod == null) {
                        selectedMethod = paymentMethodList[0]['method'];
                    }
                    var longiDivName =
                        'billingAddress' +
                        selectedMethod +
                        '.custom_attributes.longitude';
                    var latiDivName =
                        'billingAddress' +
                        selectedMethod +
                        '.custom_attributes.latitude';
                    var billLongitude = $(
                        "div[name = '" +
                            longiDivName +
                            "'] input[name = 'custom_attributes[longitude]']"
                    ).val();
                    var billLatitude = $(
                        "div[name = '" +
                            latiDivName +
                            "'] input[name = 'custom_attributes[latitude]']"
                    ).val();
                    var myLatLng = {
                        lat: billLatitude
                            ? parseFloat(billLatitude)
                            : -25.33333,
                        lng: billLongitude
                            ? parseFloat(billLongitude)
                            : 131.044,
                    };
                    var mapbilling = new google.maps.Map(
                        document.getElementById('mapbilling'),
                        {
                            center: myLatLng,
                            zoom: 8,
                        }
                    );
                    markerbilling = new google.maps.Marker({
                        position: myLatLng,
                        map: mapbilling,
                        title: 'PinDrop',
                        draggable: true,
                    });
                    google.maps.event.addListener(
                        markerbilling,
                        'dragend',
                        function (event) {
                            var latit = this.getPosition().lat();
                            var longi = this.getPosition().lng();
                            var latLng = { lat: latit, lng: longi };
                            var longiDivName =
                                'billingAddress' +
                                selectedMethod +
                                '.custom_attributes.longitude';
                            var latiDivName =
                                'billingAddress' +
                                selectedMethod +
                                '.custom_attributes.latitude';
                            $(
                                "div[name = '" +
                                    longiDivName +
                                    "'] input[name = 'custom_attributes[longitude]']"
                            ).val(longi);
                            $(
                                "div[name = '" +
                                    longiDivName +
                                    "'] input[name = 'custom_attributes[longitude]']"
                            ).trigger('keyup');
                            $(
                                "div[name = '" +
                                    latiDivName +
                                    "'] input[name = 'custom_attributes[latitude]']"
                            ).val(latit);
                            $(
                                "div[name = '" +
                                    latiDivName +
                                    "'] input[name = 'custom_attributes[latitude]']"
                            ).trigger('keyup');
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
                                                var countryDivName =
                                                    'billingAddress' +
                                                    selectedMethod +
                                                    '.country_id';
                                                var country =
                                                    addrComp[i].short_name;
                                                $(
                                                    "div[name = '" +
                                                        countryDivName +
                                                        "'] select[name='country_id'] option[value='" +
                                                        country +
                                                        "']"
                                                ).attr('selected', true);
                                                $(
                                                    "div[name = '" +
                                                        countryDivName +
                                                        "'] select[name='country_id']"
                                                ).trigger('change');
                                            } else if (
                                                addrComp[i].types[0] ==
                                                'administrative_area_level_1'
                                            ) {
                                                var state =
                                                    addrComp[i].long_name;
                                                var stateDivName =
                                                    'billingAddress' +
                                                    selectedMethod +
                                                    '.region_id';
                                                if (
                                                    $(
                                                        "div[name = '" +
                                                            stateDivName +
                                                            "'] select[name = 'region_id']"
                                                    ).is(':visible')
                                                ) {
                                                    $(
                                                        'div[name = "' +
                                                            stateDivName +
                                                            '"] select[name = "region_id"] option:contains("' +
                                                            state +
                                                            '")'
                                                    ).attr('selected', true);
                                                    $(
                                                        'input[name = region]'
                                                    ).attr('value', '');
                                                    $(
                                                        'div[name = "' +
                                                            stateDivName +
                                                            '"] select[name = "region_id"]'
                                                    ).trigger('change');
                                                } else {
                                                    var stateDivName =
                                                        'billingAddress' +
                                                        selectedMethod +
                                                        '.region';
                                                    $(
                                                        'div[name = "' +
                                                            stateDivName +
                                                            '"] input[name = region]'
                                                    ).val(state);
                                                    $(
                                                        'div[name = "' +
                                                            stateDivName +
                                                            '"] input[name = region]'
                                                    ).trigger('keyup');
                                                }
                                            } else if (
                                                addrComp[i].types[0] ==
                                                'administrative_area_level_2'
                                            ) {
                                                var city =
                                                    addrComp[i].long_name;
                                                var cityDivName =
                                                    'billingAddress' +
                                                    selectedMethod +
                                                    '.city';
                                                $(
                                                    'div[name = "' +
                                                        cityDivName +
                                                        '"] input[name="city"]'
                                                ).val(city);
                                                $(
                                                    'div[name = "' +
                                                        cityDivName +
                                                        '"] input[name="city"]'
                                                ).trigger('keyup');
                                            } else if (
                                                addrComp[i].types[0] ==
                                                'postal_code'
                                            ) {
                                                var postal =
                                                    addrComp[i].long_name;
                                                var postalDivName =
                                                    'billingAddress' +
                                                    selectedMethod +
                                                    '.postcode';
                                                $(
                                                    'div[name = "' +
                                                        postalDivName +
                                                        '"] input[name="postcode"]'
                                                ).val(postal);
                                                $(
                                                    'div[name = "' +
                                                        postalDivName +
                                                        '"] input[name="postcode"]'
                                                ).trigger('keyup');
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
                                            var streetDivName =
                                                'billingAddress' +
                                                selectedMethod +
                                                '.street.0';
                                            $(
                                                "div[name = '" +
                                                    streetDivName +
                                                    "'] input[name = 'street[0]']"
                                            ).val(streetAddress);
                                            $(
                                                "div[name = '" +
                                                    streetDivName +
                                                    "'] input[name = 'street[0]']"
                                            ).trigger('keyup');
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
                }
            }
        },
    });
});
