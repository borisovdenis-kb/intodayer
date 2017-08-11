$(document).ready(function () {
    setListenersLeftContent();
});

function setListenersLeftContent() {
    $('.plan_list li a').unbind();
    $('.plan_list li a').click(function () {
        switchPlan($(this));
    });
    $('.create_plan li a').unbind();
    $('.create_plan li a').click(function () {
        createPlan($(this).parents('li'));
    });
}

function avatarEditAccess(data) {
    /*
     *  data - словарь (возможные ключ: plan_id)
     */
    $.getJSON('/get_avatar', data, function (msg) {
        $('.ava_content').css({'background-image': 'url(' + msg.plan_avatar_url + ')'});
        if (msg.isOwner == true) {
            $('.ava_cover').css({'display': 'block'});
        } else {
            $('.ava_cover').css({'display': 'none'});
        }
    });
}