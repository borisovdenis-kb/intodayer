/**
 * Created by Alexey on 28.04.2017.
 */

$(document).ready(function () {
    setStrColor();
});



function setStrColor() {
    /*
     *  Функция окрашивает нечетные строки таблицы в серый цвет
     */
    $.each($('.day_plan_content'), function () {
        $.each($(this).find('.str_plan'), function (i) {
            if ((i % 2) != 0) {
                $(this).clearQueue();
                $(this).animate({'background-color': 'rgba(240, 240, 245, 1)'});
                $(this).find('ul').clearQueue();
                $(this).find('ul').animate({'background-color': 'rgba(240, 240, 245, 1)'});
            }
        });
    });
}