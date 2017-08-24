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
    var data = {plan_id: plan_id};

    $.ajax({
        url: '/delete_plan',
        contentType: "application/json",
        method: 'POST',
        data: JSON.stringify(data),
        dataType: 'text',
        success: function () {
            location.href = "/plan";
        }
    });
}


function activeSettings() {
    // Данная функция активирует все стили и обработчки событий и также подгружает правый контент настроек plan

    // Вставка верхнего информативного табло
    $('.setting_info_block').append($('<div class="setting_msg alert-success">Setting your select plan</div>'));
    $('.setting_msg').delay(200).slideDown(250);

    // Вставка всей панели настроек
    $('.right_content_settings').load('/plan/settings_plan', {}, function () {
        $('.right_content_only').hide();
        var start_date = $('#start_date').val().split(' ');
        $('#datetimepicker').datetimepicker({
            format: 'DD.MM.YYYY',
            locale: 'ru',
            defaultDate: new Date(day = start_date[0], month = start_date[1], year = start_date[2])
        });

        // если у пользователя есть права
        var $title_input = $('#title_edit_input');
        $title_input.attr('old_value', $title_input.val());
        $('#remove_plan').unbind();
        if ($('.plan_settings_layouts').attr('user_has_edit_plan') === 'yes') {
            // Установка title стилей и обработчиков событий

            $title_input.prop('disabled', false);
            $title_input.focus();

            $title_input.css({
                "border": "2px solid rgba(139, 29, 235, 0.4)"
            });

            setInputCursorToEnd($title_input);
            $('.btn-okay').unbind();
            $('.btn-okay').click(function () {
                updateSettings();
            });
        }
        else {
            $('#datetimepicker input').attr('disabled', "");
            $('#datetimepicker input').next().css('cursor', 'not-allowed');

        }
        // для старосты выводится отдельное модальное окно
        if ($('.plan_title').attr('user_role') === 'elder') {
            $('#remove_plan').click(function () {
                showModal('modal_elder_leave');
                $('#btn_ok').unbind();
                $('#btn_ok').click(function () {
                    removePlan();
                });
            });
        }
        else {
            $('#remove_plan').click(function () {
                $('#modal_ok_cancel').modal();
                $('.modal_ok').click(function () {
                    removePlan();
                });
            });
        }


        $('.btn-back').unbind();
        $('.btn-back').click(function () {
            deactivateSettings();
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
    $('.right_content_settings').empty();
    $('.right_content_only').show();
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

    var data = {
        'plan_id': plan_id,
        'plan_info': {
            'start_date': $('#start_date').val().split('.').reverse().join('-'),
            'title': $title_input.val()
        }
    };
    // после выполнения ajax запроса, фиксирует, что они оба прошли успешно
    // и только тогда настройки закрываютс

    var d1 = $.Deferred();

    $.ajax({
        url: '/update_plan_info',
        contentType: "application/json",
        type: 'POST',
        data: JSON.stringify(data),
        // TODO: подправить тут корректную обработку ошибок
        success: function () {
            d1.resolve();
            /*
             * обновляет title расписания у левого контента
             */
            var plan_id = $('.title_content').attr('plan_id');
            var $cur_plan = $('.plan_list').find("a[plan_id='" + plan_id + "']");
            $cur_plan.text($title_input.val());
        },
        error: function () {
            alert("Ошибка обновления информации о расписании. Обновите страницу.");
        }
    });

    $.when(d1).then(function () {
        deactivateSettings(true);
        success_frame_animate();
    });
}

