/**
 * Created by Alexey on 25.07.2017.
 */

$(document).ready(function () {
    modal_html = $(".in_modal_fade").html();
});

var pause_time = 100;

var old_pass = "";
var new_pass = "";
var re_new_pass = "";
// чтобы при закрытии и последующем открытии о окна были исходные стили
var modal_html = "";

function showModal(m_type) {
    // var modal_window = modal_fade.find('.in_modal_body');var modal_fade = $(".in_modal_fade[modal_type='" + m_type + "']")
    // получаем модальное окно определённого типа
    // при нажании на "изменить пароль" получаем окно типа old_pass
    var modal_fade = $(".in_modal_fade");
    modal_fade.html(modal_html);
    var modal_window = $(".in_modal_body");
    $(".in_modal_body").clearQueue();
    $(".in_modal_fade").clearQueue();
    modal_window.delay(pause_time).queue(function () {
        $(this).css({
            'transform': 'scale(1.4, 1.4)',
            'opacity': 1
        });
        modal_window.find('input[id=pass]').focus();
        modal_window.find('input[id=pass]').val("");
        modal_window.dequeue();
    });
    modal_fade.show().delay(pause_time).queue(function () {
        $(this).css({
            'opacity': 1
        });

        $('#okay').unbind();
        $('#okay').click(function () {
            okayAction();
        });

        var $input_pass = $('.in_modal_body').find('#pass');

        // для 1 ого модального окна сохраняем старый пароль
        if ($('.in_modal_fade').attr('modal_type') == 'old_pass') {
            $input_pass.change(function () {
                old_pass = $(this).val();
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
        $(".in_modal_fade").attr('modal_type', 'old_pass');
        $(this).dequeue();
    });
}

// Поведение модального окна в 3 стадиях ввода пароля
function okayAction() {
    var pass_input = $('.in_modal_body').find('#pass');
    if (pass_input.val() != "") {
        if ($('.in_modal_fade').attr('modal_type') == 'confirm_pass') {
            complete_submit_pass();
        }
        else if ($('.in_modal_fade').attr('modal_type') == 'new_pass') {
            complete_new_pass();
        }
        else if ($('.in_modal_fade').attr('modal_type') == 'old_pass') {
            complete_old_pass();
        }
    }
    else {
        hideModalFade();
        hideModalWindow();
    }
}

// Вид модального окна в 3 стадиях ввода пароля

// после подтверждения старого пароля
function complete_old_pass() {
    hideModalWindow(1.5, 0.5);
    $('.in_modal_fade').attr('modal_type', 'new_pass');
    $('.in_modal_body').delay(200).queue(function () {
        showModal();
        var $okay_btn = $('.in_modal_body').find('#okay');
        var $input_pass = $('.in_modal_body').find('#pass');
        $('.in_modal_title').text("Creating new password");
        $okay_btn.removeClass('btn-success');
        $okay_btn.addClass('btn-primary');
        $okay_btn.val("Next");
        $input_pass.attr('placeholder', "Input new password");

        $input_pass.unbind();
        $input_pass.change(function () {
            new_pass = $(this).val();
        });

        $(this).dequeue();
    });
}

// после подтверждения нового пароля
function complete_new_pass() {
    hideModalWindow(1.5, 0.5);
    $('.in_modal_fade').attr('modal_type', 'confirm_pass');
    $('.in_modal_body').delay(200).queue(function () {
        showModal();
        var $input_pass = $('.in_modal_body').find('#pass');
        $('.in_modal_body').find('#okay').css('background', 'black');
        $('.in_modal_body').find('#okay').val("Okay");
        $('.in_modal_title').text("Confirm new password");
        $input_pass.attr('placeholder', "Repeat new password");

        $input_pass.unbind();
        $input_pass.change(function () {
            re_new_pass = $(this).val();
        });

        $(this).dequeue();
    });
}

// после подтверждения повтора нового пароля
function complete_submit_pass() {
    // alert("Вы ввели: "  + old_pass + " " + new_pass + " " + re_new_pass);
    $('.pr_pass_btn').text("Сохраните изменения");
    $('.pr_pass_btn').unbind();
    $('.pr_pass_btn').addClass('disabled');
    $('.pr_pass_btn').addClass('btn-danger');
    hideModalWindow();
    hideModalFade(true);
}

function setDefaultPassValues() {
    new_pass = "";
    re_new_pass = "";
    old_pass = "";
}