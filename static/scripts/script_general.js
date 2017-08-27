$(document).ready(function () {
    setInvitationsListeners();
});


function confirmInvitation(is_accept) {
    /*
     *  is_accept: true/false
     */
    var uuid, data;

    uuid = location.href.split('/');
    uuid = uuid[uuid.length - 1];
    data = JSON.stringify({is_accept: is_accept});

    $.ajax({
        url: '/invitation/confirm/' + uuid,
        type: "POST",
        contentType: "application/json",
        data: data,
        success: function () {
            window.location.href = "/";
        }
    });
}

function setInvitationsListeners() {
    if (location.href.indexOf('invitation') < 0) {
        show_invitations();
    } else {
        var confposTop = $('.confirmation').offset().top;
        var confposLeft = $('.confirmation').offset().left;
    }

    $(window).on('scroll', function () {
        if ($(window).scrollTop() > confposTop + 10) {
            $('.confirmation').css({'position': 'fixed', 'top': '0px', 'left': confposLeft});
        } else {
            $('.confirmation').css({'position': 'relative', 'top': '0', 'left': '0'});
        }
    });

    var curtxt_accept = $('.accept').text();
    var curtxt_reject = $('.reject').text();

    $('.accept').hover(function () {
        $(this).text('');
        $(this).addClass('accept_img');
    }, function () {
        $(this).text(curtxt_accept);
        $(this).removeClass('accept_img');
    });

    $('.reject').hover(function () {
        $(this).text('');
        $(this).addClass('reject_img');
    }, function () {
        $(this).text(curtxt_reject);
        $(this).removeClass('reject_img');
    });

    $('.accept').click(function () {
        confirmInvitation(true);
    });

    $('.reject').click(function () {
        confirmInvitation(false);
    });
}


function setInputCursorToEnd($this_input) {
    $this_input.val($this_input.val());
}


function switchPlan($this_plan) {
    /*
     * Это функция общая для всего приложения.
     * Отвечает за подгрузку и замену данных в right_content при переключении расписания.
     * Какие данные будут подгружаться зависит от того, на какой странице мы находимся.
     * Соответственно обращение на сервер будет происходить вот так:
     * --- /<page_name>/switch_plan
     *
     * Пока возможны всего два варианта:
     * --- /home/switch_plan
     * --- /plan/switch_plan
     * --- /participants/switch_plan
     */

    var data = {plan_id: $this_plan.attr('plan_id')};
    var $this_button = $(this);

    // подгружаем правый контент, изменяем стиль кнопок слева
    var loc = location.href.split('/');
    var address = loc[loc.length - 2];

    $.each($('.right_content').children(), function () {
        if (!$(this).hasClass('plan_load_progres')) {
            $(this).remove();
        }
    });

    $('.plan_load_progres_indicator').css('display', 'flex');
    // alert('/' + address + '/switch_plan');
    $('.right_content').load('/' + address + '/switch_plan', data, function () {
        $('.plan_load_progres_indicator').css('display', 'none');
        // навешиваем обработчики
        if (address == 'plan') {
            setListenersTitleBlock();
            setListenersRightContent();
        }

        if (address == 'participants'){
            setBindsParticipants();
        }

        // смена аватарки при изменении расписания
        avatarEditAccess(data);


        // установка цвета левой панели
        jQuery.each($('.plan_list li a'), function () {
            $(this).css({'background-color': 'rgb(244, 243, 248)', 'color': '#000000'})
        });
        $this_button.css({'background-color': '#000000', 'color': '#FFFFFF'});
        // установить выбранный цвет
        var plan_menu = $('.plan_selector').find('[plan_id=' + data.plan_id + ']');
        plan_menu.css({'background': 'black', 'color': 'white'});
    });
}


function createPlan($plus_button) {
    /*
     *  Функция создает новое расписание. Т.е.:
     *  1. Добавляет кнопку в панели переключения расписаний;
     *  2. Создает для данного пользователя в базе "дефолтное" расписание.
     */
    var $new_plan_li, $new_plan_li_a;

    // если мы нажимаем на меню справа, то плюс исчезает на мгновение
    if ($plus_button) {
        $plus_button.fadeTo(50, 0).delay(100).fadeTo(200, 1);
    }

    $.ajax({
        url: '/create_plan',
        type: 'GET',
        dataType: 'json',
        success: function (msg) {
            if (!$plus_button) {
                location.href = "/plan";
            }
            $('.plan_list').append('<li style="display: none; opacity: 0"><a>No name</a></li>');

            $new_plan_li = $('.plan_list li').last();

            $new_plan_li.slideToggle(200);

            $new_plan_li_a = $new_plan_li.find('a');
            // добавляем этой кнопке в атрибуты id нового расписания
            $new_plan_li_a.attr('plan_id', msg.new_plan_id);

            setTimeout(function () {
                $new_plan_li.fadeTo(100, 1);
            }, 200);

            setTimeout(function () {
                // навешиваем возможность переключения
                $new_plan_li_a.click(function () {
                    switchPlan($(this));
                });
                // переключаемся на него, иммитируя клик
                $new_plan_li_a.trigger('click');
            }, 600);
        }
    });
}


function blurElement(element, size) {
    var filterVal = 'blur(' + size + 'px)';
    $(element).css({
        'filter': filterVal,
        'webkitFilter': filterVal,
        'mozFilter': filterVal,
        'oFilter': filterVal,
        'msFilter': filterVal,
        'transition': 'all 0.2s ease-out',
        '-webkit-transition': 'all 0.2s ease-out',
        '-moz-transition': 'all 0.2s ease-out',
        '-o-transition': 'all 0.2s ease-out'
    });
}

function showFlexCenter($elem) {
    $elem.css({
        'display': 'flex',
        'align-items': 'center',
        'align-content': 'center',
        'justify-content': 'center'
    });
}


function show_invitations() {
    $('.for_invitations').load('/get_invitations');
}


function preventDefault(e) {
  e = e || window.event;
  if (e.preventDefault)
      e.preventDefault();
  e.returnValue = false;
}

function preventDefaultForScrollKeys(e) {
    // if (keys[e.keyCode]) {
    //     preventDefault(e);
    //     return false;
    // }
}

function disableScroll() {
  if (window.addEventListener) // older FF
      window.addEventListener('DOMMouseScroll', preventDefault, false);
  window.onwheel = preventDefault; // modern standard
  window.onmousewheel = document.onmousewheel = preventDefault; // older browsers, IE
  window.ontouchmove  = preventDefault; // mobile
  document.onkeydown  = preventDefaultForScrollKeys;
}

function enableScroll() {
    if (window.removeEventListener)
        window.removeEventListener('DOMMouseScroll', preventDefault, false);
    window.onmousewheel = document.onmousewheel = null;
    window.onwheel = null;
    window.ontouchmove = null;
    document.onkeydown = null;
}


function validatePassword(email) {
    var regex = /(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;
    return regex.test(email);
}

function validateEmail(email) {
    var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return regex.test(email);
}

