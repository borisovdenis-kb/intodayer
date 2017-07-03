$(document).ready(function () {
    setCurrentMenu();
});

var $droplist = $('.droplist');
var FLAG_DROPLIST = false;

$droplist.on('click', function (e) {
    click_on_droplist($(this), e);
});

$droplist.mouseover(function () {
    if (FLAG_DROPLIST == false) {
        $(this).stop(true, true);
        $(this).animate({'background-color': 'rgba(210,210,210, 1)'}, 200);
    }
});
$droplist.mouseleave(function () {
    if (FLAG_DROPLIST == false) {
        $(this).stop(true, true);
        $(this).animate({'background-color': 'rgba(240,240,240,1)'}, 200);
    }
});

$(window).on('click', function (event) {
    if ($('.droplist_click_container').length != 0) {
        hide_droplist(event);
    }
});

// для мобильных устройств
$(document).on("touchstart",function(){
  if ($('.droplist_click_container').length != 0) {
        hide_droplist(event);
    }
});

// появление выпадающего списка
function click_on_droplist(this_elem, event) {
    if (FLAG_DROPLIST == true) {
        hide_droplist(event, true);
        return false;
    }
    this_elem.css({'background-color': 'rgba(200,200,200,1)'});
    $('#arrow_down').animate({'border-top-color': 'rgba(255, 255, 255, 1)'}, 100);
    FLAG_DROPLIST = true;


    $('.droplist').append(
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
        'position': 'absolute', 'top': 10, 'left': 10
    });

    //делаем анимацию на разные объекты, чтобы псевдо-стрелка корректо появлялась
    $('.droplist_click_container ul').fadeIn(200);
    $('.droplist_click_container li').animate({
        'width': 162
    }, 300);


    // var offset_out = this_elem.offset().left + this_elem.outerWidth();
    $('.droplist_click_container').animate({
        top: 30,
        left: -30,
        opacity: 1
    }, 300);
}

// скрытие выпадающего списка
function hide_droplist(event, hide) {
    var $this_elem = $(event.target);
    if (($this_elem.parents('.droplist_click_container').length == 0 && $this_elem.parents('.droplist').length == 0) || hide == true) {
        var $this_droplist_click = $('.droplist_click_container');
        $this_droplist_click.stop(true,true);
        $this_droplist_click.fadeOut(200);
        $this_droplist_click.animate({
            top: 50,
            left: -40
        }, 200, function () {
            $this_droplist_click.remove();
        });
        $this_droplist_click.dequeue();
        $('.droplist').stop(true,true);
        $('.droplist').animate({'background-color': 'rgba(240,240,240,1)'}, 100);
        $('#arrow_down').stop(true,true);
        $('#arrow_down').animate({'border-top-color': 'rgba(150, 150, 150, 1)'}, 100);
        FLAG_DROPLIST = false;
    }

}


function setCurrentMenu() {
    /*
     Эта функция подсвечивает текущее выбранное меню
     */
    var this_url = document.location.href;
    if (this_url.match('/home/')) {
        $('.today_bt a').css({
            "color": "#1E90FF",
        })
    }
    if (this_url.match('/plan/')) {
        $('.plan_bt a').css({
            "color": "#1E90FF",
        })
    }
    if (this_url.match('/statistics/')) {
        $('.statistic_bt a').css({
            "color": "#1E90FF",
        })
    }
    if (this_url.match('/group/')) {
        $('.group_bt a').css({
            "color": "#1E90FF",
        })
    }
}