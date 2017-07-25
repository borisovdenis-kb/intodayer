/**
 * Created by Alexey on 24.07.2017.
 */
$(document).ready(function () {
    saveInputs();

    $('.pr_content_title button').unbind();
    $('.pr_content_title button').focus(function () {
        deleteDefaultClass();
        $(this).addClass('btn-danger');
        hideAllPlans();
        showSelectTypePlans($(this));
    });
    $('#cancel').unbind();
    $('#cancel').click(function () {
        setInputsFromDefault();
    });
    $('.pr_pass_btn').unbind();
    $('.pr_pass_btn').click(function () {
        showModal('old_pass');
    });
    $('#save').unbind();
    $('#save').click(function () {
        beforeSendToServer();
    });
});

var inputValues = {
    'login': "",
    'username': "",
    'email': "",
    'send_telegram': "",
    'send_email': "",
    'pass': ""
};

function sendDataToServer(data) {
    console.log("На сервер будет отправлено:");
    for (var k in data) {
        console.log(k + ": " + data[k]);
    }
}

function beforeSendToServer() {
    var data = {
        "login": $('#pr_login').val(),
        "username": $('#pr_username').val(),
        "email": $('#pr_email').val(),
        "send_telegram": $('#pr_send_telegram').prop('checked'),
        "send_email": $('#pr_send_email').prop('checked'),
        "passStatus": false
    };
    if (old_pass != "") {
        if (new_pass == re_new_pass) {
            data.old_pass = old_pass;
            data.new_pass = new_pass;
            data.re_new_pass = re_new_pass;
            data.passStatus = 'yes';
        }
        else {
            data.passStatus = 'do not match';
            alert("Ведённые пароли не совпадают");
            setChangePassButtonDefault();
            setDefaultPassValues();
        }
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
    inputValues.login = $('#pr_login').val();
    inputValues.username = $('#pr_username').val();
    inputValues.email = $('#pr_email').val();
    inputValues.send_telegram = $('#pr_send_telegram').prop('checked');
    inputValues.send_email = $('#pr_send_email').prop('checked');
    inputValues.passStatus = false;
}

// нужно для того, чтобы также отменить индикатор кнопки "изменить пароль - сохраните изменения"
var button_change_pass = $('.change_pass_btn').html();

function setInputsFromDefault() {
    $('#pr_login').val(inputValues.login);
    $('#pr_username').val(inputValues.username);
    $('#pr_email').val(inputValues.email);
    $('#pr_send_telegram').removeAttr('checked');
    $('#pr_send_email').removeAttr('checked');
    if (inputValues.send_telegram == 1)
        $('#pr_send_telegram').prop('checked', true);
    if (inputValues.send_email == 1)
        $('#pr_send_email').prop('checked', true);
    setDefaultPassValues();
    setChangePassButtonDefault();
}

function setChangePassButtonDefault() {
    $('.pr_pass_btn').replaceWith(button_change_pass);
    $('.pr_pass_btn').click(function () {
        showModal('old_pass');
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
    if ($this_elem.attr('id') == 'pr_all') {
        $('.pr_plans_content').show();
    }
    else {
        $(".pr_plans_content[plan_role='" + $this_elem.attr('id') + "']").each(function () {
            $(this).show();
        });
    }
}