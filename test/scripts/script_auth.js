

var main_time = 150;

$('.back').click(function () {
    window.location.href = "welcome.html";
});

$(document).ready(function () {
    $('.auth').delay(50).fadeIn(200, function () {
        $('h3').fadeTo(main_time * 2, 1);
    });
});

// временное действие кнопки
// $('#submit-auth').click(function () {
//     window.location.href = "home.html";
//     return false;
// });