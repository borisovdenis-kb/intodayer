// TODO: Лех, расписание косячно работает. Надо разобраться в чем проблема.

// важная переменная, определяющая последнюю выбранную строку
var $LAST_SELECTED_STR;

function startBaseFunctions() {
    deleteTopCheckboxInEmptyDays();
    setColorStr();
}


var thisInput;
var timerInputId;

$(window).resize(function () {
    var $active_elem = $(document.activeElement);
    if ($active_elem.get(0).tagName == 'BODY') {
        blurSelectStr();
        $('.parityOpen').css({'background-color': 'rgba(255,255,255,0)'});
        $('.parityOpen').removeClass('selected_field');
        $('selected_field').removeClass('selected_field');
    }
    else {
        setDefaultStr($(document.activeElement).parents('.str_plan.change'));
        $(document.activeElement).blur();
    }
});

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
        setStrPlaceholders($(this));
        setNewListenersSpecial($(this));
        setNewListenersNewStr($(this));
    })
});


// устанавливаем обработчик при нажатии на плюс
$('.plus_button_form').click(function () {
    appendPlanStr($(this));
});
//
// $(window).resize(function () {
//    $('.selected_field').each(function () {
//       $(this).css({'height': $(this).parent().parent().height()});
//    });
// });
// если мы нажимаем не на строки расписания и не на поля ввода, то снимаем выделение с активных
$(window).on('mousedown', function (event) {

    $('.parityOpen').css({'background-color': 'rgba(255,255,255,0)'});
    $('.parityOpen').removeClass('selected_field');
    $('selected_field').removeClass('selected_field');

    if (event.button == 0 || event.button == 2 || event.button == 1) {
        var $this_obj = $(event.target);
        var tag_name = $this_obj.get(0).tagName.toUpperCase();
        // console.log($this_obj.parents('.drop_list').attr('class'));
        if ($this_obj.attr('class') != 'drop_list' && $this_obj.parents('.drop_list').attr('class') != 'drop_list') {
            $('.drop_list').remove();
        }

        if (tag_name != 'A' && tag_name != 'LI' && tag_name != 'INPUT') {
            blurSelectStr();
        }
    }
});
//
// $(window).mousedown(function (event) {
//     if (event.target === $('html')[0] && event.clientX >= document.documentElement.offsetWidth){
//         event.preventDefault();
//     }
// });


// при нажатии на enter меняет поле на следующее
$(window).on('keyup', function (e) {
    if (e.which == 13) {
        $('.parityOpen').css({'background-color': 'rgba(255,255,255,0)'});
        var $this_field = $(e.target);
        enterPressAction($this_field);
    }
});


// TODO Разобраться как можно отследить изменение или удаление (например класса) у объекта DOM - https://toster.ru/q/217999
// var origFn = $.fn.removeClass;
// $.fn.removeClass = function (className) {
//     var this_remove_class = arguments[0];
//     console.log(className);
//     if (this_remove_class == 'selected_field') {
//         setTimeout(function () {
//             $('.drop_list').remove();
//         }, 200);
//
//     }
//
//     origFn.apply(this, arguments);
// };

// TODO Сделать действие для Tab
// $(window).on('keyup', function (e) {
//     // return false;
//     // e.preventDefault();
//     // e.stopPropagation();
// });


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


// обаботчики, которые устанавливаются единожды, при добавлении новой строки
// нужно для того, чтобы, к примеру, не глючили чекбоксы
var timer_delete_drop_list;
function setNewListenersNewStr($new_div) {
    // Обработчики событый, применяемые к каждой строке расписания
    var $new_inputs = $new_div.find('ul li input');
    var $new_a = $new_div.find('ul li a');


    // сбрасываем все обработчики (так как постоянно их заново ставим)
    $new_div.off();
    $new_a.off();
    $new_inputs.off();

    //редактировать поле при нажатии на него
    $new_a.on('click', function () {
        editField($(this));
    });
    $new_a.each(function () {
        if ($(this).hasClass('parity')) {
            $(this).on('click', function () {
                $(this).addClass('selected_field');
                $(this).css('background', 'rgba(139, 29, 235, 0.4)');
            });
            $(this).on('mouseover', function () {
                $(this).css('cursor', 'pointer');
            });
        }
    });

    // важный обработчик событий , срабатывает, когда поле Input расфокусирвоано
    $new_inputs.focusout(function (e) {
        // $('.drop_list').remove();

        if (!$(this).hasClass('selected_field')) {
            $(this).removeClass('selected_field');
        }

        var $this_str = $(this).parent().parent().parent();
        setEditedField($(this));
        if (!$this_str.hasClass('selected_str')) {
            setDefaultStr($this_str);
        }

    });

    //при нажатии на другое поле снять выделение с текущей строки
    //если другое поле находится в этой же строке, то не снимаем выделение
    $new_div.on('click', function () {
        if (!$LAST_SELECTED_STR) {
            $LAST_SELECTED_STR = $(this);
        }
        if ($LAST_SELECTED_STR && !$LAST_SELECTED_STR.is($(this)) && $LAST_SELECTED_STR.hasClass('selected_str')) {
            setDefaultStr($LAST_SELECTED_STR);
        }
        $LAST_SELECTED_STR = $(this);
    });

    // при нажатии правой кнопкой мыши на полях, они расфокусируеются только в случае, если нажато другое поле str_plan
    // также чтобы корректно работали нажатия колёсиком мышки и поле осталось сфокусированным
    $new_div.on('mousedown', function (e) {
        var $this_str = $(this);
        setSelectStr($this_str);
        if (!$LAST_SELECTED_STR) {
            $LAST_SELECTED_STR = $this_str;
        }
        if (e.which == 3) {
            if (!$LAST_SELECTED_STR.is($this_str)) {
                setDefaultStr($LAST_SELECTED_STR);
            }
        }
    });

    $new_inputs.click(function (e) {
        // $(this).parent().css('background', 'black');
        var $li_parent = $(this).parent();
        var $this_str = $(this).parent().parent().parent();
        $this_str.addClass('selected_str');
        var $this_field = $(this);
        $this_field.addClass('selected_field');

        $.getScript("/static/scripts/script_drop_lists_plan.js", function () {
            // ипорт функции для выподающих списков у полей.
            // делаем услования, чтобы дроп лист больше не открывался при 2 клике на поле
            //   createDropLst($this_field);
            if (!$this_field.hasClass('drop_is') && $this_field.val() == "") {
                createDropLst($this_field);
                $this_field.addClass('drop_is');
            }
            else {
                $this_field.removeClass('drop_is');
            }
        });
    });

    // отвечает за выделение строки при наведении
    $new_div.hover(function () {
        hoverSelectStr($(this));
    }, function () {
        hoverDefaultStr($(this));
    });

    $new_inputs.on('keypress', function () {
        $('.drop_list').remove();

        thisInput = $(this);
        timerInputId = setInterval(function () {
            validateField(thisInput);
        }, 50);
        setTimeout(function () {
            clearInterval(timerInputId);
        }, 500);
    });

}



