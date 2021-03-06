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
    '<li><textarea  class="weeks" num="1"></textarea></li>' +
    '<li><textarea class="time" num="2"></textarea></li>' +
    '<li><textarea  class="subject" num="3"></textarea></li>' +
    '<li><textarea class="teacher" num="4"></textarea></li>' +
    // не забыть поставить class=last, чтобы потом распознать
    '<li><textarea class="place" num="5"></textarea></li>' +
    '<li class="last"><input class="parity drop_button" type="button" num="6" value="Все"></li>' +
    '</ul>' +
    '</div>');


var thisInput;
var timerInputId;

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
    // когда создаём новое расписание открываются настройки
    if (localStorage['new_plan_editing'] === 'true') {
        // localStorage.setItem('new_plan_editing', 'false');
        // localStorage.removeItem('new_plan_editing');
        setTimeout(function () {
            $('.plan_settings').trigger('click');
        }, 200);
    }


    rightContentActionsAllUsers();

    if ($('.plan_title').attr('user_has_edit_plan') === 'yes') {
        userHasRightsEditinig();
    }
    else {
        userHasNotRightsEdidting();
    }

});

function rightContentActionsAllUsers() {
    $('.day_plan_content').each(function () {
        setColorStr($(this));
    });
    setListenersTitleBlock();
}


function userHasRightsEditinig() {
    setListenersAdminRightContent();
    setTimeout(() => {
        showTopCheckboxInNotEmptyDays();
    }, 500);
}
function userHasNotRightsEdidting() {
    $('textarea').attr('disabled', "");
    $('textarea').css('cursor', 'default');
}


// Запуск всего скрипта, навешивание всех обработчиков
function setListenersAdminRightContent() {

    $('.str_plan.change').each(function () {
        setNewListenersNewStr($(this));
        setNewListenersSpecial($(this));
        $(this).find('li').each(function () {
            resizeArea($(this).children());
        });
    });

    // устанавливаем обработчик при нажатии на плюс
    $('.plus_button_form').click(function () {
        appendPlanStr($(this));
    });

    $('.str_plan.change').each(function () {
        $(this).find('li').each(function () {
            resizeArea($(this).children());
        });

    });

    $('.str_plan.str_title').each(function () {
        setGeneralCheckBoxListeners($(this));
    });


    $('.share_button').each(function () {
        $(this).click(function () {
            modal_share.showModal();
        });
    });
}


$(window).on('mousedown touchend', function (e) {
    /*
     при нажатии в любое место в браузере
     именн этот обработчик событий расфокусирует строку при определённых условиях
     и отправляет данные на проверку валидации и на сервер setDefaultStr(...)
     */
    var $this_active_obj = $(document.activeElement).parents('.str_plan.change');
    var $this_click_obj = $(e.target).parents('.str_plan.change');
    var $drop_lists = $(e.target).parents('.drop_list');
    if (($this_active_obj.length == 0 || $this_click_obj.length == 0 || !$this_active_obj.is($this_click_obj))) {
        // расфокусируем обязательно именно все строки на сайте (если есть больше одной)
        $(document.activeElement).blur();
        $('.selected_str').each(function () {
            var $this_str = $(this);
            setDefaultStr($this_str);
        });
    }
    // Если нажали на скролл бар в браузере
    if (e.target === $('html')[0] && e.clientX >= document.documentElement.offsetWidth) {
        $(document.activeElement).blur();
        $('.selected_str').each(function () {
            var $this_str = $(this);
            setDefaultStr($this_str);
        });
    }
});


$(window).on('mousedown', function (e) {
    /*
     чтобы при нажатии на LI текущее выбранное поле не расфокусировалоась
     нужно для корректного скрытия droplist
     */
    var $this_obj = $(e.target);
    if ($this_obj.get(0).tagName == "LI" && $this_obj.parents('.selected_str').length != 0) {
        return false;
    }
});

// при нажатии на enter
$(window).on('keydown', function (e) {
    if (e.which == 13) {
        enterPressAction();
    }
});


var timer_focusout;


function setNewListenersNewStr($new_div) {
    // Обработчики событый, применяемые к каждой строке расписания
    var $new_textarea = $new_div.find('ul li textarea');
    var $input_button = $new_div.find('.parity');
    var $LI = $new_div.find('ul li');

    // сбрасываем все обработчики (так как постоянно их заново ставим)
    $new_div.off();
    $new_textarea.off();

    // отвечает за выделение строки при наведении
    $new_div.hover(function () {
        hoverSelectStr($(this));
    }, function () {
        hoverDefaultStr($(this));
    });


    //редактировать поле при нажатии на него
    var arr_objs = [$new_textarea, $input_button];
    for (var i = 0; i < 2; i++) {
        arr_objs[i].on('focus', function () {
            var $this_field = $(this);
            var $this_str = $this_field.parents('.str_plan.change');
            $this_field.attr('old_value', $this_field.val());
            setSelectStr($this_str);

        });
    }


    $LI.on('click', function () {
        /*
         при нажатии на LI также выделяем textarea
         чтобы LI повторно не выполняла
         чтобы при нажатии на LI текущее выбранное поле не расфокусировалоась мы внесли обработчик на window с return false
         выше в этом коде
         */
        var $children = $(this).children();
        if (!$children.is(":hover")) {
            $children.trigger('focus');
        }
    });

    // делаем правильно курсор и выпадающий список
    $new_textarea.on('focus', function () {
        var $this_field = $(this);

        openTextareaDropList($this_field);
        // курсор становится всегда в конце при выделении
        $(function () {
            var data = $this_field.val();
            $this_field.val('').val(data);
        });

        $this_field.addClass('selected_field');
    });


    // при расфокусировки или нажатии клавиши удаляем выпадающий список
    // а также если нажали клавишу вверх или вниз меняем поля
    $new_textarea.on('focusout keydown', function (e) {
        var $this_str = $(this).parents('.str_plan.change');
        // var $this_field = $(this);
        // для проверки валидации
        if ($(this).attr('old_value') != $(this).val()) {
            $this_str.attr('edited', 'true');
        }

        $(this).removeClass('drop_is');
        $('.drop_list').remove();

        // смена полей при нажатии на кнопку вверх или вниз
        var $this_field = $(this);
        focusFieldWithKeys($this_field, $this_str, e);

        $this_field.removeClass('selected_field');

        // для корректной работы на iPhone
        clearTimeout(timer_focusout);
        timer_focusout = setTimeout(function () {
            if (device.iphone()) {
                if ($this_str.find($(document.activeElement)).length == 0) {
                    setDefaultStr($this_str)
                }
            }
        }, 100)

    });


    // для правильного вызова и сворачивания дроп листа
    // как бы если нажимаем на уже сфокусированное поле
    $new_textarea.on('mousedown', function () {
        var $this_field = $(this);
        openTextareaDropList($this_field);
    });

    // тут удаляются пробелмы и нормализируется размер текстового поля по высоте
    $new_textarea.on('change focusout', function () {
        var $this_field = $(this);
        // удаление пробелов в начале и вконце строки
        $this_field.val($this_field.val().trim());
        if ($this_field.val() == "") {
            return false;
        }
        setTimeout(function () {
            resizeArea($this_field);
        }, 100);

    });

    // также при вводе нормализируем высоту поля
    $new_textarea.on('input', function () {
        var $this_textarea = $(this);
        resizeArea($this_textarea, 32, 300);
    });

    // Работа валидации при вводе
    $new_textarea.on('input', function () {
        thisInput = $(this);
        validateField(thisInput);
        // timerInputId = setInterval(function () {
        //
        // }, 50);
        // setTimeout(function () {
        //     clearInterval(timerInputId);
        // }, 100);
    });


    if (device.iphone()) {
        $input_button.on('click', function () {
            $(this).trigger('focus');
        });
    }
    // для работы parity

    $input_button.on('focus', function () {
        var $this_field = $(this);
        $this_field.css('background', '#deb7ff');
        openInputDropList($this_field);
    });

    // вот это событие нужно для того, чтобы фокусировка работала и при нажатии
    // просто если не навесить соыбие focus выше, то не будет работать дроп лист, при нажатии на TAB
    $input_button.on('mousedown', function () {
        if ($(this).is(':focus')) {
            openInputDropList($(this), 'true');
        }
    });
    $input_button.on('focusout keydown', function (e) {
        var $this_str = $(this).parents('.str_plan.change');
        if ($(this).attr('old_value') != $(this).val()) {
            $this_str.attr('edited', 'true');
        }

        if ($(this).is(':hover')) {
            $(this).css({'background': '#e6ccff'});
        }
        else {
            $(this).css({'background': 'rgba(255,255,255,0)'});
        }


        $(this).removeClass('drop_is');
        $('.drop_list').remove();

        if (e.which == 9) {
            setDefaultStr($this_str);
        }

        // смена полей при нажатии на кнопку вверх вниз
        var $this_field = $(this);
        focusFieldWithKeys($this_field, $this_str, e);
    });

    $input_button.mouseover(function () {
        if (!$(this).hasClass('drop_is')) {
            $(this).css({'background': '#e6ccff'});
        }
    });
    $input_button.mouseout(function () {
        if (!$(this).hasClass('drop_is')) {
            $(this).css({'background': 'rgba(255,255,255,0)'});
        }
    });

    $.mask.definitions['5'] = '[0-5]';
    $.mask.definitions['2'] = '[0-2]';
    $.mask.definitions['3'] = '[0-3]';
    $.mask.definitions['4'] = '[0-4]';
    $new_div.find('textarea.time').each(function () {
        $(this).mask("29:59", {placeholder: "__:__", autoclear: false});
    });
    // $new_div.find('textarea.weeks').each(function () {
    //     $.mask.definitions['z'] = '[1-9]';
    //     $(this).mask("5z-5z", {placeholder: "__-__"});
    //
    // });
}


// TODO сделать ещё для случая ресайза окна, чтобы автоматом тоже поле устанавливалолсь
// отвечает за ресайз полей textarea
// при передаче одного аргемента уст. истинный размер
function resizeArea($this_textarea, minHeight, maxHeight) {
    var $area = $this_textarea;
    var $area_hidden = $('.comment_text_hidden');
    $area_hidden.css('width', $area.width());
    var text = '';
    var strings = $area.val().toString().replace(/[<>]/g, '_').split("\n");

    //эти два условия нужны чтобы добавить дополнительные символы в псевдо строку,
    // чтобы поле  увеличивалось чуть раньше
    if (minHeight != undefined && !$this_textarea.hasClass('time') && !$this_textarea.hasClass('weeks')) {
        strings[0] = "XXXX" + strings[0];
    }
    else {
        strings[0] = strings[0].slice(1);
    }
    for (var i = 0, ln = strings.length; i < ln; i++) {
        text = text + '<div>' + strings[i].replace(/\s\s/g, ' &nbsp;') + '&nbsp;</div>' + "\n";
    }

    // небольшой отступ, чтобы поле расширялось раньше
    $area_hidden.html(text);
    // console.log($area_hidden.innerHTML);

    var height = $area_hidden.outerHeight() + 10;

    if (height < +$area.attr('start_height')) {
        height = +$area.attr('start_height');
    }
    // height = Math.min(maxHeight, height);
    // height = Math.max(minHeight, height);
    $area.stop(true, true);
    $area.animate({'height': height}, 10);
}


// Позволяет перемещаться по редактированию расписания при помощи кнопок вверх вниз
function focusFieldWithKeys($this_field, $this_str, e) {
    if (e.which == 40) {
        $this_str.next().find('li').each(function () {
            var $this_iter_field = $(this).children().first();
            if ($this_iter_field.attr('num') == $this_field.attr('num')) {
                setDefaultStr($this_str);
                $this_field.blur();
                $this_iter_field.focus();
            }
        });
    }
    if (e.which == 38) {
        $this_str.prev().find('li').each(function () {
            var $this_iter_field = $(this).children().first();
            if ($this_iter_field.attr('num') == $this_field.attr('num')) {
                setDefaultStr($this_str);
                $this_field.blur();
                $this_iter_field.focus();
            }
        });
    }
}


function openTextareaDropList($this_field) {
    if ($this_field.hasClass('drop_is')) {
        $('.drop_list').remove();
    }
    else {
        $this_field.addClass('drop_is', 'drop_is');
        $.getScript("/static/scripts/script_droplists_plan_editing.js", function () {
            // ипорт функции для выпадающих списков у полей.
            // делаем услования, чтобы дроп лист больше не открывался при 2 клике на поле
            createDropLst($this_field);
        });
    }
}


// фукнция для Input отдеальная, потому что это type="button"
// и смысл появления дроп листа и оформления нажатия у них другой
function openInputDropList($this_field) {
    if ($this_field.hasClass('drop_is')) {
        $('.drop_list').remove();
        $this_field.removeClass('drop_is');
        if ($this_field.is(':hover')) {
            $this_field.css({'background': '#e6ccff'});
        }
        else {
            $this_field.css({'background': 'rgba(255,255,255,0)'});
        }
    }
    else {
        $this_field.css('background', '#deb7ff');
        $this_field.addClass('drop_is', 'drop_is');
        createDropLst($this_field);

    }
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


// действия при нажатии на enter
function enterPressAction() {
    var $active_field = $(document.activeElement);
    $active_field.blur();
    setDefaultStr($active_field.parents('.str_plan.change'));
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
            setColorStrWhenCheckbox($this_str);
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
function showTopCheckboxInNotEmptyDays() {
    let $days_content = $('.day_plan_content');
    $days_content.each(function () {
        let $str_plans = $(this).find('.str_plan.change');
        if ($str_plans.length >= 1) {
            let $this_checkbox = $(this).find('.checkbox_wrap');
            setCheckBoxVisible($this_checkbox, 'only_effect');
        }
    });
}

function setCheckBoxInvisible($general_checkbox) {
    let $this_checkbox = $general_checkbox.find('.checkbox_container');
    $this_checkbox.fadeTo(100, 0);
    $this_checkbox.css('cursor', 'default');
    $general_checkbox.off();
    $general_checkbox.css('cursor', 'default');
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
        // var week_start, week_end;
        // week_start = getRandomInt(1, 10);
        // week_end = getRandomInt(week_start + 1, 18);
        // return week_start + '-' + week_end;
        return "1-16";
    }
    if ($this_field.hasClass('time')) {
        // var time_hours, time_minutes_dec;
        // time_hours = getRandomInt(8, 15);
        // if (time_hours < 10) {
        //     time_hours = '0' + time_hours;
        // }
        // time_minutes_dec = getRandomInt(0, 5);
        // return time_hours + ":" + time_minutes_dec + "0";
        return "hh:mm";
    }
    if ($this_field.hasClass('subject'))
    // return subjects[getRandomInt(0, subjects.length)];
        return "Тервер";
    if ($this_field.hasClass('teacher'))
    // return teachers[getRandomInt(0, teachers.length)];
        return "Колмогоров А. Н.";
    if ($this_field.hasClass('place'))
    // return places[getRandomInt(0, places.length)];
        return "Л-1";
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
function hoverSelectStr($this_str, mode) {
    if (mode == 'ease_us') {
        $this_str.find('ul').animate({'border-color': borderColorSelectStr});
        return;
    }
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
            // console.log("ВЫЗОВ");
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
    let $this_checkbox = $(checkboxes[i]);
    let $this_str = $this_checkbox.parents('.str_plan');
    let $this_day_block = $this_str.parents('.day_plan_content');
    // дублируем каждую следующую запись, только если успешно продублирована предыдущая
    // alert($this_checkbox + " " + i + " " + n);
    if (i != undefined && n != undefined && i < n) {

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
            setColorStr($this_day_block);
        }, 600);

    }
}

// выполнение стилей и эффектов после успешного удаления строки с сервера

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
            var $general_checkbox = $this_plan.find('.general_checkbox');

            if ($this_plan.find('.str_plan.change').length == 0) {
                setCheckBoxInvisible($general_checkbox);
            }

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
            // alert(response);
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
        // dataType: 'json',
        error: function (jqXHR, textStatus, errorThrown) {
            alert('Ошибка! Новая запись не будет сохранена! Обновите страницу. (');
            // console.log(jqXHR);
            console.log(textStatus);
            // console.log(errorThrown);
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
    $(this).css('background', 'black');
    var $this_day_block = $(checkboxes[0]).parents('.day_plan_content');
    checkboxes.each(function (i) {
        let $this_str = $(this).parents('.str_plan');
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
                setColorStr($this_day_block);
            }, 500);
            return false;
        }
    });
}

// визуально дублируем строку, если получен ответ от сервера
function callback_clone(data, $this_str, mode) {
    var $new_div = $($NEW_STR_PLAN_HTML).clone();
    // чтобы анимация работала правильно для любой высоты блока
    $this_str.stop(true, true);
    $new_div.stop(true, true);

    appendNewStrAnimation($new_div, $this_str);
    $new_div.find('.weeks').val(data['weeks']);
    $new_div.find('.time').val(data['time']);
    $new_div.find('.subject').val(data['subject']);
    $new_div.find('.teacher').val(data['teacher']);
    $new_div.find('.place').val(data['place']);
    if (!data['parity']) {
        data['parity'] = "Все";
    }
    $new_div.find('.parity').val(data['parity']);
    $new_div.attr('id', 0);


    // преобразовываем поля input в a для всех новых полей
    // и устанавливаем плэйсхолдеры, которые были на строке дублирования
    var $new_textareas = $new_div.find('ul li textarea');
    var $old_textareas = $this_str.find('ul li textarea');
    $new_textareas.each(function (i) {
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
    parity = get_parity_value($this_str.find('.parity').val());

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
    // console.log(value);
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


function setColorStrDayBlock($day_block) {
    $day_block.each(function () {
        $(this).find('.str_plan.change').each(function (i) {
            if ($(this).hasClass('warning_str') || $(this).hasClass('clone_str') || $(this).hasClass('marked')) {
                return true;
            }
            if (i % 2 == 0) {
                $(this).delay(10 * i).animate({'background-color': backgroundColorOddStr}, time_color);
                $(this).find('ul').delay(10 * i).animate({'background-color': backgroundColorOddStr}, time_color);
            }
            else {
                $(this).delay(10 * i).animate({'background-color': backgroundColorEvenStr}, time_color);
                $(this).find('ul').delay(10 * i).animate({'background-color': backgroundColorEvenStr}, time_color);
            }
        })
    });
}

// устанвалвает цвет для нечётных строк таблицы расписания
function setColorStr($this_day_block) {
    $this_day_block.each(function () {
        setColorStrDayBlock($(this));
    });
}

function setColorStrWhenCheckbox($this_str) {
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

function appendNewStrAnimation($new_div, $insert_after_this) {
    $new_div.insertAfter($insert_after_this);
    $new_div.slideToggle(200);
    $new_div.fadeTo(200, 1);
    console.log($new_div);
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
        setColorStr($this_block);
    }, 800);

    //если до этого в текущем дне не было ни одной строки, то при добавлении первой показываем чекбокс сверху
    clearTimeout(timer_setVisibleTopCheckbox);
    timer_setVisibleTopCheckbox = setTimeout(function () {
        var $this_plan = $new_div.parents('.plan_window');
        if ($this_plan.find('.str_plan.change').length == 1) {
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


// Валидация полей
function validateField(field) {
    /*
     *  Функция в зависимости от предназначения поля
     *  будет осуществлять валидацию каждого введенного символа
     */
    // var timePatt1 = /^(([0,1])|(2))$/;
    // var timePatt2 = /^(([0,1][0-9])|(2[0-3]))$/;
    // var timePatt3 = /^(([0,1][0-9])|(2[0-3])):$/;
    // var timePatt4 = /^(([0,1][0-9])|(2[0-3])):[0-5]$/;
    // var timePatt5 = /^(([0,1][0-9])|(2[0-3])):[0-5][0-9]$/;
    var weekPatt1 = /^([1-9])$/;
    var weekPatt2 = /^([1-9]-)|([1-4][0-9])|([5][0-2])$/;
    var weekPatt3 = /^([1-9]-[1-9])|([1-4][0-9]-)|([5][0-2]-)$/;
    var weekPatt4 = /^([1-9]-[1-4][0-9])|([1-4][0-9]-[1-9])|([5][0-2]-[1-9])|([1-9]-[5][0-2])$/;
    var weekPatt5 = /^([1-4][0-9]-[1-4][0-9])|([5][0-2]-[1-4][0-9])|([1-4][0-9]-[5][0-2])|([5][0-2]-[5][0-2])$/;
    var subjectPatt = /^[a-zA-Zа-яА-Я0-9 -]*$/;
    var content = field.val();
    var length = content.length;

    // if (field.hasClass('time')) {
    //     if (length == 1) {
    //         if (content.search(timePatt1) == -1) {
    //             delExtraSymbols(field, 0);
    //         }
    //     } else if (length == 2) {
    //         if (content.search(timePatt2) == -1) {
    //             delExtraSymbols(field, 1);
    //         }
    //     } else if (length == 3) {
    //         if (content.search(timePatt3) == -1) {
    //             delExtraSymbols(field, 2);
    //         }
    //     } else if (length == 4) {
    //         if (content.search(timePatt4) == -1) {
    //             delExtraSymbols(field, 3);
    //         }
    //     } else if (length == 5) {
    //         if (content.search(timePatt5) == -1) {
    //             delExtraSymbols(field, 4);
    //         }
    //     } else if (length > 5) {
    //         delExtraSymbols(field, 5);
    //     }
    // }
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
            delExtraSymbols(field, 100);
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

function shareButtonAction() {
    var $textarea = $('.mailing').find('textarea');
    day = $(this).parents('plan_window').attr('day_num');
    console.log(day);
    storageKey = day + $('.title_content').attr('plan_id');

    blurElement('.effect_blur', 4);
    $('.cover_all').fadeIn(800);
    $('.mailing_wrap').delay(300).fadeIn(500);
    $('.mailing').slideToggle(800, 'easeInOutBack').css({'display': 'flex'});

    if ('key' in localStorage) {
        $textarea.val(localStorage[storageKey]);
    }

    $textarea.off();
    $textarea.on('input', function () {
        var thisTextArea = $(this);

        localStorage.setItem(storageKey, thisTextArea.val());

        var timerInputId = setInterval(function () {
            validateTextArea(thisTextArea);
        }, 50);

        setTimeout(function () {
            clearInterval(timerInputId);
        }, 500);
    });
}