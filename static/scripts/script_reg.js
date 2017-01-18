
// действия при нажатии на Checkbox (получать уведомления на стр. Регистрация)
function checkbox_Action() {
    var inputElem = '.phone-content';
    if ($(this).prop('checked')) {
        $(this).animate({
            'background-color': '#0da559',
        }, main_time, function () {
            $(inputElem).slideDown(main_time * 2, function () {
                $(inputElem).fadeTo(main_time, 1);
            });
        });
    }
    else {
        $(this).animate({
            'background-color': '#ffffff',
        }, main_time, function () {
            $(inputElem).fadeTo(main_time, 0).slideUp(main_time * 2, function () {
                $(inputElem).val("");
            });
        });
    }
}

var main_time = 150;


$('#get-sms_checkbox').click(checkbox_Action);


$(document).ready(function () {
    // чтобы размер страницы и поле прокрутки определились до появления (работы эффектов)
    var totalHeight = +$('.reg').css('height').slice(0,-2) +
        +$('h3').css('margin-top').slice(0,-2) + +$('h3').css('margin-top').slice(0,-2) +
        +$('h3').css('margin-bottom').slice(0,-2) + +$('h3').css('height').slice(0,-2);
    $('body').css({'height': totalHeight});
    $('.reg').delay(50).fadeIn(200, function () {
        $('h3').fadeTo(main_time * 2, 1);
    });
});