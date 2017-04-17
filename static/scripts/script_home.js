$(document).ready(function () {
    setStrColor('f');

    avatarEditAccess({plan_id: $('.ava_content p').text()});

    $('.plan_selector ul li a').click(function () {
        var data = {plan_id: $(this).siblings('p').text()};

        jQuery.each($('.plan_selector ul li a'), function () {
            $(this).css({'background-color': 'rgb(244, 243, 248)', 'color': '#000000'})
        });

        $(this).css({'background-color': '#000000', 'color': '#FFFFFF'});

        $('.right_content').load('/home/switch_plan', data, function () {
            setStrColor();
        });

        avatarEditAccess(data);
    });
});


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

function setStrColor() {
    /*
     *  Функция окрашивает нечетные строки таблицы в серый цвет
     */
    $.each($('.day_plan_content'), function () {
        $.each($(this).find('.str_plan'), function (i) {
            if ((i % 2) != 0) {
                $(this).clearQueue();
                $(this).animate({'background-color': 'rgba(240, 240, 245, 1)'});
                $(this).find('ul').clearQueue();
                $(this).find('ul').animate({'background-color': 'rgba(240, 240, 245, 1)'});
            }
        });
    });
}