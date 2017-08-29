let width_size, raise, is_correct, old_content;

raise = 0;
width_size = 0;
is_correct = 0;
old_content = $('#password1').val();


let $reg_first_name;
let $reg_last_name;
let $reg_pass;
let $reg_pass_re;
let $reg_email;
let $btn_submit;
let $btn_back;


$(document).ready(function () {
    $reg_first_name = $('#inputFirstName');
    setTimeout(function () {
        $reg_first_name.focus();
    }, 50);

    $reg_last_name = $('#inputLastName');
    $reg_pass = $('#inputPassword');
    $reg_pass_re = $('#inputPassword_re');
    $reg_email = $('#inputEmail');
    $btn_submit = $('#buttonEnter');
    $btn_back = $('#buttonBack');

    $reg_first_name.popover({
        placement: 'right',
        html: true,
        trigger: 'manual',
        viewport: 'body'
    });
    $reg_last_name.popover({
        placement: 'right',
        html: true,
        trigger: 'manual',
        viewport: 'body'
    });
    $reg_pass.popover({
        placement: 'right',
        html: true,
        trigger: 'manual',
        viewport: 'body'
    });
    $reg_email.popover({
        placement: 'right',
        html: true,
        trigger: 'manual',
        viewport: 'body'
    });

    setSubmitDisable();
    setRegistrationsListeners();

    $(window).resize(function () {
        $reg_first_name.popover('hide');
        $reg_last_name.popover('hide');
        $reg_pass.popover('hide');
        $reg_email.popover('hide');
    });

});
function setRegistrationsListeners() {
    $('.panel_reg').stop(true, true);
    $('.panel_reg').fadeTo(300, 1);
    $('.bottom_text').delay(200).fadeTo(300, 1);


    $btn_back.click(function () {
        window.location.href = "/";
    });


    $('input.reg_field').on('input focusout', function () {
        totalValidation();
    });


    // Поля имени и фамилиии
    $reg_first_name.on('change', function () {
        setValidateTextField($(this));
    });
    $reg_last_name.on('change', function () {
        setValidateTextField($(this));
    });

    $reg_first_name.on('input', function () {
        if (inputNotEmpty($(this).val())) {
            $(this).prop('validate', true);
        }
        else {
            setInputDefault($(this));
            $(this).prop('validate', false);
        }
    });
    $reg_last_name.on('input', function () {
        if (inputNotEmpty($(this).val())) {
            $(this).prop('validate', true);
        }
        else {
            setInputDefault($(this));
            $(this).prop('validate', false);
        }
    });


    // Поля ввода пароля
    $reg_pass.on('input', function () {
        if (!inputNotEmpty($(this).val())) {
            $(this).popover('hide');
            setInputDefault($(this));
            setInputDefault($reg_pass_re);
        }
    });
    $reg_pass_re.on('input', function () {
        if (!inputNotEmpty($(this).val())) {
            setInputDefault($(this));
        }
    });
    $reg_pass.on('input', function () {
        if (validatePassword($(this).val()) && $(this).val() === $reg_pass_re.val()) {
            $(this).prop('validate', true);
            setInputSuccess($reg_pass);
            setInputSuccess($reg_pass_re);
        }
        else {
            $(this).prop('validate', false);
        }
    });
    $reg_pass_re.on('input', function () {
        if (validatePassword($(this).val()) && $(this).val() === $reg_pass.val()) {
            $(this).prop('validate', true);
            setInputSuccess($reg_pass);
            setInputSuccess($reg_pass_re);
        }
        else {
            $(this).prop('validate', false);
        }
    });

    $reg_pass.on('focusout', function () {
        if (!inputNotEmpty($reg_pass.val())) {
            return false;
        }
        if (!validatePassword($reg_pass.val())) {
            $reg_pass.attr('data-content', 'Пароль должен состоять не менее, чем из 8 латинских символов, букв разного регистра и цифр.');
            $reg_pass.attr('data-original-title', 'Слабый пароль');

            $reg_pass.popover('show');

            setInputError($reg_pass);
            setInputDefault($reg_pass_re);
        }
        else {
            if (!inputNotEmpty($reg_pass_re.val())) {
                setInputSuccess($reg_pass);
            }
            else {
                if ($reg_pass.val() !== $reg_pass_re.val()) {

                    $reg_pass.attr('data-content', 'Проверьте клавишу CapsLock и язык ввода.');
                    $reg_pass.attr('data-original-title', 'Пароли не совпадают');

                    $reg_pass.popover('show');

                    setInputError($reg_pass);
                    setInputError($reg_pass_re);
                }
            }
        }
    });

    $reg_pass_re.on('focusout', function () {
        if (inputNotEmpty($(this).val())) {
            $(this).popover('hide');
        }
        $reg_pass.trigger('focusout');
    });

    // Поле ввода email
    $reg_email.on('input', function () {
        setValidateEmail($(this));
    });

    $reg_email.on('input', function () {
        if (!validateEmail($(this).val())) {
            $(this).prop('validate', false);

        }
    });
    $reg_email.on('input', function () {
        if (!inputNotEmpty($(this).val())) {
            $(this).popover('hide');
            setInputDefault($(this));
        }
    });
    $reg_email.on('change', function () {
        if (inputNotEmpty($(this).val()) && !validateEmail($(this).val())) {
            $reg_email.attr('data-content', 'Такой почты не существует');
            $reg_email.attr('data-original-title', 'Неверный email');
            $reg_email.prop('validate', false);
            $reg_email.popover('show');
            setInputError($(this));
        }
    });
}

// общая валидация проверяет во всех ли полях введена правильная информация
// а точнее, проверяет наличие атрибута 'validate' == true
function totalValidation() {
    setTimeout(() => {
        let count_input = $('input.reg_field').length;

        let validate_count = 0;
        $('input.reg_field').each(function (i) {

            if ($(this).prop('validate')) {
                validate_count += 1;
            }
            // console.log(count_input + " " + validate_count);
            if (i + 1 === count_input) {
                if (count_input === validate_count) {
                    setSubmitEnable();
                }
                else {
                    setSubmitDisable();
                }
            }
        });
    }, 100);
}

var timer_check_email;
var $inline_circle_loader_email = $('.email_content').find('.inline_circle_loader');
function setValidateEmail($email_input) {
    if (validateEmail($email_input.val())) {
        clearTimeout(timer_check_email);
        $inline_circle_loader_email.show();
        timer_check_email = setTimeout(() => {

            emailNotExistValidation($email_input.val()).then(function () {
                $email_input.prop('validate', true);
                totalValidation();
                setInputSuccess($email_input);
                $inline_circle_loader_email.hide();
            }, function () {
                $inline_circle_loader_email.hide();
                $email_input.attr('data-content', 'Такой email уже зарегестрирован другим пользователем');
                $email_input.attr('data-original-title', 'Адрес занят');
                $email_input.prop('validate', false);
                $email_input.popover('show');
                totalValidation();
                setInputError($email_input);
            });
        }, 500);
    }
}

function setValidateTextField($text_input) {
    if (inputNotEmpty($text_input.val())) {
        setInputSuccess($text_input);
    }
    else {
        setInputDefault($text_input);
    }
}







function emailNotExistValidation(email_str) {
    return new Promise(function (resolve, reject) {
        let data = {"email": email_str};

        $.ajax({
            url: '/check_email_unique',
            method: 'POST',
            data: JSON.stringify(data),
            dataType: "json",
            success: function (response) {
                if (!response['is_exist']) {
                    resolve();
                }
                else {
                    reject();
                }
            },
            error: function () {
                reject();
                alert('Ошибка проверки почты');

            }
        });
    });
}


// устанавливает состояния кнопки submit
function setSubmitDisable() {
    $btn_submit.addClass('disabled');
    $btn_submit.unbind();
    $btn_submit.click(function () {
        checkAllValidateStyle();
        return false;
    });
}

function setSubmitEnable() {
    $btn_submit.removeClass('disabled');
    $btn_submit.unbind();
}


function setValidateEmptyInputs($inputs_set) {
    $inputs_set.each(function () {
        if (!inputNotEmpty($(this).val())) {
            $(this).attr('data-content', 'Заполните данное поле');
            $(this).attr('data-original-title', '');
            $(this).popover('show');
            return false;
        }
    });
}

function checkAllValidateStyle() {
    setValidateEmptyInputs($('input.reg_field'));
    // setValidateCorrectPass($reg_pass, $reg_pass_re);
    setValidateEmail($reg_email);
}


