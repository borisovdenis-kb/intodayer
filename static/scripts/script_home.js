$(document).ready(function () {
    // setStrColor('f');

    avatarEditAccess({plan_id: $('.ava_content p').text()});

    $('.plan_selector ul li a').click(function () {
        switchPlan($(this));
    });
});

function switchPlan($this_plan) {
    /*
     * Это функция общая для всего сайта.
     * Отвечает за подгрузку и замену данных в right_content при переключении расписания.
     * Какие данные будут погружаться зависит от того, на какой странице мы находимся.
     * Соответственно обращение на сервер будет происходит вот так:
     * --- /{{page_name}}/switch_plan
     *
     * Пока возможны всего два варианта:
     * --- /home/switch_plan
     * --- /plan/switch_plan
     */
    var data = {plan_id: $this_plan.siblings('p').text()};
    var loc = location.href.split('/');
    var address = loc[loc.length - 2];

    jQuery.each($('.plan_selector ul li a'), function () {
        $(this).css({'background-color': 'rgb(244, 243, 248)', 'color': '#000000'})
    });

    $this_plan.css({'background-color': '#000000', 'color': '#FFFFFF'});

    $.each($('.right_content').children(), function () {
        if (!$(this).hasClass('plan_load_progres')){
            $(this).remove();
        }
    });

    $('.plan_load_progres_indicator').css('display', 'flex');

    $('.right_content').load('/' + address + '/switch_plan', data, function () {
        $('.plan_load_progres_indicator').css('display', 'none');
        // setStrColor();
        startIntodayer();

    });

    avatarEditAccess(data);
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

// function setStrColor() {
//     /*
//      *  Функция окрашивает нечетные строки таблицы в серый цвет
//      */
//     $.each($('.day_plan_content'), function () {
//         $.each($(this).find('.str_plan'), function (i) {
//             if ((i % 2) != 0) {
//                 $(this).clearQueue();
//                 $(this).animate({'background-color': 'rgba(240, 240, 245, 1)'});
//                 $(this).find('ul').clearQueue();
//                 $(this).find('ul').animate({'background-color': 'rgba(240, 240, 245, 1)'});
//             }
//         });
//     });
// }