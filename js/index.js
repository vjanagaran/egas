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
        "#delivery": {handler: "deliveryPage", events: "bs"},
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
                //var params = router.getParams(match[1]);
                //loadShoppingItems(params.cat);
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


/********  Common Functions and Variables **/

var loading = '<div class="align-center"><br/><br/><img src="img/loading.gif" width="60" /></div>';
var cart = {items: [], decs: "", delivery: ""};
var confirm_id = 0;
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


/**********   Shoping Items functions ***/

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
        out = out + '<table data-role="table" data-mode="none"><thead><tr><th class="align-left">Your Order</th><th class="align-right">Qty</th><th class="align-right">Amount</th><th>&nbsp;</th><th>&nbsp;</th></tr></thead><tbody>';
        $.each(cart.items, function (index, row) {
            out = out + '<tr><td class = "align-left">' + row.name + '</td><td class="align-right"><div class="select-qty"><a onclick="decreaseCartQty(' + row.id +
                    ')">-</a> <input data-role="none" name="qty" type="text" readonly="true" id="cart_item_' + row.id + '" value="' + row.qty + '"> <a onclick="increaseCartQty(' + row.id
                    + ')">+</a></div></td><td class="align-right">' + (parseInt(row.rate) * parseInt(row.qty)).toFixed(2) + '</td><td ><a class="symbol" onclick="updateCart(' + row.id +
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
                    '</td><td>&nbsp;</td><td>&nbsp;</td></tr>';
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
    /*var decs = $("#orderdecs").val();
     cart.decs = decs;
     if (getVal(config.user_id) != null) {
     $(":mobile-pagecontainer").pagecontainer("change", "#payment");
     } else {
     $(":mobile-pagecontainer").pagecontainer("change", "#registration");
     }*/
    $(":mobile-pagecontainer").pagecontainer("change", "#payment");
}

