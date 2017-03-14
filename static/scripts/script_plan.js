/**
 * Created by Alexey on 12.03.2017.
 */

$(document).ready(function () {

    delete_empty_days();


});


$('.plus_button_form').click(function () {
    add_plan_str($(this));
});


// удаляет пустные дни (дни в которых нет ничего ни разу за год)
function delete_empty_days() {
    var $days_content = $('.plan_content');
    $days_content.each(function () {
        var $str_plans = $(this).find('.str_plan');
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
    var $new_div = $('<div class="str_plan" style="opacity:0">' +
        '<ul>' +
        '<li><a>empty</a></li>' +
        '<li><a>empty</a></li>' +
        '<li><a>empty</a></li>' +
        '<li><a>empty</a></li>' +
        '<li><a>empty</a></li>' +
        '</ul>' +
        '</div>');

    
    var $plus_button = $this_block.find('.str_plus');
    $plus_button.fadeOut(0);
    $this_block.append($new_div);
    $new_div.fadeTo(200,1);
    $this_block.animate({'height':$this_block.height() + $str_height},200, function () {
        $this_block.append($plus_button.fadeIn(150));
        $this_block.animate()
    });
}