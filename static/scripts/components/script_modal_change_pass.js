/**
 * Created by Alexey on 25.07.2017.
 */

$(document).ready(function () {
    modal_html = $(".in_modal_fade").html();
});

var pause_time = 100;

var oldPassword = "";
var newPassword = "";
var confirmedPassword = "";
// чтобы при закрытии и последующем открытии у окна были исходные стили
var modal_html = "";

var passwordChangedSuccesfuly = {text: 'Пароль успешно изменен.', color: '#2BBBAD'};
var notCorrectOldPassword = {text: 'Введенный пароль и Ваш текущий пароль не совпадают.', color: '#d9534f'};
var newPasswordAndConfirmedNotEquel = {text: 'Пароли не совпадают.', color: '#d9534f'};
var newPasswordDontPassValidation = {
    text: 'Пароль должен быть не меньше 8 символов и содержать: заглавные буквы, строчные буквы и цифры.',
    color: '#d9534f'
};



function showModal(m_type) {
    // var modal_window = modal_fade.find('.in_modal_body');var modal_fade = $(".in_modal_fade[modal_type='" + m_type + "']")
    // получаем модальное окно определённого типа
    // при нажании на "изменить пароль" получаем окно типа oldPassword
    var $modal_fade = $(".in_modal_fade");
    $modal_fade.html(modal_html);
    var $modal_window = $(".in_modal_body");
    $(".in_modal_body").clearQueue();
    $(".in_modal_fade").clearQueue();
    $modal_window.delay(pause_time).queue(function () {
        $(this).css({
            'transform': 'scale(1.4, 1.4)',
            'opacity': 1
        });
        $modal_window.find('input[id=pass]').focus();
        $modal_window.find('input[id=pass]').val("");
        $modal_window.dequeue();
    });
    $modal_fade.show().delay(pause_time).queue(function () {
        $(this).css({
            'opacity': 1
        });

        $('#okay').unbind();
        $('#okay').click(function () {
            okayAction();
        });

        var $input_pass = $('.in_modal_body').find('#pass');

        // для 1 ого модального окна сохраняем старый пароль
        if ($('.in_modal_fade').attr('modal_type') === 'oldPassword') {
            $input_pass.on('focusout', function () {
                oldPassword = $(this).val();
            });
        }

        $(this).dequeue();
    });
    $(document).unbind('click');
    $(document).click(function (event) {
        if ($(event.target).children(".in_modal_body").length == 1) {
            hideModalWindow();
            hideModalFade();
        }
    });
}

function hideModalWindow(scale_size, opacity_size) {
    if (!scale_size) {
        scale_size = 0.5;
        opacity_size = 0;
    }

    $(".in_modal_body").clearQueue();
    $(".in_modal_body").queue(function () {
        $(this).css({
            'transform': 'scale(' + scale_size + ', ' + scale_size + ')',
            'opacity': opacity_size
        });
        $(this).dequeue();
    });

}


function hideModalFade(confirm_yes) {
    $(".in_modal_fade").clearQueue();

    // если не прошли 3 стадии изменеия пароля (оставили поле ввода пустым)
    if (!confirm_yes) {
        setDefaultPassValues();
    }

    $(".in_modal_fade").queue(function () {
        $(this).css({
            'opacity': 0
        });
        $(this).dequeue();
    }).delay(400).queue(function () {
        $(this).hide();
        // параметры по умолчанию
        $(".in_modal_fade").attr('modal_type', 'oldPassword');
        $(this).dequeue();
    });
}

// Поведение модального окна в 3 стадиях ввода пароля
function okayAction() {
    var pass_input = $('.in_modal_body').find('#pass');
    if (pass_input.val()) {
        if ($('.in_modal_fade').attr('modal_type') === 'confirm_pass') {
            completeConfirmPass();
        }
        else if ($('.in_modal_fade').attr('modal_type') === 'newPassword') {
            completeNewPass();
        }
        else if ($('.in_modal_fade').attr('modal_type') === 'oldPassword') {
            completeOldPass(pass_input.val());
        }
    } else {
        hideModalFade();
        hideModalWindow();
    }
}

// Вид модального окна в 3 стадиях ввода пароля

// после подтверждения старого пароля
function completeOldPass(old_pass) {
    var data = JSON.stringify({old_password: old_pass});

    console.log(data);

    $.ajax({
        url: '/check_old_password',
        type: 'POST',
        contentType: 'json',
        data: data,
        success: function () {
            hideModalWindow(1.5, 0.5);
            $('.in_modal_fade').attr('modal_type', 'newPassword');
            $('.in_modal_body').delay(200).queue(function () {
                showModal();
                var $okay_btn = $('.in_modal_body').find('#okay');
                var $input_pass = $('.in_modal_body').find('#pass');
                $('.in_modal_title').text("Creating new password");
                $okay_btn.removeClass('btn-success');
                $okay_btn.addClass('btn-primary');
                $okay_btn.text("Next");
                $input_pass.attr('placeholder', "Input new password");

                $input_pass.unbind();
                $input_pass.change(function () {
                    newPassword = $(this).val();
                });

                $(this).dequeue();
            });
        },
        error: function () {
            showFrameMessage(notCorrectOldPassword.text, notCorrectOldPassword.color)
        }
    });
}

// после подтверждения нового пароля
function completeNewPass() {
    var re = /(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;

    if (newPassword.search(re) != -1){
        hideModalWindow(1.5, 0.5);
        $('.in_modal_fade').attr('modal_type', 'confirm_pass');
        $('.in_modal_body').delay(200).queue(function () {
            showModal();
            var $input_pass = $('.in_modal_body').find('#pass');
            $('.in_modal_body').find('#okay').css('background', 'black');
            $('.in_modal_body').find('#okay').text('Change');
            $('.in_modal_title').text("Confirm new password");
            $input_pass.attr('placeholder', "Repeat new password");

            $input_pass.unbind();
            $input_pass.change(function () {
                confirmedPassword = $(this).val();
            });

            $(this).dequeue();
        });
    } else {
        showFrameMessage(newPasswordDontPassValidation.text, newPasswordDontPassValidation.color);
    }
}

// после подтверждения повтора нового пароля
function completeConfirmPass() {
    if (newPassword == confirmedPassword){
        var data = JSON.stringify({new_password: newPassword});

        $.ajax({
            url: '/make_new_password',
            type: 'POST',
            contentType: 'json',
            data: data,
            success: function () {
                showFrameMessage(passwordChangedSuccesfuly.color, passwordChangedSuccesfuly.color);
                $('.pr_pass_btn').text(passwordChangedSuccesfuly.text);
                $('.pr_pass_btn').unbind();
                $('.pr_pass_btn').addClass('disabled');
                $('.pr_pass_btn').addClass('btn-success');
                hideModalWindow();
                hideModalFade(true);

                setTimeout(function () {
                    location.href = '/login';
                }, 1000);

            },
            error: function () {
                showFrameMessage(notCorrectOldPassword.text, notCorrectOldPassword.color);
            }
        });
    } else {
        showFrameMessage(newPasswordAndConfirmedNotEquel.text, newPasswordAndConfirmedNotEquel.color)
    }
}

function setDefaultPassValues() {
    newPassword = "";
    confirmedPassword = "";
    oldPassword = "";
}

function showFrameMessage(message, color) {
    /*
     *  Выводит переданное сообещение (message) внизу формы.
     */
    $('.in_stage_content').animate({'padding-bottom': '10px', 'color': color}, 200);
    $('.in_stage_content').text(message);
}