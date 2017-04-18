/**
 * Created by Alexey on 18.04.2017.
 */
$(document).ready(function () {
    startAllFunctions();
    setTimeout(function () {
        startAllFunctions();
    }, 200);
});

$(window).on('resize', function () {
    startAllFunctions();
});


function startAllFunctions() {
    setContentToCenter();
}


// когда высота страницы становится маленькой, выравнивает весь контент
// в точности по центру (а обычно контент чуть выше центра)
var trueHeightBlock = $('.fill-space-bottom');
function setContentToCenter() {
    if ($(window).height() < 800) {
        trueHeightBlock.css('display', 'none');
    }
    else {
        trueHeightBlock.css('display', 'block');
    }
}




