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
        "#feedback": {handler: "feedbackPage", events: "bs"}
    }],
        {
            registerPage: function (type, match, ui) {
                log("Register Page", 3)
                refreshRegister();
            },
            verifyPage: function (type, match, ui) {
                log("Verification Page", 3);
                startTimer();
            },
            shoppingPage: function (type, match, ui) {
                log("Catalog Page", 3)
                loadShopping();
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
                $("#success_msg").empty();
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
                $("#mypannel").panel("close");
                calcCart();
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
        $.each(cart.items, function (index, item) {
            if (value == item.id) {
                cls = cls + " selected";
            }
        });
        return cls;
    },
    itemQtyClass: function (value, options) {
        var cls = "item-qty";
        var remove = true;
        $.each(cart.items, function (index, item) {
            if (value == item.id) {
                cls = cls + " selected_qty";
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


/********  Intro Page Functions **/

function getStart() {
    if (getVal(config.user_id) != null && getVal(config.user_status) != 0) {
        $(":mobile-pagecontainer").pagecontainer("change", "#shopping");
    } else {
        $(":mobile-pagecontainer").pagecontainer("change", "#register");
    }
}


/**********   Register Page functions ***/

function validRegister() {
    $("#reg_err .ui-content a").attr("data-rel", "back");
    $("#reg_err .ui-content a").removeAttr("onclick");
    if ($.trim($("#name").val()).length < 3) {
        $("#reg_err_text").html("<b>Name should be 3 char</b>");
        $("#reg_err").popup("open");
        return false;
    }
    if (!validateEmail($.trim(jQuery("#email").val()))) {
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

function refreshRegister() {
    $("#err_msg").empty();
    if (getVal(config.user_id) != null && getVal(config.user_status) != 1) {
        $("#name").val(getVal(config.user_name));
        $("#mobile").val(getVal(config.user_mobile));
        $("#email").val(getVal(config.user_email));
    } else {
        $("#name").val("");
        $("#mobile").val("");
        $("#email").val("");
    }
}

function createCode() {
    if (validRegister()) {
        $("#err_msg").empty();
        $("#err_msg").append(loading);
        var name = $.trim($('#name').val());
        var mobile = $.trim($('#mobile').val());
        var email = $.trim($('#email').val());
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
                $("#err_msg").empty();
                if (html.error == false) {
                    $("#reg_err .ui-content a").removeAttr("data-rel");
                    $("#reg_err .ui-content a").attr("onclick", "redirectToVerify()");
                    setVal(config.user_name, name);
                    setVal(config.user_mobile, mobile);
                    setVal(config.user_email, email);
                    setVal(config.user_id, html.id);
                    setVal(config.user_status, html.status);
                    after_reg = "verify";
                    $("#reg_err_text").html("<b>" + html.message + "</b>");
                    $("#reg_err").popup("open");
                } else {
                    $("#reg_err .ui-content a").removeAttr("data-rel");
                    $("#reg_err .ui-content a").attr("onclick", "redirectToVerify()");
                    setVal(config.user_name, name);
                    setVal(config.user_mobile, mobile);
                    setVal(config.user_email, email);
                    setVal(config.user_status, html.status);
                    setVal(config.user_id, html.id);
                    after_reg = "verify";
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
    $("#my_details").empty();
    $("#update_success").empty();
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
    var up_name = $.trim($("#me_name").val());
    var up_email = $.trim(jQuery("#me_email").val());
    var name = $.trim(getVal(config.user_name));
    var email = $.trim(getVal(config.user_email));
    if (up_name == name && up_email == email) {
        $("#update_success").empty();
        $("#update_success").append("<b>No informations found to update</b>");
        return false;
    }
    return true;
}

function validateUpdation() {
    if ($.trim($("#me_name").val()).length < 3) {
        $("#update_success").empty();
        $("#update_success").append("<b>Name should be 3 char</b>");
        return false;
    }
    if (!validateEmail($.trim(jQuery("#me_email").val()))) {
        $("#update_success").empty();
        $("#update_success").append("<b>Please enter valid email</b>");
        return false;
    }
    return true;
}

function updateUser() {
    $("#update_success").empty();
    $("#update_success").append(loading);
    if (validateUpdation() && checkUpdation()) {
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
                    setVal(config.user_name, name);
                    setVal(config.user_email, email);
                    $("#update_success").empty();
                    $("#update_success").append(html.message);
                } else {
                    $("#update_success").empty();
                    $("#update_success").append(html.message);
                }
            },
            error: function (request, status, error) {
                $("#update_success").empty();
                $("#update_success").append("Process failed please try again after some times.....");
            }
        });
    }
}


/**********   Shoping Page functions ***/

function loadShopping() {
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


/**********   Shoping Items Page functions ***/

function loadShoppingItems(cat) {
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

function toogleQtySection(id) {
    if ($("#menu_item_" + id + " .item-info").hasClass("selected")) {
        $("#menu_item_" + id + " #qty-toggle").removeClass("remove_form");
    } else {
        $("#menu_item_" + id + " #qty-toggle").toggleClass("remove_form");
    }
}

function addToCart(id) {
    $('#request_process').attr('onclick', 'addConfirmed(' + id + ')');
    var qty = $("#item_qty_" + id).val();
    var name = $("#item_name_" + id).html();
    var act = "adding";
    var title = "Add";
    if ($("#menu_item_" + id).hasClass("selected")) {
        act = "updating";
        title = "Update";
    }
    $("#confirm_title").html(title + " Item");
    $("#confirm_text").html("You're " + act + " <b>" + name + "</b> into cart <b>" + qty + " nos.</b>");
    $("#popupDialog").popup("open");
}

function addConfirmed(id) {
    $("#popupDialog").popup("close");
    var qty = $("#item_qty_" + id).val();
    var rate = $("#item_price_" + id).html().replace(/[^0-9]/g, '');
    var name = $("#item_name_" + id).html();
    var tax = $("#item_tax_" + id).val();
    var item = {
        id: id,
        name: name,
        qty: qty,
        rate: rate,
        tax: tax,
    };
    $("#menu_item_" + id + " .item-info").addClass("selected");
    $("#menu_item_" + id + " #qty-toggle").addClass("selected_qty");
    $.each(cart.items, function (index, row) {
        if (row.id == id) {
            cart.items.splice(index, 1);
            return false;
        }
    });
    cart.items.push(item);
    calcCart();
}

function increaseQty(id) {
    var qty = parseInt($("#item_qty_" + id).val());
    if (qty > 0 && qty < 99) {
        qty = qty + 1;
    }
    $("#item_qty_" + id).val(qty);
}

function decreaseQty(id) {
    var qty = parseInt($("#item_qty_" + id).val());
    if (qty > 1 && qty < 99) {
        qty = qty - 1;
    }
    $("#item_qty_" + id).val(qty);
}

function removeFromCart(id) {
    $('#request_process').attr('onclick', 'removeConfirmed(' + id + ')');
    var name = $("#item_name_" + id).html();
    $("#confirm_title").html("Remove Item");
    $("#confirm_text").html("You're removing <b>" + name + "</b> from cart");
    $("#popupDialog").popup("open");
}

function removeConfirmed(id) {
    $("#popupDialog").popup("close");
    $.each(cart.items, function (index, row) {
        if (row.id == id) {
            cart.items.splice(index, 1);
            return false;
        }
    });
    $("#menu_item_" + id + " .item-info").removeClass("selected");
    $("#menu_item_" + id + " #qty-toggle").removeClass("selected_qty");
    calcCart();
}


/**********   Cart page functions ***/

function showMyCart() {
    calcCart();
    $("#my_cart_items").empty();
    $("#success_msg").empty();
    var out = "";
    var tax_row = "";
    var total = 0;
    var cart_tax = {};
    var g_total = 0;
    if (cart.items.length > 0) {
        $("#cart div[data-role=footer]").removeClass("remove-item");
        out = out + '<table data-role="table" data-mode="none"><tbody>';
        $.each(cart.items, function (index, row) {
            out = out + '<tr><td class = "align-left">' + row.name + '</td><td class="align-right"> &#8377;' + (parseInt(row.rate) * parseInt(row.qty)).toFixed(2) + '</td><td class="align-center"><a onclick="showToggle(' + row.id + ')"><i class="fa fa-crop"></i></a></td></tr>';
            out = out + '<tr id="cart_toggle_' + row.id + '" class="remove_form"><td colspan="3"><div class="cart_toggle"><div class="select-qty"><a onclick="decreaseCartQty(' + row.id + ')">&ndash;</a> <input data-role="none" name="qty" type="text" readonly="true" id="cart_item_' + row.id + '" value="' + row.qty + '"> <a onclick="increaseCartQty(' + row.id + ')">+</a></div> <div class="con_del"><a onclick="updateCart(' + row.id + ')">&#10004;</a> <a onclick="removeItem(' + row.id + ');">&#10008;</a></div></div></td></tr>';
            total = total + parseFloat(row.rate) * parseInt(row.qty);
            if (isNaN(cart_tax[row.tax])) {
                cart_tax[row.tax] = 0;
            }
            cart_tax[row.tax] = parseFloat(cart_tax[row.tax]) + (parseFloat(row.rate) * parseInt(row.qty) * parseFloat(row.tax) / 100);
        });
        g_total = total;
        $.each(cart_tax, function (index, val) {
            tax_row = tax_row + '<tr><td colspan="2" class="align-left">TAX ' + index + '%</td><td class="align-right">&#8377;' + val.toFixed(2) +
                    '</td></tr>';
            g_total = g_total + val;
        });
        out = out + '<tr><td colspan="3">&nbsp;</td></tr>';
        out = out + '<tr><td colspan="2" class="align-left">Total</td><td class="align-right">&#8377;' + total.toFixed(2) + '</td></tr>';
        out = out + tax_row;
        out = out + '<tr><td colspan="2" class="align-left">Grand Total</td><td class="align-right">&#8377;' + g_total.toFixed(2) + '</td></tr>';
        out = out + '<tr><td colspan="3"><textarea name="orderdecs" id="orderdecs" placeholder="Order description (optional)...."></textarea></td></tr></tbody></table>';
    } else {
        out = "<p>No items found in your cart</p>";
        $("#cart div[data-role=footer]").addClass("remove-item");
    }
    grand_total = g_total.toFixed(2);
    $(out).appendTo("#my_cart_items").enhanceWithin();
}

function showToggle(id) {
    $("#cart_toggle_" + id).toggleClass("remove_form");
}

function increaseCartQty(id) {
    var new_qty = parseInt($("#cart_item_" + id).val());
    if (new_qty > 0 && new_qty < 99) {
        new_qty = new_qty + 1;
    }
    $("#cart_item_" + id).val(new_qty);
}

function decreaseCartQty(id) {
    var new_qty = parseInt($("#cart_item_" + id).val());
    if (new_qty > 1 && new_qty < 99) {
        new_qty = new_qty - 1;
    }
    $("#cart_item_" + id).val(new_qty);
}

function updateCart(id) {
    $('#cart_request_process').attr('onclick', 'updateCartConfirmed(' + id + ')');
    var qty = $("#cart_item_" + id).val();
    var name = "";
    $.each(cart.items, function (index, row) {
        if (row.id == id) {
            name = row.name;
            qty = row.qty;
        }
    });
    $("#cart_confirm_title").html("Update Item");
    $("#cart_confirm_text").html("You're updating <b>" + name + "</b> into cart <b>" + qty + " nos.</b>");
    $("#cart_manipulation").popup("open");
}

function updateCartConfirmed(id) {
    $("#cart_manipulation").popup("close");
    var new_qty = $("#cart_item_" + id).val();
    $.each(cart.items, function (index, row) {
        if (row.id == id) {
            row.qty = new_qty;
            return false;
        }
    });
    showMyCart();
    calcCart();
    $("#cart_items_total").html("&#8377;" + grand_total);
}

function removeItem(id) {
    var name = "";
    $('#cart_request_process').attr('onclick', 'removeItemConfirmed(' + id + ')');
    $.each(cart.items, function (index, row) {
        if (row.id == id) {
            name = row.name;
        }
    });
    $("#cart_confirm_title").html("Remove Item");
    $("#cart_confirm_text").html("You're removing <b>" + name + "</b> from cart");
    $("#cart_manipulation").popup("open");
}

function removeItemConfirmed(id) {
    $("#cart_manipulation").popup("close");
    $.each(cart.items, function (index, row) {
        if (row.id == id) {
            cart.items.splice(index, 1);
            return false;
        }
    });
    $("#menu_item_" + id).removeClass("selected");
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
    $("#delivery_err").empty();
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
        $("#shosho_address").removeClass("remove_form");
        $("#address_form").addClass("remove_form");
    } else {
        $("#address_form").removeClass("remove_form");
        $("#shosho_address").addClass("remove_form");
    }
}

function processStep2() {
    $("#delivery_err").empty();
    if ((getVal(config.user_id) != null)) {
        var address1 = $("#address1").val();
        var che = $("input[name='delivery']:checked");
        var obj = che.val();
        if (obj == 1 && address1 < 3) {
            $("#delivery_err").append("<b>Address line 1 mandatory</b>");
            $("#address1").focus();
        } else {
            cart.delivery = obj;
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
        }
    } else {
        $("#delivery_err").append("<b>Please select a delivery type..</b>");
    }
}


/****** Payment page functions  ***/

function processOrder() {
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
                    cart.items = [];
                    grand_total = 0;
                    $("#order_success .ui-content a").removeAttr("data-rel");
                    $("#order_success .ui-content a").attr("onclick", "redirectOrdersPage()");
                    $("#order_success_text").html("<b>" + html.message + "</b>");
                    $("#order_success").popup("open");
                } else {
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
                        out = out + '<li><a href="#view_ordered_items?cat=' + row.id + '">#' + row.id + '. on ' + $.format.date(row.date, "dd-MMM-yy") + ' &#8377; ' + parseFloat(row.amount).toFixed(2) + ' (' + row.status + ')</a></li>';
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
                    tax_row = tax_row + '<tr><td class="align-left" colspan="2">TAX ' + index + '%</td><td class="align-right">&#8377;' + val.toFixed(2) + '</td></tr>';
                    g_total = g_total + val;
                });
                out = out + '<tr><td colspan="3">&nbsp;</td></tr>';
                out = out + '<tr><td colspan="2" class="align-left">Total</td><td class="align-right">&#8377;' + total.toFixed(2) + '</td></tr>';
                out = out + tax_row;
                out = out + '<tr><td class="align-left" colspan="2">Grand Total</td><td class="align-right">&#8377;' + g_total.toFixed(2) + '</td></tr>';
                out = out + '<tr><td colspan="3">&nbsp;</td></tr>';
                out = out + '<tr><td colspan="2">Delivery Type</td><td>' + data.delivery_type + '</td></tr>'
                out = out + '<tr><td colspan="2">Order Status</td><td>' + data.status + '</td></tr>'
                out = out + '<tr><td colspan="2">Order Date</td><td>' + $.format.date(data.date, "dd-MMM-yy hh:mm") + '</td></tr></tbody></table>';
                $("#ordered_items_list").empty();
                $("#ordered_items_list").append(out);
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
    window.open(fullurl, '_system', "toolbar=0,location=0,height=450,width=550");
}

function fbShare() {
    var url = "http://youtu.be/GB_JRRm8hAQ";
    var fullurl = "http://www.facebook.com/sharer/sharer.php?u=" + url;
    window.open(fullurl, '_system', "toolbar=0,location=0,height=450,width=650");
}

function twitterShare() {
    var url = "http://youtu.be/GB_JRRm8hAQ";
    var ttl = "Dedicated mobile app about E-Gas Cylinder. Download now for free!";
    var fullurl = "https://twitter.com/share?original_referer=http://www.charing.com/&source=tweetbutton&text=" + ttl + "&url=" + url;
    window.open(fullurl, '_system', "menubar=1,resizable=1,width=450,height=350");
}

function rateUs() {
    var fullurl = "http://youtu.be/GB_JRRm8hAQ";
    window.open(fullurl, '_system', "menubar=1,resizable=1,width=450,height=350");
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
        $("#feedback_err_text").html("<b>Your feedback can't be empty</b>");
        $("#feedback_err").popup("open");
    }
    return false;
}


/****** Menu Pannel functions  ***/

function openJayam() {
    window.open('http://www.jayam.co.uk', '_system', 'toolbar=0,location=0,height=200,width=400');
}


/****** Refer page functions  ***/

function referFriend() {
    var email = $("#friend_email").val();
    var msg = $.trim($("#friend_message").val());
    var data = {
        email: email,
        message: msg
    };
    if (!validateEmail($.trim(email))) {
        $("#refer_err_text").html("<b>Please enter valid email</b>");
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
            $("#refer_err_text").html("<b>Message for your friend cant be empty</b>");
            $("#refer_err").popup("open");
        }
    }
}