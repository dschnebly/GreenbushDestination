$(function () {
    init();

    $("img.lazy").lazyload();

    // Google Plus code
    var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
    po.src = '//apis.google.com/js/platform.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);

    $(document).bind('change', function (e) {
        var $changed = $(e.target);

        if ($changed.hasClass("mobile-menu-filter")) {
            var url = window.location.href;
            var age = $("#mobile-menu-age").val();
            var view = $("#mobile-menu-view").val();

            if(url.indexOf("bakedhomepage.html") > -1)
            {
                url = "https://www.lyriacomicexchange.com/index.php?age=63&view=active&graded=1&variant=0&popular=1&lot=0";
            }

            if(url.split("?").length > 1)
            {
                if ($changed.is("#mobile-menu-age")) {
                    var newUrl = url.replace(/age=\d+/, 'age=' + age);

                    $('#load').css('display', 'block');
                    window.location.href = newUrl;
                }
                else {
                    var newUrl = url.replace(/view=\w+/, 'view=' + view);

                    $('#load').css('display', 'block');
                    window.location.href = newUrl;
                }
            }
            else
            {
                var newUrl = window.location.href.split('?')[0]  + "?age=" + age + "&view=" + view + "&graded=0&variant=0&popular=1&lot=0";
                window.location.href = newUrl;
            }
        }
    });

    $(document).bind('click', function (e) {

        var $clicked = $(e.target);

        if ($clicked.hasClass("loadingresults")) {
            $('#load').css('display', 'block');
        }

    });

});

$.fn.hasAttr = function(name) {
    return this.attr(name) !== undefined;
};

// All Facebook functions should be included in this function, or at least initiated from here
window.fbAsyncInit = function () {
    FB.init({
        appId: '1374349982811626',
        status: true, // check login status
        cookie: true, // enable cookies to allow the server to access the session
        xfbml: true // parse XFBML
    });
    // Additional initialization code such as adding Event Listeners goes here
};

// Load the SDKs source Asynchronously
// Note that the debug version is being actively developed and might
// contain some type checks that are overly strict.
// Please report such bugs using the bugs tool.
(function (d, debug) {
    var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
    if (d.getElementById(id)) { return; }
    js = d.createElement('script'); js.id = id; js.async = true;
    js.src = "//connect.facebook.net/en_US/all" + (debug ? "/debug" : "") + ".js";
    ref.parentNode.insertBefore(js, ref);
}(document, /*debug*/false));

function init() {
    cookieSettings();
    attachButtonEvents();
    attachLabelEvents();
    attachToggleOptions();
}

function cookieSettings() {
    // setup the initial display on page load
    var option_state = $.cookie('lyriacomicexchange_menuOptions');

    if (typeof option_state == "undefined" || option_state == "visible") {
        $('#options').show(); // visible, and cookie is set
    } else {
        $('#options').hide(); // hidden or cookie is not set, set just in case

        $("#toggle-options-label").text("Show Options");
        $("#toggle-options-button").toggleClass('glyphicon-plus glyphicon-minus');
        $.removeCookie('lyriacomicexchange_menuOptions'); // prevent multiple instances
        $.cookie('lyriacomicexchange_menuOptions', 'hidden'); // set the cookie
    }
}

function attachButtonEvents() {
    $(".more-information-button").click(function (e) {
        var $span = $(e.target);

        if($span.is('span')) {
            $span.toggleClass('glyphicon-plus glyphicon-minus');
        }
    });
}

function attachLabelEvents() {
    $(".more-information-label").click(function (e) {
        var label = e.target;

        var button = $(label).prev().find("span");
        $(button).toggleClass('glyphicon-plus glyphicon-minus');
    });
}

function attachToggleOptions() {
    $("#toggle-options-label").add("#toggle-options-button").click(function () {
        var label = $("#toggle-options-label");
        var button = $("#toggle-options-button");

        $(label).text(function (i, text) {
            return text === "Hide Options" ? "Show Options" : "Hide Options";
        });
        $(button).toggleClass('glyphicon-plus glyphicon-minus');
        if ($("#options").css('display') == 'none') {
            $("#options").slideDown();

            $.removeCookie('lyriacomicexchange_menuOptions'); // prevent multiple instances
            $.cookie('lyriacomicexchange_menuOptions', 'visible'); // update (or set) the cookie
        }
        else {
            $("#options").slideUp();

            $.removeCookie('lyriacomicexchange_menuOptions'); // prevent multiple instances
            $.cookie('lyriacomicexchange_menuOptions', 'hidden'); // update (or set) the cookie
        }
    });
}

//-------------------- Submit Filters -----------------//
// a = "variable to change"
// b = value to change too
// c = current age
// d = current view
// e = one of the filters passed along
// f = one of the filters passed along
//----------------------------------------------------//

function submitFilter(a, b, c, d, e, f) {

    if (a === "graded") {
        var grade = b ? 0 : 1;
        var variant = e;
        var popular = f;
    }
    if (a === "variant") {
        var grade = e;
        var variant = b ? 0 : 1;
        var popular = f;
    }
    if (a === "popular") {
        var grade = e;
        var variant = f;
        var popular = b ? 0 : 1;
    }
    var e = "http://www.lyriacomicexchange.com/index.php?age=" + c + "&view=" + d + "&graded=" + grade + "&variant=" + variant + "&popular=" + popular;
    document.location.href = e;
}
