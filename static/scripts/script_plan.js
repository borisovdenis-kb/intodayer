/**
 * Created by Alexey on 12.03.2017.
 */

$(document).ready(function () {
    setTimeout(function () {
        // delete_empty_days();
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

var NEW_STR_PLAN_HTML = '' +
    '<div class="str_fade">' +
    '<div class="str_plan change" style="opacity: 0; display:none;">' +
    '<ul>' +
    '<li><input placeholder="Недели" class="weeks"></li>' +
    '<li><input placeholder="Время" class="time"></li>' +
    '<li><input placeholder="Предмет" class="subject"></li>' +
    '<li><input placeholder="Преподователь" class="teacher"></li>' +
    // не забыть поставить class=last, чтобы потом распознать
    '<li class="last"><input placeholder="Аудитория" class="place"></li>' +
    '</ul>' +
    '</div>' +
    '</div>';

function append_new_str_animation($new_div, $insert_after_this) {
    $new_div.insertAfter($insert_after_this);
    $new_div.slideToggle(200);
    $new_div.fadeTo(200, 1);
}

function add_plan_str($this_button) {

    var $this_block = $($this_button).closest('.day_plan_content');

    // когда плюс исчезает, высота окна не меняется и не дёргается
    // var $this_window = $this_block.parent();
    // var $window_height = $this_window.height();
    // $this_window.css({'min-height': $window_height})
    var $new_div = $(NEW_STR_PLAN_HTML).find('.str_plan.change');
    var $plus_button = $this_block.find('.str_plus');

    // сам плюс погасает
    $plus_button.fadeTo(1, 0);
    // сначала блок погасшего плюса немного подтягивается вверх панель дня
    $plus_button.animate({'margin-top': '0px'}, 100, function () {
        // затем погасает
        // затем опять разворачивает панель
        $plus_button.animate({'margin-top': '10px'}, 100);
    });
    setTimeout(function () {
        // и потом плюс появляется визуально
        $plus_button.fadeTo(200, 1);
    }, 150);
    setTimeout(function () {
        var insert_after_this = $this_block.find('.str_plan.change').last();
        if (insert_after_this.hasClass('change')) {
            append_new_str_animation($new_div, insert_after_this);
        }
        //если нет ни одной строчки в расписании, то вставляем после заголовка
        else {
            insert_after_this = $this_block.find('.str_title');
            append_new_str_animation($new_div, insert_after_this);
        }
    }, 200);

    set_new_listeners($new_div);

    // делаем правильный цвет следующей строчки
    setTimeout(function () {
        set_color_str();
    }, 500);
    blur_select_str();
}


function set_new_listeners($new_div) {
    // ###########################################################################################

    //               Обработчики событый для новой добавленной строки расписания

    // ###########################################################################################
    $new_div.find('ul li a').on('click', function () {
        edit_field($(this));
    });
    // отвечает за выделение строки при наведении
    $new_div.hover(function () {
        set_current_str($(this));
    }, function () {
        set_default_str($(this));
    });

    // $new_div.mouseover(function () {
    //     set_current_str($(this));
    // });
    // $new_div.mouseout(function () {
    //     set_default_str($(this));
    // });
    // при нажатии на строку, она выделяется
    $new_div.find('ul li input').on('mousedown', function (event) {
        if (event.button == 0 || event.button == 2 || event.button == 1) {
            select_str($(this).parent().parent().parent());
        }
    });
    $new_div.on('mousedown', function (event) {
        if (event.button == 0 || event.button == 2 || event.button == 1) {
            select_str($(this));
        }
    });
    $new_div.contextmenu(function (event) {
        if ((event.button == 2 || event.button == 1) && $(event.target).get(0).tagName.toUpperCase() != 'INPUT') {
            right_click_on_str(event);
        }
    });

    $new_div.find('ul li input').contextmenu(function () {
        return false;
    });
    $new_div.find('ul li input').bind('mousedown contexmenu', function (e) {
        if (e.which == 1) {
            edit_field($(this));
        }
        else {
            right_click_on_str(e);
            return false;
        }
    });

}

// ###########################################################################################

//                                  Обработчики событый

// ###########################################################################################

//Редактирование расписания
$('.str_plan.change ul li a').bind('click', function () {
    edit_field($(this));
});

//Если мы нажимает на строку прямо над input, то мы нажимаем на сам input,поэтому событие ставим на него
$('.str_plan.change ul li input').contextmenu(function (event) {
    if ((event.button == 2 || event.button == 1) && $(event.target).get(0).tagName.toUpperCase() != 'INPUT') {
        right_click_on_str(event);
    }
});

//При нажатии на input не показывать стандартное контекстное меню
$('.str_plan.change ul li input').find('ul li input').contextmenu(function () {
    return false;
});

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

// если мы нажимаем не на строки расписания и не на поля ввода, то снимаем выделение с активных
// здесь же мы мы обновляем данные в БД
$(window).on('mousedown', function (event) {
    if (event.button == 0 || event.button == 2 || event.button == 1) {
        var tag_name = $(event.target).get(0).tagName.toUpperCase();
        if (tag_name != 'A' && tag_name != 'LI' && tag_name != 'INPUT') {
            blur_select_str();
        }
    }
});


//выпадающий список фукционала для строки. открывается при нажатии на правую кнопку мыши на строке
$('.str_plan.change').contextmenu(function (event) {
    //если нажата правая клавиша
    // alert($(event.target).get(0).tagName);
    if ((event.button == 2 || event.button == 1) && $(event.target).get(0).tagName.toUpperCase() != 'INPUT') {
        right_click_on_str(event);
    }
});

// при изменении размеров окна скрывать контекстное меню
$(window).on('resize', function () {
    $('.drop_menu').fadeOut(100);
});

// если мышь нажата не на самом контекстном меню, то скрываем его
$(window).on('mousedown', function (event) {
    var $target = $(event.target);
    // последнее условие здесь отвечает за клик по скроллбару
    if ((event.button == 0 || event.button == 1 || event.button == 2) && !(event.target === $('html')[0] && event.clientX >= document.documentElement.offsetWidth)) {
        if (!$target.hasClass('str_plan.change') && !$target.is('.drop_menu li')) {
            $('.drop_menu').remove();
        }
    }
});


// ###########################################################################################

//                                          Функции

// ###########################################################################################


// устанавливает фокус на поле и его функционал для редактирования (при нажатии на него)
// поля a заменяются на input
function edit_field($field) {
    var value = $field.html();
    var $ul_parent = $field.parent().parent();

    $ul_parent.css('height', $ul_parent.height());

    var $input;
    var $temp_field = $field;

    if ($field.get(0).tagName != 'INPUT') {
        $field.replaceWith('<input class="this_edit">');
        $input = $('.this_edit');
        $input.removeClass('this_edit');
        $input.addClass($temp_field.attr('class'));
        $input.attr('placeholder', set_true_placeholder($temp_field));
    }
    else {
        $input = $field;
    }

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
    $input.unbind('contextmenu mousedown');
}

// устанавливает поле после редактирования (при снятии фокуса)
// поля input заменяются на a
function set_edited_field($input) {
    // var old_value = $input.attr('value');
    var $ul_parent = $input.parent().parent();

    $ul_parent.css('height', 'auto');
    var temp_input = $input;

    if ($input.val() != '') {
        $input.replaceWith('<a class="this_edited"></a>');
        var $field = $('.this_edited');
        $field.removeClass('this_edited');
        $field.addClass(temp_input.attr('class'));
    }

    if ($input.val() != '') {
        $field.text($input.val());
    }

    $('.str_plan.change ul li a').on('click', function () {
        edit_field($(this));
    });

    set_new_listeners($input.parent().parent().parent());
}

// при нажатии на enter поле меняется на следующие в текущей строке
// если следующее поле это <a> или <input> то меняем
function set_next_field($this_field, e) {
    var $next_elem;
    if (e.which != 13) {
        return;
    }
    else {
        $next_elem = $this_field.parent().next('li');
        if ($next_elem.get(0) == undefined) {
            $this_field.blur();
            return;
        }
        else {
            $this_field.blur();
            if ($next_elem.find('a').get(0) != undefined) {
                edit_field($next_elem.find('a'));
                return;
            }
            if ($next_elem.find('input').get(0) != undefined) {
                edit_field($next_elem.find('input'));
                return;
            }

        }
    }
}


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

//устанавливает выделение для строки, если не установлено
function set_current_str($this_str) {
    if ($this_str.hasClass('selected_str') || $this_str.hasClass('animation')) {
        return false;
    }
    $this_str.css({'border': '2px solid rgba(3, 96, 255, 0.3)'});
}

//снимает выделение со строки, если  установлено
function set_default_str($this_str) {
    if ($this_str.hasClass('selected_str') || $this_str.hasClass('animation')) {
        return false;
    }
    $this_str.css({'border': '2px solid rgba(3, 96, 255, 0.0)'});
}


// обрабатывает правый клик мыши по строке с расписанием
function right_click_on_str(e) {
    // $(e.target).css('background', "black");

    e.preventDefault();
    $('.drop_menu').remove();
    if ($('.selected_str').length > 0) {
        $('body').append('<div class="drop_menu" style="display:none">' +
            '<ul>' +
            '<li class="copy_str">Копировать содержимое</li>' +
            '<li class="clone_str">Дублировать</li>' +
            '<li class="delete_str">Удалить </li>' +
            '</ul>' +
            '</div>');

        if ($('.selected_str').find('ul li a').length == 0) {
            $('.clone_str').remove();
            $('.copy_str').remove();
            $('.delete_str').html('Удалить строку');
        }

        var $elem = $('.drop_menu').last();
        setTimeout(function () {
            $elem.css({'position': 'absolute', 'top': e.pageY + 5, 'left': e.pageX + 1}).fadeIn(100);
        }, 10);

        // вешаем обработчики для нового div блока
        $('.delete_str').on('click', function () {
            delete_str($('.selected_str').first());
        });
        $('.clone_str').on('click', function () {
            clone_str($('.selected_str').first());
        });
    }
}


function delete_str($this_str) {
    blur_select_str();
    $('.drop_menu').remove();
    var delete_id_planRow = $this_str.attr('id');
    var data = {'delete_id_planRow': delete_id_planRow};
    // alert(delete_id_planRow);

    $.ajax({
        url: '/plan/update_delete',
        success: function (response) {
            // alert(response);
            callback_delete($this_str);
        },
        method: 'POST',
        data: data,
        error: function (jqXHR, textStatus, errorThrown) {
            alert(textStatus + " " + errorThrown);
        }
    });


}

function callback_delete($this_str) {
    $this_str.css({'border': '2px solid #FF6161'});
    $this_str.fadeTo(200, 0, function () {
        $this_str.slideUp(200, function () {
            $this_str.remove();
        });
    });
    setTimeout(function () {
        set_color_str();
    }, 500);

}

// дублируем строку
// работает с AJAX
function clone_str($this_str) {
    blur_select_str();
    $('.drop_menu').remove();

    var weeks, start_week, end_week, parity, time, subject, teacher, place, day_of_week;

    parity = 1; // временно
    day_of_week = 1; //временно
    weeks = $this_str.find('.weeks').text();
    start_week = weeks.split('-')[0];
    end_week = weeks.split('-')[1];
    time = $this_str.find('.time').text();
    subject = $this_str.find('.subject').text();
    teacher = $this_str.find('.teacher').text();
    place = $this_str.find('.place').text();
    var data = {
        'weeks': weeks, 'start_week': start_week, 'end_week': end_week, 'time': time,
        'subject': subject, 'teacher': teacher, 'place': place, 'parity': parity, 'day_of_week': day_of_week
    };
    $.ajax({
        url: '/plan/update_clone',
        success: function (response) {
            // alert(response);
            callback_clone(data, $this_str);
        },
        method: 'POST',
        data: data,
        error: function (jqXHR, textStatus, errorThrown) {
            alert(textStatus + " " + errorThrown);
        }
    });
}

// визуально дублируем строку, если получен ответ от сервера
function callback_clone(data, $this_str) {
    var $new_div = $(NEW_STR_PLAN_HTML).find('.str_plan.change');
    $this_str.css({'border': '2px solid rgba(139, 29, 235, 0.6)'});
    $this_str.addClass('animation');
    $new_div.css({'border': '2px solid rgba(103, 198, 97, 0.9)'});
    $new_div.addClass('animation');
    // чтобы анимация работала правильно для любой высоты блока
    $new_div.css('height',  $this_str.height());
    setTimeout(function () {
        $this_str.animate({'border-color': 'rgba(103, 198, 97, 0.0)'}, function () {
            $new_div.css('height', 'auto');
            $this_str.removeClass('animation');
        });
        $new_div.animate({'border-color': 'rgba(139, 29, 235, 0.0)'}, function () {
            $new_div.removeClass('animation');
        });
    }, 1000);

    //чтобы вставка строки работала именно для самого внешнего класса строки
    var insert_after_this;
    if (!$this_str.hasClass('fade')){
        insert_after_this = $this_str.parent();
    }
    else{
        insert_after_this = $this_str;
    }

    alert($this_str.attr('class'));
    append_new_str_animation($new_div, insert_after_this);
    $new_div.find('.weeks').attr('value', data['weeks']);
    $new_div.find('.time').attr('value', data['time']);
    $new_div.find('.subject').attr('value', data['subject']);
    $new_div.find('.teacher').attr('value', data['teacher']);
    $new_div.find('.place').attr('value', data['place']);

    // преобразовываем поля input в a для всех новых полей
    var $new_inputs = $new_div.find('ul li input');
    $new_inputs.each(function () {
        set_edited_field($(this));
    });
    // вешаем обработчики на все новые поля
    set_new_listeners($new_div);

    // модернизируем цвет строк
    setTimeout(function () {
        set_color_str();
    }, 500);
}

// добавляет новую строку в расписание
function add_new_plan_row() {

}

// устанвалвает цвет для нечётных строк таблицы расписания
function set_color_str() {
    $('.plan_content').each(function () {
        $(this).find('.str_plan.change').each(function (i) {
            if (i % 2 == 0) {
                $(this).animate({'background-color': 'rgba(240, 240, 245, 1)'})
            }
            else {
                $(this).animate({'background-color': 'rgba(255, 255, 255, 1)'}, 50)
            }
        });
    });
}

// устанавливает правильный placeholder
function set_true_placeholder($this_field) {
    if ($this_field.hasClass('weeks'))
        return 'Недели';
    if ($this_field.hasClass('time'))
        return 'Время';
    if ($this_field.hasClass('subject'))
        return 'Предмет';
    if ($this_field.hasClass('teacher'))
        return 'Преподаватель';
    if ($this_field.hasClass('place'))
        return 'Аудитория';
    return "Пусто";
}

// доделать функцию при нажатии на кнопку