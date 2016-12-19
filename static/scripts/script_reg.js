
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

// эта функция не нужна, можно удалять!
/*$('.back').click(function () {
    window.location.href = "welcome.html";
});*/

$('#get-sms_checkbox').click(checkbox_Action);


$(document).ready(function () {
    var totalHeight = $('.reg').css('height').slice(0,-2) +  $('h3').css('margin-top').slice(0,-2) + $('h3').css('height').slice(0,-2);
    $('body').css({'min-height': totalHeight});
    $('.reg').delay(100).fadeIn(300, function () {
        $('h3').fadeTo(main_time * 2, 1);
    });
});