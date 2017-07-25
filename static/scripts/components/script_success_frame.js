/**
 * Created by Alexey on 12.07.2017.
 */
$(document).ready(function () {

});

var success_frame_background_color = $('.success_frame').css('background-color');
var success_html = $('.success_modal_body').html();
function success_frame_animate() {
    $('.success_modal_body').html(success_html);
    var $elem = $('.success_frame');
    showFlexCenter($elem);
    $elem.delay(100).queue(function () {
        $elem.css('transform', 'scale(1.0,1.0)');
        $(this).dequeue();
    });

    $elem.delay(300).queue(function () {
        $(this).css({
            'opacity': 0.99,
            'border-radius': '50%'
            // 'transform': 'scale(1.1,1.1)'
        });
        $(this).dequeue();
    }).delay(1000).queue(function () {
        $(this).css({
            'opacity': 0,
            'background': 'green'
            // 'transform': 'scale(1.0,1.0)'
        });
        $(this).dequeue();
    }).delay(500).queue(function () {
        $(this).hide();
        $(this).dequeue();
        $(this).clearQueue();
    });

}

