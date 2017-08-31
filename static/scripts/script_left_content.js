$(document).ready(function () {
    setListenersLeftContent();
    setAvaModalListeners();

    // setAvatarFrameListeners();
});

function setListenersLeftContent() {
    $('.plan_list li a').unbind();
    $('.plan_list li a').click(function () {
        switchPlan($(this), false);
    });
    $('.create_plan li a').unbind();
    $('.create_plan li a').click(function () {
        createPlan($(this).parents('li'));
    });
}

function setAvaModalListeners() {
    setTimeout(() => {
        $('.upload_ava').click(function () {
            modal_ava.showModal();
        });
    }, 200);

}

function pushAvaModalClickBlock() {
    $('.left_content').append($('<div class="ava_cover"><div class="ava_cover_text"><p class="upload_ava">Загрузить фото</p></div></div>'))
}
function deleteAvaModalClickBlock() {
    if ($('.ava_cover').length > 0) {
        $('.ava_cover').remove();
    }
}