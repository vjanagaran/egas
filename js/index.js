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
        "#shopping": {handler: "shoppingPage", events: "bs"},
        "#shoppingitems(?:[?/](.*))?": {handler: "shoppingitemsPage", events: "bs"},
        "#cart": {handler: "cartPage", events: "bs"},
        "#payment": {handler: "paymentPage", events: "bs"},
        "#me": {handler: "mePage", events: "bs"},
        "#orders": {handler: "ordersPage", events: "bs"},
        "#more": {handler: "morePage", events: "bs"},
        "#verify": {handler: "verifyPage", events: "bs"},
        "#details": {handler: "detailsPage", events: "bs"}
    }],
        {
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
                $("#cart_items_total").html(grand_total);
                $("#success_msg").empty();
            },
            paymentPage: function (type, match, ui) {
                log("Payment Items page", 3);
                $("#cash_pay").attr("checked", true);
                $("#payment_items_total").html(grand_total);
            },
            morePage: function (type, match, ui) {
                log("More page", 3);
                calcCart();
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


/********  Common Functions and Global Variables **/

var loading = '<div class="align-center"><br/><br/><img src="img/loading.gif" width="60" /></div>';
var cart = {items: [], decs: "", delivery: ""};
var grand_total = 0;

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


/********  Intro Page Functions **/

function goCategory() {
    $(":mobile-pagecontainer").pagecontainer("change", "#shopping");
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
    $("#menu_item_" + id).removeClass("selected");
    calcCart();
}


/**********   Cart functions ***/

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
        out = out + '<table data-role="table" data-mode="none"><thead><tr><th class="align-left">Your Order</th><th class="align-right">Qty</th><th class="align-right">Amount</th><th>Manipulate</th></tr></thead><tbody>';
        $.each(cart.items, function (index, row) {
            out = out + '<tr><td class = "align-left">' + row.name + '</td><td class="align-right"><div class="select-qty"><a onclick="decreaseCartQty(' + row.id +
                    ')">&ndash;</a> <input data-role="none" name="qty" type="text" readonly="true" id="cart_item_' + row.id + '" value="' + row.qty + '"> <a onclick="increaseCartQty(' + row.id
                    + ')">+</a></div></td><td class="align-right">' + (parseInt(row.rate) * parseInt(row.qty)).toFixed(2) + '</td><td class="align-center"><a class="symbol" onclick="updateCart(' + row.id +
                    ')">&#10004;</a> <a class="symbol" onclick="removeItem(' + row.id + ');">&#10008;</a></td></tr>';
            total = total + parseFloat(row.rate) * parseInt(row.qty);
            if (isNaN(cart_tax[row.tax])) {
                cart_tax[row.tax] = 0;
            }
            cart_tax[row.tax] = parseFloat(cart_tax[row.tax]) + (parseFloat(row.rate) * parseInt(row.qty) * parseFloat(row.tax) / 100);
        });
        g_total = total;
        $.each(cart_tax, function (index, val) {
            tax_row = tax_row + '<tr><td colspan="2" class="align-left">TAX ' + index + '%</td><td class="align-right">' + val.toFixed(2) +
                    '</td><td>&nbsp;</td></tr>';
            g_total = g_total + val;
        });
        out = out + '<tr><td colspan="4">&nbsp;</td></tr>';
        out = out + '<tr><td colspan="2" class="align-left">Total</td><td class="align-right">' + total.toFixed(2) + '</td><td>&nbsp;</td></tr>';
        out = out + tax_row;
        out = out + '<tr><td colspan="2" class="align-left">Grand Total</td><td class="align-right">' + g_total.toFixed(2) + '</td><td>&nbsp;</td></tr>';
        out = out + '<tr><td colspan="4"><textarea name="orderdecs" id="orderdecs" placeholder="Order description (optional)...."></textarea></td></tr></tbody></table>';
    } else {
        out = "<p>No items found in your cart</p>";
        $("#cart div[data-role=footer]").addClass("remove-item");
    }
    grand_total = g_total.toFixed(2);
    $(out).appendTo("#my_cart_items").enhanceWithin();
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
    $("#cart_items_total").html(grand_total);
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
    $("#cart_items_total").html(grand_total);
}

function processStep1() {
    var decs = $("#orderdecs").val();
    cart.decs = decs;
    $(":mobile-pagecontainer").pagecontainer("change", "#payment");
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