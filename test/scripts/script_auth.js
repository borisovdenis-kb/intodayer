
// анимация скрытия конента
function hideContent(time, mode){
    var dfd = $.Deferred();
    $('h1').fadeTo(time,0, function() {
        $('h2').fadeTo(time/1.5, 0, function () {
            if (mode == 1) {
                $('#sign_up').fadeTo(time, 0, function () {
                    $('#sign_in').fadeTo(time, 0, function () {
                        //знак того, что все объекты скрылись
                        dfd.resolve();
                    });
                });
            }
            if (mode == 2) {
                $('#sign_in').fadeTo(time, 0, function () {
                    $('#sign_up').fadeTo(time, 0, function () {
                        //знак того, что все объекты скрылись
                        dfd.resolve();
                    });
                });
            }
        });
    });
    $('h3').fadeTo(time*1.5,0);
    return dfd.promise();
}

//устанавливает элемент по центру
// jQuery.fn.center = function (topPlus, leftPlus) {
//     this.css("position","absolute");
//     this.css("top", Math.max(0, (($(window).height() - $(this).outerHeight()) / 2) +
//             $(window).scrollTop()) + topPlus + "px");
//     this.css("left", Math.max(0, (($(window).width() - $(this).outerWidth()) / 2) +
//             $(window).scrollLeft()) + leftPlus + "px");
//     return this;
// }


function removeContent(){
    $('.text').detach();
    $('.enter').detach();
    $('h3').detach();
}

var main_time = 150;

function sing_up_Action(){
    //контент откроется только по заверешению всех действия в hideContent
    $.when(hideContent(150, 2)).then(function () {
        removeContent();
        $('.reg').delay(0).fadeIn(300, function (){
            $('h3').css({'margin-top':'70'}).fadeTo(main_time*2,1);
        });
    });
}
function sing_in_Action(){
    //контент откроется только по заверешению всех действия в hideContent
    $.when(hideContent(main_time, 1)).then(function () {
        removeContent();
        $('.auth').delay(0).fadeIn(500, function (){
            $('h3').css({'margin-top':'100'}).fadeTo(main_time*2,1);
        });
    });
}

function checkbox_Action(){
    if ($(this).prop('checked')) {
        $('#phone').slideDown(main_time*2).fadeTo(main_time,1);
    }
    else {
        $('#phone').fadeTo(main_time,0).slideUp(main_time * 2, function () {
            $('#phone').val("");
        });
    }
}

//сделать как нибудь, чтобы если возвращается контент тоже динамически восстанавливался
// function back_Action() {
//     $('.reg').fadeTo(main_time * 2, 0, function () {
//         $('page').prependTo($(weclome_text));
//         $(weclome_text).show();
//     });

$('#sign_up').click(sing_up_Action);
$('#sing_up-top').click(sing_up_Action);
$('#sign_in').click(sing_in_Action);
$('#login-top').click(sing_in_Action);
$('#get-sms_checkbox').click(checkbox_Action);
$('.back').click(function() {
    window.location.href = "auth.html";
});

// временное действие кнопки
$('#submit-auth').click(function() {
    window.location.href = "home.html";
    return false;
});

//
// removeContent()
// $('.auth').delay(1).fadeIn(300);

