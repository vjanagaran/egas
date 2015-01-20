/**
 * Global config file to load server / application settings and constants 
 */
config = function () {
    'use strict';
    return {
        showlog: 3, // 0: "Disabled", 1: "Error", 2: "Warning", 3: "Info"
        api_url: "http://jayam.co.uk/shosho/api.php?",
        user_name: "sho_sho_user_name",
        user_mobile: "sho_sho_user_mobile",
        user_email: "sho_sho_user_email",
        user_password: "sho_sho_user_password",
        user_address1: "sho_sho_user_address1",
        user_address2: "sho_sho_user_address2",
        user_area: "sho_sho_user_area",
        user_pincode: "sho_sho_user_pincode",
        user_city: "sho_sho_user_city",
        user_image: "sho_sho_user_image",
        user_id: "sho_sho_userid",
        user_alternet_number: "sho_sho_user_alternet_number",
        device_token: "sho_sho_device_token"
    };
}();

function setVal(key, value) {
    window.localStorage.setItem(key, value);
}

function getVal(key) {
    var value;
    value = window.localStorage.getItem(key);
    return  value;
}

function removeVal(key) {
    window.localStorage.removeItem(key);
}

function clearAll() {
    window.localStorage.clear();
}