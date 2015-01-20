var push = {};
var PWAppID = "AC4D4-E4A45";
var GoogleAppID = "1069059125213";

push.pushNotification = null;
push.initPushwoosh = function () {
    push.pushNotification = window.plugins.pushNotification;

    if (device.platform === "Android") {
        registerPushwooshAndroid();
        alert("Init push on android");
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
                alert(title);
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
    alert(pushToken);
    push.pushNotification.getPushToken(
            function (token) {
                setVal(config.device_token, token);
                alert(token);
                console.warn('push token: ' + token);
            });
}

function registerPushwooshIOS() {
    document.addEventListener('push-notification',
            function (event) {
                var notification = event.notification;
                alert(notification.aps.alert);
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