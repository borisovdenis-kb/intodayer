/**
 * Created by Alexey on 02.04.2017.
 */
// .selected_str - поля помеченные этим классом, означают, что на них есть синее выделение
// .warning_str - поля помеченные этим классом, означают, что они не прошли валидацию
// .animation - поля помеченные этим классом, означают, что они анимируются в данный момент

// важная переменная, определяющая последнюю выбранную строку
var $LAST_SELECTED_STR;

function startBaseFunctions() {
    // delete_empty_days();
    setColorStr();
}

$(document).ready(function () {
    startBaseFunctions();
    setTimeout(function () {
        startBaseFunctions();
    }, 200);
    //вешаем обработчики на все поля
    $('.str_plan.str_title').each(function () {
        setGeneralCheckBoxListeners($(this));
    });
    $('.str_plan.change').each(function () {
        setNewListenersSpecial($(this));
        setNewListenersNewStr($(this));

    })
});

// переписать через Load
var NEW_STR_PLAN_HTML = '' +
    '<div class="str_fade">' +
    '<div class="str_plan change" style="opacity: 0; display:none;">' +
    '<div class="checkbox_wrap">' +
    '<div class="checkbox_container row"></div>' +
    '</div>' +
    '<ul>' +
    '<li><input placeholder="Недели" class="weeks"></li>' +
    '<li><input placeholder="Время" class="time"></li>' +
    '<li><input placeholder="Предмет" class="subject"></li>' +
    '<li><input placeholder="Преподователь" class="teacher"></li>' +
    // не забыть поставить class=last, чтобы потом распознать
    '<li><input placeholder="Место" class="place"></li>' +
    '<li class="last"><a class="parity">Все</a></li>' +
    '</ul>' +
    '</div>' +
    '</div>';

var thisInput;
var timerInputId;

// устанавливаем обработчик при нажатии на плюс
$('.plus_button_form').click(function () {
    addPlanStr($(this));
});

// если мы нажимаем не на строки расписания и не на поля ввода, то снимаем выделение с активных
$(window).on('mousedown', function (event) {
    if (event.button == 0 || event.button == 2 || event.button == 1) {
        var tag_name = $(event.target).get(0).tagName.toUpperCase();
        if (tag_name != 'A' && tag_name != 'LI' && tag_name != 'INPUT') {
            blurSelectStr();
        }
    }
});

// обработчик для верхнего чекбокса, в заголовке каждого дня
function setGeneralCheckBoxListeners($this_str) {
    var this_checkbox = $this_str.find('.general_checkbox');
    this_checkbox.attr('flag_active', 'false');
    this_checkbox.on('click', function () {
        // if (!FLAG_DELETE && !FLAG_CLONE) {
        actionGeneralCheckBox($(this));
        // }
    });
}


// удаляет поле галочки в заголовке для пустых дней
function delete_empty_days() {
    var $days_content = $('.plan_content');
    $days_content.each(function () {
        var $str_plans = $(this).find('.str_plan ul');
        if ($str_plans.length == 1) {
            $(this).find('.checkbox_wrap').fadeTo(0, 0);
        }
    });
}

// урезанная версия фукнции для установки только событий редактирования
// (используется, когда мы отключаем обработчики редактирования, используя чекбоксы)
function setNewListenersEdit($new_div) {
    var $new_a = $new_div.find('ul li a');
    $new_a.on('click', function () {
        editField($(this));
    });
}


function setNewListenersSpecial($new_div) {
    var $checkbox = $new_div.find('.checkbox_wrap');
    $checkbox.on('click', function () {
        var $this_plan_content = $(this).parents('.plan_window');
        setCheckBox($(this));
        setTools($this_plan_content);
        setTopCheckBox($this_plan_content);
    });
}

// устанавливает автоматом верхний чекбокс, если все остальные установлены
function setTopCheckBox($this_plan_content) {
    var $general_checkbox = $this_plan_content.find('.general_checkbox');
    if ($general_checkbox.attr('flag_active') == 'false') {
        var $checkboxes_active = $this_plan_content.find('.checkbox_container.row');
        var $checkboxes_inactive = $this_plan_content.find('.checkbox_container.marked.row');
        $general_checkbox = $this_plan_content.find('.general_checkbox').find('.checkbox_container');
        if ($checkboxes_active.length != $checkboxes_inactive.length) {
            $general_checkbox.removeClass('marked');
            $general_checkbox.animate({'background-color': 'rgba(0,0,0,0)'}, 50);
        }
        else if ($checkboxes_active.length == $checkboxes_inactive.length) {
            $general_checkbox.addClass('marked');
            $general_checkbox.animate({'background-color': 'rgba(0,0,0,1)'}, 100);
        }
    }
}

// обаботчики, которые устанавливаются единожды, при добавлении новой строки
// нужно для того, чтобы, к примеру, не глючили чекбоксы
function setNewListenersNewStr($new_div) {
    // Обработчики событый, применяемые к каждой строке расписания
    var $new_inputs = $new_div.find('ul li input');
    var $new_a = $new_div.find('ul li a');


    // сбрасываем все обработчики (так как постоянно их заново ставим)
    $new_div.off();
    $new_a.off();
    $new_inputs.off();
    //!!! позже лучше сделать, чтобы обработчики не отключались, если уже стоят

    //редактировать поле при нажатии на него
    $new_a.on('click', function () {
        editField($(this));
    });

    //при нажатии на другое поле снять выделение с текущей строки
    //если другое поле находится в этой же строке, то не снимаем выделение
    $new_div.click(function () {
        if ($LAST_SELECTED_STR && !$LAST_SELECTED_STR.is($(this)) && $LAST_SELECTED_STR.hasClass('selected_str')) {
            setDefaultStr($LAST_SELECTED_STR);
        }
        $LAST_SELECTED_STR = $(this);
    });

    $new_inputs.on('focus', function () {
        $(this).parent().parent().parent().addClass('selected_str');
    });

    $new_inputs.on('focusout', function () {
        $(this).removeClass('focus');
        setEditedField($(this));
    });

    // отвечает за выделение строки при наведении
    $new_div.hover(function () {
        hoverSelectStr($(this));
    }, function () {
        hoverDefaultStr($(this));
    });

    $new_inputs.on('input', function () {
        thisInput = $(this);
        timerInputId = setInterval(function () {
            validateField(thisInput);
        }, 50);
        setTimeout(function () {
            clearInterval(timerInputId);
        }, 500);
    });

    // при нажатии на enter меняет поле на следующее
    // $new_inputs.on('keyup', function (e) {
    //     if (e.which == 13) {
    //
    //     }
    // });
}

// устанавливаем появление и скрытие панели инструментов
function setTools($this_plan) {
    var $buttons = $this_plan.find('.tools_panel button').slice(0, 2);
    var res_status = statusCheckboxes($this_plan);
    if (res_status == 1) {
        $this_plan.find('.info_checkboxes').attr('tools_flag', 'true');
        $buttons.each(function () {
            setButtonToolsProperties($(this));
        });
    }
    else if (res_status == 0) {
        $this_plan.find('.info_checkboxes').attr('tools_flag', 'false');
        $buttons.each(function () {
            setDefaultButtonToolsProperties($(this));
        });
    }
}

// устанавливает стили кнопок при появлении
// устанавливает обработчики событий для кнопок
var time_animate = 100;
function setButtonToolsProperties($button) {
    $button.off();
    $button.animate({
        'color': 'rgba(255,255,255,1)',
        'border-color': 'rgba(0,0,0,0.0)',
        'background-color': 'rgba(64,199,129,1)',
    }, time_animate);

    $button.hover(function () {
        $button.stop(true, true);
        $(this).animate({
            'background-color': 'rgba(33,147,90,1)',
            'box-shadow': 'none'
        }, time_animate);
    }, function () {
        $button.stop(true, true);
        $(this).css({'background-color': 'rgb(64,199,129)'})
    }, time_animate / 2);

    $button.mousedown(function () {
        $(this).css({
            'color': 'rgba(255,255,255,0.8)',
            'background-color': 'rgba(33,147,90,0.8)'
        });
    });
    $button.mouseup(function () {
        $(this).css({
            'color': 'rgba(255,255,255,1)',
            'background-color': 'rgba(33,147,90,1)'
        });
    });

    $button.click(function () {
        getAjaxActions($(this));
        var $buttons = $(this).parent().parent().find('button');
        $buttons.each(function () {
            setDefaultButtonToolsProperties($(this));
        });

    })
}

// устанавливает стили кнопок при скрытие
// удаляет все обработчки событий с кнопок
function setDefaultButtonToolsProperties($button) {
    $button.stop(true, true);
    $button.off();
    $button.animate({
        'color': 'rgba(0, 0, 0, 0.2)',
        'border-color': 'rgba(0,0,0,0.1)',
        'background-color': 'white',
        'box-shadow': 'none'
    }, time_animate);
}

// div блок с классом .info_checkboxes содержит информацию
// о количестве включённых чекбоксов в каждом дне
// 3 разных if нужно чтобы не вешать обработчики лишний раз, если меню уже появилось
function statusCheckboxes($this_plan) {
    var $info_checkboxes = $this_plan.find('.info_checkboxes');
    var enabled_checkbox = $this_plan.find('.checkbox_container.marked.row').length;
    if (enabled_checkbox > 0 && $info_checkboxes.attr('tools_flag') == 'false') {
        return 1;
    }
    else if (enabled_checkbox > 0 && $info_checkboxes.attr('tools_flag') == 'true') {
        return 2;
    }
    else if (enabled_checkbox == 0) {
        return 0;
    }
}

// работа чекбокса, который в заголовке (отвечает за все чекбоксы)
function actionGeneralCheckBox($general_checkbox) {
    $general_checkbox.attr('flag_active', 'true');

    $general_checkbox.off();
    var $this_checkbox = $general_checkbox.find('.checkbox_container');
    var $this_plan_content = $general_checkbox.parents('.plan_window');
    var $this_str = $general_checkbox.parents('.str_plan');
    var $checkboxes = $this_plan_content.find('.checkbox_container').slice(1);
    var count_checkboxes = $checkboxes.length;

    if (!$this_checkbox.hasClass('marked')) {
        $checkboxes.each(function (i) {
            var $this_checkbox = $(this);
            if (!$this_checkbox.hasClass('marked')) {
                $this_checkbox.removeClass('marked');
                if (count_checkboxes <= 50) {
                    setTimeout(function () {
                        $this_checkbox.trigger('click');
                    }, i * 5)
                }
                else {
                    $this_checkbox.trigger('click');
                }
            }
        });

    }
    else {
        $checkboxes.each(function (i) {
            var $this_checkbox = $(this);
            // if ($this_checkbox.hasClass('marked')) {
            var $this_str = $(this).parents('.str_plan');
            $(this).addClass('marked');
            if (count_checkboxes <= 50) {
                setTimeout(function () {
                    $this_checkbox.trigger('click');
                    // как только переключили все чек боксы, сбрасываем все строки
                    hoverDefaultStr($this_str);
                }, i * 5)
            }
            else {
                $this_checkbox.trigger('click');
                hoverDefaultStr($this_str);
            }
        });
    }
    // устанавливаем заголовчный чекбокс вконце всех действий
    blurSelectStr();
    setTimeout(function () {
        blurSelectStr();
    }, 300);
    setCheckBox($general_checkbox);
    setTimeout(function () {
        setGeneralCheckBoxListeners($this_str);
    }, count_checkboxes * 10);
}


// устанавливаем чек боксы
function setCheckBox($checkbox_wrap, mode) {
    var $this_str = $checkbox_wrap.parent('.str_plan');
    $this_str.removeClass('selected_str');
    var $this_ul = $this_str.find('ul');
    var $this_checkbox = $checkbox_wrap.find('.checkbox_container');
    var $this_plan_content = $this_str.parents('.plan_window');
    var $info_checkboxes = $this_plan_content.find('.info_checkboxes');

    $this_str.stop(true, true);
    $this_ul.stop(true, true);
    $this_checkbox.stop(true, true);

    //если чекбокс выключён, то
    if (!$this_checkbox.hasClass('marked')) {
        //если чекбокс не относится к заголовку
        if (!$this_str.hasClass('str_title')) {
            $info_checkboxes.attr('count', +$info_checkboxes.attr('count') + 1);
            $this_str.find('a').unbind('click');
            blockInputs($this_str);
            $this_str.addClass('marked');
            $this_ul.animate({
                'border-color': 'rgba(139, 29, 235, 0.5)',
                'background-color': 'rgb(237, 218, 255)'
            }, 100);
        }
        $this_checkbox.addClass('marked');
        $this_checkbox.animate({'background-color': 'rgba(0,0,0,1)'}, 100);
    }
    //если чекбокс включён, то
    else {
        // если чекбокс не относится к заголовку
        if (!$this_str.hasClass('str_title')) {
            $info_checkboxes.attr('count', +$info_checkboxes.attr('count') - 1);
            setNewListenersEdit($this_str);
            unblockInputs($this_str);
            $this_str.removeClass('marked');
            hoverSelectStr($this_str);
            setColorStr($this_str);
        }
        $this_checkbox.removeClass('marked');
        $this_checkbox.animate({'background-color': 'rgba(0,0,0,0)'}, 50);
    }
}

function setBlurCheckbox($this_str, mode) {
    $this_str.find('.checkbox_container').each(function () {
        if ($(this).hasClass('marked')) {
            $(this).trigger('click');
            setDefaultStr($this_str, mode);
        }
    });

}

function editField($field) {
    var $str_plan = $field.parent().parent().parent();
    a_to_input($field);
    setSelectStr($str_plan);
    setNewListenersNewStr($str_plan);
}

// устанавливает поле после редактирования (при снятии фокуса)
// поля input заменяются на a
function setEditedField($field) {
    var $str_plan = $field.parent().parent().parent();
    input_to_a($field);
    setNewListenersNewStr($str_plan);
}

//устанавливает выделение для строки, если не установлено
function hoverSelectStr($this_str) {
    if ($this_str.hasClass('marked') || $this_str.hasClass('animation')) {
        return false;
    }
    if ($this_str.hasClass('clone_str')) {
        $this_str.find('ul').css({'border': '2px solid rgba(3, 96, 255, 0.3)'});
        return;
    }
    if ($this_str.hasClass('warning_str')) {
        $this_str.find('ul').css({'border': '2px solid #F37C7C'});
        return;
    }
    $this_str.find('ul').css({'border': '2px solid rgba(3, 96, 255, 0.3)'});
}
//снимает выделение со строки, если  установлено
function hoverDefaultStr($this_str) {
    if ($this_str.hasClass('marked') || $this_str.hasClass('selected_str') || $this_str.hasClass('animation')) {
        return false;
    }
    if ($this_str.hasClass('warning_str')) {
        $this_str.find('ul').css({
            'border-color': 'rgba(103, 198, 97, 0.9)'
        });
    }
    $this_str.find('ul').css({'border': '2px solid rgba(3, 96, 255, 0.0)'});

}

// устанавливает выделение текущей строки
function setSelectStr($str_plan) {
    $str_plan.addClass('selected_str');
    hoverSelectStr($str_plan);
    setOldValues($str_plan);
}


function setDefaultStr($str_plan, mode) {
    //при расфокусировке отправляем инфу в БД
    $str_plan.removeClass('selected_str');
    hoverDefaultStr($str_plan);

    setTimeout(function () {
        if (mode == 'clone' || mode == 'delete') {
            return false;
        }
        //***************************************************************************************
        // Одна из важнейших строчек во всём коде
        // именно тут данные отправляются на сервер для обновления или создания строки расписания
        // 1. Если строка изменена при расфокусировки (изменено хотя бы одно поле), то
        if (checkThatFieldIsChanged($str_plan)) {
            // 2. Если строка проходит базовую валидацию, то отправляем данные на сервер
            var errors = mainValidationStr($str_plan);
            if (!isEmpty(errors)) {
                callback_editStrPlan_error($str_plan);
            }
            // если нет ни одной ошибки, то всё успешно! )
            else {
                editStrPlan($str_plan);
            }

        }
    }, 200);
}


//устанавливаем старые значения полей строки, до фокусировки
//чтобы потом проверить, что строка была изменена => отправить на сервер
//все старые значения записываются в виде атрибутов в строку с теми же названиями как у классов
function setOldValues($str_plan) {
    var old_data = getFieldsInformation($str_plan);
    for (var key in old_data) {
        // alert(key + " " + old_data[key]);
        $str_plan.attr(key + "_old", old_data[key])
    }
}

// проверяет, что в текущей строке, с момента фокусировки было ли что-то изменено
function checkThatFieldIsChanged($str_plan) {
    var new_data = getFieldsInformation($str_plan);
    for (var key in new_data) {
        if (new_data[key] != $str_plan.attr(key + "_old")) {
            return true;
        }
        $str_plan.removeAttr(key + "_old");
    }
    return false;
}


function a_to_input($field) {
    //преобразовывает a в input
    var value = $field.html();
    var $ul_parent = $field.parent().parent();
    $ul_parent.css('height', $ul_parent.height());
    var $temp_field = $field;

    if ($field.get(0).tagName != 'INPUT') {
        $field.replaceWith('<input class="this_edit">');
        $field = $('.this_edit');
        $field.removeClass('this_edit');
        $field.addClass($temp_field.attr('class'));
        $field.attr('placeholder', setTruePlaceholder($temp_field));
        $field.attr('old_value', $temp_field.text());
    }
    // else {
    //     $field = input_to_a($field);
    //     return;
    // }

    $field.addClass('selected_field');
    $field.attr("value", value);
    $field.focus();
    //поместить курсор в конец поля input
    var inputVal = $field.val();
    $field.val('').focus().val(inputVal);
    $field.animate({scrollLeft: $field.width() * 2});
    return $field;
}

function input_to_a($field) {
    //преобразовывает input в a
    var temp_input = $field; // поле input
    var $ul_parent = $field.parent().parent();
    $ul_parent.css('height', 'auto');

    if ($field.val() != '') {
        var old_value = $field.attr('old_value');
        $field.replaceWith('<a class="this_edited"></a>');
        $field = $('.this_edited');
        $field.removeClass('this_edited');
        $field.removeClass('selected_field');
        $field.addClass(temp_input.attr('class'));
        $field.attr('old_value', old_value);
    }
    else {
        // если в поле было что-то введено, а потом поле очистили, то вернётся старое значение
        $field.val(temp_input.attr('old_value'));
        return $field;
    }
    // на этой строчке важно обрезать часть строки до 100 символов
    // именно эта строка отвечает за обновление полей при вводе
    $field.text(temp_input.val().slice(0, 100));


    return $field;
}

// устанавливает правильный placeholder
function setTruePlaceholder($this_field) {
    if ($this_field.hasClass('weeks'))
        return 'Недели';
    if ($this_field.hasClass('time'))
        return 'Время';
    if ($this_field.hasClass('subject'))
        return 'Предмет';
    if ($this_field.hasClass('teacher'))
        return 'Преподаватель';
    if ($this_field.hasClass('place'))
        return 'Место';
    if ($this_field.hasClass('parity'))
        return 'Чётность';
    return "Пусто";
}


var time_color = 200;
// устанвалвает цвет для нечётных строк таблицы расписания
function setColorStr($this_str) {
    if (!$this_str) {
        $('.plan_content').each(function () {
            $(this).find('.str_plan.change').each(function (i) {

                if (i % 2 == 0) {
                    $(this).animate({'background-color': 'rgba(240, 240, 245, 1)'}, time_color);
                    if ($(this).hasClass('warning_str') || $(this).hasClass('clone_str')) {
                        return true;
                    }
                    $(this).find('ul').animate({'background-color': 'rgba(240, 240, 245, 1)'}, time_color);
                }
                else {
                    $(this).animate({'background-color': 'rgba(255, 255, 255, 1)'}, time_color);
                    if ($(this).hasClass('warning_str') || $(this).hasClass('clone_str')) {
                        return true;
                    }
                    $(this).find('ul').animate({'background-color': 'rgba(255, 255, 255, 1)'}, time_color);
                }
            });
        });
    }
    // если передана одна строка, для которой нужно установить правильный цвет,
    else {
        if ($this_str.hasClass('warning_str')) {
            hoverSelectStr($this_str);
            $this_str.find('ul').css({'background-color': '#FBB6B6'});
            return false;
        }
        if ($this_str.hasClass('clone_str')) {
            hoverSelectStr($this_str);
            $this_str.find('ul').css({'background-color': '#ABD6F2'});
            return false;
        }
        $this_str.find('ul').css({'background': $this_str.css('background')});

    }
}

//снимает выделение со всех выделенных строк
function blurSelectStr() {
    var $selected_str = $('.selected_str');
    if ($selected_str.length > 0) {
        $selected_str.each(function () {
            setDefaultStr($(this));
        });
    }
}

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

    // делаем правильный цвет следующей строчки
    setTimeout(function () {
    }, 500);

    setNewListenersNewStr($new_div);
    setNewListenersSpecial($new_div);
}

function delExtraSymbols(field, n) {
    /*
     *  Функция укорачивает содержимое поля input
     *  то длины n
     */
    while (field.val().length > n) {
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
    if (field.hasClass('subject')) {
        if (content.search(subjectPatt) == -1) {
            delExtraSymbols(field, length - 1);
        }
    }
}


function blockInputs($this_str) {
    $this_str.find('input').each(function () {
        $(this).attr('disabled', 'disabled');
    });
}

function unblockInputs($this_str) {
    $this_str.find('input').each(function () {
        $(this).removeAttr('disabled');
    });
}

function getAjaxActions($pressed_button, i) {
    blurSelectStr();
    var $this_plan = $pressed_button.parents('.plan_window');
    var $checkboxes = $this_plan.find('.checkbox_container.marked.row');

    if ($pressed_button.hasClass('clone_row')) {
        clone_str($checkboxes);
    }
    if ($pressed_button.hasClass('delete_row')) {
        delete_str($checkboxes);
    }

}


// дублируем строку
// работает с AJAX
var FLAG_CLONE = false;
function clone_str(checkboxes) {
    var n = checkboxes.length;
    checkboxes.each(function (i) {
        var $this_str = $(this).parents('.str_plan');
        if ($this_str.attr('id') != undefined) {
            var data = getFieldsInformation($this_str);
            callback_clone(data, $this_str, 0);

        }
        // если строка пустая (не сохранена в базе)
        else {
            delete_str(checkboxes, i, n);
        }
        // alert(n + " " + i);
        if (n == i + 1) {
            // alert("Sdf");
            FLAG_CLONE = false;
            setTimeout(function () {
                setColorStr();
            }, 500);
            return false;
        }
    });
}

// визуально дублируем строку, если получен ответ от сервера
function callback_clone(data, $this_str, new_id) {
    var $new_div = $(NEW_STR_PLAN_HTML).find('.str_plan.change');
    // чтобы анимация работала правильно для любой высоты блока
    $new_div.css('height', $this_str.height());
    $this_str.stop(true, true);
    $new_div.stop(true, true);

    appendNewStrAnimation($new_div, $this_str);
    $new_div.find('.weeks').attr('value', data['weeks']);
    $new_div.find('.parity').attr('value', data['parity']);
    $new_div.find('.time').attr('value', data['time']);
    $new_div.find('.subject').attr('value', data['subject']);
    $new_div.find('.teacher').attr('value', data['teacher']);
    $new_div.find('.place').attr('value', data['place']);
    $new_div.attr('id', 0);
    $new_div.attr('id', new_id);

    if ($this_str.hasClass('clone_str')) {
        $new_div.addClass('clone_str');
    }

    // преобразовываем поля input в a для всех новых полей
    var $new_inputs = $new_div.find('ul li input');
    $new_inputs.each(function () {
        setEditedField($(this));
    });
    // вешаем обработчики на все новые поля
    setNewListenersNewStr($new_div);
    setNewListenersSpecial($new_div);

    setBlurCheckbox($this_str, 'clone');
    callback_cloneErrorStr($new_div);
    // check_field_exist($new_div);

}

// удаляет строку с расписанием
// работает с ajax
var FLAG_DELETE = false;
function delete_str(checkboxes, i, n) {
    if (!i) {
        FLAG_DELETE = true;
        var i = 0;
        var n = checkboxes.length;
    }
    // дублируем каждую следующую запись, только если успешно продублирована предыдущая
    if (i != undefined && n != undefined && i < n) {
        var $this_checkbox = $(checkboxes[i]);
        var $this_str = $this_checkbox.parents('.str_plan');
        // получаем данные всех полей из текущей строки
        var data = {};
        if ($this_str.attr('id') && $this_str.attr('id') != 0) {
            data = {'id': $this_str.attr('id')};
            $.ajax({
                url: '/plan/update_delete',
                success: function (response) {
                    callback_delete($this_str);
                    delete_str(checkboxes, i + 1, n);
                },
                method: 'POST',
                data: data,
                error: function (jqXHR, textStatus, errorThrown) {
                    alert('Ошибка! Запись не будет удалена! (');
                    return false;
                }
            });
        }
        else {
            callback_delete($this_str);
            delete_str(checkboxes, i + 1, n);
        }
    }
    // по оконачанию удаления всех строк выполнить это
    else {
        FLAG_DELETE = false;
        setTimeout(function () {
            setColorStr();
        }, 600);

    }
}

// выполнение стилей и эффектов после успешного удаления строки с сервера
function callback_delete($this_str) {
    $this_str.clearQueue();
    $this_str.find('ul').css({
        'border': '2px solid #FF6161',
        'background': $this_str.css('background')
    });
    setBlurCheckbox($this_str, 'delete');

    $this_str.fadeTo(100, 0, function () {
        $this_str.slideToggle(200, function () {
            $this_str.remove();
        });
    });
}


// добавляет новую строку в расписание
// пока все поля не будут заполнены, строчка не добавится в БД
function editStrPlan($selected_str) {
    var data = getFieldsInformation($selected_str);
    $.ajax({
        url: '/plan/edit_plan_row',
        success: function (response) {
            var response = JSON.parse(response);
            if (response.error) {
                callback_editStrPlan_error($selected_str, response);
            }
            else if (response.clone_error) {
                callback_cloneErrorStr($selected_str);
            }
            else {
                callback_editStrPlan($selected_str, response);
            }
        },
        method: 'POST',
        data: data,
        error: function (jqXHR, textStatus, errorThrown) {
            alert('Ошибка! Новая запись не будет сохранена! Обновите страницу. (');
        }
    });
}

// общая валидация строки перед отправкой на сервер
// нормы и стандарты полей валидации придуманы разработчиками Intodayer!
function mainValidationStr($this_str) {
    var data = getFieldsInformation($this_str);
    var everything_flag = 'weeks' in data && 'time' in data && 'subject' in data
        && 'teacher' in data && 'place' in data && 'parity' in data;

    var errors = {};
    if (everything_flag) {
        var weeks = data['weeks'];
        var time = data['time'];
        var subject = data['subject'];
        var teacher = data['teacher'];
        var place = data['place'];

        if (weeks == "") {
            errors[weeks] = 'empty_value';
        }
        if (time == "") {
            errors[time] = 'empty_value';
        }
        if (subject == "") {
            errors[subject] = 'empty_value';
        }
        if (teacher == "") {
            errors[teacher] = 'empty_value';
        }
        if (place == "") {
            errors[place] = 'empty_value';
        }

        // Проверка корректности ввода дня недели
        var reg_weeks = /^[0-9]{1,2}-[0-9]{1,2}$/;
        if (reg_weeks.test(weeks)) {
            weeks = weeks.split('-');
            var start_week = weeks[0];
            var end_week = weeks[1];
            // alert(start_week + " " + end_week);
            if (start_week > end_week && start_week <= 52 && end_week <= 52) {
                errors['weeks'] = 'logical_error';
            }
        }
        else {
            errors['weeks'] = 'format_error';
        }
        // Проверка корректности ввода времени
        var timePatt1 = /^(([0,1])|(2))$/;
        var timePatt2 = /^(([0,1][0-9])|(2[0-3]))$/;
        var timePatt3 = /^(([0,1][0-9])|(2[0-3])):$/;
        var timePatt4 = /^(([0,1][0-9])|(2[0-3])):[0-5]$/;
        var timePatt5 = /^(([0,1][0-9])|(2[0-3])):[0-5][0-9]$/;
        if (!(timePatt1.test(time[0]) && timePatt2.test(time.slice(0, 2)) && timePatt3.test(time.slice(0, 3)) &&
            timePatt4.test(time.slice(0, 4)) && timePatt5.test(time.slice(0, 5)))) {
            errors['time'] = 'format_error';
        }
        // Проверка корректности ввода предмета

        if (subject.length > 100) {
            errors['subject'] = 'length_error';
        }
        // Проверка корректности ввода учителя

        if (subject.length > 100) {
            errors['teacher'] = 'length_error';
        }
        // Проверка корректности ввода места

        if (subject.length > 100) {
            errors['place'] = 'length_error';
        }

    }
    else {
        errors['error'] = 'error_exist';
    }
    // если есть ошибки то возвращаем их
    if (errors != {}) {
        return errors;
    }
    else {
        return {};
    }


}


function callback_cloneErrorStr($this_str, response) {
    var $this_ul = $this_str.find('ul');
    $this_str.removeClass('warning_str');
    $this_str.addClass('clone_str');
    $this_ul.animate({
        'background-color': '#ABD6F2',
    }, 300);
}


function callback_editStrPlan($this_str, response) {
    $this_str.removeClass('warning_str');
    $this_str.removeClass('clone_str');
    var success_id = response.id;
    var $this_ul = $this_str.find('ul');
    $this_ul.clearQueue();
    $this_str.addClass('animation');
    $this_ul.animate({
        'background-color': '#CBF5BD',
        'border-color': 'rgba(103, 198, 97, 0.9)'
    }, 300, function () {
        var $this = $(this);
        setTimeout(function () {
            $this.animate({
                'background-color': $this_str.css('background-color'),
                'border-color': 'rgba(103, 198, 97, 0.0)'
            }, function () {
                $this_str.removeClass('animation');
                setTimeout(function () {
                    setColorStr();
                }, 200);

            });
        }, 1000);
    });
    $this_str.attr('id', success_id);
}

function callback_editStrPlan_error($this_str, response) {
    $this_str.addClass('warning_str');
    $this_str.removeClass('clone_str');
    var $this_ul = $this_str.find('ul');
    $this_ul.clearQueue();
    $this_ul.animate({
        'background-color': '#FBB6B6',
    }, 300);
}

// получаем инфу из строки
function getFieldsInformation($this_str) {
    var weeks, start_week, end_week, parity, time, subject, teacher, place, day_of_week, id;
    var $this_plan = $this_str.parents('.plan_window');

    if ($this_str.attr('id') != undefined) {
        id = $this_str.attr('id');
    }
    else {
        id = 0;
    }
    parity = get_patiry_value($this_str.find('.parity').text());
    day_of_week = get_day_num($this_plan.attr('day_num'));

    // делаем проверку для случая, когда одна из строк активирована и она INPUT
    if ($this_str.find('.weeks').get(0).tagName == 'A') {
        weeks = $this_str.find('.weeks').text();
    }
    else {
        weeks = $this_str.find('.weeks').val();
    }
    start_week = weeks.split('-')[0];
    end_week = weeks.split('-')[1];

    if ($this_str.find('.time').get(0).tagName == 'A') {
        time = $this_str.find('.time').text();
    }
    else {
        time = $this_str.find('.time').val();
    }
    if ($this_str.find('.subject').get(0).tagName == 'A') {
        subject = $this_str.find('.subject').text();
    }
    else {
        subject = $this_str.find('.subject').val();
    }

    if ($this_str.find('.teacher').get(0).tagName == 'A') {
        teacher = $this_str.find('.teacher').text();
    }
    else {
        teacher = $this_str.find('.teacher').val();
    }

    if ($this_str.find('.place').get(0).tagName == 'A') {
        place = $this_str.find('.place').text();
    }
    else {
        place = $this_str.find('.place').val();
    }

    return {
        'weeks': weeks,
        'start_week': start_week,
        'end_week': end_week,
        'time': time,
        'subject': subject,
        'teacher': teacher,
        'place': place,
        'parity': parity,
        'day_of_week': day_of_week,
        'id': id
    };

}

// возвращает номер дня, начиная с 0
function get_day_num(name_day) {
    var days = {
        'Понедельник': 1,
        'Вторник': 2,
        'Среда': 3,
        'Четверг': 4,
        'Пятница': 5,
        'Суббота': 6,
        'Воскресенье': 7
    };
    if (days[name_day] != undefined) {
        return days[name_day];
    }
    else {
        return 0;
    }
}

// возвращает значащий номер для чётности
function get_patiry_value(value) {
    var values_num = {
        'Все': 0,
        'Чётные': 1,
        'Четные': 1,
        'Нечётные': 2,
        'Нечетные': 2
    };
    if (values_num[value] != undefined) {
        return values_num[value];
    }
    else {
        return 0;
    }
}

// проверяет является ли пустым объект javascript
var hasOwnProperty = Object.prototype.hasOwnProperty;

function isEmpty(obj) {

    // null and undefined are "empty"
    if (obj == null) return true;

    // Assume if it has a length property with a non-zero value
    // that that property is correct.
    if (obj.length > 0)    return false;
    if (obj.length === 0)  return true;

    // If it isn't an object at this point
    // it is empty, but it can't be anything *but* empty
    // Is it empty?  Depends on your application.
    if (typeof obj !== "object") return true;

    // Otherwise, does it have any properties of its own?
    // Note that this doesn't handle
    // toString and valueOf enumeration bugs in IE < 9
    for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) return false;
    }

    return true;
}