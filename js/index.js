"use strict";
var is_mobile = document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1;
if (is_mobile) {
    document.addEventListener("deviceready", onDeviceReady, false);
    document.addEventListener("touchstart", function () {
    }, false);
} else {
    onDeviceReady();
}

function onDeviceReady() {
    $.mobile.defaultPageTransition = 'none';
    $.mobile.defaultDialogTransition = 'none';
    if (is_mobile) {
        push.initPushwoosh();
        window.analytics.startTrackerWithId('UA-59665096-1');
    }
}

var router = new $.mobile.Router([{
        "#loading": {handler: "loadingPage", events: "bs"},
        "#intro": {handler: "introPage", events: "bs"},
        "#register_one": {handler: "registerStepOnePage", events: "bs"},
        "#register": {handler: "registerPage", events: "bs"},
        "#verify": {handler: "verifyPage", events: "bs"},
        "#shopping": {handler: "shoppingPage", events: "bs"},
        "#shoppingitems(?:[?/](.*))?": {handler: "shoppingitemsPage", events: "bs"},
        "#cart": {handler: "cartPage", events: "bs"},
        "#delivery": {handler: "deliveryPage", events: "bs"},
        "#payment": {handler: "paymentPage", events: "bs"},
        "#me": {handler: "mePage", events: "bs"},
        "#orders": {handler: "ordersPage", events: "bs"},
        "#view_ordered_items(?:[?/](.*))?": {handler: "viewordereditemsPage", events: "bs"},
        "#more": {handler: "morePage", events: "bs"},
        "#contact": {handler: "contactPage", events: "bs"},
        "#faq": {handler: "faqPage", events: "bs"},
        "#about": {handler: "aboutPage", events: "bs"},
        "#policy": {handler: "policyPage", events: "bs"},
        "#rate": {handler: "ratePage", events: "bs"},
        "#feedback": {handler: "feedbackPage", events: "bs"}
    }],
        {
            loadingPage: function (type, match, ui) {
                log("Intro Page", 3);
                loadLocalData();
            },
            introPage: function (type, match, ui) {
                log("Intro Page", 3);
                getPromoVideo();
                if (is_mobile) {
                    window.analytics.trackView('Intro Page');
                }
            },
            registerPage: function (type, match, ui) {
                log("Register Page", 3);
                refreshRegister();
            },
            registerStepOnePage: function (type, match, ui) {
                log("Register Step One Page", 3);
                resetMobileNo();
                if (is_mobile) {
                    window.analytics.trackView('Register Page');
                }
            },
            verifyPage: function (type, match, ui) {
                log("Verification Page", 3);
                startTimer();
                if (is_mobile) {
                    window.analytics.trackView('Verification Page');
                }
            },
            shoppingPage: function (type, match, ui) {
                log("Catalog Page", 3);
                loadShopping();
                if (is_mobile) {
                    window.analytics.trackView('Catalog Page');
                }
            },
            shoppingitemsPage: function (type, match, ui) {
                log("Catalog Items page", 3);
                var params = router.getParams(match[1]);
                loadShoppingItems(params.cat);
                calcCart();
            },
            cartPage: function (type, match, ui) {
                log("Cart Items page", 3);
                showMyCart();
                $("#cart_items_total").html("&#8377;" + grand_total);
                if (is_mobile) {
                    window.analytics.trackView('Cart Page');
                }
            },
            deliveryPage: function (type, match, ui) {
                log("Delivery page", 3);
                $("#delivery_items_total").html("&#8377;" + grand_total);
                setDetails();
            },
            paymentPage: function (type, match, ui) {
                log("Payment Items page", 3);
                $("#cash_pay").attr("checked", true);
                $("#payment_items_total").html("&#8377;" + grand_total);
            },
            mePage: function (type, match, ui) {
                log("Me Page", 3);
                showMe();
                calcCart();
            },
            ordersPage: function (type, match, ui) {
                log("Orders page", 3);
                showOrders();
                calcCart();
            },
            viewordereditemsPage: function (type, match, ui) {
                log("View Ordered Items page", 3);
                var params = router.getParams(match[1]);
                loadOrderedItems(params.cat);
            },
            morePage: function (type, match, ui) {
                log("More page", 3);
                calcCart();
            },
            faqPage: function (type, match, ui) {
                log("FAQ page", 3);
                showFAQ();
            },
            aboutPage: function (type, match, ui) {
                log("About App page", 3);
                showAboutApp();
            },
            policyPage: function (type, match, ui) {
                log("Policy page", 3);
                showPolicy();
            },
            ratePage: function (type, match, ui) {
                log("Contact page", 3);
                setRate();
            },
            contactPage: function (type, match, ui) {
                log("Contact page", 3);
                showContact();
            },
            feedbackPage: function (type, match, ui) {
                log("Feedback Page", 3);
                showFeedbackForm();
            }
        }, {
    ajaxApp: true,
    defaultHandler: function (type, ui, page) {
        log("Default handler called due to unknown route (" + type + ", " + ui + ", " + page + ")", 1);
    },
    defaultHandlerEvents: "s",
    defaultArgsRe: true
});
$.addTemplateFormatter({
    menuHref: function (value, options) {
        return "#shoppingitems?cat=" + value;
    },
    menuItemClass: function (value, options) {
        var cls = "menu-items";
        return cls;
    },
    itemInfoClass: function (value, options) {
        var cls = "item-info";
        return cls;
    },
    itemQtyClass: function (value, options) {
        var cls = "item-qty";
        var remove = true;
        $.each(cart.items, function (index, item) {
            if (value == item.id) {
                remove = false;
            }
        });
        if (remove != false) {
            cls = cls + " remove_form";
        }
        return cls;
    },
    menuItemId: function (value, options) {
        return "menu_item_" + value;
    },
    menuItemOnclick: function (value, options) {
        return "toogleQtySection(" + value + ")";
    },
    itemQtyId: function (value, options) {
        return "item_qty_" + value;
    },
    itemTotal: function (value, options) {
        var val = 0;
        $.each(cart.items, function (index, item) {
            if (value == item.id) {
                val = parseFloat(item.qty) * parseFloat(item.rate);
            }
        });
        return "&#8377;" + val.toFixed(2);
    },
    itemQtyVal: function (value, options) {
        var val = 0;
        $.each(cart.items, function (index, item) {
            if (value == item.id) {
                val = item.qty;
            }
        });
        return val;
    },
    itemPriceId: function (value, options) {
        return "item_price_" + value;
    },
    itemPriceSpl: function (value, options) {
        if (value == 1) {
            return "rateSpl";
        } else {
            return "rateNormal";
        }
    },
    itemPriceSplContent: function (value, options) {
        return "&#8377;" + value;
    },
    itemNameId: function (value, options) {
        return "item_name_" + value;
    },
    itemOnclick: function (value, options) {
        return "addToCart(" + value + ")";
    },
    itemRemoveclick: function (value, options) {
        return "removeFromCart(" + value + ")";
    },
    itemTaxId: function (value, options) {
        return "item_tax_" + value;
    },
    qtyIncreaseOnclick: function (value, options) {
        return "increaseQty(" + value + ")";
    },
    qtyDecreaseOnclick: function (value, options) {
        return "decreaseQty(" + value + ")";
    }
});
/**** Pre Defined Functions **/

function log(msg, level) {
    if (typeof (level) === "undefined") {
        level = 3;
    }
    var logname = {0: "Disabled", 1: "Error", 2: "Warning", 3: "Info"};
    if (level <= config.showlog) {
        console.log(logname[level] + ": " + msg);
    }
}


/********  Common Functions and Global Variables **/

var loading = '<div class="align-center"><br/><br/><img src="img/loading.gif" width="60" /></div>';
var cart = {items: [], decs: "", delivery: ""};
var grand_total = 0;
var after_reg = "";
var order_id = "";
function calcCart() {
    var cart_qty = 0;
    $.each(cart.items, function (index, row) {
        cart_qty = cart_qty + parseInt(row.qty);
    });
    $("#cart_items").html(cart_qty);
    $("#category_cart").html(cart_qty);
    $("#order_cart").html(cart_qty);
    $("#more_cart").html(cart_qty);
    $("#me_cart").html(cart_qty);
}

function validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}


/********  Loading Page Functions **/

jQuery.fn.center = function () {
    this.css("position", "fixed");
    this.css("top", ($(window).height() / 2) - (this.outerHeight() / 2));
    this.css("left", ($(window).width() / 2) - (this.outerWidth() / 2));
    return this;
};

function loadLocalData() {
    $("#load_gif").append(loading);
    $("#load_data").append("Loading app configuration");
    $.ajax({
        type: "GET",
        url: config.api_url + "module=config&action=list",
        cache: false,
        success: function (rs) {
            if (rs.error == false) {
                setVal(config.app_config, JSON.stringify(rs.data));
                $("#load_data").empty();
                $("#load_data").append("Loading shoping menus");
                $.ajax({
                    type: "GET",
                    dataType: 'json',
                    url: config.api_url + "module=menu&action=all",
                    cache: false,
                    success: function (rs) {
                        if (rs.error == false) {
                            setVal(config.product_list, JSON.stringify(rs.data));
                            if ($("#externalpopup").parent().hasClass('ui-popup-hidden')) {
                                $(":mobile-pagecontainer").pagecontainer("change", "#intro");
                            } else {
                                $("#externalpopup .ui-content a").removeAttr("data-rel");
                                $("#externalpopup .ui-content a").attr("href", "#intro");
                            }
                        }
                    }
                });
            }
        }
    });
}


/********  Intro Page Functions **/

function getPromoVideo() {
    var rs = $.parseJSON(getVal(config.app_config));
    $("#promo-video").attr("src", rs["promo_url"] + "?rel=0&amp;showinfo=0");
}

function getStart() {
    if (getVal(config.user_id) != null && getVal(config.user_status) != 0) {
        $(":mobile-pagecontainer").pagecontainer("change", "#shopping");
    } else {
        $(":mobile-pagecontainer").pagecontainer("change", "#register_one");
    }
}


/**********   Register Step One functions ***/

function validMobile() {
    $("#reg_err_one .ui-content a").attr("data-rel", "back");
    $("#reg_err_one .ui-content a").removeAttr("href");
    if ($.trim($("#mobile").val()).length < 10) {
        $("#reg_err_one_text").html("<b>Enter your 10 digit mobile number</b>");
        $("#reg_err_one").popup("open");
        return false;
    }
    return true;
}

function registerPartOne() {
    if (validMobile()) {
        $("#reg_one_spinner").empty();
        $("#reg_one_spinner").append(loading);
        var mobile = $.trim($('#mobile').val());
        var data = {mobile: mobile};
        $.ajax({
            type: "POST",
            url: config.api_url + "module=user&action=user_exist",
            data: data,
            cache: false,
            success: function (rs) {
                $("#reg_one_spinner").empty();
                if (rs.error == false) {
                    $("#reg_err_one .ui-content a").removeAttr("data-rel");
                    $("#reg_err_one .ui-content a").attr("href", "#register");
                    setVal(config.user_mobile, mobile);
                    $(":mobile-pagecontainer").pagecontainer("change", "#register");
                } else {
                    $("#reg_err_one .ui-content a").removeAttr("data-rel");
                    $("#reg_err_one .ui-content a").attr("href", "#verify");
                    setVal(config.user_name, rs.name);
                    setVal(config.user_mobile, mobile);
                    setVal(config.user_email, rs.email);
                    setVal(config.user_address1, rs.address1);
                    setVal(config.user_address2, rs.address2);
                    setVal(config.user_city, rs.city);
                    setVal(config.user_pincode, rs.pincode);
                    setVal(config.user_alternet_number, rs.alt_num);
                    setVal(config.cylinder_type, rs.gas_type);
                    setVal(config.user_status, rs.status);
                    setVal(config.user_id, rs.id);
                    $("#reg_err_one_text").html("<b>" + rs.message + "</b>");
                    $("#reg_err_one").popup("open");
                }
            },
            error: function (request, status, error) {
                $("#reg_one_spinner").empty();
                $("#reg_err_one .ui-content a").removeAttr("href");
                $("#reg_err_one .ui-content a").attr("data-rel", "back");
                $("#reg_err_one_text").html("<b>Process fail please try again......</b>");
                $("#reg_err_one").popup("open");
            }
        });
    }
}

function resetMobileNo() {
    $("#reg_one_spinner").empty();
    if (getVal(config.user_id) != null && getVal(config.user_status) != 1) {
        $("#mobile").val(getVal(config.user_mobile));
    } else {
        $("#mobile").val("");
    }
}


/**********   Register Page functions ***/

function validRegister() {
    $("#reg_err .ui-content a").attr("data-rel", "back");
    $("#reg_err .ui-content a").removeAttr("onclick");
    if ($.trim($("#name").val()).length < 3) {
        $("#reg_err_text").html("<b>Name should be at least 3 char</b>");
        $("#reg_err").popup("open");
        return false;
    }
    if (!validateEmail($.trim(jQuery("#email").val()))) {
        $("#reg_err_text").html("<b>Please enter valid email address</b>");
        $("#reg_err").popup("open");
        return false;
    }
    if ($.trim($("#addressl1").val()).length < 3) {
        $("#reg_err_text").html("<b>Address line 1 is mandatory</b>");
        $("#reg_err").popup("open");
        return false;
    }
    if ($.trim($("#area_pin").val()).length < 6) {
        $("#reg_err_text").html("<b>Enter a valid pin code</b>");
        $("#reg_err").popup("open");
        return false;
    }
    return true;
}

function refreshRegister() {
    $("div#err_msg").center();
    $("#err_msg").empty();
    $("#name").val("");
    $("#email").val("");
    $("#addressl1").val("");
    $("#addressl2").val("");
    $("#area_pin").val("");
    $("#alt_number").val("");
}

function createCode() {
    if (validRegister()) {
        $("#err_msg").empty();
        $("#err_msg").append(loading);
        var name = $.trim($('#name').val());
        var email = $.trim($('#email').val());
        var addressl1 = $.trim($('#addressl1').val());
        var addressl2 = $.trim($('#addressl2').val());
        var pin = $.trim($('#area_pin').val());
        var alt_num = $.trim($('#alt_number').val());
        var city = $.trim($('#fix_city').val());
        var gas_type = $.trim($('#gas_type').val());
        var details = {
            name: name,
            mobile: getVal(config.user_mobile),
            email: email,
            device_token: getVal(config.device_token),
            address1: addressl1,
            address2: addressl2,
            city: city,
            pincode: pin,
            alt_num: alt_num,
            gas_type: gas_type
        };
        $.ajax({
            type: "POST",
            url: config.api_url + "module=user&action=create",
            data: details,
            cache: false,
            success: function (html) {
                $("#err_msg").empty();
                if (html.error == false) {
                    $("#reg_err .ui-content a").removeAttr("data-rel");
                    $("#reg_err .ui-content a").attr("onclick", "redirectToVerify()");
                    setVal(config.user_name, name);
                    setVal(config.user_email, email);
                    setVal(config.user_address1, addressl1);
                    setVal(config.user_address2, addressl2);
                    setVal(config.user_pincode, pin);
                    setVal(config.user_alternet_number, alt_num);
                    setVal(config.cylinder_type, gas_type);
                    setVal(config.user_id, html.id);
                    setVal(config.user_status, html.status);
                    after_reg = "verify";
                    $("#reg_err_text").html("<b>" + html.message + "</b>");
                    $("#reg_err").popup("open");
                } else {
                    $("#reg_err .ui-content a").removeAttr("onclick");
                    $("#reg_err .ui-content a").attr("data-rel", "back");
                    $("#reg_err_text").html("<b>" + html.message + "</b>");
                    $("#reg_err").popup("open");
                }
            },
            error: function (request, status, error) {
                $("#err_msg").empty();
                $("#err_msg").append("Process fail please try again......");
            }
        });
    }
}

function redirectToVerify() {
    $(":mobile-pagecontainer").pagecontainer("change", "#verify");
}


/**********   Verify Page functions ***/

function startTimer() {
    clearInterval();
    $("#resend").empty();
    var resend = '<a href="#" class="ui-btn ui-btn-corner-all" onclick="resend();"> Resend Code</a>';
    var sec = 90;
    var timer = setInterval(function () {
        $("#timer").text(sec--);
        if (sec == -1) {
            clearInterval(timer);
            $("#timer").empty();
            $("#resend").append(resend);
        }
    }, 1000);
}

function verifyCode() {
    var code = $("#code").val();
    if (code != "") {
        var details = {
            user: getVal(config.user_id),
            code: code
        };
        $.ajax({
            type: "POST",
            url: config.api_url + "module=user&action=verify",
            data: details,
            cache: false,
            success: function (html) {
                if (html.error == false) {
                    $("#verify_err .ui-content a").removeAttr("data-rel");
                    $("#verify_err .ui-content a").attr("onclick", "redirectToShopping()");
                    setVal(config.user_status, html.status);
                    $("#verify_err_text").html("<b>" + html.message + "</b>");
                    $("#verify_err").popup("open");
                } else {
                    $("#verify_err_text").html("<b>" + html.message + "</b>");
                    $("#verify_err").popup("open");
                }
            },
            error: function (request, status, error) {
                $("#err_msg").empty();
                $("#err_msg").append("Process fail please try again......");
            }
        });
    }
}

function redirectToShopping() {
    $(":mobile-pagecontainer").pagecontainer("change", "#shopping");
}

function resend() {
    var mobile = getVal(config.user_mobile);
    var email = getVal(config.user_email);
    var id = getVal(config.user_id);
    var details = {
        mobile: mobile,
        email: email,
        id: id,
        device_token: getVal(config.device_token)
    };
    startTimer();
    $.ajax({
        type: "POST",
        url: config.api_url + "module=user&action=resend",
        data: details,
        cache: false,
        success: function (html) {
            if (html.error == false) {
                $("#verify_err_text").html("<b>" + html.message + "</b>");
                $("#verify_err").popup("open");
            }
        },
        error: function (request, status, error) {
            $("#verify_err_text").html("<b>Process fail please try again......</b>");
            $("#verify_err").popup("open");
        }
    });
}


/**********   Me Page functions ***/

function showMe() {
    $("#me_loader").empty();
    $("#me_loader").center();
    var id = getVal(config.user_id);
    var name = getVal(config.user_name);
    var mobile = getVal(config.user_mobile);
    var email = getVal(config.user_email);
    if (id != null) {
        $("#me_name").val(name);
        $("#me_mobile").val(mobile);
        $("#me_email").val(email);
    }
}

function checkUpdation() {
    $("#me_loader").empty();
    var up_name = $.trim($("#me_name").val());
    var up_email = $.trim(jQuery("#me_email").val());
    var name = $.trim(getVal(config.user_name));
    var email = $.trim(getVal(config.user_email));
    if (up_name == name && up_email == email) {
        $("#update_success_text").html("<b>No informations found to update</b>");
        $("#update_success").popup("open");
        return false;
    }
    return true;
}

function validateUpdation() {
    $("#me_loader").empty();
    if ($.trim($("#me_name").val()).length < 3) {
        $("#update_success_text").html("<b>Name must be 3 characters</b>");
        $("#update_success").popup("open");
        return false;
    }
    if (!validateEmail($.trim(jQuery("#me_email").val()))) {
        $("#update_success_text").html("<b>Please enter valid email address</b>");
        $("#update_success").popup("open");
        return false;
    }
    return true;
}

function updateUser() {
    if (validateUpdation() && checkUpdation()) {
        $("#me_loader").empty();
        $("#me_loader").append(loading);
        var name = $("#me_name").val();
        var email = $("#me_email").val();
        var data = {
            name: name,
            email: email,
            id: getVal(config.user_id)
        };
        $.ajax({
            type: "POST",
            url: config.api_url + "module=user&action=update",
            data: data,
            cache: false,
            success: function (html) {
                if (html.error == false) {
                    $("#me_loader").empty();
                    setVal(config.user_name, name);
                    setVal(config.user_email, email);
                    $("#update_success_text").html("<b>" + html.message + "</b>");
                    $("#update_success").popup("open");
                } else {
                    $("#me_loader").empty();
                    $("#update_success_text").html("<b>" + html.message + "</b>");
                    $("#update_success").popup("open");
                }
            },
            error: function (request, status, error) {
                $("#me_loader").empty();
                $("#update_success_text").html("<b>Process failed please try again after some times.....</b>");
                $("#update_success").popup("open");
            }
        });
    }
}


/**********   Shoping Page functions ***/

function loadShopping() {
    $("#categories").empty();
    var rs = $.parseJSON(getVal(config.product_list));
    if (rs == null) {
        $("#categories").empty();
        $("#categories").append('Error in loading data');
    } else {
        $.each(rs, function (k, v) {
            $("#categories").loadTemplate($('#category_list_tpl'), v, {append: true});
        });
    }
}


/**********   Shoping Items Page functions ***/

function loadShoppingItems(cat) {
    $("#menus").empty();
    var heading = "";
    var rs = $.parseJSON(getVal(config.product_list));
    if (cat !== "") {
        $("#cat_name").empty();
        $.each(rs[cat]["items"], function (k, v) {
            $("#menus").loadTemplate($('#menus_list_tpl'), v, {append: true});
        });
        heading = heading + '<h1 class="ui-title" role="heading">' + rs[cat]["cat_name"] + '</h1>';
        $("#cat_name").append(heading);
    }
}

function increaseQty(id) {
    $("#menu_item_" + id + " #qty-toggle").removeClass("remove_form");
    var rate = $("#item_price_" + id).html().replace(/[^0-9]/g, '');
    var name = $("#item_name_" + id).html();
    var qty = parseInt($("#item_qty_" + id).html());
    var tax = $("#item_tax_" + id).val();
    var total = 0;
    if (qty >= 0 && qty < 99) {
        qty = qty + 1;
    }
    var item = {
        id: id,
        name: name,
        qty: qty,
        rate: rate,
        tax: tax
    };
    total = total + parseFloat(rate) * parseFloat(qty);
    $.each(cart.items, function (index, row) {
        if (row.id == id) {
            cart.items.splice(index, 1);
            return false;
        }
    });
    cart.items.push(item);
    $("#item_qty_" + id).html(qty);
    $("#menu_item_" + id + " #qty-toggle #total_amt").html("&#8377;" + total.toFixed(2));
    calcCart();
}

function decreaseQty(id) {
    var rate = $("#item_price_" + id).html().replace(/[^0-9]/g, '');
    var qty = parseInt($("#item_qty_" + id).html());
    var total = 0;
    if (qty >= 0 && qty < 99) {
        qty = qty - 1;
    }
    total = total + parseFloat(rate) * parseFloat(qty);
    $.each(cart.items, function (index, row) {
        if (row.id == id) {
            if (qty > 0) {
                row.qty = qty;
                return false;
            } else {
                $("#request_process_btn1").attr("onclick", "confirmRemove(" + row.id + ")");
                $("#request_process_btn2").attr("onclick", "ignoreRemove(" + row.id + ")");
                $("#popupDialog").popup("open");
                return false;
            }
        }
    });
    $("#item_qty_" + id).html(qty);
    $("#menu_item_" + id + " #qty-toggle #total_amt").html("&#8377;" + total.toFixed(2));
    calcCart();
}

function ignoreRemove(id) {
    $("#popupDialog").popup("close");
    var rate = $("#item_price_" + id).html().replace(/[^0-9]/g, '');
    var total = 0;
    $.each(cart.items, function (index, row) {
        if (row.id == id) {
            row.qty = 1;
            return false;
        }
    });
    total = total + parseFloat(rate) * parseFloat(1);
    $("#item_qty_" + id).html(1);
    $("#menu_item_" + id + " #qty-toggle #total_amt").html("&#8377;" + total.toFixed(2));
    calcCart();
}

function confirmRemove(id) {
    $("#popupDialog").popup("close");
    $.each(cart.items, function (index, row) {
        if (row.id == id) {
            cart.items.splice(index, 1);
            return false;
        }
    });
    calcCart();
    $("#menu_item_" + id + " #qty-toggle").addClass("remove_form");
}


/**********   Cart page functions ***/

function showMyCart() {
    calcCart();
    $("#my_cart_items").empty();
    var out = "";
    var tax_row = "";
    var total = 0;
    var cart_tax = {};
    var g_total = 0;
    if (cart.items.length > 0) {
        $("#cart div[data-role=footer]").removeClass("remove-item");
        out = out + '<table data-role="table" data-mode="none"><tbody>';
        $.each(cart.items, function (index, row) {
            out = out + '<tr><td class="align-left" colspan="2">' + row.name + '</td></tr>';
            out = out + '<tr><td class="align-left"><div class="select-qty"><a onclick="decreaseCartQty(' + row.id + ')"><i class="fa fa-minus-circle"></i></a><input data-role="none" name="qty" type="text" readonly="true" id="cart_item_' + row.id + '" value="' + row.qty + '"><a onclick="increaseCartQty(' + row.id + ')"><i class="fa fa-plus-circle"></i></a></div></td><td class="align-right"> <span id="cart_item_total_' + row.id + '">&#8377;' + (parseInt(row.rate) * parseInt(row.qty)).toFixed(2) + '</span></td></tr>';
            total = total + parseFloat(row.rate) * parseInt(row.qty);
            if (isNaN(cart_tax[row.tax])) {
                cart_tax[row.tax] = 0;
            }
            cart_tax[row.tax] = parseFloat(cart_tax[row.tax]) + (parseFloat(row.rate) * parseInt(row.qty) * parseFloat(row.tax) / 100);
        });
        g_total = total;
        $.each(cart_tax, function (index, val) {
            tax_row = tax_row + '<tr><td class="align-left">TAX ' + index + '%</td><td class="align-right">&#8377;' + val.toFixed(2) +
                    '</td></tr>';
            g_total = g_total + val;
        });
        out = out + '<tr><td colspan="2">&nbsp;</td></tr>';
        out = out + '<tr><td class="align-left">Total</td><td class="align-right">&#8377;' + total.toFixed(2) + '</td></tr>';
        out = out + tax_row;
        out = out + '<tr><td class="align-left">Grand Total</td><td class="align-right">&#8377;' + g_total.toFixed(2) + '</td></tr>';
        out = out + '<tr><td colspan="2"><textarea rows="3" name="orderdecs" id="orderdecs" placeholder="Order description (optional)...."></textarea></td></tr></tbody></table>';
    } else {
        out = '<a class=ui-btn href="#shopping">Shop now</a>';
        $("#cart div[data-role=footer]").addClass("remove-item");
    }
    grand_total = g_total.toFixed(2);
    $(out).appendTo("#my_cart_items").enhanceWithin();
}

function increaseCartQty(id) {
    var rate = 0;
    var total = 0;
    var new_qty = parseInt($("#cart_item_" + id).val());
    if (new_qty > 0 && new_qty < 99) {
        new_qty = new_qty + 1;
    }
    $.each(cart.items, function (index, row) {
        if (row.id == id) {
            rate = row.rate;
            row.qty = new_qty;
            return false;
        }
    });
    total = total + parseFloat(rate) * parseFloat(new_qty);
    $("#cart_item_" + id).val(new_qty);
    $("#cart_item_total" + id).html("&#8377;" + total.toFixed(2));
    showMyCart();
    $("#cart_items_total").html("&#8377;" + grand_total);
}

function decreaseCartQty(id) {
    var rate = 0;
    var total = 0;
    var new_qty = parseInt($("#cart_item_" + id).val());
    if (new_qty >= 0 && new_qty < 99) {
        new_qty = new_qty - 1;
    }
    $.each(cart.items, function (index, row) {
        if (row.id == id) {
            if (new_qty > 0) {
                rate = row.rate;
                row.qty = new_qty;
                return false;
            } else {
                $("#cart_manipulation_text").html("<b>You're removing " + row.name + " from cart</b>")
                $("#cart_request_process_btn1").attr("onclick", "confirmRemoveFromCart(" + row.id + ")");
                $("#cart_request_process_btn2").attr("onclick", "ignoreRemoveFromCart(" + row.id + ")");
                $("#cart_manipulation").popup("open");
                return false;
            }
        }
    });
    total = total + parseFloat(rate) * parseFloat(new_qty);
    $("#cart_item_" + id).val(new_qty);
    $("#cart_item_total" + id).html("&#8377;" + total.toFixed(2));
    showMyCart();
    $("#cart_items_total").html("&#8377;" + grand_total);
}

function ignoreRemoveFromCart(id) {
    $("#cart_manipulation").popup("close");
    var rate = 0;
    var total = 0;
    $.each(cart.items, function (index, row) {
        if (row.id == id) {
            rate = row.rate;
            row.qty = 1;
            return false;
        }
    });
    total = total + parseFloat(rate) * parseFloat(1);
    $("#cart_item_" + id).val(1);
    $("#cart_item_total" + id).html("&#8377;" + total.toFixed(2));
    showMyCart();
    $("#cart_items_total").html("&#8377;" + grand_total);
}

function confirmRemoveFromCart(id) {
    $("#cart_manipulation").popup("close");
    $.each(cart.items, function (index, row) {
        if (row.id == id) {
            cart.items.splice(index, 1);
            return false;
        }
    });
    showMyCart();
    $("#cart_items_total").html("&#8377;" + grand_total);
}

function processStep1() {
    var decs = $("#orderdecs").val();
    cart.decs = decs;
    $(":mobile-pagecontainer").pagecontainer("change", "#delivery");
}


/****** Delivery page functions  ***/

function setDetails() {
    $("#takeaway").attr("checked", true)
    var che = $("input[type='radio']:checked");
    var obj = che.val();
    if (obj == 0) {
        $("#shosho_address").removeClass("remove_form");
        $("#address_form").addClass("remove_form");
    } else {
        $("#shosho_address").addClass("remove_form");
        $("#address_form").removeClass("remove_form");
        $("#address1").val(getVal(config.user_address1));
        $("#address2").val(getVal(config.user_address2));
        $("#pincode").val(getVal(config.user_pincode));
        $("#alt_num").val(getVal(config.user_alternet_number));
    }
}

function showDetails() {
    var che = $("input[type='radio']:checked");
    var obj = che.val();
    if (obj == 0) {
        $("#shosho_address").removeClass("remove_form");
        $("#address_form").addClass("remove_form");
    } else {
        $("#address_form").removeClass("remove_form");
        $("#shosho_address").addClass("remove_form");
        $("#address1").val(getVal(config.user_address1));
        $("#address2").val(getVal(config.user_address2));
        $("#pincode").val(getVal(config.user_pincode));
        $("#alt_num").val(getVal(config.user_alternet_number));
    }
}

function processStep2() {
    if ((getVal(config.user_id) != null)) {
        var address1 = $("#address1").val();
        var pincode = $("#pincode").val();
        var che = $("input[name='delivery']:checked");
        var obj = che.val();
        if (obj == 1 && address1.length < 3) {
            $("#delivery_err_text").html("<b>Address line 1 mandatory</b>");
            $("#delivery_err").popup("open");
            $("#address1").focus();
        } else if (obj == 1 && pincode.length < 6) {
            $("#delivery_err_text").html("<b>Enter a valid pin code</b>");
            $("#delivery_err").popup("open");
            $("#address1").focus();
        } else {
            cart.delivery = obj;
            var address2 = $("#address2").val();
            var city = $("#city").val();
            var alternet = $("#alt_num").val();
            setVal(config.user_address1, address1);
            setVal(config.user_address2, address2);
            setVal(config.user_city, city);
            setVal(config.user_pincode, pincode);
            setVal(config.user_alternet_number, alternet);
            $(":mobile-pagecontainer").pagecontainer("change", "#payment");
        }
    } else {
        $("#delivery_err_text").html("<b>Please select a delivery type..</b>");
        $("#delivery_err").popup("open");
    }
}


/****** Payment page functions  ***/

function processOrder() {
    $("#success_msg").empty();
    $("#success_msg").append(loading);
    var id = getVal(config.user_id);
    var delivery = cart.delivery;
    var decs = cart.decs;
    if ($("input[name='cash_pay']").prop('checked') == true) {
        var data = {items: []};
        var items = [];
        $.each(cart.items, function (index, row) {
            var item = {
                item_id: row.id,
                quantity: row.qty
            };
            items.push(item);
        });
        data = {
            items: items,
            user: id,
            notes: decs,
            delivery: delivery,
            total: grand_total,
            address1: getVal(config.user_address1),
            address2: getVal(config.user_address2),
            area: getVal(config.user_area),
            city: getVal(config.user_city),
            pincode: getVal(config.user_pincode),
            alternetno: getVal(config.user_alternet_number)
        };
        $.ajax({
            type: "POST",
            url: config.api_url + "module=order&action=create",
            data: data,
            cache: false,
            success: function (html) {
                if (html.error == false) {
                    $("#success_msg").empty();
                    cart.items = [];
                    grand_total = 0;
                    $("#order_success .ui-content a").removeAttr("data-rel");
                    $("#order_success .ui-content a").attr("onclick", "redirectOrdersPage()");
                    $("#order_success_text").html("<b>" + html.message + "</b>");
                    $("#order_success").popup("open");
                } else {
                    $("#success_msg").empty();
                    $("#order_success_text").html("<b>" + html.message + "</b>");
                    $("#order_success .ui-content a").removeAttr("onclick");
                    $("#order_success .ui-content a").attr("data-rel", "back");
                    $("#order_success").popup("open");
                }
            },
            error: function (request, status, error) {
                $("#success_msg").empty();
                $("#success_msg").append("Process not successfull try again later......");
            }
        });
    } else {
        $("#success_msg").append("<b>Please select the payment mode</b>");
    }
}

function redirectOrdersPage() {
    $(":mobile-pagecontainer").pagecontainer("change", "#orders");
}


/****** Orders page functions  ***/

function showOrders() {
    var id = getVal(config.user_id);
    if (id != null) {
        $("#ordered_items").empty();
        $("#ordered_items").append(loading);
        var out = "";
        out = out + '<div><ul data-role="listview" data-inset="true" data-theme="b">';
        $.ajax({
            type: "GET",
            url: config.api_url + "module=order&action=list&id=" + id,
            dataType: 'json',
            cache: false,
            success: function (data) {
                if (data.error == true) {
                    $("#ordered_items").empty();
                    $("#ordered_items").append("No items found");
                } else {
                    $("#ordered_items").empty();
                    $.each(data.data, function (index, row) {
                        out = out + '<li><a class="ui-btn" href="#view_ordered_items?cat=' + row.id + '">#' + row.id + '. on ' + $.format.date(row.date, "dd-MMM-yy") + ' &#8377; ' + parseFloat(row.amount).toFixed(2) + ' (' + row.status + ')</a></li>';
                    });
                    out = out + '</ul></div>';
                    $(out).appendTo("#ordered_items").enhanceWithin();
                }
            },
            error: function (request, status, error) {
                $("#ordered_items").empty();
                $("#ordered_items").append("Loading failed please retry......");
            }
        });
    } else {
        $("#ordered_items").empty();
        $("#ordered_items").html("<p>Your information is not found...</p>");
    }
}


/****** View Ordered Items page functions  ***/

function loadOrderedItems(oid) {
    var out = "";
    var items = {};
    var ordered_tax = {};
    var total = 0;
    var tax_row = "";
    order_id = oid;
    var g_total = 0;
    $("#ordered_items_list").empty();
    $("#ordered_items_list").append(loading);
    $.ajax({
        type: "GET",
        url: config.api_url + "module=order&action=orderlist&id=" + oid,
        dataType: 'json',
        cache: false,
        success: function (data) {
            if (data.error == false) {
                out = out + '<table><thead><tr><th class="align-left">Items</th><th class="align-right">Qty</th><th class="align-right">Amount</th></tr></thead><tbody>';
                $.each(data.item, function (index, row) {
                    out = out + '<tr><td class="align-left">' + row.name + '</td><td class="align-right">' + row.quantity + '</td><td class="align-right">&#8377;' + row.rate + '</td></tr>';
                    total = total + parseFloat(row.rate) * parseInt(row.quantity);
                    if (isNaN(ordered_tax[row.tax])) {
                        ordered_tax[row.tax] = 0;
                    }
                    ordered_tax[row.tax] = parseFloat(ordered_tax[row.tax]) + (parseFloat(row.rate) * parseInt(row.quantity) * parseFloat(row.tax) / 100);
                });
                g_total = g_total + total;
                $.each(ordered_tax, function (index, val) {
                    tax_row = tax_row + '<tr><td class="align-left" colspan="2">VAT ' + index + '%</td><td class="align-right">&#8377;' + val.toFixed(2) + '</td></tr>';
                    g_total = g_total + val;
                });
                out = out + '<tr><td colspan="3">&nbsp;</td></tr>';
                out = out + '<tr><td colspan="2" class="align-left">Total</td><td class="align-right">&#8377;' + total.toFixed(2) + '</td></tr>';
                out = out + tax_row;
                out = out + '<tr><td class="align-left" colspan="2">Grand Total</td><td class="align-right">&#8377;' + g_total.toFixed(2) + '</td></tr>';
                out = out + '<tr><td colspan="3">&nbsp;</td></tr>';
                out = out + '<tr><td colspan="2">Delivery Type</td><td>' + data.delivery_type + '</td></tr>'
                out = out + '<tr><td colspan="2">Order Status</td><td>' + data.status + '</td></tr>'
                out = out + '<tr><td colspan="2">Order Date</td><td>' + $.format.date(data["data"].created_at, "dd-MMM-yy hh:mm") + '</td></tr>';
                if (data.status == "Completed" && data["data"].review_status == null) {
                    out = out + '<tr><td colspan="3"><a href="#rate" class="ui-btn">Rate Order</a></td></tr></tbody></table>';
                } else if (data.status == "Completed" && data["data"].review_status == 1) {
                    out = out + '<tr><td colspan="3">&nbsp;</td></tr></tbody></table>';
                    out = out + '<table><tbody><tr><td colspan="2"><b>Your Ratings</b></td></tr>';
                    out = out + '<tr><td>Service:</td><td><div id="your_rate1"></div></td></tr>';
                    out = out + '<tr><td>Price:</td><td><div id="your_rate2"></div></td></tr>';
                    out = out + '<tr><td>Timeliness:</td><td><div id="your_rate3"></div></td></tr>';
                    out = out + '<tr><td>Message:</td><td>' + data["data"].review + '</td></tr>';
                    out = out + '</tbody></table>';
                } else {
                    out = out + '</tbody></table>';
                }
                $("#ordered_items_list").empty();
                $("#ordered_items_list").append(out);
                $("#your_rate1").raty({readOnly: true, score: data["data"].rate1});
                $("#your_rate2").raty({readOnly: true, score: data["data"].rate2});
                $("#your_rate3").raty({readOnly: true, score: data["data"].rate3});
            } else {
                $("#ordered_items_list").empty();
                $("#ordered_items_list").append(data.message);
            }
        },
        error: function (request, status, error) {
            $("#ordered_items_list").empty();
            $("#ordered_items_list").append("Loading failed please retry......");
        }
    });
}


/****** Share page functions  ***/

function gplusShare() {
    var url = "http://youtu.be/U-AAL_3r9Vg";
    var fullurl = "https://plus.google.com/share?url=" + url;
    window.open(fullurl, '_system');
    return false;
}

function fbShare() {
    var url = "http://youtu.be/GB_JRRm8hAQ";
    var fullurl = "http://www.facebook.com/sharer/sharer.php?u=" + url;
    window.open(fullurl, '_system');
    return false;
}

function twitterShare() {
    var url = "http://youtu.be/GB_JRRm8hAQ";
    var ttl = "Dedicated mobile app about E-Gas Cylinder. Download now for free!";
    var fullurl = "https://twitter.com/share?original_referer=http://www.charing.com/&source=tweetbutton&text=" + ttl + "&url=" + url;
    window.open(fullurl, '_system');
    return false;
}

function rateUs() {
    var fullurl = "http://youtu.be/GB_JRRm8hAQ";
    window.open(fullurl, '_system');
    return false;
}


/****** Feedback page functions  ***/

function showFeedbackForm() {
    var name = getVal(config.user_name);
    var email = getVal(config.user_email);
    var mobile = getVal(config.user_mobile);
    if (name != null && email != null && mobile != null) {
        $("#contact_submit").addClass("remove_form");
    } else {
        $("#contact_submit").removeClass("remove_form");
    }
}

function validForm() {
    if ($.trim($("#contact_name").val()).length < 3) {
        $("#feedback_err_text").html("<b>Name must be 3 char</b>");
        $("#feedback_err").popup("open");
        $("#contact_name").focus();
        return false;
    }
    if (!validateEmail($.trim(jQuery("#contact_email").val()))) {
        $("#feedback_err_text").html("<b>Please enter valid email</b>");
        $("#feedback_err").popup("open");
        $("#contact_email").focus();
        return false;
    }
    if ($.trim($("#contact_message").val()).length < 20) {
        $("#feedback_err_text").html("<b>Message at least 20 char</b>");
        $("#feedback_err").popup("open");
        $("#contact_message").focus();
        return false;
    }
    return true;
}

function receiveForm() {
    var message = $.trim($("#contact_message").val());
    var data = {};
    var name = getVal(config.user_name);
    var email = getVal(config.user_email);
    var mobile = getVal(config.user_mobile);
    if (message != "") {
        if (name != null && email != null && mobile != null) {
            data = {
                name: name,
                email: email,
                phone: mobile,
                message: message
            };
        } else {
            if (validForm()) {
                name = $("#contact_name").val();
                email = $("#contact_email").val();
                mobile = $("#contact_num").val();
                data = {
                    name: name,
                    email: email,
                    phone: mobile,
                    message: message
                };
            }
        }
        $.ajax({
            type: "POST",
            url: config.api_url + "module=user&action=feedback",
            data: data,
            cache: false,
            success: function (data) {
                if (data.error == false) {
                    $("#feedback_err_text").html("<b>" + data.message + "</b>");
                    $("#feedback_err").popup("open");
                } else {
                    $("#feedback_err_text").html("<b>" + data.message + "</b>");
                    $("#feedback_err").popup("open");
                }
            }
        });
    } else {
        $("#feedback_err_text").html("<b>Please enter feedback</b>");
        $("#feedback_err").popup("open");
    }
    return false;
}


/****** Menu Pannel functions  ***/

function openJayam() {
    window.open('http://www.jayam.co.uk', '_system');
    return false;
}


/****** FAQ page functions  ***/

function showFAQ() {
    $("#faq_details").empty();
    var rs = $.parseJSON(getVal(config.app_config));
    $("#faq_details").append(rs["faq_details"]);
}


/****** Contact page functions  ***/

function showContact() {
    $("#contact_details").empty();
    var rs = $.parseJSON(getVal(config.app_config));
    var direction = '<a href="#" class="ui-btn" onclick="getDirection()">Get Directions</a>'
    $("#contact_details").append(rs["contact_details"] + direction);
}

function getDirection() {
    window.open('https://www.google.co.in/maps/dir//Thiru+Enterprises,+No.+73%2F95,+Kutty+Gramini+Street,+Kamaraj+Nagar,+Raja+Annamalai+Puram,+Chennai,+Tamil+Nadu+600028/@13.020363,80.262495,17z/data=!4m13!1m4!3m3!1s0x3a5267c46139fa95:0x98a4165dd0cd40e6!2sThiru+Enterprises,+No.+73%2F95!3b1!4m7!1m0!1m5!1m1!1s0x3a5267c46139fa95:0x98a4165dd0cd40e6!2m2!1d80.262495!2d13.020363?hl=en96324', '_system');
    return false;
}


/****** Policy page functions  ***/

function showPolicy() {
    $("#policy_details").empty();
    var rs = $.parseJSON(getVal(config.app_config));
    $("#policy_details").append(rs["policy_details"]);
}


/****** About app page functions  ***/

function showAboutApp() {
    $("#about_app_details").empty();
    var rs = $.parseJSON(getVal(config.app_config));
    $("#about_app_details").append(rs["about_app_details"]);
}


/****** Rate page functions  ***/

function setRate() {
    $("#service_rate").raty();
    $("#timeliness_rate").raty();
    $("#price_rate").raty();
}

function validRate() {
    if (typeof ($("#service_rate").raty("score")) == "undefined") {
        $("#ratepopup_text").html("<b>Please rate our service</b>");
        $("#ratepopup").popup("open");
        return false;
    }
    if (typeof ($("#timeliness_rate").raty("score")) == "undefined") {
        $("#ratepopup_text").html("<b>Please rate our timliness</b>");
        $("#ratepopup").popup("open");
        return false;
    }
    if (typeof ($("#price_rate").raty("score")) == "undefined") {
        $("#ratepopup_text").html("<b>Please rate our price</b>");
        $("#ratepopup").popup("open");
        return false;
    }
    if ($("#rate_msg").val().length < 1) {
        $("#ratepopup_text").html("<b>Please enter a rate message</b>");
        $("#ratepopup").popup("open");
        return false;
    }
    return true;
}

function rateService() {
    var msg = $("#rate_msg").val();
    var rate1 = $("#service_rate").raty("score");
    var rate2 = $("#price_rate").raty("score");
    var rate3 = $("#timeliness_rate").raty("score");
    var data = {
        order_id: order_id,
        rate1: rate1,
        rate2: rate2,
        rate3: rate3,
        review: msg
    };
    if (validRate()) {
        $.ajax({
            type: "POST",
            url: config.api_url + "module=rate_review&action=create",
            data: data,
            cache: false,
            success: function (data) {
                if (data.error == false) {
                    $("#ratepopup_text").html("<b>" + data.message + "</b>");
                    $("#ratepopup").popup("open");
                } else {
                    $("#ratepopup_text").html("<b>" + data.message + "</b>");
                    $("#ratepopup").popup("open");
                }
            }
        });
    }
}


/****** Refer page functions  ***/

function referFriend() {
    var email = $("#friend_email").val();
    var msg = $.trim($("#friend_message").val());
    var data = {
        name: getVal(config.user_name),
        mobile: getVal(config.user_mobile),
        email: email,
        message: msg
    };
    if (!validateEmail($.trim(email))) {
        $("#refer_err_text").html("<b>Please enter valid email address</b>");
        $("#refer_err").popup("open");
    } else {
        if (msg != "") {
            $.ajax({
                type: "POST",
                url: config.api_url + "module=user&action=invitefriend",
                data: data,
                cache: false,
                success: function (data) {
                    if (data.error == false) {
                        $("#refer_err_text").html("<b>" + data.message + "</b>");
                        $("#refer_err").popup("open");
                    } else {
                        $("#refer_err_text").html("<b>" + data.message + "</b>");
                        $("#refer_err").popup("open");
                    }
                }
            });
        } else {
            $("#refer_err_text").html("<b>Please enter message</b>");
            $("#refer_err").popup("open");
        }
    }
}
