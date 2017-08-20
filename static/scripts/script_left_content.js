$(document).ready(function () {
    setListenersLeftContent();
    setAvaModalListeners();

    // setAvatarFrameListeners();
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

function setAvaModalListeners() {
    $('.ava_cover_text p').click(function () {
        modal_ava.showModal();
    })
}
