/**
 * Created by Denis on 15.04.2017.
 */


function addDropLstListeners($thisStr){
    $thisStr.find('ul li input').click(function () {

    });
}

function createDropLst($thisField) {
    $('.drop_list').remove();

    $('body').append('<div class="drop_list"></div>');

    var $drop_list = $('.drop_list');
    var posY = $thisField.offset().top + $thisField.outerHeight();

    setTimeout(function () {
        $drop_list.css({
            'width': $thisField.outerWidth() - 3,
            // 'height': $thisField.outerHeight(),
            'top': posY,
            'left': $thisField.offset().left
        });
    }, 10);

    loadData($thisField);
}

function loadData($thisField) {
    var data = {plan_id: $('.title_content').attr('plan_id')};

    if ($thisField.hasClass('weeks')) {
        // $('.drop_list').load('/get_list_weeks', data);

    } else if ($thisField.hasClass('time')) {
        data.model = 'time';

        $('.drop_list').load('/get_drop_list', data, function () {

            $('.drop_list ul li a').click(function () {
                $($thisField).val($(this).text());
                $($thisField).remove();
            });
        });
    } else if ($thisField.hasClass('subject')) {
        data.model = 'subject';

        $('.drop_list').load('/get_drop_list', data, function () {

            $('.drop_list ul li a').click(function () {
                $($thisField).val($(this).text());
                $($thisField).remove();
            });
        });
    } else if ($thisField.hasClass('teacher')) {
        data.model = 'teacher';

        $('.drop_list').load('/get_drop_list', data, function () {

            $('.drop_list ul li a').click(function () {
                $($thisField).val($(this).text());
                $($thisField).remove();
            });
        });
    } else if ($thisField.hasClass('place')) {
        data.model = 'place';

        $('.drop_list').load('/get_drop_list', data, function () {

            $('.drop_list ul li a').click(function () {
                $($thisField).val($(this).text());
                $($thisField).remove();
            });
        });
    } else if ($thisField.hasClass('parity')) {
        // Здесь без ajax запроса. Т.к. четность у нас статичная
        $('.drop_list').append(
            '<ul>' +
            '<li><a>Все</a></li>' +
            '<li><a>Чет</a></li>' +
            '<li><a>Нечет</a></li>' +
            '</ul>'
        );
    }
}
