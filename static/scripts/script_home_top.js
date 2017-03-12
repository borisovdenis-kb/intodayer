/**
 * Created by Alexey on 12.03.2017.
 */
//############################################################################## отвечает за выпадающий список
var $droplist = $('.droplist');
var FLAG_DROPLIST = false;

// сохранять положение выпадающего списка
$(window).on('resize', set_place_droplist_click);

function set_place_droplist_click() {
    if (FLAG_DROPLIST == true) {
        $('.droplist_click_container').css({
            'top': $droplist.offset().top + 30, 'left': $droplist.offset().left - 20
        }, 100);
    }
}

$droplist.on('click', function (e) {
    $(window).bind('resize', set_place_droplist_click);
    click_on_droplist($(this), e);
});
$droplist.mouseover(function () {
    if (FLAG_DROPLIST == false) {
        $(this).animate({'background-color': 'rgba(210,210,210, 1)'}, 200);
    }
});
$droplist.mouseleave(function () {
    if (FLAG_DROPLIST == false) {
        $(this).animate({'background-color': 'rgba(240,240,240,1)'}, 200);
    }
});
$(window).on('click', function (event) {
    if ($('.droplist_click_container').length != 0) {
        hide_droplist(event);
    }
});


// скрытие выпадающего списка
function hide_droplist(event, hide) {
    if (!event.target.closest('.droplist') && !event.target.closest('.droplist_click_container') || hide == true) {
        var $this_droplist_click = $('.droplist_click_container');
        $this_droplist_click.fadeOut(200);
        $this_droplist_click.animate({
            top: $this_droplist_click.offset().top + 20,
            left: $this_droplist_click.offset().left - 5
        }, 200, function () {
            $this_droplist_click.remove();
        });
        $this_droplist_click.dequeue();
        $('.droplist').animate({'background-color': 'rgba(240,240,240,1)'}, 100);
        $('#arrow_down').animate({'border-top-color': 'rgba(150, 150, 150, 1)'}, 100);
        FLAG_DROPLIST = false;
    }

}

// появление выпадающего списка
function click_on_droplist(this_elem, event) {
    if (FLAG_DROPLIST == true) {
        hide_droplist(event, true);
        return false;
    }
    this_elem.css({'background-color': 'rgba(200,200,200,1)'});
    $('#arrow_down').animate({'border-top-color': 'rgba(255, 255, 255, 1)'}, 100);
    FLAG_DROPLIST = true;

    $('body').append(
        '<div class="droplist_click_container" style="opacity: 0;">' +
        '<div class="triangle"></div>' +
        '<div class="triangle_bottom"></div>' +
        '<div class="droplist_click">' +
        '<ul style="display: none">' +
        '<li></li>' +

        '<li><a href="#">Мой профиль</a></li>' +
        '<li><a href="#">О сервисе</a></li>' +
        '<li><a href="/logout">Выйти</a></li>' +

        '<li></li>' +
        '</ul>' +
        '</div>' +
        '</div>'
    );

    var $droplist_click = $('.droplist_click_container');

    $droplist_click.css({
        'position': 'absolute', 'top': this_elem.offset().top, 'left': this_elem.offset().left + 80,
    });

    //делаем анимацию на разные объекты, чтобы псевдо-стрелка корректо появлялась
    $('.droplist_click_container ul').fadeIn(200);
    $('.droplist_click_container li').animate({
        'width': 162
    }, 300);
    $('.droplist_click_container').animate({
        top: this_elem.offset().top + 30,
        left: this_elem.offset().left - 20,
        opacity: 1
    }, 300);

}
//############################################################################## отвечает за выпадающий список
