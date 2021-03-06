
var imageData, timer, day, storageKey;

$(document).ready(function () {


    $('.do_mailing_button').click(function() {

        var $elem, $clone;
        var $KLOSS = $('.KLOSS');
        var $textarea = $(this).parent().parent().find('textarea');
        var data = {};

        $.each($('.plan_window'), function() {
            if ($(this).attr('day_num') == day){
                $elem = $(this);
            }
        });

        $clone = $elem.clone();

        // убираем лишние элементы
        $.each($clone.find('.checkbox_wrap'), function () {
            $(this).remove();
        });

        $clone.find('.delete_row').remove();
        $clone.find('.clone_row').remove();
        $clone.find('.share_button').remove();
        $clone.find('.plus_button').remove();

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
                $('.progress_indicator').css({'display': 'flex'});

                $.ajax({
                    url: '/mailing',
                    type: 'POST',
                    data: data,
                    success: function (msg) {
                        msg = JSON.parse(msg);
                        $('.progress').css({'display': 'none'});
                        $('.progress_indicator').css({'display': 'none'});
                        $('.mailing_close').trigger('click');
                        localStorage.setItem(storageKey, '');
                        $textarea.val('');
                    },
                    error: function () {
                        $('.progress_indicator').css({'display': 'none'});
                        $('.progress').text('Ошибка. ');
                        $('.progress').append('<a href="/plan">Перезагрузите страницу.</a>');
                    }

                });

                clearInterval(timer);
            }
        }, 100);
    });
});

function validateTextArea(textArea) {
    /*
     *  Функция валидации поля ввода сообщения.
     *  Ограничение на длинну сообщения: 1000 символов.
     */
    if (textArea.val().length > 1000) {
        textArea.val(textArea.val().slice(0, 1000));
    }
}

function htmlToImage($elem) {
    /*
     *  Функция конвертирует блок HTML в изображение
     *  И отправляет на сервер.
     */
    html2canvas($elem, {
        onrendered: function (canvas) {
            imageData = canvas.toDataURL("image/png");
            // $("#btn-Convert-Html2Image").attr("download", "your_pic_name.png").attr("href", imageData);
        }
    });
}
