/**
 * Created by Alexey on 20.12.2016.
 */
var main_time = 150;

$('.back').click(function () {
    window.location.href = "welcome.html";
});


$(document).ready(function () {
    $('.add_schedules').delay(50).fadeIn(200, function () {
        $('h3').fadeTo(main_time * 2, 1);
    });
});


function setReallyHeight(){
    // чтобы размер страницы и поле прокрутки определились до появления (работы эффектов)
    var totalHeight = +$('.add_schedules').css('height').slice(0,-2) +
        +$('h3').css('margin-top').slice(0,-2) + +$('h3').css('margin-top').slice(0,-2) +
        +$('h3').css('margin-bottom').slice(0,-2) + +$('h3').css('height').slice(0,-2);
    $('body').css({'height': totalHeight});
    $('.reg').delay(50).fadeIn(200, function () {
        $('h3').fadeTo(main_time * 2, 1);
    });
}

setReallyHeight();