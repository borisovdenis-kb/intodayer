/**
 * Created by Alexey on 12.07.2017.
 */
$(document).ready(function () {

});

var succsess_frame_background_color = $('.success_frame').css('background-color');
function success_frame_animate() {
    var $elem = $('.success_frame');

    showFlexCenter($elem);
    $elem.delay(300).queue(function () {
        blurElement($(this), 0);
        $(this).css('opacity', 0.95);
        $(this).css('border-radius', '50%');
        $(this).dequeue();
    }).delay(1000).queue(function () {
        blurElement($(this), 20);
        $(this).css('opacity', 0);
        $(this).css('background', 'green');
        $(this).dequeue();
    }).delay(500).queue(function () {
       $(this).hide();
       $(this).dequeue();
       $(this).css('background', succsess_frame_background_color);
       $(this).css('border-radius', '50px');
       $(this).clearQueue();
    });

}

