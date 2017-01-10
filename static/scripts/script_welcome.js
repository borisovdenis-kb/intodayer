// // анимация скрытия конента
function hideContent(time, mode) {
    var dfd = $.Deferred();
    $('h1').fadeTo(time, 0, function () {
        $('h2').fadeTo(time / 1.5, 0, function () {
            if (mode == 1) {
                $('#sign_up').fadeTo(time, 0, function () {
                    $('#sign_in').fadeTo(time, 0, function () {
                        //знак того, что все объекты скрылись
                        return dfd.resolve();
                    });
                });
            }
            if (mode == 2) {
                $('#sign_in').fadeTo(time, 0, function () {
                    $('#sign_up').fadeTo(time, 0, function () {
                        //знак того, что все объекты скрылись
                        return dfd.resolve();
                    });
                });
            }
        });
    });
    $('h3').fadeTo(time * 1.5, 0);
    return dfd.promise();
}

var main_time = 150;

// действия при нажатии на кнопку Регистрация
function sing_up_Action() {
    $.when(hideContent(150, 2)).then(function () {
        window.location.href = "reg.html";
    });
}
// действия при нажатии на кнопку Авторизация
function sing_in_Action() {
    $.when(hideContent(main_time, 1)).then(function () {
        window.location.href = "auth.html";
    });
}

$(document).ready(function () {
    $('.text').delay(50).fadeIn(main_time*2, function () {
        $('.enter').fadeIn(main_time*2, function () {
            $('h3').fadeTo(main_time*2, 1);
        });
    });
});

$('#sign_up').click(sing_up_Action);
$('#sign_in').click(sing_in_Action);
$('#sing_up-top').click(sing_up_Action);
$('#login-top').click(sing_in_Action);




