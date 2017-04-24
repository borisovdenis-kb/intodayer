/**
 * Created by Denis on 15.04.2017.
 */

// TODO: Сделать фичу. При выборе предмета, должен предлагаться соответсвующий препод.

var $this;

function addDropLstListeners($thisStr) {
    $thisStr.find('ul li input').click(function () {
        createDropLst($(this));
    });
}

function createDropLst($thisField) {
    $('.drop_list').remove();
    if (!$thisField.hasClass('weeks')) {

        $('body').append('<div class="drop_list"></div>');

        var $drop_list = $('.drop_list');
        var posY = $thisField.offset().top + $thisField.outerHeight() + 2;

        $drop_list.find('ul li a').click(function () {
            console.log('popa');
            $($thisField).val($(this).text());
            // $('.drop_list').delay(200).remove();
        });

        setTimeout(function () {
            $drop_list.animate({
                'width': $thisField.outerWidth() - 3,
                // 'height': $thisField.outerHeight(),
                'top': posY,
                'left': $thisField.offset().left
            }, 1, function () {
                $(this).css({'display': 'block'});
            });
        }, 10);

        loadData($thisField);
    }
}

function loadData($thisField) {
    /*
     *  Функция подгружает с сервера уже отрендеренный выподающий список
     *  и вставляет его под тем инпутом, на который кликнули.
     */
    var $bruceLi = $thisField.parent();


    var data = {plan_id: $('.title_content').attr('plan_id')};

    if ($thisField.hasClass('time')) {
        data.model = 'time';

    } else if ($thisField.hasClass('subject')) {
        data.model = 'subject';

    } else if ($thisField.hasClass('teacher')) {
        data.model = 'teacher';

    } else if ($thisField.hasClass('place')) {
        data.model = 'place';

    } else if ($thisField.hasClass('parity')) {
        // Здесь без ajax запроса. Т.к. четность у нас статичная
        $('.drop_list').append(
            '<ul>' +
            '<li><a>Все</a></li>' +
            '<li><a>Чет</a></li>' +
            '<li><a>Нечет</a></li>' +
            '</ul>'
        );
        $('.drop_list ul li a').click(function () {
            if ($bruceLi.find('a').length != 0) {
                $bruceLi.find('a').text($(this).text());

            } else if ($bruceLi.find('input') != 0) {
                console.log('popa');
                $bruceLi.find('input').val($(this).text());
            }

            $('.drop_list').remove();
        });
    }

    if (!$thisField.hasClass('parity')) {
        // вставляем даные из базы в div drop_list
        $('.drop_list').load('/get_drop_list', data, function () {
            if ($('.drop_list').height() >= 150) {
                // добавляем скролл только, когда размер 300
                // потому что когда он висит постоянно - это уродство...
                $('.drop_list').css('overflowY', 'scroll');
            }
            setTimeout(function () {
                // $('.drop_list ul li a').css('background', 'green');
                $('.drop_list ul li a').click(function () {
                    // alert("Sdfsdaf");

                    if ($bruceLi.find('a').length != 0) {
                        $bruceLi.find('a').text($(this).text());

                    } else if ($bruceLi.find('input') != 0) {
                        console.log('popa');
                        $bruceLi.find('input').val($(this).text());
                    }

                    $('.drop_list').remove();
                });
            }, 100);
        });
    }

}
