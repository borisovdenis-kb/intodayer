$(document).ready(function () {

    setListenersLeftContent();


});


function loadLeftContent() {
    /*
     Функция загружает левый контент
     */
    $('.left_content').load('/left_content', {}, function () {
        setListenersLeftContent();
    });
    // при загрузке левого конетнта, правый должен быть именно такого размера
    $('.right_content').css({
        'width': 'calc(100% - 188px)'
    });
    avatarEditAccess({plan_id: +$('.ava_content p').text()});
}

function setListenersLeftContent() {
    // для страницы empty
    $(".select_plan").click(function () {
        // :TODO тут нужно сделать чтобы просто поменялось current_plan и потом перебрасывало на plan.html
        switchPlan($(this));
    });

    $('.plan_list li a').click(function () {
        switchPlan($(this));
    });
    $('.create_plan li a').click(function () {
        createPlan($(this).parents('li'));
    });
}

function avatarEditAccess(data) {
    /*
     *  data - словарь (возможные ключ: plan_id)
     */
    $.getJSON('/get_avatar', data, function (msg) {
        $('.ava_content').css({'background-image': 'url(' + msg.url + ')'});
        if (msg.isOwner == true) {
            $('.ava_cover').css({'display': 'block'});
        } else {
            $('.ava_cover').css({'display': 'none'});
        }
    });
}