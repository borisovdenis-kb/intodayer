

var main_time = 150;

$(document).ready(function () {
    $('.auth').delay(100).fadeIn(300, function () {
        $('h3').fadeTo(main_time * 2, 1);
    });
});

// временное действие кнопки
// $('#submit-auth').click(function () {
//     window.location.href = "home.html";
//     return false;
// });