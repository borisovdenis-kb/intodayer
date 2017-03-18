/**
 * Created by Alexey on 12.03.2017.
 */

$(document).ready(function () {
    setTimeout(function () {
        delete_empty_days();
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
    // var $this_block = $this_window.find('.day_plan_content');
    // $this_block.css('background', 'red');
    var $new_div = $('<div class="str_plan change" style="opacity:0">' +
        '<ul>' +
        '<li><a>empty</a></li>' +
        '<li><a>empty</a></li>' +
        '<li><a>empty</a></li>' +
        '<li><a>empty</a></li>' +
        // не забыть поставить class=last, чтобы потом распознать
        '<li class="last"><a>empty</a></li>' +
        '</ul>' +
        '</div>');


    var $plus_button = $this_block.find('.str_plus');
    $plus_button.fadeOut(0);
    $this_block.append($new_div);
    $new_div.fadeTo(200, 1);
    $new_div.slideDown(200, function () {
        $this_block.append($plus_button.slideDown(150));
    });

    // навешиваем обработчик на новую строку расписания
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
    }, 100);
}

//Редактирование расписания
$('.str_plan.change ul li a').bind('click', function () {
    edit_field($(this));
});

// устанавливает поле для редактирования (при нажатии на него)
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

// $('.str_plan.change').mouseover(function () {
//     set_current_str($(this));
// });
// $('.str_plan.change').mouseout(function () {
//     set_default_str($(this));
// });

// var padding_li = $('.str_plan.change ul li').css('padding');
function set_current_str($this_str) {
     $this_str.clearQueue();
    $this_str.animate({'background-color': 'rgba(50, 50, 50, 0.1)'}, 200);
}

function set_default_str($this_str) {
    $this_str.clearQueue();
    $this_str.css({'background': 'none'}, 100);
}
