$(document).ready(function () {
    // setStrColor('f');

    avatarEditAccess({plan_id: $('.ava_content p').text()});

    $('.plan_list li a').click(function () {
        switchPlan($(this));
    });

    $('.create_plan li a').click(function() {
        var $new_plan;

        $(this).animate({'background-color': '#ffffff'}, 200);
        $(this).delay(100).animate({'background-color': '#f4f3f8'}, 200);

        $('.plan_list').append('<li style="display: none; opacity: 0"><a>No name</a></li>');

        $new_plan = $('.plan_list li').last();
        $new_plan.slideToggle(200);

        setTimeout(function() {
            $new_plan.fadeTo(100, 1);
        }, 200);
    });

    bindPlanTitleAndPlanSelector();
    updatePlanTitle();

    // $('#plan_title').click(function() {
    //     var $title_input, title_val;
    //
    //     title_val = $(this).text();
    //
    //     $(this).text("");
    //     $(this).append('<input type="text">');
    //
    //     $title_input = $(this).find('input');
    //     $title_input.attr({value: title_val, id: 'plan_title_input'});
    //
    //     $('#plan_title_input').focusout(function() {
    //         var $plan_title;
    //
    //         $plan_title = $(this).parent();
    //
    //         $plan_title.text($(this).val());
    //         $(this).remove();
    //     });
    // });
});


function bindPlanTitleAndPlanSelector() {
    /*
     *  Функция "связывает" текст в заголовке расписания
     *  и в кнопке соответсвуещей данному расписанию в панели переключения расписаний
     */
    $('#title_edit_input').on('input', function() {
        var plan_id = $(this).parent().parent().attr('plan_id');
        var $plan_selector;

        $.each($('.plan_list li'), function() {
            var id = $(this).find('p').text();
            if (plan_id == id){
                $plan_selector = $(this);
            }
        });

        $plan_selector.find('a').text($(this).val());
    });
}

function updatePlanTitle() {
    /*
     * Функция обновляет заголовок расписания в базе после редактирования.
     */
    $('#title_edit_input').focusout(function () {
        var data;

        data = {
            plan_id: $(this).parent().parent().attr('plan_id'),
            new_title: $(this).val()
        };

        $.ajax({
            url: '/update_plan_title',
            type: 'POST',
            data: data,
            success: function (msg) {
                msg = JSON.parse(msg);
                if(msg.success == 0){
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
    var data = {plan_id: $this_plan.siblings('p').text()};
    var loc = location.href.split('/');
    var address = loc[loc.length - 2];

    jQuery.each($('.plan_list li a'), function () {
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

        bindPlanTitleAndPlanSelector();
        updatePlanTitle();
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
