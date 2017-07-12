$(document).ready(function () {
    setListenersTitleBlock();
});

function setListenersTitleBlock() {
    $('.plan_settings').unbind();
    $('.plan_settings').click(function () {
        if ($('.setting_msg').length > 0) {
            deactivateSettings();
        }
        else {
            activeSettings();

        }
    });
}

function removePlan() {
    var plan_id = +$('.title_content').attr('plan_id');

    $.ajax({
        url: '/delete_plan',
        method: 'POST',
        data: {plan_id: plan_id},
        dataType: 'json',
        success: function (response) {
            location.href = "/plan";
        }
    });
}


function activeSettings() {
    // Данная функция активирует все стили и обработчки событий и также подгружает правый контент настроек plan

    // Вставка верхнего информативного табло
    $('.setting_info_block').append($('<div class="setting_msg alert-success">Setting your select plan</div>'));
    $('.setting_msg').slideDown(250);

    // Вставка всей панели настроек
    $('.right_content_only').load('/plan/settings_plan', {}, function () {

        var start_date = $('#start_date').val().split(' ');
        $('#datetimepicker').datetimepicker({
            format: 'DD.MM.YYYY',
            locale: 'ru',
            defaultDate: new Date(day = start_date[0], month = start_date[1], year = start_date[2])
        });


        // Установка title стилей и обработчиков событий
        var $title_input = $('#title_edit_input');

        $title_input.attr('old_value', $title_input.val());
        $title_input.prop('disabled', false);
        $title_input.focus();

        $title_input.css({
            "border": "1px solid rgba(217, 217, 227, 1)"
        });

        setInputCursorToEnd($title_input);

        $('.return_button').unbind();
        $('.return_button').click(function () {
            deactivateSettings();
        });
        $('.btn-back').unbind();
        $('.btn-back').click(function () {
            deactivateSettings();
        });
        $('.btn-okay').unbind();
        $('.btn-okay').click(function () {
            updateSettings();
        });
        $('#remove_plan').unbind();
        $('#remove_plan').click(function () {
            $('#modal_ok_cancel').modal();
            $('.modal_ok').click(function () {
                removePlan();
            });
        });


    });
}


function deactivateSettings(flag_update) {
    /*
     // Данная функция деактивирует все стили и обработчки событий связанных с настройками plan
     */
    var $title_input = $('#title_edit_input');
    $title_input.css({
        "border": "1px solid rgba(217, 217, 227, 0)"
    });
    $title_input.prop('disabled', true);

    if (!flag_update) {
        $title_input.val($title_input.attr('old_value'));
    }

    // удаление контента настроек
    $('.setting_msg').remove();
    var plan_id = $('.title_content').attr('plan_id');
    var data = {plan_id: plan_id};
    $('.right_content_only').load('/plan/plan_content_only', data, function () {
        setListenersRightContent();
    });
}


function updateSettings() {
    /*
     * Данная функция обновляет все поля, связанные с настройками Plan (загружает их на сервер и получает ответ)
     */
    var $title_input = $('#title_edit_input');
    var plan_id = $('.title_content').attr('plan_id');

    if ($title_input.val() == "") {
        $title_input.val("No name");
    }

    var titleData = {
        plan_id: $('.title_content').attr('plan_id'),
        new_title: $title_input.val()
    };

    var dateInputData = {
        'start_date': $('#start_date').val(),
        'plan_id': plan_id
    };
    // после выполнения 2 ajax запросов, фиксирует, что они оба прошли успешно
    // и только тогда настройки закрываются
    $.when(
        $.ajax({
            url: '/update_plan_title',
            type: 'POST',
            data: titleData,
            dataType: 'json',
            // TODO: подправить тут корректную обработку ошибок
            success: function () {
                /*
                 * обновляет title расписания у левого контента
                 */
                var plan_id = $('.title_content').attr('plan_id');
                var $cur_plan = $('.plan_list').find("a[plan_id='" + plan_id + "']");
                $cur_plan.text($title_input.val());
            },
            error: function () {
                alert("Ошибка обновления заголовка расписания. Обновите страницу.");
            }
        }),
        /*
         * обновляет дату расписания в БД
         */
        $.ajax(
            {
                url: '/set_start_date',
                dataType: 'json',
                method: 'POST',
                data: dateInputData,
                success: function () {
                },
                error: function () {
                    alert("Ошибка обновления даты начала расписания. Обновите страницу.");
                }
            }
        )
    ).then(function () {
        deactivateSettings(true);
        success_frame_animate();
    });
}

