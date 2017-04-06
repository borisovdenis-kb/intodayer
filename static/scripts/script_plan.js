/**
 * Created by Alexey on 12.03.2017.
 */

// .selected_str - поля помеченные этим классом, означают, что на них есть синее выделение
// .warning_str - поля помеченные этим классом, означают, что они не прошли валидацию
// .animation - поля помеченные этим классом, означают, что они анимируются в данный момент
var $SELECTED_STR;

$(document).ready(function () {
    setTimeout(function () {
        // deleteTopCheckboxInEmptyDays();
        setColorStr();
    }, 100);

    //вешаем обработчики на все поля
    $('.str_plan.change').each(function () {
        setNewListeners($(this));
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

function setNewListeners($new_div) {
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
        editField($(this));
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
            rightClickOnStr(event);
        }
    });
    //При нажатии на input не показывать стандартное контекстное меню
    $new_div.find('ul li input').contextmenu(function () {
        return false;
    });
    //При нажатии правой кнопкой над input появлялось контекстное меню
    $new_div.find('ul li input').bind('mousedown contexmenu', function (e) {
        if (e.which == 1) {
            editField($(this));
        }
        else {
            rightClickOnStr(e);
            return false;
        }
    });
    $new_div.find('ul li input').on('focusout', function () {
        setEditedField($(this));
    });

    $new_div.find('ul li input').on('input', function () {
        thisInput = $(this);
        timerInputId = setTimeout(function(){
            validateField(thisInput);
        }, 20);
    });

    $new_div.find('ul li input').keyup(function (e) {
        if (e.which == 13) {
            setNextField($(this), e);
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
}

// ###########################################################################################

//                       Обработчики событый (устанавливаемые однократно)

// ###########################################################################################

// устанавливаем обработчик при нажатии на плюс
$('.plus_button_form').click(function () {
    addPlanStr($(this));
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


function appendNewStrAnimation($new_div, $insert_after_this) {
    $new_div.insertAfter($insert_after_this);
    $new_div.slideToggle(200);
    $new_div.fadeTo(200, 1);
}

// добавление новой строки с расписанием
function addPlanStr($this_button) {

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
            appendNewStrAnimation($new_div, insert_after_this);
        }
        //если нет ни одной строчки в расписании, то вставляем после заголовка
        else {
            insert_after_this = $this_block.find('.str_title');
            appendNewStrAnimation($new_div, insert_after_this);
        }
    }, 200);

    setNewListeners($new_div);

    // делаем правильный цвет следующей строчки
    setTimeout(function () {
        setColorStr();
    }, 500);
    blur_select_str();
}

// устанавливает фокус на поле и его функционал для редактирования (при нажатии на него)
// поля a заменяются на input
var LAST_SELECTED_STR;



// var $selected_str;


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



// обрабатывает правый клик мыши по строке с расписанием
function rightClickOnStr(e) {
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









// добавляет новую строку в расписание
// пока все поля не будут заполнены, строчка не добавится в БД
function add_plan_str_ajax($selected_str) {
    // если выполняется, то все поля не пустые
    setTimeout(function () {
        if (validate_fields_has_changed($selected_str) && (validate_fields_not_empty($selected_str))) {
            // получаем данные всех полей из текущей строки
            // alert("SDf");
            var data = getFieldsInformation($selected_str);
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


// доделать функцию при нажатии на кнопку

