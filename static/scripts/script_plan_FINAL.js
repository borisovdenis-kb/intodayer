//цвет чётных строчек расписания
var backgroundColorEvenStr = 'rgba(255, 255, 255, 1)';
//цвет нечётный строчек расписания
var backgroundColorOddStr = 'rgba(240, 240, 245, 1)';
//цвет границ обычной строки при наведении мышки или выделении строки
var borderColorSelectStr = 'rgba(3, 96, 255, 0.3)';
//успешная отправка на сервер
var backgroundSuccessSavedStr = '#CBF5BD';
var borderColorSuccessSavedStr = 'rgba(103, 198, 97, 0.9)';
//поле выделено галочкой
var backgroundCheckedStr = 'rgba(237, 218, 255,1)';
var borderColorCheckedStr = 'rgba(139, 29, 235, 0.5)';
//поле с ошибкой отправки на сервер
// var backgroundErrorStr = '#FBB6B6';
var backgroundErrorStr = '#ffd1cf';
var borderColorErrorStr = '#F37C7C';
//строка, которая клонирована и не существует на сервере
//или строка которая, если была изменена, уже существует на сервере в текущем дне (в точности до всех полей)
// var backgroundCloneStr = '#ABD6F2';
var backgroundCloneStr = '#bee0f2';
var borderColorStr = 'rgba(3, 96, 255, 0.3)';

// переписать через Load
var $NEW_STR_PLAN_HTML = $('' +
    '<div class="str_plan change" style="opacity: 0; display:none;">' +
    '<div class="checkbox_wrap">' +
    '<div class="checkbox_container row"></div>' +
    '</div>' +
    '<ul>' +
    '<li><textarea  class="weeks"></textarea></li>' +
    '<li><textarea class="time"></textarea></li>' +
    '<li><textarea  class="subject"></textarea></li>' +
    '<li><textarea class="teacher"></textarea></li>' +
    // не забыть поставить class=last, чтобы потом распознать
    '<li><textarea class="place"></textarea></li>' +
    '<li class="last"><textarea class="parity">Все</textarea></li>' +
    '</ul>' +
    '</div>');

// Возвращает случайное целое число между min (включительно) и max (не включая max)
// Использование метода Math.round() даст вам неравномерное распределение!
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

// плэйсхолдеры переменные
var subjects = ["Математика", "Русский язык", "Информатика", "История", "Право", "Алгебра", "Рисование", "ИНО", "ОБЖ"];
var teachers = ["Попов С.Ю.", "Крутов А.Н.", "Елисеев", "Денис Борисов", "Алексей Кротков", "Богатырёв", "Срибная Т.А.", "Родичев", "Марат"];
var places = ["510x", '110м', "Л-11", "Л-10", '511м', "112ф", "Кафедра-М"];
var parity_PlaceHolder = 'Все';

$(document).ready(function () {
    $('.str_plan.change').each(function () {
        setNewListenersNewStr($(this));
        setNewListenersSpecial($(this));
    });
    $('.str_plan.str_title').each(function () {
        setGeneralCheckBoxListeners($(this));
    });
    startBaseFunctions();

});


$(window).click(function (e) {
    // var $this_obj = $(e.target);
    // if ($this_obj.get(0).tagName != 'TEXTAREA' && ($this_obj.is('.drop_list').length == 0 || $this_obj.parents('.drop_list').length == 0)){
    //     $('.drop_list').remove();
    // }
});

// устанавливаем обработчик при нажатии на плюс
$('.plus_button_form').click(function () {
    appendPlanStr($(this));
});

function setNewListenersNewStr($new_div) {
    // Обработчики событый, применяемые к каждой строке расписания
    var $new_textarea = $new_div.find('ul li textarea');


    // сбрасываем все обработчики (так как постоянно их заново ставим)
    $new_div.off();
    $new_textarea.off();

    //редактировать поле при нажатии на него
    $new_textarea.on('focus', function () {
        var $this_field = $(this);
        var $this_str = $(this).parents('.str_plan.change');
        $(this).attr('old_value', $(this).val());

        $.getScript("/static/scripts/script_drop_lists_plan.js", function () {
            // ипорт функции для выподающих списков у полей.
            // делаем услования, чтобы дроп лист больше не открывался при 2 клике на поле
            //   createDropLst($this_field);
             createDropLst($this_field);

        });

        setSelectStr($this_str);
        // editField($(this));
    });
    $new_textarea.on('focusout', function () {
        var $this_str = $(this).parents('.str_plan.change');
        if ($(this).attr('old_value') != $(this).val()) {
            $this_str.attr('edited', 'true');
        }
        // setTimeout(function () {
           $('.drop_list').remove();
        // },100);

        setDefaultStr($this_str);
        return false;
    });

    // отвечает за выделение строки при наведении
    $new_div.hover(function () {
        hoverSelectStr($(this));
    }, function () {
        hoverDefaultStr($(this));
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


function setStrPlaceholders($this_str) {
    //устанавливаем заданные плэйсхолдеры
    $this_str.find('textarea').each(function () {
        $(this).attr('placeholder', setTrueRandomPlaceholder($(this)));
    });
}


function startBaseFunctions() {
    deleteTopCheckboxInEmptyDays();
    setColorStr();
}


// действия при нажатии на enter
function enterPressAction($this_field) {
    $this_field.blur();
    setDefaultStr($LAST_SELECTED_STR);
    $('.drop_list').remove();
}

// когда нажимаем на галочку блокируем
function blockInputs($this_str) {
    $this_str.find('textarea').each(function () {
        $(this).attr('disabled', 'disabled');
    });
}

function unblockInputs($this_str) {
    $this_str.find('textarea').each(function () {
        $(this).removeAttr('disabled');
    });
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
// удаляет все обработчики событий с кнопок
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
// устанавливаем чек боксы

function setCheckBox($checkbox_wrap, mode) {
    var $this_str = $checkbox_wrap.parent('.str_plan');
    $this_str.removeClass('selected_str');

    var $this_ul = $this_str.find('ul');
    var $this_checkbox = $checkbox_wrap.find('.checkbox_container');
    var $this_plan_content = $this_str.parents('.plan_window');
    var $info_checkboxes = $this_plan_content.find('.info_checkboxes');

    // //прекращаем анимации при нажатии на галочку
    // //если есть отложенные анимации, то остановить их
    $this_str.removeClass('animation');

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
                'border-color': borderColorCheckedStr,
                'background-color': backgroundCheckedStr
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
            // setNewListenersEdit($this_str);
            unblockInputs($this_str);
            $this_str.removeClass('marked');
            hoverSelectStr($this_str);
            setColorStr($this_str);
        }
        $this_checkbox.removeClass('marked');
        $this_checkbox.animate({'background-color': 'rgba(0,0,0,0)'}, 50);
    }
}
// обработчик для верхнего чекбокса, в заголовке каждого дня
function setGeneralCheckBoxListeners($this_str, $general_checkbox) {
    var this_checkbox;
    if (!$general_checkbox) {
        this_checkbox = $this_str.find('.general_checkbox');
    }
    else {
        this_checkbox = $general_checkbox;
    }

    this_checkbox.attr('flag_active', 'false');
    this_checkbox.on('click', function () {
        // if (!FLAG_DELETE && !FLAG_CLONE) {
        actionGeneralCheckBox($(this));
        // }
    });
}


// удаляет поле галочки в заголовке для пустых дней
function deleteTopCheckboxInEmptyDays() {
    var $days_content = $('.plan_content');
    $days_content.each(function () {
        var $str_plans = $(this).find('.str_plan ul');
        if ($str_plans.length == 1) {
            var $this_checkbox = $(this).find('.checkbox_wrap');
            setCheckBoxInvisible($this_checkbox);
        }
    });
}

function setCheckBoxInvisible($checkbox_wrap) {
    var $this_checkbox = $checkbox_wrap.find('.checkbox_container');
    $this_checkbox.fadeTo(300, 0);
    $this_checkbox.css('cursor', 'default');
    $checkbox_wrap.off();
    $checkbox_wrap.css('cursor', 'default');
    $checkbox_wrap.addClass("invisible");
}

function setCheckBoxVisible($checkbox_wrap, type) {
    // если не указан тип чекбокса, навешиваем обработчки на главный верхний чекбокс
    if (!type) {
        $checkbox_wrap.off();
        setGeneralCheckBoxListeners(false, $checkbox_wrap);
    }
    var $this_checkbox = $checkbox_wrap.find('.checkbox_container');
    $this_checkbox.fadeTo(300, 1);
    $this_checkbox.css('cursor', 'pointer');
    $checkbox_wrap.css('cursor', 'pointer');
    $checkbox_wrap.removeClass("invisible");
}


function setBlurCheckbox($this_str, mode) {
    $this_str.find('.checkbox_container').each(function () {
        if ($(this).hasClass('marked')) {
            $(this).trigger('click');
            setDefaultStr($this_str, mode);
        }
    });
}

// устанавливает правильный placeholder
function setTrueRandomPlaceholder($this_field) {
    if ($this_field.hasClass('weeks')) {
        var week_start, week_end;
        week_start = getRandomInt(1, 10);
        week_end = getRandomInt(week_start + 1, 18);
        return week_start + '-' + week_end;
    }
    if ($this_field.hasClass('time')) {
        var time_hours, time_minutes_dec;
        time_hours = getRandomInt(8, 15);
        if (time_hours < 10) {
            time_hours = '0' + time_hours;
        }
        time_minutes_dec = getRandomInt(0, 5);
        return time_hours + ":" + time_minutes_dec + "0";
    }
    if ($this_field.hasClass('subject'))
        return subjects[getRandomInt(0, subjects.length)];
    if ($this_field.hasClass('teacher'))
        return teachers[getRandomInt(0, teachers.length)];
    if ($this_field.hasClass('place'))
        return places[getRandomInt(0, places.length)];
    if ($this_field.hasClass('parity'))
        return parity_PlaceHolder;
    return "Пусто";
}


// устанавливает выделение текущей строки
function setSelectStr($str_plan, mode) {
    $str_plan.addClass('selected_str');
    hoverSelectStr($str_plan, mode);

}

//устанавливает выделение для строки, если не установлено
function hoverSelectStr($this_str) {
    if ($this_str.hasClass('marked') || $this_str.hasClass('animation')) {
        return false;
    }
    if ($this_str.hasClass('clone_str')) {
          // чтобы работало для клонированных строк
        $this_str.find('ul').css({'border-color': borderColorStr});
        return;
    }
    if ($this_str.hasClass('warning_str')) {
        // чтобы работало для ошибочных строк
        $this_str.find('ul').css({'border-color': borderColorErrorStr});
        return;
    }
    $this_str.find('ul').css({'border-color': borderColorSelectStr});
}

//снимает выделение со строки, если  установлено
function hoverDefaultStr($this_str) {

    if (!$this_str || $this_str.hasClass('marked') || $this_str.hasClass('selected_str') || $this_str.hasClass('animation')) {
        return false;
    }

    $this_str.find('ul').css({'border': '2px solid rgba(255, 255, 255, 0.0)'});

}

function setDefaultStr($str_plan, mode) {
    //при расфокусировке отправляем инфу в БД
    if ($str_plan) {
        $str_plan.removeClass('selected_str');
    }

    hoverDefaultStr($str_plan);

    if (mode == 'clone' || mode == 'delete' || mode == 'animation') {
        return false;
    }

    timer_send_server = setTimeout(function () {
        //***************************************************************************************
        // Одна из важнейших строчек во всём коде
        // именно тут данные отправляются на сервер для обновления или создания строки расписания
        if (strIsEmpty($str_plan)) {
            return false;
        }
        // 1. Если строка изменена при расфокусировки (изменено хотя бы одно поле), то
        if (checkThatFieldIsChanged($str_plan)) {
            console.log("ВЫЗОВ");
            // 2. Если строка проходит базовую валидацию, то отправляем данные на сервер
            var errors = mainValidationStr($str_plan);
            if (!isEmpty(errors)) {
                printObj(errors);
                callback_editStrPlan_error($str_plan);
            }
            // если нет ни одной ошибки, то всё успешно! )
            else {
                editStrPlan($str_plan);
            }
        }
    }, 200);
}


function callback_cloneErrorStr($this_str, response) {
    var $this_ul = $this_str.find('ul');
    var $this_checkbox = $this_str.find('.checkbox_container');
    $this_str.removeClass('warning_str');
    $this_str.addClass('clone_str');
    // если после расфокусировки сразу выбрана галочка, то нельзя портить выранную строку этой анимацией
    if (!$this_checkbox.hasClass('marked')) {
        $this_ul.animate({
            'background-color': backgroundCloneStr,
        }, 300, function () {
            $this_str.css('height', 'auto');
        });
    }
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
var timer_setInvisibleTopCheckbox;

function callback_delete($this_str) {
    var $this_plan = $this_str.parents('.plan_window');
    $this_str.clearQueue();
    $this_str.find('ul').css({
        'border': '2px solid #FF6161',
        'background': $this_str.css('background')
    });
    setBlurCheckbox($this_str, 'delete');

    $this_str.fadeTo(100, 0, function () {
        $this_str.slideToggle(200, function () {
            $this_str.remove();

            //если удалённая строка последняя, то убираем чек бокс сверху
            clearTimeout(timer_setInvisibleTopCheckbox);
            timer_setInvisibleTopCheckbox = setTimeout(function () {
                if ($this_plan.find('.str_plan.change').length == 0) {
                    setCheckBoxInvisible($this_plan.find('.general_checkbox'));
                }
            }, 100);
        });
    });
}


// добавляет новую строку в расписание
// пока все поля не будут заполнены, строчка не добавится в БД
function editStrPlan($selected_str) {
    $selected_str.removeAttr('edited');
    var data = getFieldsInformation($selected_str);
    $.ajax({
        url: '/plan/edit_plan_row',
        success: function (response) {
            var response = JSON.parse(response);
            if (response.error) {
                callback_editStrPlan_error($selected_str, response);
            }
            else if (response.clone_error) {
                // alert("sdfaf");
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


function callback_editStrPlan($this_str, response) {
    $this_str.removeClass('warning_str');
    $this_str.removeClass('clone_str');
    var $this_checkbox = $this_str.find('.checkbox_container');
    var $this_ul = $this_str.find('ul');
    $this_ul.clearQueue();
    // var success_id = response.id;
    $this_str.attr('id', response.id);
    $this_str.addClass('animation');

    // если после расфокусировки сразу выбрана галочка, то нельзя портить выранную строку этой анимацией
    // обязательно внутри не через setTimeout а через delay
    // чтобы можно было остановить очередь jquery
    if (!$this_checkbox.hasClass('marked')) {
        $this_ul.animate({
            'background-color': backgroundSuccessSavedStr,
            'border-color': borderColorSuccessSavedStr
        }).delay(1000).animate({
            'background-color': $this_str.css('background-color'),
            'border-color': 'rgba(255, 255, 255, 0.0)'
        }, function () {
            $this_str.removeClass('animation');
            if (hasSelectedField($this_str)) {
                // alert("Sdf");
                setSelectStr($this_str, 'ease_us');
            }
        });
    }

}

function hasSelectedField($this_str) {
    if ($this_str.find('.selected_field').length >= 1) {
        return true;
    }
    else {
        return false;
    }
}

function callback_editStrPlan_error($this_str, response) {
    $this_str.addClass('warning_str');
    $this_str.removeClass('clone_str');
    var $this_ul = $this_str.find('ul');
    var $this_checkbox = $this_str.find('.checkbox_container');
    $this_ul.clearQueue();
    // если после расфокусировки сразу выбрана галочка, то нельзя портить выранную строку этой анимацией
    if (!$this_checkbox.hasClass('marked')) {
        $this_ul.animate({
            'background-color': backgroundErrorStr,
        }, 300);
    }
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
function clone_str(checkboxes) {
    var n = checkboxes.length;
    checkboxes.each(function (i) {
        var $this_str = $(this).parents('.str_plan');
        // если строка не пустая, то отмечаем синим, так как она уже существует в базе
        if (!strIsEmpty($this_str)) {
            var data = getFieldsInformation($this_str);
            callback_clone(data, $this_str);
        }
        // если строка полностью пустая (не сохранена в базе)
        else {
            callback_clone({}, $this_str, 'new_str');
        }
        // по окончанию клонирования
        if (n == i + 1) {
            setTimeout(function () {
                setColorStr();
            }, 500);
            return false;
        }
    });
}

// визуально дублируем строку, если получен ответ от сервера
function callback_clone(data, $this_str, mode) {
    var $new_div = $($NEW_STR_PLAN_HTML).clone();
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

    // преобразовываем поля input в a для всех новых полей
    // и устанавливаем плэйсхолдеры, которые были на строке дублирования
    var $new_textareas = $new_div.find('ul li textarea');
    var $old_textareas = $this_str.find('ul li textarea');
    $new_textareas.each(function (i) {
        console.log($old_textareas[i]);
        $(this).attr("placeholder", $($old_textareas[i]).attr('placeholder'));
    });

    // вешаем обработчики на все новые поля
    setNewListenersNewStr($new_div);
    setNewListenersSpecial($new_div);
    setBlurCheckbox($this_str, 'clone');

    // если дублируем пустую строку, то не выделяем её
    if (mode != 'new_str') {
        if ($this_str.hasClass('clone_str')) {
            $new_div.addClass('clone_str');
        }
        callback_cloneErrorStr($new_div);
    }
}


// проверяет, что в текущей строке, с момента фокусировки было ли что-то изменено
function checkThatFieldIsChanged($str_plan) {
    if ($str_plan.attr('edited')) {
        return true;
    }
    else {
        return false;
    }
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
        var parity = data['parity'];

        if (weeks == "") {
            errors['weeks'] = 'empty_value';
        }
        if (time == "") {
            errors['time'] = 'empty_value';
        }
        if (subject == "") {
            errors['subject'] = 'empty_value';
        }
        if (teacher == "") {
            errors['teacher'] = 'empty_value';
        }
        if (place == "") {
            errors['place'] = 'empty_value';
        }

        // if (parity == "") {
        //     alert(0 == "");
        //     errors['parity'] = 'empty_value';
        // }

        // Проверка корректности ввода дня недели
        if (!errors['weeks']) {
            var reg_weeks = /^[0-9]{1,2}-[0-9]{1,2}$/;
            if (reg_weeks.test(weeks)) {
                weeks = weeks.split('-');
                var start_week = +weeks[0];
                var end_week = +weeks[1];
                if ((start_week > end_week) || (start_week > 52) || (end_week > 52) || (start_week == 0) || (end_week == 0)) {
                    errors['weeks'] = 'logical_error';
                }
            }
            else {
                errors['weeks'] = 'format_error';
            }
        }

        if (!errors['time']) {
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
        }
        // Проверка корректности ввода предмета

        if (!errors['subject']) {
            if (subject.length > 100) {
                errors['subject'] = 'length_error';
            }
            // Проверка корректности ввода учителя
        }

        if (!errors['teacher']) {
            if (teacher.length > 100) {
                errors['teacher'] = 'length_error';
            }
        }
        // Проверка корректности ввода места

        if (!errors['place']) {
            if (place.length > 100) {
                errors['place'] = 'length_error';
            }
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
    parity = get_parity_value($this_str.find('.parity').text());

    day_of_week = get_day_num($this_plan.attr('day_num'));

    // делаем проверку для случая, когда одна из строк активирована и она INPUT

    weeks = $this_str.find('.weeks').val();

    start_week = weeks.split('-')[0];
    end_week = weeks.split('-')[1];
    time = $this_str.find('.time').val();
    subject = $this_str.find('.subject').val();
    teacher = $this_str.find('.teacher').val();
    place = $this_str.find('.place').val();


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
function get_parity_value(value) {
    console.log(value);
    var values_num = {
        'Все': 'Все',
        'Чет': 'Чет',
        'Нечет': 'Нечет'
    };
    if (values_num[value] != undefined) {
        return values_num[value];
    }
    else {
        return 0;
    }
}


// проверка, что вся строка не пустая
// var count_field = $('.str_plan.change').first().find('li').length;
function strIsEmpty($this_str) {
    var flag_exist = true;
    // считаем в скольки полях есть текст
    // при снятии фокуса с input он может также присутствовать и не успеть измениться на <a>
    if (!$this_str) {
        return false;
    }

    $this_str.find('ul li textarea').each(function () {
        if ($(this).val() != '') {
            flag_exist = false;
            return false;
        }
    });
    return flag_exist;
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

function printObj(obj) {
    for (var key in obj) {
        console.log(key + ": " + obj[key])
    }
}

var time_color = 200;
// устанвалвает цвет для нечётных строк таблицы расписания
function setColorStr($this_str) {
    if (!$this_str) {
        $('.plan_content').each(function () {
            $(this).find('.str_plan.change').each(function (i) {

                if (i % 2 == 0) {
                    $(this).animate({'background-color': backgroundColorOddStr}, time_color);
                    if ($(this).hasClass('warning_str') || $(this).hasClass('clone_str')) {
                        return true;
                    }
                    $(this).find('ul').animate({'background-color': backgroundColorOddStr}, time_color);
                }
                else {
                    $(this).animate({'background-color': backgroundColorEvenStr}, time_color);
                    if ($(this).hasClass('warning_str') || $(this).hasClass('clone_str')) {
                        return true;
                    }
                    $(this).find('ul').animate({'background-color': backgroundColorEvenStr}, time_color);
                }
            });
        });
    }
    // если передана одна строка, для которой нужно установить правильный цвет,
    else {
        // случай, когда после эффекта успшеной отправки строки на сервер мы сразу нажали на галочку


        if ($this_str.hasClass('warning_str')) {
            hoverSelectStr($this_str);
            $this_str.find('ul').css({'background-color': backgroundErrorStr});
            return false;
        }
        if ($this_str.hasClass('clone_str')) {
            hoverSelectStr($this_str);
            $this_str.find('ul').css({'background-color': backgroundCloneStr});
            return false;
        }

        hoverSelectStr($this_str);
        $this_str.find('ul').css({'background-color': 'rgba(255,255,255,0)'});

    }
}

function appendNewStrAnimation($new_div, $insert_after_this) {
    $new_div.insertAfter($insert_after_this);
    $new_div.slideToggle(200);
    $new_div.fadeTo(200, 1);

    // эта строчка нужна чтобы при добавлении новой строки высота input не глючила и
    // ровно заполняла li элемент
    // setTimeout(function () {
    //     $new_div.find('input').each(function () {
    //         $(this).css('height', $(this).parent().height());
    //         // $(this).css('height', 'auto');
    //     });
    // }, 200);

}

// добавление новой строки с расписанием
var timer_setVisibleTopCheckbox;

function appendPlanStr($this_button) {

    var $this_block = $($this_button).parents('.day_plan_content');
    var $new_div = $($NEW_STR_PLAN_HTML).clone();
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

    var insert_after_this = $this_block.find('.str_plan.change').last();
    setTimeout(function () {
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
        setColorStr();
    }, 800);

    //если до этого в текущем дне не было ни одной строки, то при добавлении первой показываем чекбокс сверху
    clearTimeout(timer_setVisibleTopCheckbox);
    timer_setVisibleTopCheckbox = setTimeout(function () {
        var $this_plan = $new_div.parents('.plan_window');
        if ($this_plan.find('.str_plan.change').length == 1 && $this_plan.find('.general_checkbox').hasClass('invisible')) {
            setCheckBoxVisible($this_plan.find('.general_checkbox'));
        }
    }, 500);


    setStrPlaceholders($new_div);
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
    var weekPatt2 = /^([1-9]-)|([1-4][0-9])|([5][0-2])$/;
    var weekPatt3 = /^([1-9]-[1-9])|([1-4][0-9]-)|([5][0-2]-)$/;
    var weekPatt4 = /^([1-9]-[1-4][0-9])|([1-4][0-9]-[1-9])|([5][0-2]-[1-9])|([1-9]-[5][0-2])$/;
    var weekPatt5 = /^([1-4][0-9]-[1-4][0-9])|([5][0-2]-[1-4][0-9])|([1-4][0-9]-[5][0-2])|([5][0-2]-[5][0-2])$/;
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


//снимает выделение со всех выделенных строк
function blurSelectStr() {
    var $selected_str = $('.selected_str');
    if ($selected_str.length > 0) {
        // условия для того, чтобы при расфокусировки после нажатого дроп листа для парити поле отправлялось на сервер
        $selected_str.each(function () {
            setDefaultStr($(this));
        });
    }

}

