/**
 * Created by Alexey on 24.07.2017.
 */
$(document).ready(function () {
    saveInputs();

    $('.pr_content_title button').unbind();
    $('.pr_content_title button').on('focus click', function () {
        deleteDefaultClass();
        $(this).addClass('btn-danger');
        hideAllPlans();
        showSelectTypePlans($(this));
    });
    $('input').unbind();
    $('input').bind('input change', function () {
        isNewValuesDifferents();
    });
    // $('input:radio').change(function () {
    //    alert("DSfa");
    // });

    $('.pr_pass_btn').unbind();
    $('.pr_pass_btn').click(function () {
        showModal('oldPassword');
    });
});

var inputValues = {
    'first_name': "",
    'last_name': "",
    'telegram_yn': "",
    'email_yn': "",
    'email': ""
};

function setOkCancelBinds() {
    $('#cancel').unbind();
    $('#cancel').click(function () {
        setInputsFromDefault();
        disableOkCancel();
    });
    $('#save').unbind();
    $('#save').click(function () {
        beforeSendToServer();
    });

}

function sendDataToServer(data) {
    data = {
        user: {
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email,
        },
        channels: {
            telegram_yn: data.telegram_yn ? 'y' : 'n',
            email_yn: data.email_yn ? 'y' : 'n'
        }
    };

    $.ajax({
        url: '/update_user_info',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: function () {
            success_frame_animate();
            saveInputs();
            disableOkCancel();
            console.log('User info updated')
        },
        error: function () {
            alert("Ошибка. Поля не были обновлены! Перезагрузите страницу. (")
        }
    })
}

// проверяет, что введённые значения в любое поле отличаются от старых
function isNewValuesDifferents() {
    let data_fields = getAllData();
    let flag_diff = false;
    for (let key in data_fields) {
        if (data_fields[key] !== inputValues[key]) {
            flag_diff = true;
            break;
        }
    }

    if ($('#save').hasClass('disabled') && flag_diff) {
        enableOkCancel();
    }
    else if (!$('#save').hasClass('disabled') && !flag_diff) {
        disableOkCancel();
    }
}

function enableOkCancel() {
    let $save_btn = $('#save');
    let $cancel_btn = $('#cancel');
    setOkCancelBinds();
    $save_btn.removeClass('disabled');
    $cancel_btn.removeClass('disabled');

}

function disableOkCancel() {
    let $save_btn = $('#save');
    let $cancel_btn = $('#cancel');
    $save_btn.unbind();
    $cancel_btn.unbind();
    $save_btn.addClass('disabled');
    $cancel_btn.addClass('disabled');

}

function getAllData() {
    let data_fields = {
        telegram_yn: $('#pr_send_telegram').prop('checked'),
        email_yn: $('#pr_send_email').prop('checked'),
        email: $('#pr_email').val(),
        first_name: $('#first_name').val(),
        last_name: $('#last_name').val(),
    };
    return data_fields;
}

function beforeSendToServer() {
    var re = /^([a-z0-9_-]+\.)*[a-z0-9_-]+@[a-z0-9_-]+(\.[a-z0-9_-]+)*\.[a-z]{2,6}$/;
    var data = {
        telegram_yn: $('#pr_send_telegram').prop('checked'),
        email_yn: $('#pr_send_email').prop('checked')
    };

    if ($('#pr_email').val().search(re) != -1) {
        data.email = $('#pr_email').val();
    } else {
        alert('Неправильный формат email')
        return;
    }

    if ($('#first_name').val() && $('#last_name').val()) {
        data.first_name = $('#first_name').val();
        data.last_name = $('#last_name').val();
    } else {
        alert('Поля имя и фамиля не могут быть пустыми');
        return;
    }


    // если значения хотя бы одного поля отличаются (значит отправляем для обновления на севрер)
    for (var key in data) {
        if (data[key] != inputValues[key]) {
            // TODO: вот тут дальше идёт ajax запрос с данными на сервер
            sendDataToServer(data);
            return false;
        }
    }
}

function saveInputs() {
    inputValues.first_name = $('#first_name').val();
    inputValues.last_name = $('#last_name').val();
    inputValues.email = $('#pr_email').val();
    inputValues.telegram_yn = $('#pr_send_telegram').prop('checked');
    inputValues.email_yn = $('#pr_send_email').prop('checked');
    inputValues.passStatus = false;
}

// нужно для того, чтобы также отменить индикатор кнопки "изменить пароль - сохраните изменения"
var button_change_pass = $('.change_pass_btn').html();

function setInputsFromDefault() {
    $('#first_name').val(inputValues.first_name);
    $('#last_name').val(inputValues.last_name);
    $('#pr_email').val(inputValues.email);
    $('#pr_send_telegram').prop('checked', inputValues.telegram_yn);
    $('#pr_send_email').prop('checked', inputValues.email_yn);
    setDefaultPassValues();
    setChangePassButtonDefault();
}

function setChangePassButtonDefault() {
    $('.pr_pass_btn').replaceWith(button_change_pass);
    $('.pr_pass_btn').click(function () {
        showModal('oldPassword');
    });
}

function deleteDefaultClass() {
    $('.pr_content_title ul li').each(function () {
        var $this_button = $(this).find('button');
        $this_button.removeClass('btn-danger');
    });
}

function hideAllPlans() {
    $('.pr_plans_content').each(function () {
        $(this).hide();
    });
}

function showSelectTypePlans($this_elem) {
    if ($this_elem.attr('id') == 'all') {
        $('.pr_plans_content').show();
    }
    else {
        $(".pr_plans_content[plan_role='" + $this_elem.attr('id') + "']").each(function () {
            $(this).show();
        });
    }
}