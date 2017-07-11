$(document).ready(function () {
    setListenersTitleBlock();
});


function setListenersTitleBlock() {
    $('.plan_settings').click(function () {
        openSettings();
    });
}


function startDatePicker() {
    $('#datetimepicker').datetimepicker({
        locale: 'ru'
    });
}

function openSettings() {
    /*
     Открывает панель настроек при нажатии
     */
    if ($('.setting_msg').length > 0) {
        deactivateSettingsTitle();
        deactivateSettingContent();
    }
    else {
        activeSettingsTitle();
        activeSettingsContent();
    }
}


function removePlan() {
    var plan_id = +$('.title_content').attr('plan_id');
    // alert(plan_id);
    $.ajax({
        url: '/delete_plan',
        method: 'POST',
        data: {plan_id: plan_id},
        dataType: 'json',
        success: function (response) {
            alert("Удалено");
        }

    });
}

function activeSettingsContent() {
    $('.setting_info_block').append($('<div class="setting_msg alert-success">Setting your select plan</div>'));
    $('.setting_msg').slideDown(250);
    $('.right_content_only').load('/plan/settings_plan', {}, function () {

        startDatePicker();
        $('.return_button').unbind();
        $('.return_button').click(function () {
            openSettings();
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

function deactivateSettingContent() {
    $('.setting_msg').remove();
    var data = {plan_id: $('.title_content').attr('plan_id')};
    $('.right_content_only').load('/plan/plan_content_only', data, function () {
        setListenersRightContent();
    });
}

function activeSettingsTitle() {
    /*
     функция активирует настройки при нажатии на кнопку
     активируется поле имени расписания
     появляются поля для изменения начальной даты расписания
     */

    var $title_input = $('#title_edit_input');

    bindPlanTitleAndPlanSelector();

    $title_input.prop('disabled', false);
    $title_input.focus();

    $title_input.css({
        "border": "1px solid rgba(217, 217, 227, 1)"
    });

    setInputCursorToEnd($title_input);
}
function deactivateSettingsTitle() {
    /*
     Деактивирует и сохраняет все настройки
     */
    var $title_input = $('#title_edit_input');
    $title_input.css({
        "border": "1px solid rgba(217, 217, 227, 0)"
    });
    $title_input.prop('disabled', true);

    updatePlanTitle();

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

