/**
 * Created by Alexey on 16.08.2017.
 */

var invite_input_block;

var modal_confirm_admin;
var modal_delete_participant;


$(document).ready(function () {
    setAdminParticipantsActions();
});


function setAdminParticipantsActions() {
    setBindsParticipant();
    modal_confirm_admin = new ModalConfirmRole('#confirm_admin');
    modal_delete_participant = new ModalDeleteParticipant('#delete_participant');
}


function setBindsParticipant() {
    $('.part_rights').each(function () {
        if ($(this).find('.part_role').length === 2) {
            $(this).find('.part_role').css('cursor', 'pointer');

            let $admin_icon = $(this).find('.part_admin');
            $admin_icon.unbind();
            $admin_icon.click(function () {
                let $part_rights = $(this).parents('.part_rights');
                if ($part_rights.attr('role') === 'elder' || $part_rights.attr('role') === 'admin') {
                    return false;
                }
                let $click_elem = $(this);
                modal_confirm_admin.showModal($click_elem, 'admin');
            });

            let $participant_icon = $(this).find('.part_participant');
            $participant_icon.unbind();
            $participant_icon.click(function () {
                let $part_rights = $(this).parents('.part_rights');
                if ($part_rights.attr('role') === 'participant') {
                    return false;
                }
                let $click_elem = $(this);
                setRoleServer($click_elem, 'participant').then(function () {
                });
            });
        }

        let $part_remove = $(this).find('.part_remove');
        if ($part_remove.length === 1) {
            $part_remove.unbind();
            $part_remove.click(function () {
                let $click_elem = $(this);
                let $part_rights = $click_elem.parents('.part_rights');
                if ($part_rights.attr('role') === 'participant' || $part_rights.attr('role') === 'admin') {
                    modal_delete_participant.showModal($click_elem);
                }
            });
        }
    });
    $('.part_settings').unbind();
    $('.part_settings').click(function () {
        if ($('.setting_msg').length > 0) {
            deactivateInvite();
        }
        else {
            activeInvite();
        }
    });
}


function activeInvite() {
    // Данная функция активирует все стили и обработчки событий и также подгружает правый контент настроек plan

    // Вставка верхнего информативного табло
    $('.part_settings').text("К участникам");
    // $('.part_settings').removeClass('btn-success');
    // $('.part_settings').activeClass('btn-primary');

    $('.setting_info_block').append($('<div class="setting_msg alert-success" style="display: none">Invite new people in your plan</div>'));
    $('.setting_msg').delay(200).slideDown(250);

    $('.part_content').hide();

    // Вставка всей панели настроек

    $('.setting_invite').load('/plan/invite_setting_plan', {}, function () {
        if (!invite_input_block) {
            invite_input_block = $('.invite_input_block').html();
        }

        $('.btn-back ').unbind();
        $('.btn-back ').click(deactivateInvite);

        newInputInviteBinds($('.invite_input'));

    });
}

function newInputInviteBinds($input_field) {
    $input_field.unbind();
    $input_field.on('input', function () {
        inputInviteActions($(this).val());
        toggleInviteButtonWorking();
    });
    $input_field.on('change', function () {
        hideInviteInput($(this));

    });
}


function hideInviteInput($input_field) {
    // let input_outer_block = $(this).parents('.input_outer');
    let empty_input = false;
    $('.invite_input').each(function () {
            // проверяем, что если останется 2 пустых поля, то удаляем одно
            if ((!$(this).val() || $(this).val().length === 0) && !empty_input) {
                empty_input = true;
                return true;
            }
            if (!$(this).val() && empty_input) {
                let $this_input_block = $input_field.parents('.input_outer');
                $this_input_block.fadeTo(200, 1, function () {
                    $this_input_block.slideUp(200, function () {
                        $this_input_block.remove();
                    });
                });
            }
        }
    )
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


function inputInviteActions(email) {
    if (validateEmail(email)) {
        showNewInputInvite();
    }
}

function showNewInputInvite() {
    let empty_input = false;
    // проверяем, что нет пустых полей input
    if ($('.invite_input').length >= 8) {
        return false;
    }
    $('.invite_input').each(function () {
        if (!$(this).val()) {
            empty_input = true;
            return true;
        }
    });
    if (!empty_input) {
        let $invite_input_block = $('.invite_input_block');
        $invite_input_block.append(invite_input_block);

        let $last_input = $invite_input_block.find('.invite_input').last();
        $last_input.hide();
        $last_input.css('opacity', 0);
        $last_input.slideDown(200);
        $last_input.fadeTo(200, 1);
        newInputInviteBinds($last_input);
    }

}


// отключает кнопку submit , если нечего отправлять
function toggleInviteButtonWorking() {
    var $btn_invite = $('#invite_btn');
    var validate_fields = false;

    $('.invite_input').each(function () {
        if (validateEmail($(this).val())) {
            if ($btn_invite.hasClass('disabled')) {
                $btn_invite.removeClass('disabled');
                $('#invite_btn').click(sendEmailsToServer);
            }
            validate_fields = true;
            return true;
        }
    });

    if (!$btn_invite.hasClass('disabled')) {
        if (!validate_fields) {
            $('#invite_btn').unbind();
            $btn_invite.addClass('disabled');
        }
    }

}

function sendEmailsToServer() {
    let email_list = [];
    $('.invite_input').each(function () {
        if (validateEmail($(this).val())) {
            email_list.push($(this).val());
        }
    });
    let data = {
        plan_id: $('.title_content').attr('plan_id'),
        email_list: email_list
    };
    // alert(data.email_list);
    $.ajax({
        url: '/invite_participants',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: function () {
            success_frame_animate();
            $('.part_settings').trigger('click');
        },
        error: function () {
            alert("Ошибка. Не удалось выполнить операцию.");
        }
    });
}




function removeParticipantServer($click_elem) {
    return new Promise(function (resolve, reject) {
        let $part_block = $click_elem.parents('.part_block');
        if ($part_block.attr('part_id') && $('.title_content').attr('plan_id')) {
            let data = {
                plan_id: $('.title_content').attr('plan_id'),
                participant_id: $click_elem.parents('.part_block').attr('part_id')
            };
            $.ajax({
                url: '/delete_participant',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(data),
                success: function () {
                    deleteUserAnimate($part_block);
                    return resolve();
                },
                error: function () {
                    alert("Ошибка. Не удалось выполнить операцию. Обновите страницу");
                    return reject();
                }
            });
        }
        else {
            return reject();
        }
    });
}

// устанавливает role_str на выбранном пользователе $click_elem
function setRoleServer($click_elem, role_str) {
    return new Promise(function (resolve, reject) {

        let self = this;

        let data = {
            new_role: role_str,
            plan_id: $('.title_content').attr('plan_id'),
            participant_id: $click_elem.parents('.part_block').attr('part_id')
        };

        $.ajax({
            url: '/change_role',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function () {
                $click_elem.parents('.part_rights').attr('role', role_str);
                changeRoleAnimate($click_elem);
                return resolve();
            },
            error: function () {
                alert("Ошибка. Не удалось выполнить операцию. Обновите страницу");
                return reject();
            }
        });
    });
}

function deleteUserAnimate($part_block) {
    $part_block.fadeTo(100, 0, function () {
        $(this).slideUp(200);
    });
}

function changeRoleAnimate($this_elem) {
    $this_elem.parents('ul').find('.part_admin').css('opacity', 0.3);
    $this_elem.parents('ul').find('.part_participant').css('opacity', 0.3);
    $this_elem.css('opacity', 1);
}



