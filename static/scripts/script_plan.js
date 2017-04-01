/**
 * Created by Alexey on 12.03.2017.
 */

// .selected_str - поля помеченные этим классом, означают, что на них есть синее выделение
// .warning_str - поля помеченные этим классом, означают, что они не прошли валидацию
// .animation - поля помеченные этим классом, означают, что они анимируются в данный момент
var $SELECTED_STR;

$(document).ready(function () {
    setTimeout(function () {
        // delete_empty_days();
        set_color_str();
    }, 100);

    //вешаем обработчики на все поля
    $('.str_plan.change').each(function () {
        set_new_listeners($(this));
    })


});

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

var timer_id;
var thisInput;
var timerInputId;

function set_new_listeners($new_div) {
    // ###########################################################################################

    //               Обработчики событый, применяемые к каждой строке расписания

    // ###########################################################################################

    // сбрасываем все обработчики (так как постоянно их заново ставим)
    $new_div.off();
    $new_div.find('ul li a').off();
    $new_div.find('ul li input').off();
    //!!! позже лучше сделать, чтобы обработчики не отключались, если уже стоят

    //редактировать поле при нажатии на него
    $new_div.find('ul li a').on('click', function () {
        edit_field($(this));
    });
    // отвечает за выделение строки при наведении
    $new_div.hover(function () {
        set_current_str($(this));
    }, function () {
        set_default_str($(this));
    });

    // при нажатии на строку, она выделяется
    $new_div.find('ul li input').on('mousedown', function (event) {
        if (event.button == 0 || event.button == 2 || event.button == 1) {
            select_str($(this).parent().parent().parent());
        }
    });
    // при нажатии на строку, она выделяется
    $new_div.on('mousedown', function (event) {
        if (event.button == 0 || event.button == 2 || event.button == 1) {
            select_str($(this));
        }
    });
    //Если мы нажимает на строку прямо над input, то мы нажимаем на сам input,поэтому событие ставим на него
    $new_div.contextmenu(function (event) {
        if ((event.button == 2 || event.button == 1) && $(event.target).get(0).tagName.toUpperCase() != 'INPUT') {
            right_click_on_str(event);
        }
    });
    //При нажатии на input не показывать стандартное контекстное меню
    $new_div.find('ul li input').contextmenu(function () {
        return false;
    });
    //При нажатии правой кнопкой над input появлялось контекстное меню
    $new_div.find('ul li input').bind('mousedown contexmenu', function (e) {
        if (e.which == 1) {
            edit_field($(this));
        }
        else {
            right_click_on_str(e);
            return false;
        }
    });
    $new_div.find('ul li input').on('focusout', function () {
        set_edited_field($(this));
    });

    // var interavlId;
    //
    // $new_div.find('ul li input').on('focus', function(e) {
    //     interavlId = setInterval(validateField($(this), e), 20);
    // });
    //
    // $new_div.find('ul li input').on('blur', function() {
    //     clearInterval(interavlId);
    // });
    $new_div.find('ul li input').on('input', function () {
        thisInput = $(this);
        timerInputId = setTimeout(function(){
            validateField(thisInput);
        }, 20);
    });

    $new_div.find('ul li input').keyup(function (e) {
        if (e.which == 13) {
            set_next_field($(this), e);
        }
        else {
            var $this_str = $(this).parent().parent().parent();
            clearTimeout(timer_id);
            timer_id = setTimeout(function () {
                if ($this_str.hasClass('warning_str')) {
                    // alert("Sfd");
                    check_field_exist($this_str);
                }
            }, 300)

        }
    });
    // При наборе текста делает простую валидацию на пустоту
    // $new_div.find('ul li input').on('keyup', function (event) {
    //     var $this_str = $(this).parent().parent().parent();
    //     if ($this_str.hasClass('warning_str')){
    //         check_field_exist($this_str);
    //     }
    //
    //     // alert($(this).val());
    //
    // });


}


// ###########################################################################################

//                       Обработчики событый (устанавливаемые однократно)

// ###########################################################################################

// устанавливаем обработчик при нажатии на плюс
$('.plus_button_form').click(function () {
    add_plan_str($(this));
});

// если мы нажимаем не на строки расписания и не на поля ввода, то снимаем выделение с активных
// здесь же мы мы обновляем данные в БД
$(window).on('mousedown', function (event) {
    if (event.button == 0 || event.button == 2 || event.button == 1) {
        var tag_name = $(event.target).get(0).tagName.toUpperCase();
        if (tag_name != 'A' && tag_name != 'LI' && tag_name != 'INPUT') {
            blur_select_str();
        }
        // при расфокусировке поля нужно проверить его для отправки на сервер
        // $('.selected_str').each(function () {
        //     check_field_exist($(this));
        // })
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


function append_new_str_animation($new_div, $insert_after_this) {
    $new_div.insertAfter($insert_after_this);
    $new_div.slideToggle(200);
    $new_div.fadeTo(200, 1);
}

// добавление новой строки с расписанием
function add_plan_str($this_button) {

    var $this_block = $($this_button).closest('.day_plan_content');
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

// устанавливает фокус на поле и его функционал для редактирования (при нажатии на него)
// поля a заменяются на input
var LAST_SELECTED_STR;
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
        $input.addClass('selected_field');
        $input.attr('placeholder', set_true_placeholder($temp_field));
    }
    else {
        $input = $field;
    }

    $input.attr("value", value);
    $input.attr("old_value", value);
    $input.focus();
    //поместить курсор в конец поля input
    var inputVal = $input.val();
    $input.val('').focus().val(inputVal);

    $input.animate({scrollLeft: $input.width() * 2});

    set_new_listeners($input.parent().parent().parent());

    $input.unbind('contextmenu mousedown');
}

// устанавливает поле после редактирования (при снятии фокуса)
// поля input заменяются на a
function set_edited_field($input) {
    var $ul_parent = $input.parent().parent();
    var $last_selected_str = $ul_parent.parent();

    $ul_parent.css('height', 'auto');
    var temp_input = $input;

    if ($input.val() != '') {
        var old_value = $input.attr('old_value');
        $input.replaceWith('<a class="this_edited"></a>');
        var $field = $('.this_edited');
        $field.removeClass('this_edited');
        $field.removeClass('selected_field');
        $field.addClass(temp_input.attr('class'));
        $field.attr('old_value', old_value);

    }

    // проверяем, что мы не меняли значения
    // чтобы при расфокусировке дать понять, что нужно отправить новые данные на сервер
    if ($input.val() != $input.attr('old_value')) {
        $last_selected_str.addClass('has_changed');
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

// var $selected_str;
// если нет выбранной строки, то выделяется её и запоминмает в selected_str
// если выбранная строка, отлична от текущей, то снимает выделение с selected_str
function select_str($this_str) {
    if (!$this_str.hasClass('selected_str')) {
        if ($SELECTED_STR) {
            $SELECTED_STR.removeClass('selected_str');
            check_field_exist($SELECTED_STR);

            set_default_str($SELECTED_STR);
        }
        $this_str.addClass('selected_str');

        $SELECTED_STR = $this_str;
    }
}

//снимает выделение со всех выделенных строк
function blur_select_str() {
    var $selected_str = $('.selected_str');
    if ($selected_str.length > 0) {
        $selected_str.each(function () {
            // check_field_exist($(this));
            $(this).removeClass('selected_str');
            set_default_str($(this));
        });
    }
    check_field_exist($selected_str);
    // add_plan_str_ajax($selected_str);
    $selected_str = NaN;
}

//устанавливает выделение для строки, если не установлено
function set_current_str($this_str) {
    if ($this_str.hasClass('selected_str') || $this_str.hasClass('animation') || $this_str.hasClass('warning_str')) {
        return false;
    }
    $this_str.css({'border': '2px solid rgba(3, 96, 255, 0.3)'});
}

//снимает выделение со строки, если  установлено
function set_default_str($this_str) {
    if ($this_str.hasClass('selected_str') || $this_str.hasClass('animation') || $this_str.hasClass('warning_str')) {
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
    add_plan_str_ajax($SELECTED_STR);
    check_field_exist($SELECTED_STR);
}

// удаляет строку с расписанием
// работает с ajax
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
            alert('Ошибка! Запись не будет удалена! (');
            // alert(textStatus + " " + errorThrown);
        }
    });


}

// выполнение стилей и эффектов после успешного удаления строки с сервера
function callback_delete($this_str) {
    $this_str.clearQueue();
    $this_str.css({'border': '2px solid #FF6161'});
    $this_str.fadeTo(200, 0, function () {
        $this_str.slideToggle(300, function () {
            $this_str.remove();
        });
    });
    // setTimeout(function () {
    //     set_color_str();
    // }, 500);

}

// дублируем строку
// работает с AJAX
function clone_str($this_str) {
    blur_select_str();
    $('.drop_menu').remove();
    var data = get_fields_information($this_str);
    if (validate_fields_not_empty($this_str)) {
        // получаем данные всех полей из текущей строки

        $.ajax({
            url: '/plan/update_clone',
            success: function (response) {
                alert(response);
                callback_clone(data, $this_str);
            },
            method: 'POST',
            data: data,
            error: function (jqXHR, textStatus, errorThrown) {
                alert('Ошибка! Продублированная запись не будет сохранена! (');
                // alert(textStatus + " " + errorThrown);
            }
        });
    }
    else {
        callback_clone(data, $this_str);
    }
}

// визуально дублируем строку, если получен ответ от сервера
function callback_clone(data, $this_str) {
    var $new_div = $(NEW_STR_PLAN_HTML).find('.str_plan.change');
    $this_str.css({'border': '2px solid rgba(139, 29, 235, 0.6)'});
    $this_str.addClass('animation');
    $new_div.css({'border': '2px solid rgba(103, 198, 97, 0.9)'});
    $new_div.addClass('animation');

    // чтобы анимация работала правильно для любой высоты блока
    $new_div.css('height', $this_str.height());
    $this_str.stop(true, true);
    $new_div.stop(true, true);

    setTimeout(function () {
        if (!$new_div.hasClass('warning_str')) {
            $this_str.animate({'border-color': 'rgba(103, 198, 97, 0.0)'}, function () {
                $new_div.css('height', 'auto');
            });
            $new_div.animate({'border-color': 'rgba(139, 29, 235, 0.0)'}, function () {
                $new_div.removeClass('animation');
                $this_str.removeClass('animation');
            });
        }
        else {
            $this_str.removeClass('animation');
            $new_div.removeClass('animation');
        }
    }, 1000);

    append_new_str_animation($new_div, $this_str);
    $new_div.find('.weeks').attr('value', data['weeks']);
    $new_div.find('.time').attr('value', data['time']);
    $new_div.find('.subject').attr('value', data['subject']);
    $new_div.find('.teacher').attr('value', data['teacher']);
    $new_div.find('.place').attr('value', data['place']);

    $new_div.attr('id', 0);

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

    check_field_exist($new_div);

}


function get_fields_information($this_str) {
    var weeks, start_week, end_week, parity, time, subject, teacher, place, day_of_week, id;

    if ($this_str.attr('id') != undefined) {
        id = $this_str.attr('id');
    }
    else {
        id = 0;
    }

    parity = 1; // временно
    day_of_week = 1; //временно
    weeks = $this_str.find('.weeks').text();
    start_week = weeks.split('-')[0];
    end_week = weeks.split('-')[1];
    time = $this_str.find('.time').text();
    subject = $this_str.find('.subject').text();
    teacher = $this_str.find('.teacher').text();
    place = $this_str.find('.place').text();

    return {
        'weeks': weeks, 'start_week': start_week, 'end_week': end_week, 'time': time,
        'subject': subject, 'teacher': teacher, 'place': place, 'parity': parity, 'day_of_week': day_of_week, 'id': id
    };

}


// устанвалвает цвет для нечётных строк таблицы расписания
function set_color_str() {
    $('.plan_content').each(function () {
        $(this).find('.str_plan.change').each(function (i) {
            if (i % 2 == 0) {
                $(this).animate({'background-color': 'rgba(240, 240, 245, 1)'})
            }
            else {
                $(this).animate({'background-color': 'rgba(255, 255, 255, 1)'}, 150)

            }
        });
    });
}


// добавляет новую строку в расписание
// пока все поля не будут заполнены, строчка не добавится в БД
function add_plan_str_ajax($selected_str) {
    // если выполняется, то все поля не пустые
    setTimeout(function () {
        if (validate_fields_has_changed($selected_str) && (validate_fields_not_empty($selected_str))) {
            // получаем данные всех полей из текущей строки
            // alert("SDf");
            var data = get_fields_information($selected_str);
            data['mode'] = 'add';
            $.ajax({
                url: '/plan/add_plan_row',
                success: function (response) {
                    alert(response);
                    // complete_add_plan_row(data, $this_str);
                },
                method: 'POST',
                data: data,
                error: function (jqXHR, textStatus, errorThrown) {
                    alert('Ошибка! Новая запись не будет сохранена! (');
                    // alert(textStatus + " " + errorThrown);
                }
            });
        }
    }, 200);
}

// простая проверка, что поля строки не пустые
function validate_fields_not_empty($selected_str) {
    var count = 0;
    // считаем в скольки полях есть текст
    // при снятии фокуса с input он может также присутствовать и не успеть измениться на <a>
    $selected_str.find('ul li a').each(function () {
        if ($(this).text() != '') {
            count += 1;
        }
    });

    $selected_str.find('ul li input').each(function () {
        if ($(this).val() != '') {
            count += 1;
        }
    });
    if (count == 5 || count == 0) {
        return true;
    }
    else {
        return false;
    }
}


function validate_fields_has_changed($selected_str) {
    // считаем в скольки полях есть текст
    // при снятии фокуса с input он может также присутствовать и не успеть измениться на <a>
    if ($selected_str.hasClass('has_changed')) {
        return true;
    }
    else {
        return false;
    }
}


//валидацию не делает, но проверяет, чтобы все поля были заполнены
//рассчитана на срабатывание, когда выделение всей строки расфокусировано
function check_field_exist($last_selected_srt) {
    add_plan_str_ajax($last_selected_srt);
    if (!validate_fields_not_empty($last_selected_srt)) {
        if (!$last_selected_srt.hasClass('warning_str')) {
            $last_selected_srt.addClass('warning_str');
        }
        // $last_selected_srt.animate({'border-color': '#D72828'});
        $last_selected_srt.animate({'border-color': '#FF8F8F'});

    }
    else {
        if ($last_selected_srt.hasClass('warning_str')) {
            $last_selected_srt.removeClass('warning_str');
            $last_selected_srt.animate({'border-color': '2px solid rgba(3, 96, 255, 0.3)'}, function () {
                // select_str($last_selected_srt);
            });
            // set_default_str($last_selected_srt, true);
        }
    }
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

function delExtraSymbols(field, n) {
    /*
     *  Функция укорачивает содержимое поля input
     *  то длины n
     */
    while (field.val().length > n){
        field.val(field.val().slice(0, -1));
    }
}

function validateField(field) {
    /*
     *  Функция в зависимости от предназначения поля
     *  будет осуществлять валидацию каждого введенного символа
     */
    var timePatt1 = /^(([0,1])|(2))$/;
    var timePatt2 = /^(([0,1][0-9])|(2[0-3]))$/;
    var timePatt3 = /^(([0,1][0-9])|(2[0-3])):$/;
    var timePatt4 = /^(([0,1][0-9])|(2[0-3])):[0-5]$/;
    var timePatt5 = /^(([0,1][0-9])|(2[0-3])):[0-5][0-9]$/;
    var weekPatt1 = /^([1-9])$/;
    var weekPatt2 = /^([1-9]-)|([1-4][0-9])|([5][0-6])$/;
    var weekPatt3 = /^([1-9]-[1-9])|([1-4][0-9]-)|([5][0-6]-)$/;
    var weekPatt4 = /^([1-9]-[1-4][0-9])|([1-4][0-9]-[1-9])|([5][0-6]-[1-9])|([1-9]-[5][0-6])$/;
    var weekPatt5 = /^([1-4][0-9]-[1-4][0-9])|([5][0-6]-[1-4][0-9])|([1-4][0-9]-[5][0-6])|([5][0-6]-[5][0-6])$/;
    var subjectPatt = /^[a-zA-Zа-яА-Я0-9 -]*$/;
    var content = field.val();
    var length = content.length;

    if (field.hasClass('time')) {
        if (length == 1) {
            if (content.search(timePatt1) == -1) {
                delExtraSymbols(field, 0);
            }
        } else if (length == 2) {
            if (content.search(timePatt2) == -1) {
                delExtraSymbols(field, 1);
            }
        } else if (length == 3) {
            if (content.search(timePatt3) == -1) {
                delExtraSymbols(field, 2);
            }
        } else if (length == 4) {
            if (content.search(timePatt4) == -1) {
                delExtraSymbols(field, 3);
            }
        } else if (length == 5) {
            if (content.search(timePatt5) == -1) {
                delExtraSymbols(field, 4);
            }
        } else if (length > 5) {
            delExtraSymbols(field, 5);
        }
    }
    if (field.hasClass('weeks')) {
        if (length == 1) {
            if (content.search(weekPatt1) == -1) {
                delExtraSymbols(field, 0);
            }
        } else if (length == 2) {
            if (content.search(weekPatt2) == -1) {
                delExtraSymbols(field, 1);
            }
        } else if (length == 3) {
            if (content.search(weekPatt3) == -1) {
                delExtraSymbols(field, 2);
            }
        } else if (length == 4) {
            if (content.search(weekPatt4) == -1) {
                delExtraSymbols(field, 3);
            }
        } else if (length == 5) {
            if (content.search(weekPatt5) == -1) {
                delExtraSymbols(field, 4);
            }
        } else if (length > 5) {
            delExtraSymbols(field, 5);
        }
    }
    if (field.hasClass('subject')){
        if (content.search(subjectPatt) == -1) {
            delExtraSymbols(field, length-1);
        }
    }
}