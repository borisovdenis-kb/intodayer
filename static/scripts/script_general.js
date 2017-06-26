$(document).ready(function () {
    // setStrColor('f');

    avatarEditAccess({plan_id: $('.ava_content p').text()});

    $('.plan_list li a').click(function () {
        switchPlan($(this));
    });

    $('.create_plan_first').click(function () {
        createPlan();
        setScrollTop();
        // focusInputTitle();
    });

    $('.create_plan li a').click(function () {
        createPlan($(this).parents('li'));
    });

    $(".select_plan").click(function () {
        switchPlan($(this));
        setScrollTop();
    });

    bindPlanTitleAndPlanSelector();
    updatePlanTitle();
    createPlan();
});

function setScrollTop() {
        $('html, body').animate({scrollTop: 0}, 400); //1100 - скорость
}
// function focusInputTitle() {
//        $('#title_edit_input').trigger('focus');
// }

function createPlan($plus_button) {
    /*
     *  Функция создает новое расписание. Т.е.:
     *  1. Добавляет кнопку в панели переключения расписаний;
     *  2. Создает для данного пользователя в базе "дефолтное" расписание.
     */
    var $new_plan_li, $new_plan_li_a;

    $(this).animate({'background-color': '#ffffff'}, 200);
    $(this).delay(100).animate({'background-color': '#f4f3f8'}, 200);

    // если мы нажимаем на меню справа, то плюс исчезает на мгновение
    if ($plus_button) {
        $plus_button.fadeTo(50, 0).delay(100).fadeTo(200, 1);
    }

    $.ajax({
        url: '/create_new_plan',
        type: 'GET',
        success: function (msg) {
            msg = JSON.parse(msg);
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


function bindPlanTitleAndPlanSelector() {
    /*
     *  Функция "связывает" текст в заголовке расписания
     *  и в кнопке соответсвуещей данному расписанию в панели переключения расписаний
     */
    $('#title_edit_input').on('input', function () {
        var plan_id = $(this).parent().parent().parent().attr('plan_id');
        var $plan_selector;

        $.each($('.plan_list li a'), function () {
            var id = $(this).attr("plan_id");
            if (plan_id == id) {
                $plan_selector = $(this);
            }
        });

        $plan_selector.text($(this).val());
    });
}

function updatePlanTitle() {
    /*
     * Функция обновляет заголовок расписания в базе после редактирования.
     */
    $('#title_edit_input').focusout(function () {
        var data;

        data = {
            plan_id: $(this).parent().parent().parent().attr('plan_id'),
            new_title: $(this).val()
        };

        $.ajax({
            url: '/update_plan_title',
            type: 'POST',
            data: data,
            success: function (msg) {
                msg = JSON.parse(msg);
                if (msg.success == 0) {
                    $(this).parent().text('Ошибка');
                    $(this).parent().append('<a href="/plan">Перезагрузите страницу.</a>');
                }
            },
            error: function () {
                $(this).parent().text('Ошибка');
                $(this).parent().append('<a href="/plan">Перезагрузите страницу.</a>');
            }

        });
    });
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
    var loc = location.href.split('/');
    var address = loc[loc.length - 2];


    jQuery.each($('.plan_list li a'), function () {
        $(this).css({'background-color': 'rgb(244, 243, 248)', 'color': '#000000'})
    });

    $this_plan.css({'background-color': '#000000', 'color': '#FFFFFF'});

    $.each($('.right_content').children(), function () {
        if (!$(this).hasClass('plan_load_progres')) {
            $(this).remove();
        }
    });

    $('.plan_load_progres_indicator').css('display', 'flex');

    $('.right_content').load('/' + address + '/switch_plan', data, function () {
        $('.plan_load_progres_indicator').css('display', 'none');

        bindPlanTitleAndPlanSelector();
        updatePlanTitle();
        startIntodayer();
    });

    avatarEditAccess(data);

    // установить выбранный цвет
    var id = data.plan_id;
    var plan_menu = $('[plan_id=' + id + ']');
    plan_menu.css({'background': 'black', 'color': 'white'});

}

function avatarEditAccess(data) {
    /*
     *  data - словарь (возможные ключ: plan_id)
     */
    $.getJSON('/get_avatar', data, function (msg) {
        $('.ava_content').css({'background-image': 'url(' + msg.url + ')'});
        if (msg.isOwner == true) {
            $('.ava_cover').css({'display': 'block'});
        } else {
            $('.ava_cover').css({'display': 'none'});
        }
    });
}
