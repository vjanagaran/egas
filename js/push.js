var push = {};
var PWAppID = "7F606-37FFF";
var GoogleAppID = "564849744820";

push.pushNotification = null;
push.initPushwoosh = function () {
    push.pushNotification = window.plugins.pushNotification;

    if (device.platform === "Android") {
        registerPushwooshAndroid();
    }
    if (device.platform === "iPhone" || device.platform === "iOS") {
        registerPushwooshIOS();
    }
};

function registerPushwooshAndroid() {
    document.addEventListener('push-notification',
            function (event) {
                var title = event.notification.title;
                var userData = event.notification.userdata;
                //dump custom data to the console if it exists
                if (typeof (userData) !== "undefined") {
                    console.warn('user data: ' + JSON.stringify(userData));
                }
                $("#externalpopup_text").html(title);
                $("#externalpopup").popup("open");
                //push_message = title;
            });

    push.pushNotification.onDeviceReady({projectid: GoogleAppID, appid: PWAppID});

    push.pushNotification.registerDevice(
            function (token) {
                onPushwooshAndroidInitialized(token);
            },
            function (status) {
                alert("failed to register: " + status);
                console.warn(JSON.stringify(['failed to register ', status]));
            });
}

function onPushwooshAndroidInitialized(pushToken) {
    push.pushNotification.getPushToken(
            function (token) {
                setVal(config.device_token, token);
                console.warn('push token: ' + token);
            });
}

function registerPushwooshIOS() {
    document.addEventListener('push-notification',
            function (event) {
                var notification = event.notification;
                $("#externalpopup_text").html(notification.aps.alert);
                $("#externalpopup").popup("open");
                //push_message = notification.aps.alert;
                push.pushNotification.setApplicationIconBadgeNumber(0);
            });

    //initialize the plugin
    push.pushNotification.onDeviceReady({pw_appid: PWAppID});

    //register for pushes
    push.pushNotification.registerDevice(
            function (status) {
                var deviceToken = status['deviceToken'];
                console.log('registerDevice: ' + deviceToken);
                onPushwooshiOSInitialized(deviceToken);
            },
            function (status) {
                console.warn('failed to register : ' + JSON.stringify(status));
            });
    //reset badges on start
    push.pushNotification.setApplicationIconBadgeNumber(0);
}

function onPushwooshiOSInitialized(pushToken) {
    push.pushNotification = window.plugins.pushNotification;
    push.pushNotification.getPushToken(function (token) {
        setVal(config.device_token, token);
        console.log('push token device: ' + token);
    });
}