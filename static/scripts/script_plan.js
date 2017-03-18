/**
 * Created by Alexey on 12.03.2017.
 */

$(document).ready(function () {
    setTimeout(function () {
        delete_empty_days();
        set_color_str();
    }, 100);


});


$('.plus_button_form').click(function () {
    add_plan_str($(this));
});

// удаляет пустные дни (дни в которых нет ничего ни разу за год)
function delete_empty_days() {
    var $days_content = $('.plan_content');
    $days_content.each(function () {
        var $str_plans = $(this).find('.str_plan ul');
        if ($str_plans.length == 1) {
            $(this).remove();
        }
    });
}

var $str_height = $('.str_plan li a').first().outerHeight() + 4;
function add_plan_str($this_button) {
    var $this_block = $($this_button).closest('.day_plan_content');
    var $new_div = $('<div class="str_plan change" style="opacity:0">' +
        '<ul>' +
        '<li><a></a></li>' +
        '<li><a></a></li>' +
        '<li><a></a></li>' +
        '<li><a></a></li>' +
        // не забыть поставить class=last, чтобы потом распознать
        '<li class="last"><a></a></li>' +
        '</ul>' +
        '</div>');


    var $plus_button = $this_block.find('.str_plus');
    $plus_button.fadeOut(0);
    $this_block.append($new_div);
    $new_div.fadeTo(300, 1);
    $new_div.slideDown(200);
    setTimeout(function () {
        $this_block.append($plus_button.slideDown(150));
    }, 150);


    // навешиваем обработчик на новую строку расписания (для наведения)
    // делаем правильный цвет следующей строчки
    setTimeout(function () {
        // var $elements = $new_div.find('ul li a');
        $new_div.find('ul li a').on('click', function () {
            edit_field($(this));
        });
        $new_div.mouseover(function () {
            set_current_str($(this));
        });
        $new_div.mouseout(function () {
            set_default_str($(this));
        });
        $new_div.on('mousedown', function (event) {
            if (event.button == 0 || event.button == 2 || event.button == 1) {
                select_str($(this));
            }
        });
        $('.str_plan.change').contextmenu(function (event) {
            if ((event.button == 2 || event.button == 1) && $(event.target).get(0).tagName.toUpperCase() != 'INPUT') {
                right_click_on_str(event);
            }
        });
        set_color_str();
    }, 100);
    blur_select_str();
}

//Редактирование расписания
$('.str_plan.change ul li a').bind('click', function () {
    edit_field($(this));
    selected_str = $(this).parent().parent().parent();
    set_current_str(selected_str);
});

// устанавливает фокус на поле и его функционал для редактирования (при нажатии на него)
// поля a заменяются на input
function edit_field($field) {
    $('.str_plan.change ul li a').unbind('click');
    var value = $field.html();
    var $ul_parent = $field.parent().parent();

    $ul_parent.css('height', $ul_parent.height());
    $field.replaceWith('<input class="this_edit" placeholder="Пусто">');
    var $input = $('.this_edit');
    $input.removeClass('this_edit');
    $input.attr("value", value);
    $input.focus();
    //поместить курсор в конец поля input
    var inputVal = $input.val();
    $input.val('').focus().val(inputVal);
    $input.on('focusout', function () {
        set_edited_field($(this));
    });
    $input.on('keypress', function (e) {
        set_next_field($(this), e);
    });
    $input.animate({scrollLeft: $input.width() * 2});
}

// устанавливает поле после редактирования (при снятии фокуса)
// поля input заменяются на a
function set_edited_field($input) {
    var old_value = $input.attr('value');
    var $ul_parent = $input.parent().parent();

    $ul_parent.css('height', 'auto');

    $input.replaceWith('<a class="this_edited"></a>');
    var $field = $('.this_edited');
    $field.removeClass('this_edited');
    if ($input.val() != '') {
        $field.text($input.val());
    }
    else {
        $field.text(old_value);
    }
    $('.str_plan.change ul li a').on('click', function () {
        edit_field($(this));
    });
}

// при нажатии на enter поле меняется на следующие в текущей строке
function set_next_field($this_field, e) {
    if (e.which != 13) {
        return;
    }
    else {
        if ($this_field.parent().hasClass('last')) {
            $this_field.blur();
        }
        else {
            var $next_elem = $this_field.parent().next().find('a');
            $this_field.blur();
            edit_field($next_elem);
        }

    }
}

// устанвалвает цвет для нечётных строк таблицы расписания
function set_color_str() {
    $('.plan_content').each(function () {
        $(this).find('.str_plan.change').each(function (i) {
            if (i % 2 == 0) {
                $(this).css({'background-color': 'rgba(240, 240, 245, 1)'})
            }
        });
    });

}

// отвечает за выделение строки при наведении
$('.str_plan.change').hover(function () {
    set_current_str($(this));
}, function () {
    set_default_str($(this));
});

// при нажатии на строку, она выделяется
$('.str_plan.change').on('mousedown', function (event) {
    if (event.button == 0 || event.button == 2 || event.button == 1) {
        select_str($(this));
    }
});

$(window).on('mousedown', function (event) {
    if (event.button == 0 || event.button == 2 || event.button == 1) {
        var tag_name = $(event.target).get(0).tagName.toUpperCase();
        if (tag_name != 'A' && tag_name != 'LI') {
            blur_select_str();
        }
    }
});

var selected_str;
// если нет выбранной строки, то выделяется её и запоминмает в selected_str
// если выбранная строка, отлична от текущей, то снимает выделение с selected_str
function select_str($this_str) {
    if (!$this_str.hasClass('selected_str')) {
        if (selected_str) {
            selected_str.removeClass('selected_str');
            set_default_str(selected_str);
        }
        $this_str.addClass('selected_str');
        selected_str = $this_str;
    }
}

//снимает выделение со всех выделенных строк
function blur_select_str() {
    var $selected_strs = $('.selected_str');
    if ($selected_strs.length > 0) {
        $selected_strs.each(function () {
            $(this).removeClass('selected_str');
            set_default_str($(this));
        });
    }
    selected_str = NaN;
}
// проверить ещё после нажатия на plus!!!!!!!!!!!!!!!!!!!!!!!!!!!


//устанавливает выделение для строки, если не установлено
function set_current_str($this_str) {
    if ($this_str.hasClass('selected_str')) {
        return false;
    }
    $this_str.css({'border': '2px solid rgba(3, 96, 255, 0.3)'});
}

//снимает выделение со строки, если  установлено
function set_default_str($this_str) {
    if ($this_str.hasClass('selected_str')) {
        return false;
    }
    $this_str.css({'border': '2px solid rgba(3, 96, 255, 0.0)'});
}


//выпадающий список фукционала для строки. открывается при нажатии на правую кнопку мыши на строке
$('.str_plan.change').contextmenu(function (event) {
    //если нажата правая клавиша
    // alert($(event.target).get(0).tagName);
    if ((event.button == 2 || event.button == 1) && $(event.target).get(0).tagName.toUpperCase() != 'INPUT') {
        right_click_on_str(event);
    }
});

// обрабатывает правый клик мыши по строке с расписанием
function right_click_on_str(e) {
    e.preventDefault();
    $('.drop_menu').remove();
    $('body').append('<div class="drop_menu" style="display:none">' +
        '<ul>' +
        '<li>Копировать содержимое</li>' +
        '<li>Дублировать</li>' +
        '<li>Удалить </li>' +
        '</ul>' +
        '</div>');
    var $elem = $('.drop_menu').last();
    setTimeout(function () {
        $elem.css({'position': 'absolute', 'top': e.pageY + 5, 'left': e.pageX + 1}).fadeIn(100);
    }, 10);
}

$(window).on('resize', function () {
    $('.drop_menu').fadeOut(100);
});

$(window).on('mousedown', function (event) {
    var $target = $(event.target);
    if (event.button == 0 || event.button == 1) {
        if (!$target.hasClass('str_plan.change') && !$target.is('.drop_menu li')) {
            $('.drop_menu').remove();
        }
    }
});