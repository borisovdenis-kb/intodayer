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
    $('#upload_ava').click(function () {
        modal_ava.showModal();
    })
}
