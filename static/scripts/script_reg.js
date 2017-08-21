var width_size, raise, is_correct, old_content;
var input_width = $('.reg input').outerWidth();
raise = 0;
width_size = 0;
is_correct = 0;
old_content = $('#password1').val();


$(document).ready(function () {
    setSubmitDisable();
    $('.panel_reg').stop(true, true);
    $('.panel_reg').fadeTo(300, 1);
    $('.bottom_text').delay(200).fadeTo(300, 1);

    // для валидации пароля
    $("#inputPassword_re").on('input', function () {
        /*
         Проверка на совпадение пароля 1 и пароля 2
         */
        if ($(this).val() && $(this).val() == $("#inputPassword").val()) {
            $(this).addClass('pswd_equal_pswd_confirm');
            $("#inputPassword").addClass('pswd_equal_pswd_confirm');
        } else {
            $(this).removeClass('pswd_equal_pswd_confirm');
            $("#inputPassword").removeClass('pswd_equal_pswd_confirm');
        }
    });
    $("#inputPassword").on('input', function () {
        /*
         Проверка на совпадение пароля 1 и пароля 2
         */
        if ($(this).val() && $(this).val() == $("#inputPassword_re").val()) {
            $(this).addClass('pswd_equal_pswd_confirm');
            $("#inputPassword_re").addClass('pswd_equal_pswd_confirm');
        } else {
            $(this).removeClass('pswd_equal_pswd_confirm');
            $("#inputPassword_re").removeClass('pswd_equal_pswd_confirm');
        }
    });

    $('#buttonBack').click(function () {
        window.location.href = "/";
    });
    // $('#inputEmail').on('change', function () {
    //     if (!validateRegistrationEmail($(this).val())) {
    //         // $(this).popover('show');
    //     } else {
    //         // $(this).popover('destroy');
    //     }
    // });


    $('input').bind('input', function () {
        if (totalValidation()) {
            $('#buttonEnter').removeClass('disabled');
        } else {
            $('#buttonEnter').addClass('disabled');
        }

    });
});

function setSubmitDisable() {
    $('#buttonEnter').unbind();
    $('#buttonEnter').click(function () {
        return false;
    });
}
function setSubmitEnable() {
    $('#buttonEnter').unbind();
}


function inputNotEmptyValidation(input_val) {
    if (input_val) {
        return true;
    } else {
        return false;
    }
}


function totalValidation() {
    let fields_is_clear = true;
    if (!validateEmail($('#inputEmail').val())) {
        fields_is_clear = false;
    }
    else{
        emailNotExistValidation($('#inputEmail').val());
    }
    if (!inputNotEmptyValidation($('#inputFirstName').val())) {
        fields_is_clear = false;
    }
    if (!inputNotEmptyValidation($('#inputLastName').val())) {
        fields_is_clear = false;
    }
    if (!validatePassword($('#inputPassword').val())) {
        fields_is_clear = false;
    }
    if (!passwordConfirmationValidation($('#inputPassword').val(), $('#inputPassword_re').val())) {
        fields_is_clear = false;
    }



    if (fields_is_clear) {
        setSubmitEnable();
        return true;
    } else {
        setSubmitDisable();
        return false;
    }
}

function passwordConfirmationValidation(pass1, pass2) {
    if (pass1 === pass2) {
        return true;
    }
    else {
        return false;
    }
}


function emailNotExistValidation(email_str) {
    let data = {"email": email_str};

    $.ajax({
        url: '/check_email_unique',
        method: 'POST',
        data: JSON.stringify(data),
        dataType: "json",
        success: function (response) {
            alert(response['is_exist']);
            if (response['is_exist']) {
                setSubmitDisable();
            }
            else{
                setSubmitEnable();
            }
        },
        error: function () {
            alert('Ошибка проверки почты');
        }
    });
}