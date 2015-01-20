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
    if (is_mobile) {
        push.initPushwoosh();
    }
}

var router = new $.mobile.Router([{
        "#home": {handler: "homePage", events: "bs"},
        "#catalog": {handler: "catalogPage", events: "bs"},
        "#catalogitems(?:[?/](.*))?": {handler: "catalogitemsPage", events: "bs"},
        "#cart": {handler: "cartPage", events: "bs"},
        "#delivery": {handler: "deliveryPage", events: "bs"},
        "#payment": {handler: "paymentPage", events: "bs"},
        "#me": {handler: "mePage", events: "bs"},
        "#orders": {handler: "ordersPage", events: "bs"},
        "#more": {handler: "morePage", events: "bs"},
        "#verify": {handler: "verifyPage", events: "bs"},
        "#details": {handler: "detailsPage", events: "bs"}
    }],
        {
            homePage: function (type, match, ui) {
                log("Home Page", 3);
            },
            catalogPage: function (type, match, ui) {
                log("Catalog Page", 3)
                loadCatalog();
            },
            catalogitemsPage: function (type, match, ui) {
                log("Catalog Items page", 3);
                var params = router.getParams(match[1]);
                loadCatalogItems(params.cat);
                calcCart();
            },
            cartPage: function (type, match, ui) {
                log("Cart Items page", 3);
                showMyCart();
                $("#cart_items_total").html(grand_total);
                $("#success_msg").empty();
                calcCart();
            },
            paymentPage: function (type, match, ui) {
                log("Payment Items page", 3);
                $("#payment_items_total").html(grand_total);
            },
            morePage: function (type, match, ui) {
                log("More page", 3);
                calcCart();
            },
            deliveryPage: function (type, match, ui) {
                log("Delivery Items page", 3);
                $("#delivery_items_total").html(grand_total);
                setDetails();
            },
            ordersPage: function (type, match, ui) {
                log("Orders page", 3);
                showOrders();
                calcCart();
            },
            mePage: function (type, match, ui) {
                log("Me Page", 3);
                showMe();
                calcCart();
            },
            verifyPage: function (type, match, ui) {
                log("Verification Page", 3);
                clearInterval();
                startTimer();
            },
            detailsPage: function (type, match, ui) {
                log("Details Page", 3);
                $("#deltails_items_total").html(grand_total);
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
        return "#catalogitems?cat=" + value;
    },
    menuItemClass: function (value, options) {
        var cls = "menu-items";
        $.each(cart.items, function (index, item) {
            if (value == item.id) {
                cls = cls + " selected";
            }
        });
        return cls;
    },
    menuItemId: function (value, options) {
        return "menu_item_" + value;
    },
    itemQtyId: function (value, options) {
        return "item_qty_" + value;
    },
    itemQtyVal: function (value, options) {
        var val = 1;
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




/********  General Functions **/

var loading = '<div class="align-center"><br/><br/><img src="img/loading.gif" width="60" /></div>';

function loadCatalog() {
    $("#categories").empty();
    $("#categories").append(loading);
    $.ajax({
        type: "GET",
        dataType: 'json',
        url: config.api_url + "module=cat&action=list",
        cache: false,
        success: function (data) {
            $("#categories").empty();
            $.each(data.data, function (k, v) {
                $("#categories").loadTemplate($('#category_list_tpl'), v, {append: true});
            });
        },
        error: function (request, status, error) {
            $("#categories").empty();
            $("#categories").append('Error in loading data');
        }
    });
}

function loadCatalogItems(cat) {
    $("#menus").empty();
    $("#menus").append(loading);
    var heading = "";
    var cat_name = "";
    if (cat !== "") {
        $.ajax({
            type: "GET",
            url: config.api_url + "module=menu&action=list&id=" + cat,
            dataType: 'json',
            cache: false,
            success: function (data) {
                $("#menus").empty();
                $("#cat_name").empty();
                $.each(data.data, function (k, v) {
                    $("#menus").loadTemplate($('#menus_list_tpl'), v, {append: true});
                    cat_name = v.cat_name;
                });
                heading = heading + '<h1 class="ui-title" role="heading">' + cat_name + '</h1>';
                $("#cat_name").append(heading);
            },
            error: function (request, status, error) {
                $("#menus").empty();
                $("#menus").append('Error in loading data');
            }
        });
    }
}

function createCode() {
    if (validateRegistration()) {
        var name = $('#name').val();
        var mobile = $('#mobile').val();
        var email = $('#email').val();
        var details = {
            name: name,
            mobile: mobile,
            email: email,
            device_token: getVal(config.device_token)
        };
        $.ajax({
            type: "POST",
            url: config.api_url + "module=user&action=create",
            data: details,
            cache: false,
            success: function (html) {
                if (html.error == false) {
                    setVal(config.user_name, name);
                    setVal(config.user_mobile, mobile);
                    setVal(config.user_email, email);
                    setVal(config.user_id, html.id);
                    $(":mobile-pagecontainer").pagecontainer("change", "#verify");
                } else {
                    setVal(config.user_name, name);
                    setVal(config.user_mobile, mobile);
                    setVal(config.user_email, email);
                    setVal(config.user_id, html.id);
                    $(":mobile-pagecontainer").pagecontainer("change", "#delivery");
                }
            },
            error: function (request, status, error) {
                $("#err_msg").empty();
                $("#err_msg").append("Process fail please try again......");
            }
        });
    }
}

function verifyCode() {
    var code = $("#code").val();
    if (code != "") {
        var details = {
            user: getVal(config.user_id),
            code: code
        }
        $.ajax({
            type: "POST",
            url: config.api_url + "module=user&action=verify",
            data: details,
            cache: false,
            success: function (html) {
                if (html.error == false) {
                    $(":mobile-pagecontainer").pagecontainer("change", "#details");
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

function showMe() {
    $("#my_details").empty();
    var name = getVal(config.user_name);
    var mobile = getVal(config.user_mobile);
    var email = getVal(config.user_email);
    var details = "<p><b>Name:</b> " + name + "</p>";
    details = details + "<p><b>Mobile No:</b> " + mobile + "</p>";
    details = details + "<p><b>Email:</b> " + email + "</p>";
    $("#my_details").append(details);
}

var cart = {items: [], decs: "", delivery: ""};
var confirm_id = 0;
var grand_total = 0;

function addToCart(id) {
    var qty = $("#item_qty_" + id).val();
    var name = $("#item_name_" + id).html();
    confirm_id = id;
    $("#confirm_text").html("You're adding <b>" + name + "</b> into cart <b>" + qty + " nos.</b>");
    $("#popupDialog").popup("open");
}

function addConfirmed() {
    $("#popupDialog").popup("close");
    var id = confirm_id;
    var qty = $("#item_qty_" + id).val();
    var rate = $("#item_price_" + id).html();
    var name = $("#item_name_" + id).html();
    var tax = $("#item_tax_" + id).val();
    var item = {
        id: id,
        name: name,
        qty: qty,
        rate: rate,
        tax: tax,
    };
    $("#menu_item_" + id).addClass("selected");
    $.each(cart.items, function (index, row) {
        if (row.id == id) {
            cart.items.splice(index, 1);
            return false;
        }
    });
    cart.items.push(item);
    calcCart();
}

function calcCart() {
    var cart_qty = 0;
    $.each(cart.items, function (index, row) {
        cart_qty = cart_qty + parseInt(row.qty);
    });
    $("#cart_items").html(cart_qty);
    $("#catalog_cart").html(cart_qty);
    $("#order_cart").html(cart_qty);
    $("#more_cart").html(cart_qty);
    $("#me_cart").html(cart_qty);
}

function showMyCart() {
    $("#my_cart_items").empty();
    $("#success_msg").empty();
    var out = "";
    var tax_row = "";
    var total = 0;
    var cart_tax = {};
    var g_total = 0;
    if (cart.items.length > 0) {
        $("#cart div[data-role=footer]").removeClass("remove-item");
        out = out + '<table data-role="table" data-mode="none"><thead><tr><th class="align-left">Your Order</th><th class="align-right">Qty</th><th class="align-right">Amount</th><th>&nbsp;</th><th>&nbsp;</th></tr></thead><tbody>';
        $.each(cart.items, function (index, row) {
            out = out + '<tr><td class = "align-left">' + row.name + '</td><td class="align-right"><div class="select-qty"><a onclick="decreaseCartQty(' + row.id + ')">-</a> <input data-role="none" name="qty" type="text" readonly="true" id="cart_item_' + row.id + '" value="' + row.qty + '"> <a onclick="increaseCartQty(' + row.id + ')">+</a></div></td><td class="align-right">' + (parseInt(row.rate) * parseInt(row.qty)).toFixed(2) + '</td><td ><a class="symbol" onclick="updateCart(' + row.id + ')">&#10004;</a> <a class="symbol" onclick="removeItem(' + row.id + ');">&#10008;</a></td></tr>';
            total = total + parseFloat(row.rate) * parseInt(row.qty);
            if (isNaN(cart_tax[row.tax])) {
                cart_tax[row.tax] = 0;
            }
            cart_tax[row.tax] = parseFloat(cart_tax[row.tax]) + (parseFloat(row.rate) * parseInt(row.qty) * parseFloat(row.tax) / 100);
        });
        g_total = total;
        $.each(cart_tax, function (index, val) {
            tax_row = tax_row + '<tr><td colspan="2" class="align-left">TAX ' + index + '%</td><td class="align-right">' + val.toFixed(2) + '</td><td>&nbsp;</td><td>&nbsp;</td></tr>';
            g_total = g_total + val;
        });
        out = out + '<tr><td colspan="3">&nbsp;</td></tr>';
        out = out + '<tr><td class="align-left">Total</td><td class="align-right" colspan="2">' + total.toFixed(2) + '</td><td>&nbsp;</td><td>&nbsp;</td></tr>';
        out = out + tax_row;
        out = out + '<tr><td colspan="2" class="align-left">Grand Total</td><td class="align-right">' + g_total.toFixed(2) + '</td><td>&nbsp;</td><td>&nbsp;</td></tr>';
        out = out + '<tr><td colspan="5"><textarea name="orderdecs" id="orderdecs" placeholder="Order description (optional)...."></textarea></td></tr></tbody></table>';
    } else {
        out = "<p>No items found in your cart</p>";
        $("#cart div[data-role=footer]").addClass("remove-item");
    }
    grand_total = g_total.toFixed(2);
    $(out).appendTo("#my_cart_items").enhanceWithin();
}

function removeFromCart(id) {
    $.each(cart.items, function (index, row) {
        if (row.id == id) {
            cart.items.splice(index, 1);
            return false;
        }
    });
    $("#menu_item_" + id).removeClass("selected");
    calcCart();
}

function removeItem(id) {
    $.each(cart.items, function (index, row) {
        if (row.id == id) {
            cart.items.splice(index, 1);
            return false;
        }
    });
    $("#menu_item_" + id).removeClass("selected");
    showMyCart();
    $("#cart_items_total").html(grand_total);
}

function processOrder() {
    var id = getVal(config.user_id);
    var delivery = cart.delivery;
    var decs = cart.decs;
    if (id != null && $("#cash_pay").prop('checked') == true) {
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
                cart.items = [];
                grand_total = 0;
                $("#order_success_text").html("<b>" + html.message + "</b>");
                $("#order_success").popup("open");
                $(":mobile-pagecontainer").pagecontainer("change", "#orders");
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

function showOrders() {
    var id = getVal(config.user_id);
    if (id != null) {
        $("#ordered_items").empty();
        $("#ordered_items").append(loading);
        var out = "";
        out = out + '<table data-role="table" data-mode="none"><thead><tr><th class="align-left">Order Id</th><th class="align-left">Date</th><th class="align-right">Amount</th><th class="align-center">Status</th></tr></thead><tbody>';
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
                        out = out + '<tr><td class="align-left">' + row.id + '</td><td class="align-left">' + $.format.date(row.date, "dd-MMM-yyyy H:m") + '</td><td class="align-right">' + parseFloat(row.amount).toFixed(2) + '</td><td class="align-center">' + row.status + '</td></tr>';
                    });
                    out = out + '</tbody></table>';
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
        $("#ordered_items").html("<p>Your information is not found so no items found...</p>");
    }
}

function updateCart(id) {
    var new_qty = $("#cart_item_" + id).val();
    $.each(cart.items, function (index, row) {
        if (row.id == id) {
            row.qty = new_qty;
            return false;
        }
    });
    showMyCart();
    calcCart();
    $("#cart_items_total").html(grand_total);
}

function processStep1() {
    var decs = $("#orderdecs").val();
    cart.decs = decs;
    if (getVal(config.user_id) != null) {
        $(":mobile-pagecontainer").pagecontainer("change", "#delivery");
    } else {
        $(":mobile-pagecontainer").pagecontainer("change", "#registration");
    }
}

function processStep2() {
    $("#delivery_err").empty();
    if ((getVal(config.user_id) != null) && ($("#home_delivery").prop('checked') == true || $("#takeaway").prop('checked') == true)) {
        var che = $("input[name='delivery']:checked");
        var obj = che.val();
        cart.delivery = obj;
        var address1 = $("#address1").val();
        var address2 = $("#address2").val();
        var city = $("#city").val();
        var area = $("#area").val();
        var pincode = $("#pincode").val();
        var alternet = $("#alt_num").val();
        setVal(config.user_address1, address1);
        setVal(config.user_address2, address2);
        setVal(config.user_city, city);
        setVal(config.user_area, area);
        setVal(config.user_pincode, pincode);
        setVal(config.user_alternet_number, alternet);
        $(":mobile-pagecontainer").pagecontainer("change", "#payment");
    } else {
        $("#delivery_err").append("<b>Please select a delivery type..</b>");
    }
}

function setDetails() {
    $("#delivery_err").empty();
    var che = $("input[type='radio']:checked");
    var obj = che.val();
    if ($("input:radio").attr("checked", false)) {
        $("#address_form").addClass("remove_form");
    } else if (obj == 0) {
        $("#address_form").addClass("remove_form");
    } else {
        $("#address_form").removeClass("remove_form");
        $("#address1").val(getVal(config.user_address1));
        $("#address2").val(getVal(config.user_address2));
        $("#city").val(getVal(config.user_city));
        $("#area").val(getVal(config.user_area));
        $("#pincode").val(getVal(config.user_pincode));
        $("#alt_num").val(getVal(config.user_alternet_number));
    }
}

function showDetails() {
    $("#delivery_err").empty();
    var che = $("input[type='radio']:checked");
    var obj = che.val();
    if (obj == 0) {
        $("#address_form").addClass("remove_form");
    } else {
        $("#address_form").removeClass("remove_form");
    }
}

function validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function validateRegistration() {
    if ($.trim($("#name").val()).length < 3) {
        $("#reg_err_text").html("<b>Name should be 3 char</b>");
        $("#reg_err").popup("open");
        return false;
    }
    if (!validateEmail(jQuery("#email").val())) {
        $("#reg_err_text").html("<b>Please enter valid email</b>");
        $("#reg_err").popup("open");
        return false;
    }
    if ($.trim($("#mobile").val()).length < 10) {
        $("#reg_err_text").html("<b>Enter your 10 digit mobile number</b>");
        $("#reg_err").popup("open");
        return false;
    }
    return true;
}

function validForm() {
    if ($.trim($("#contact_name").val()).length < 3) {
        $("#feedback_err_text").html("<b>Name must be 3 char</b>");
        $("#feedback_err").popup("open");
        $("#contact_name").focus();
        return false;
    }
    if (!validateEmail(jQuery("#contact_email").val())) {
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

function increaseQty(id) {
    var qty = parseInt($("#item_qty_" + id).val());
    if (qty > 0 && qty < 99) {
        qty = qty + 1;
    }
    $("#item_qty_" + id).val(qty);
}

function increaseCartQty(id) {
    var new_qty = parseInt($("#cart_item_" + id).val());
    if (new_qty > 0 && new_qty < 99) {
        new_qty = new_qty + 1;
    }
    $("#cart_item_" + id).val(new_qty);
}

function decreaseQty(id) {
    var qty = parseInt($("#item_qty_" + id).val());
    if (qty > 1 && qty < 99) {
        qty = qty - 1;
    }
    $("#item_qty_" + id).val(qty);
}

function decreaseCartQty(id) {
    var new_qty = parseInt($("#cart_item_" + id).val());
    if (new_qty > 1 && new_qty < 99) {
        new_qty = new_qty - 1;
    }
    $("#cart_item_" + id).val(new_qty);
}

function gplusShare() {
    /*var url = "https://play.google.com/store/apps/details?id=com.coolappz.periyava";
     var fullurl = "https://plus.google.com/share?url=" + url;
     window.open(fullurl, '', "toolbar=0,location=0,height=450,width=550");*/
}

function fbShare() {
    /*var url = "https://play.google.com/store/apps/details?id=com.coolappz.periyava";
     var fullurl = "http://www.facebook.com/sharer/sharer.php?u=" + url;
     window.open(fullurl, '', "toolbar=0,location=0,height=450,width=650");*/
}

function twitterShare() {
    /*var url = "https://play.google.com/store/apps/details?id=com.coolappz.periyava";
     var ttl = "Dedicated mobile app about Sri Sri Kanji Maha Periyava. Download now for free!";
     var fullurl = "https://twitter.com/share?original_referer=http://www.charing.com/&source=tweetbutton&text=" + ttl + "&url=" + url;
     window.open(fullurl, '', "menubar=1,resizable=1,width=450,height=350");*/
}

function rateUs() {
    /*var fullurl = "https://play.google.com/store/apps/details?id=com.coolappz.periyava";
     window.open(fullurl, '', "menubar=1,resizable=1,width=450,height=350");*/
}

function receiveForm() {
    if (validForm()) {
        var name = $("#contact_name").val();
        var email = $("#contact_email").val();
        var phone = $("#contact_num").val();
        var message = $("#contact_message").val();
        /*var data = {"name": name, "email": email, "phone": phone, "message": message};
         $.ajax({
         type: "POST",
         url: "http://www.periyava.org/mail.php",
         data: data,
         cache: false,
         success: function (data) {
         $('#result_table').append('<p>hello world</p>');
         alert("Success!");
         $.each(data.results, function (k, v) {
         $.each(v, function (key, value) {
         $('#result_table').append('<br/>' + key + ' : ' + value);
         });
         });
         }
         });*/
    }
    return false;
}

function redirectToOrders() {
    $("#order_success").popup("close");
    $(":mobile-pagecontainer").pagecontainer("change", "#orders");
}

function referFriend() {
    var email = $("#friend_email").val();
    var msg = $("#friend_message").val();
    if (!validateEmail(email)) {
        $("#refer_err_text").html("<b>Please enter valid email</b>");
        $("#refer_err").popup("open");
    } else {
        //Do here something
    }
}

function startTimer() {
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