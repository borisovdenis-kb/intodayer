var width_size, raise, is_correct, old_content;
var input_width = $('.reg input').outerWidth();
raise = 0;
width_size = 0;
is_correct = 0;
old_content = $('#password1').val();


$(document).ready(function () {
    $('.panel_reg').stop(true, true);
    $('.panel_reg').fadeTo(300, 1);
    $('.bottom_text').delay(200).fadeTo(300, 1);

    // для валидации пароля
    $("#inputPassword_re").on('input', function () {
        /*
         Проверка на совпадение пароля 1 и пароля 2
         */
        console.log($(this).val());

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
        console.log($(this).val());

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

});





