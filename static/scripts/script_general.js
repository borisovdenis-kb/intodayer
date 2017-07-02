$(document).ready(function () {
    setListenersEmptyPlan();
});

function setListenersEmptyPlan() {
    $('.create_plan_first').click(function () {
        createPlan();
        setScrollTop();
    });

    $('.create_plan li a').click(function () {
        createPlan($(this).parents('li'));
    });
}


function setInputCursorToEnd($this_input) {
    $this_input.val($this_input.val());
}


function setScrollTop() {
    $('html, body').animate({scrollTop: 0}, 400); //1100 - скорость
}


function switchPlan($this_plan) {
    /*
     * Это функция общая для всего сайта.
     * Отвечает за подгрузку и замену данных в right_content при переключении расписания.
     * Какие данные будут погружаться зависит от того, на какой странице мы находимся.
     * Соответственно обращение на сервер будет происходить вот так:
     * --- /<page_name>/switch_plan
     *
     * Пока возможны всего два варианта:
     * --- /home/switch_plan
     * --- /plan/switch_plan
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

    $('.right_content').load('/' + address + '/switch_plan', data, function () {
        $('.plan_load_progres_indicator').css('display', 'none');
        // навешиваем обработчики
        if (address == 'plan') {
            setListenersTitleBlock();
            setListenersRightContent();
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
        url: '/create_new_plan',
        type: 'GET',
        dataType: 'json',
        success: function (msg) {
            // создаем новую кнопку
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

