$(document).ready(function () {

});

var $droplink = $('.droplink');

$droplink.on('click', function (e) {
    click_on_droplist($(this), e);
});

$(window).on('click', function (event) {
    if (!event.target.closest('.droplink') && !event.target.closest('.droplink_click')) {
        var $this_droplink_click = $('.droplink_click');
        $this_droplink_click.fadeOut(200);
        $this_droplink_click.animate({top: $this_droplink_click.offset().top - 20, left: $this_droplink_click.offset().left - 5},200);
        $this_droplink_click.dequeue();
        $('.droplink').css('background', 'none');
    }
});

// обрабатывает клип по кнопке "Profile"
function click_on_droplist(this_elem, e) {
    if ($('.droplink_click')) {
        $('.droplink_click').remove();
    }
    this_elem.css('background', 'rgba(200, 200, 200, 1)');

    $('body').append('<div class="droplink_click" style="display: block">' +
        '<ul>' +
        '<li><a>О сервисе</a></li>' +
        '<li><a>Выйти</a></li>' +
        '</ul>' +
        '</div> ' +
        ''
    );

    var $droplist_click = $('.droplink_click');

    $droplist_click.css({
        'position': 'absolute', 'top': this_elem.offset().top, 'left': this_elem.offset().left + 20,
        'width': 100, opacity: 0
    });

    setTimeout(function () {
        $droplist_click.animate({
                'top': $droplist_click.offset().top + 45, 'left': this_elem.offset().left - 30,
                'width': 150, opacity: 1
            },
            250);

    }, 10)

}