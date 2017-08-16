/**
 * Created by Alexey on 16.08.2017.
 */

$(document).ready(function () {
    $('.part_settings').unbind();
    $('.part_settings').click(function () {
        if ($('.setting_msg').length > 0) {
            deactivateInvite();
        }
        else {
            activeInvite();
        }
    });


    $('.part_admin').click(function () {
        var $part_rights = $(this).parents('.part_rights');
        if ($part_rights.attr('role') === 'elder' || $part_rights.attr('role') === 'admin') {
            return false;
        }
        let click_elem = $(this);
        setRoleServer(click_elem, 'admin');

    });
    $('.part_participant').click(function () {
        let $part_rights = $(this).parents('.part_rights');
        if ($part_rights.attr('role') === 'participant') {
            return false;
        }
        setRoleServer($(this), 'participant');
    });
    $('.part_remove').click(function () {
        $('#modal_ok_cancel').modal();
        $('.modal_ok').click(function () {
            removePlan();
        });
        removeRoleServer($(this));
    })
});

function setRoleServer($click_elem, role_str) {
    var data = {
        new_role: role_str,
        plan_id: $('.title_content').attr('plan_id'),
        participant_id: $('.part_block').attr('part_id')
    };

    $.ajax({
        url: '/change_role',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: function () {
            $click_elem.parents('.part_rights').attr('role', role_str);
            changeRoleAnimate($click_elem);
        }
    });
}

function removeRoleServer($click_elem) {
    var $part_block = $click_elem.parents('.part_block');
    if ($part_block.attr('part_id') && $('.title_content').attr('plan_id')) {
        var data = {
            plan_id: $('.title_content').attr('plan_id'),
            participant_id: $('.part_block').attr('part_id')
        };
        $.ajax({
            url: '/delete_participant',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function () {
                deleteUserAnimate($part_block);
            }
        });
    }
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


function activeInvite() {
    // Данная функция активирует все стили и обработчки событий и также подгружает правый контент настроек plan

    // Вставка верхнего информативного табло
    $('.setting_info_block').append($('<div class="setting_msg alert-success" style="display: none">Invite new people in your plan</div>'));
    $('.setting_msg').delay(200).slideDown(250);

    $('.part_content').hide();

    // Вставка всей панели настроек
    $('.setting_invite').load('/plan/invite_setting_plan', {}, function () {
        $('.btn-back ').unbind();
        $('.btn-back ').click(deactivateInvite);
    });
}


function deactivateInvite() {

    // удаление контента настроек
    $('.setting_msg').remove();
    $('.setting_invite').empty();
    var plan_id = $('.title_content').attr('plan_id');
    $('.part_content').show();
    // var data = {plan_id: plan_id};
}

