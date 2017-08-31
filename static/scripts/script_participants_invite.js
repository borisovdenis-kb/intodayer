/**
 * Created by Alexey on 29.08.2017.
 */

$(window).resize(function () {
    hideAllTooltips();
});

function hideAllTooltips() {
    $('.invite_input').tooltip('hide');
}

function newInputInviteBinds($input_field) {
    $input_field.unbind();
    $input_field.on('input', function () {
        inputInviteActions($(this));
        if (!validateEmail($(this).val())) {
            checkTrueCloneInputs($(this));
            $(this).tooltip('hide');
            setInputDefault($(this));
        }
    });
    $input_field.on('focusout', function () {
        // checkTrueCloneInputs($(this));
        hideEmptyInput($(this));
        if (inputNotEmpty($(this).val()) && !validateEmail($(this).val())) {
            $(this).attr('data-original-title', "Failed email");
            $(this).tooltip('show');
            setInputError($(this));
        }
    });
    $input_field.on('focusout', function () {
        setInputOldValue($(this));
    });
}

function setInputOldValue($this_input) {
    $this_input.attr('old_val', $this_input.val());
}

function hideEmptyInput($click_input) {
    let $inputs = $('.invite_input').filter(function () {
        return !this.value;
    });
    setTimeout(function () {
        if ($inputs.length >= 2) {
            hideAllTooltips();
            hideInput($click_input);
        }
    }, 200);

}

function hideInput($input_field) {
    let $this_input_block = $input_field.parents('.input_outer');
    $this_input_block.fadeTo(200, 1, function () {
        $this_input_block.slideUp(200, function () {
            $this_input_block.remove();
        });
    });
}

function showNewInputInvite() {
    // проверяем, что нет пустых полей input
    if ($('.invite_input').length >= 8) {
        return false;
    }
    let $inputs = $('.invite_input').filter(function () {
        return !this.value;
    });

    if ($inputs.length === 0) {
        let $invite_input_block = $('.invite_input_block');
        $invite_input_block.append(invite_input_block);

        let $last_input = $invite_input_block.find('.invite_input').last();
        $last_input.tooltip({placement: 'right', trigger: 'manual'});
        $last_input.hide();
        $last_input.css('opacity', 0);
        $last_input.slideDown(200);
        $last_input.fadeTo(200, 1, function () {
            $last_input.focus();
        });
        newInputInviteBinds($last_input);
    }

}


function checkEmailStatus(email_str) {
    return new Promise(function (resolve, reject) {
        let data = {
            plan_id: $('.title_content').attr('plan_id'),
            email: email_str
        };

        $.ajax({
            url: '/check_email_not_invited',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function (data) {
                return resolve(data);
            },
            error: function () {
                alert("Ошибка. Не удалось проверить корректность email.");
                return reject();
            }
        });
    });

}

// главная фукнция валидации и управления действия
// второй аргумент тут не обязательный (нужен только для фукнции checkTrueCloneInputs)
var input_timer;
function inputInviteActions($email_input, $input_old) {
    let circle_loader = $email_input.next().find('.inline_circle_loader');
    clearTimeout(input_timer);
    if (validateEmail($email_input.val())) {
        input_timer = setTimeout(function () {
            validateEqualsNotExist($email_input).then(function () {
                circle_loader.show();
                checkEmailStatus($email_input.val()).then(function (data) {
                    showNewInputInvite();
                    setTimeout(function () {
                        circle_loader.hide();
                        if (data.state === 'ok' && validateEmail($email_input.val())) {
                            $email_input.attr('validation', 'true');
                            setInputSuccess($email_input);
                            if ($input_old) {
                                setInputOldValue($input_old);
                            }
                            checkValidateInputs();
                        }
                        else {
                            if (data.state === 'already_joined') {
                                $email_input.attr('data-original-title', "Already joined");
                                $email_input.tooltip('show');
                            }
                            if (data.state === 'already_invited') {
                                $email_input.attr('data-original-title', "Already invited");
                                $email_input.tooltip('show');
                            }
                            setInputError($email_input);
                            $email_input.attr('validation', 'false');
                            checkValidateInputs();
                        }
                    }, 400);

                }, function () {
                    setTimeout(function () {
                        showNewInputInvite();
                        circle_loader.hide();
                    }, 400);
                });
            }, function () {
                $email_input.attr('data-original-title', "Already exist field");
                $email_input.tooltip('show');
                showNewInputInvite();
                setInputError($email_input);
                $email_input.attr('validation', 'false');
                checkValidateInputs();
            });
        }, 200);

    }
    else {
        $email_input.attr('validation', 'false');
        checkValidateInputs();
    }
}

// если среди введёных input есть одинаковые, но при этом не один не валидирован, то валидируем первый
function checkTrueCloneInputs($this_input) {
    var old_val = $this_input.attr('old_val');
    let $validate_is_input = $('.invite_input').filter(function () {
        if ($(this).attr('validation') === 'true' && $(this).val() === old_val) {
            return true
        }
    });


    if ($validate_is_input.length === 0) {

        let $input_for_validate = $('.invite_input').filter(function () {
            if ($(this).val() === old_val) {
                return true
            }
        });
        if ($input_for_validate.length > 0) {
            // console.log($input_for_validate.first().css('background', 'black'));
            inputInviteActions($input_for_validate.first(), $this_input);
        }
    }
}


// проверяет, что такого же значения среди всех input нету
function validateEqualsNotExist($input_this) {
    return new Promise(function (resolve, reject) {
        let $inputs_equal = $('.invite_input').filter(function () {
            if ($(this).val() === $input_this.val()) {
                return true;
            }
        });
        let $inputs_equal_validate = $('.invite_input').filter(function () {
            if ($(this).val() === $input_this.val() && $(this).attr('validation') === 'true') {
                return true;
            }
        });
        if ($inputs_equal.length <= 1) {
            return resolve()
        }
        else {
            if ($inputs_equal_validate.length >= 1) {
                return reject();
            }
            else {
                return resolve();
            }
        }
    });
}


function deactivateInvite() {
    $('.part_settings').text("Пригласить");
    // удаление контента настроек
    $('.setting_msg').remove();
    $('.setting_invite').empty();
    var plan_id = $('.title_content').attr('plan_id');
    $('.part_content').show();
    // var data = {plan_id: plan_id};
}


// отключает кнопку submit , если нечего отправлять
function checkValidateInputs() {
    let validate_fields = false;
    $('.invite_input').each(function () {
        if ($(this).attr('validation') === 'true') {
            setInviteButtonActivate();
            validate_fields = true;
            return true;
        }
    });

    if (!validate_fields) {
        setInviteButtonDeactivate();
    }
}

function setInviteButtonActivate() {
    let $btn_invite = $('#invite_btn');
    let info_msg = $('.info_invite_msg');
    info_msg.slideDown(200);

    $btn_invite.removeClass('disabled');
    $btn_invite.click(sendEmailsToServer);
}
function setInviteButtonDeactivate() {
    let $btn_invite = $('#invite_btn');
    let info_msg = $('.info_invite_msg');
    info_msg.slideUp(200);
    $btn_invite.unbind();
    $btn_invite.addClass('disabled');
}


function sendEmailsToServer() {
    let email_list = [];
    $('.invite_input').each(function () {
        if ($(this).attr('validation') === 'true') {
            email_list.push($(this).val());
        }
    });
    let data = {
        plan_id: $('.title_content').attr('plan_id'),
        email_list: email_list
    };
    // console.log(email_list);
    $.ajax({
        url: '/invite_participants',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: function () {
            success_frame_animate();
            pushExpectedParticipants();

            $('.part_settings').trigger('click');
        },
        error: function () {
            alert("Ошибка. Не удалось выполнить операцию.");
        }
    });
}
