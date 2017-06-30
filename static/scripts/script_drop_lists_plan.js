/**
 * Created by Denis on 15.04.2017.
 */

// TODO: Сделать фичу. При выборе предмета, должен предлагаться соответсвующий препод.

var $this;


function createDropLst($thisField) {
    $('.drop_list').remove();
    if (!$thisField.hasClass('weeks')) {
        $('body').append('<div class="drop_list"></div>');
        loadData($thisField);
    }
}

function loadData($thisField) {
    var $thisField = $thisField;
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
    }

    if (!$thisField.hasClass('parity')) {
        // вставляем даные из базы в div drop_list
        $('.drop_list').load('/get_drop_list', data, function () {
            var count_li = $('.drop_list').find('li').length;
            if (count_li == 0) {
                $('.drop_list').remove();
                return false;
            }
            $('.drop_list ul li a').on('mousedown touchstart', function (e) {
                // console.log($(this).text());
                $thisField.val($(this).text());

                if ($thisField.hasClass('drop_button')) {
                    $thisField.removeClass('drop_is');
                    $thisField.css({'background': 'rgba(255,255,255,0)'});
                }

                $('.drop_list').remove();
                e.preventDefault();
                return false;
            });

            $('.drop_list ul li a').css({
                'height': $bruceLi.height()
            });
            $drop_list.animate({
                'width': $thisField.outerWidth(),
                'top': posY,
                'left': $thisField.offset().left
            }, 1, function () {
                $(this).fadeTo(1, 1);
            });


        });
    }

    var $drop_list = $('.drop_list');
    var posY = $thisField.offset().top + $thisField.outerHeight() + 2;


}

// делает чтобы дроп лист двигался вместе с полем
// и соответственно изменял ширину
$(window).on('resize scroll', function () {
    var $active_elem = $(document.activeElement);
    var $this_field = $(document.activeElement);
    console.log($active_elem.get(0).tagName);
    if ($active_elem.get(0).tagName == "BODY") {
        $this_field = ($('.selected_field'));
        if ($this_field.length != 1) {
            $('.drop_list').remove();
            return false;
        }
    }

    var $droplist = $('.drop_list');
    var posY = $this_field.offset().top + $this_field.outerHeight() + 2;
    $droplist.css({
        'width': $this_field.outerWidth(),
        'top': posY,
        'left': $this_field.offset().left
    });
});
