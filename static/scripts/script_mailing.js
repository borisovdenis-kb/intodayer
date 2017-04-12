

// удалить все клоссы check_box_wrap
// у всех блоков с классом weeks border left прозрачный

var imageData, timer;

$(document).ready(function () {

    $('.share_button').click(function () {
        blurElement('.effect_blur', 4);
        $('.cover_all').fadeIn(800);
        $('.mailing_wrap').delay(300).fadeIn(500);
        $('.mailing').slideToggle(800, 'easeInOutBack').css({'display': 'flex'});
    });

    $('.mailing_close').click(function () {
        blurElement('.effect_blur', 0);
        $('.mailing').slideToggle(800, 'easeInOutBack');
        $('.mailing_wrap').delay(400).fadeOut(500);
        $('.cover_all').delay(400).fadeOut(800);
        $('.maiiling_footer').text('Изображение можно загузить в формате jpg, png или gif.');
    });

    $('.do_mailing_button').click(function() {

        var $elem = $(this).parent().parent().parent();
        var $clone = $elem.clone(); // plan_content
        var $KLOSS = $('.KLOSS');
        var $textarea = $(this).parent().parent().find('textarea');
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
                data.text = $textarea.val();
                data.plan_id = $('.title_content').attr('plan_id');

                imageData = undefined;
                $KLOSS.find($clone).remove();

                $('.progress').css({'display': 'flex'});

                $.ajax({
                    url: '/mailing',
                    type: 'POST',
                    data: data,
                    success: function (msg) {
                        msg = JSON.parse(msg);
                        $('.progress').css({'display': 'none'});
                        $('.mailing_close').trigger('click');
                        $textarea.val('');
                    }
                });

                clearInterval(timer);
            }
        }, 100);
    });
});


function htmlToImage($elem) {
    /*
     *  Функция конвертирует блок HTML в изображение
     *  И отправляет на сервер.
     */

    html2canvas($elem, {
        onrendered: function (canvas) {
            imageData = canvas.toDataURL("image/png");

            $("#btn-Convert-Html2Image").attr("download", "your_pic_name.png").attr("href", imageData);
        }
    });
}
