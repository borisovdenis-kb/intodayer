$(window).ready(function() {
   showWelcome();
    // setInvisible();
});


function setInvisible(){
    $('.bottom_text').css('opacity', '0');
    $('.welcome_text').css('opacity', '0');
    $('.buttons_row').css('opacity', '0');
    $('.about_service_text').css('opacity', '0');
    // $('#sign_up').css('opacity', '0');
    // $('#sign_in').css('opacity', '0');
}

function showWelcome() {
    $('.bottom_text').delay(100).fadeTo(main_time * 2, 1);
    $('.welcome_text').delay(100).fadeTo(main_time * 1.5, 1, function () {
        $('.buttons_row').fadeTo(main_time * 2, 1).queue(function () {
            $('.about_service_text').fadeTo(main_time * 3, 1).queue(function () {
                // на этом этапе анимации ставим обработчики на кнопки

                $('#sign_up').on('click', function () {
                    sing_up_Action();
                    return false;
                });

                $('#sign_in').on('click', function () {
                    sing_in_Action();
                    return false;
                });
            });
        });
    });
}

var main_time = 150;
// // анимация скрытия конента
function hideContentWelcome(time, mode) {
    // эта штука очень удобная и нужна, чтобы выполнить какое-то действие только по завершении этой фукнции
    // индикатор завершения  return dfd.resolve();
    var dfd = $.Deferred();
    // чтобы при нажатии вся текущая анимация до нажатия завершилась мгновенно
    $('#sign_up').off();
    $('#sign_in').off();
    $('.bottom_text').stop(true, true);
    $('.welcome_text').stop(true, true);
    $('.buttons_row').stop(true, true);
    $('.about_service_text').stop(true, true);

    $('.about_service_text').fadeTo(time, 0);
    $('.bottom_text').fadeTo(time / 1.5, 0);


    $('h1').fadeTo(time, 0).queue(function () {
        $('h2').fadeTo(time / 2, 0).queue(function () {
            if (mode == 1) {
                $('#sign_up').fadeTo(time / 3, 0, function () {
                    $('#sign_in').delay(150).fadeTo(time / 4, 0, function () {
                        //знак того, что все объекты скрылись
                        setTimeout(function () {
                            return dfd.resolve();
                        }, 100);
                    });
                });
            }
            if (mode == 2) {

                $('#sign_in').fadeTo(time / 3, 0, function () {
                    $('#sign_up').delay(150).fadeTo(time / 4, 0, function () {
                        //знак того, что все объекты скрылись
                        setTimeout(function () {
                            return dfd.resolve();
                        }, 100);
                    });
                });
            }
        });
    });


    return dfd.promise();
}

// действия при нажатии на кнопку Регистрация
function sing_up_Action() {
    $.when(hideContentWelcome(main_time, 2)).then(function () {
        window.location.href = "/registration";
    });
}
// действия при нажатии на кнопку Авторизация
function sing_in_Action() {
    $.when(hideContentWelcome(main_time, 1)).then(function () {
        window.location.href = "/login";
    });
}


