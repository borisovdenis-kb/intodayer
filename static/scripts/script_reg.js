var width_size, raise, is_correct, old_content;
var input_width = $('.reg input').outerWidth();
raise = 0;
width_size = 0;
is_correct = 0;
old_content = $('#password1').val();


var $reg_first_name;
var $reg_last_name;
var $reg_pass;
var $reg_pass_re;
var $reg_email;
var $btn_submit;
var $btn_back;


$(document).ready(function () {
    $reg_first_name = $('#inputFirstName');
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
        // container: 'input'
    });
    $reg_last_name.popover({
        placement: 'right',
        html: true,
        trigger: 'manual',
    });
    $reg_pass.popover({
        placement: 'right',
        html: true,
        trigger: 'manual',
    });
    $reg_email.popover({
        placement: 'right',
        html: true,
        trigger: 'manual',
    });

    setSubmitDisable();
    setRegistrationsListeners();

});
function setRegistrationsListeners() {
    $('.panel_reg').stop(true, true);
    $('.panel_reg').fadeTo(300, 1);
    $('.bottom_text').delay(200).fadeTo(300, 1);


    $btn_back.click(function () {
        window.location.href = "/";
    });


    $('input.reg_field').on('input blur', function () {
        setTimeout(function () {
            totalValidation();
        }, 50);

    });


    // Поля имени и фамилиии
    $reg_first_name.on('change blur', function () {
        setValidateTextField($(this));
    });
    $reg_first_name.on('input', function () {
        setValidateEmptyInput($(this));
    });
    $reg_last_name.on('input', function () {
        setValidateEmptyInput($(this));
    });
    $reg_last_name.on('change blur', function () {
        setValidateTextField($(this));
    });
    // Поля ввода пароля

    $reg_pass.on('blur', function () {
        setValidateCorrectPass($reg_pass, $reg_pass_re);
    });
    $reg_pass_re.on('blur', function () {
        setValidateCorrectPass($reg_pass, $reg_pass_re);
    });
    $reg_pass.on('input', function () {
        setValidateCorrectPassDefault($reg_pass, $reg_pass_re);
    });
    $reg_pass_re.on('input', function () {
        setValidateCorrectPassDefault($reg_pass, $reg_pass_re);
    });

    // Поле ввода email
    $reg_email.on('input', function () {
        setValidateEmail($(this));
    });

    $reg_email.on('input', function () {
        if (!validateEmail($(this).val())) {
            setInputDefault($(this));
        }
    });
}

function totalValidation() {
    let count_input = $('input.reg_field').length;

    let validate_count = 0;
    $('input.reg_field').each(function (i) {

        if ($(this).hasClass('success_input_validate')) {
            validate_count += 1;
        }
        if (i + 1 === count_input) {
            if (count_input === validate_count) {
                console.log(validate_count);
                setSubmitEnable();
            }
            else {
                setSubmitDisable();
            }
        }
    });
}

function setValidateEmptyInput($input_field) {
    if (!inputNotEmpty($input_field.val())) {
        $input_field.popover('hide');
        setInputDefault($input_field);
    }
}

var timer_check_email;
function setValidateEmail($email_input) {
    if (validateEmail($email_input.val())) {

        clearTimeout(timer_check_email);
        timer_check_email = setTimeout(() => {
            setTimeout(() => {
                totalValidation();
            }, 50);


            emailNotExistValidation($email_input.val()).then(function () {
                setInputSuccess($email_input);
            }, function () {
                $email_input.popover('show');
                $email_input.attr('data-content', 'Такой email уже зарегестрирован другим пользователем');
                $email_input.attr('data-original-title', 'Адрес занят');
                $email_input.popover('show');
                setInputError($email_input);
            });
        }, 500);


    }
}

function setValidateCorrectPassDefault($pass_input1, $pass_input2) {
    if (!inputNotEmpty($pass_input1.val()) && !validatePassword($pass_input1.val())) {
        $pass_input1.popover('hide');
        setInputDefault($pass_input1);
        setInputDefault($pass_input2);

    }
}

function setValidateCorrectPass($pass_input1, $pass_input2) {
    let pass1 = $pass_input1.val();
    let pass2 = $pass_input2.val();

    if (inputNotEmpty(pass1)) {
        if (!validatePassword(pass1)) {
            setInputError($pass_input1);
            setInputError($pass_input2);

            $pass_input1.attr('data-content', 'Пароль должен состоять не менее, чем из 8 латинских символов, букв разного регистра и цифр.');
            $pass_input1.attr('data-original-title', 'Слабый пароль');
            $pass_input1.popover('show');
            return;
        }
        else {
            setInputDefault($pass_input1);
            setInputDefault($pass_input2);
            if (inputNotEmpty(pass2)) {
                if (pass1 !== pass2) {
                    setInputError($pass_input1);
                    setInputError($pass_input2);
                    $pass_input1.attr('data-content', 'Проверьте клавишу CapsLock и язык ввода.');
                    $pass_input1.attr('data-original-title', 'Пароли не совпадают');
                    $pass_input1.popover('show');
                    return;
                }
                else {
                    setInputSuccess($pass_input1);
                    setInputSuccess($pass_input2);
                }
            }
        }
    }
    else {
        // if ($pass_input1.next().hasClass('popover')) {
        //     $pass_input1.popover('hide');
        // }
        setInputDefault($pass_input1);
        setInputDefault($pass_input2);
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


// устанавливают стили INPUT валидации
function setInputSuccess($input) {
    if ($input.next().hasClass('popover')) {
        $input.popover('hide');
    }

    setInputDefault($input);
    $input.addClass('success_input_validate');
}

function setInputError($input) {
    setInputDefault($input);
    $input.addClass('error_input_validate');
}

function setInputDefault($input) {
    $input.removeClass('success_input_validate error_input_validate');
}


function inputNotEmpty(input_val) {
    if (input_val) {
        return true;
    } else {
        return false;
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
    // $btn_submit.click(function () {
    //
    // });
    // return false;
    $btn_submit.click(function () {
        $('input.reg_field').each(() => {

                $(this).popover('hide');

            }
        );
        $('input.reg_field').each(function () {
            if (!inputNotEmpty($(this).val())) {

                // $(this).parent().addClass('popover_style');
                $(this).attr('data-content', 'Заполните данное поле');
                $(this).attr('data-original-title', '');
                $(this).popover('show');
                return false;
            }
        });
        return false;
    });
}

function setSubmitEnable() {
    $btn_submit.removeClass('disabled');
    $btn_submit.unbind();
}

