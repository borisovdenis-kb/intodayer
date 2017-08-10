/**
 * Created by Максим on 21.07.2017.
 */
$(document).ready(function () {
    $(".about_content").each(function (i) {
        console.log(i);
        $(this).delay(300 * i).fadeTo(1, 200);
    });
});