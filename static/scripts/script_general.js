$(document).ready(function () {

    avatarEditAccess({plan_id: $('.ava_content p').text()});
    setListenersTitleBlock();
    setListenersEmptyPlan();
    setListenersLeftContent();
    setCurrentMenu();

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

function setListenersTitleBlock() {
    $('.plan_settings').click(function () {
        activeSettingsTitle();
    });
}

function setListenersLeftContent() {
    $(".select_plan").click(function () {
        switchPlan($(this));
        loadLeftContent();
        setScrollTop();
        avatarEditAccess({plan_id: $('.ava_content p').text()});
    });

    $('.plan_list li a').click(function () {
        switchPlan($(this));
    });

}


function loadLeftContent() {
    /*
     Функция загружает правый контент
     */
    $('.left_content').load('/left_content', {}, function () {
        setListenersLeftContent();
    });
    // при загрузке левого конетнта, правый должен быть именно такого размера
    $('.right_content').css({
        'width': 'calc(100% - 188px)'
    })
}


function getCursorToEnd($this_input) {
    $this_input.val($this_input.val());
}

function activeSettingsTitle() {
    /*
     функция активирует настройки при нажатии на кнопку
     активируется поле имени расписания
     появляются поля для изменения начальной даты расписания
     */
    if ($('.buttons_setting').length > 0) {
        deactivateSettingsTitle();
        return true;
    }

    var $title_input = $('#title_edit_input');
    var $title_content = $('.title_content');

    bindPlanTitleAndPlanSelector();
    $title_input.prop('disabled', false);
    $title_input.focus();

    var $buttons = $(
        '<div class="buttons_setting row">' +
        '<div class="text-center">' +
        '<button type="button" class="setting_success col-lg-2 col-lg-offset-4 col-md-2 col-md-offset-4 col-xs-4  col-xs-offset-2 col-sm-4 col-sm-offset-2 btn-primary btn-lg text-center">Применить</button>' +
        '<button type="button" class="setting_cancel col-lg-2 col-md-2 col-md-offset-4 col-xs-4 col-sm-4 btn-danger btn-lg text-center">Отмена</button>' +
        '</div>' +
        '</div>');

    $buttons.insertAfter($title_content);

    $('.setting_cancel').click(function () {
        deactivateSettingsTitle();
    });

    $('.setting_success').click(function () {
        updatePlanTitle();
        deactivateSettingsTitle();
    });

    $title_input.css({
        "border": "1px solid rgb(217, 217, 227)"
    });

    // редактировать дату действия расписания
    // var $dates_block = $(
    //     '<form class="select_dates">' +
    //     '<div class="form-group col-lg-10">' +
    //     '<input type="date" class="start_date form-control">' +
    //     '</div>' +
    //     '<div class="form-group col-lg-10">' +
    //     '<input type="date" class="end_date form-control">' +
    //     '</div>' +
    //     '</form>');
    $('.data_work').remove();
    // $('.setting_left').append($dates_block);


    getCursorToEnd($title_input);
}
function deactivateSettingsTitle() {
    var $title_input = $('#title_edit_input');
    var $dates = $('.select_dates');
    $title_input.css({'border-color': 'rgba(0,0,0,0)'});
    $title_input.prop('disabled', true);
    $dates.remove();
    var dates_work = $('<div class="data_work">22.03.16-24.12.16</div>')
    $('.setting_left').append(dates_work);
    $('.buttons_setting').remove();
    updatePlanTitle();
}


function setScrollTop() {
    $('html, body').animate({scrollTop: 0}, 400); //1100 - скорость
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
    var data;
    var $title_input = $('#title_edit_input');

    data = {
        plan_id: $('.title_content').attr('plan_id'),
        new_title: $title_input.val()
    };

    $.ajax({
        url: '/update_plan_title',
        type: 'POST',
        data: data,
        dataType: 'json',
        success: function (msg) {
            if (!msg.success) {
                $title_input.parent().text('Ошибка');
                $title_input.parent().append('<a href="/plan">Перезагрузите страницу.</a>');
            }
        },
        error: function () {
            $title_input.parent().text('Ошибка');
            $title_input.parent().append('<a href="/plan">Перезагрузите страницу.</a>');
        }


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

    // подгружаем правый контент, изменяем стиль кнопок слева
    goSwitchPlan(data);

    jQuery.each($('.plan_list li a'), function () {
        $(this).css({'background-color': 'rgb(244, 243, 248)', 'color': '#000000'})
    });

    $this_plan.css({'background-color': '#000000', 'color': '#FFFFFF'});

    // установить выбранный цвет
    var id = data.plan_id;
    var plan_menu = $('[plan_id=' + id + ']');
    plan_menu.css({'background': 'black', 'color': 'white'});
}
// изменяет расписание, показываем шкалу загрузки (не зависит от правой панели)
// можно просто вызвать для переключения расписания
function goSwitchPlan(data) {
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
        setListenersTitleBlock();
        setListenersRightContent();
        avatarEditAccess(data);

    });


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