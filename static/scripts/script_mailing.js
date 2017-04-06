

// удалить все клоссы check_box_wrap
// у всех блоков с классом weeks border left прозрачный

var imageData, timer;

$(document).ready(function () {

    $('.share_button').click(function() {

        var $elem = $(this).parent().parent().parent();
        var $clone = $elem.clone(); // plan_content
        var $KLOSS = $('.KLOSS');
        var data = {};

        $.each($clone.find('.checkbox_wrap'), function () {
            $(this).remove();
        });

        // $KLOSS.css({'top': '10000px'});
        $KLOSS.append($clone);

        htmlToImage($clone);

        timer = setInterval(function () {
            if (imageData) {
                data.image = imageData;
                imageData = undefined;
                $KLOSS.find($clone).remove();
                clearInterval(timer);

                data.plan_id = $('.title_content').attr('plan_id');

                alert(data.image);

                $.ajax({
                    url: '/mailing',
                    type: 'POST',
                    data: data,
                    success: function (msg) {
                        msg = JSON.parse(msg);
                        alert(msg.success);
                    }
                });
            }
        }, 100);
    });
});


// function planRowsFullProc($elem) {
//     /*
//      *  Функция удаляет лишнее из DIV блока, содержащего
//      *  расписание, тем самы подготавливая его для конвертация
//      *  в изображение.
//      */
//     var $clone = $elem.clone();
//
//     $.each($clone.find('.checkbox_wrap'), function() {
//         $(this).remove();
//     });
//
//     alert($clone.html());
//
//     return $clone;
// }



function htmlToImage($elem) {
    /*
     *  Функция конвертирует блок HTML в изображение
     *  И отправляет на сервер.
     */

    html2canvas($elem, {
        onrendered: function (canvas) {
            imageData = canvas.toDataURL("image/png");
            // imageData.replace("image/png", "image/octet-stream");
            imageData.replace(/^data:image\/png/, "data:application/octet-stream");

            $("#btn-Convert-Html2Image").attr("download", "your_pic_name.png").attr("href", imageData);
            // $("#btn-Convert-Html2Image").trigger('click');

        }
    });
}
