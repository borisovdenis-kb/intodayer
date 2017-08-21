class SliderModal {
    constructor(modalId) {
        this.modalIdAccess = ".modal_slider_outer" + modalId;
        this.$modal_outer_body = $(this.modalIdAccess);
        //создаём модальное окно заново в DOM
        // html модального окна (нужно, чтобы сбрасывать всю DOM информацию о модальном окне
        this.modal_html = this.$modal_outer_body.html();
        this.$modal_outer_body.empty();
        this.flag_open = false;
    }

    modalInit() {
        // запоминаем компоненты модального окна
        this.$modal_outer_body.append($(this.modal_html));
        this.$close_btn = this.$modal_outer_body.find('.close');
        this.$modal_body = this.$modal_outer_body.find('.modal_slider_body');
        // отвечает за задний фон
        this.$modal_blur = undefined;
        this.setInitListeners();
    }

    showModal() {
        if (this.flag_open) {
            return false;
        }
        this.flag_open = true;
        this.modalInit();
        disableScroll();
        this.$modal_outer_body.delay(300).fadeIn(500);
        this.$modal_body.slideToggle(800, 'easeInOutBack').css({'display': 'flex'});
        $('body').append("<div class='modal_blur'></div>");
        $('.modal_blur').show().delay(50).queue(function () {
            $(this).css('opacity', 0.7);
            $(this).dequeue();
        });

    }

    setInitListeners() {
        let self = this;
        this.$close_btn.click(function () {
            // при нажатии на закрытие удаляем все обработчики повторного закрытия
            $('.modal_blur').off();
            $(this).off();
            self.hideModal();

        });
    }

    setModalListeners() {
        let self = this;
        setTimeout(function () {
            $('.modal_blur').unbind();
            $('.modal_blur').click(function () {
                // при нажатии на закрытие удаляем все обработчики повторного закрытия
                $(this).off();
                self.$close_btn.off();
                self.hideModal();
            });
        }, 1000);
    }

    hideModal() {
        let self = this;
        enableScroll();
        this.$modal_body.slideToggle(800, 'easeInOutBack');
        this.$modal_outer_body.delay(400).fadeOut(500, function () {
            self.$modal_outer_body.empty();
            self.flag_open = false;
        });
        $('.modal_blur').queue(function () {
            $(this).css({
                'opacity': 0
            });
            $(this).dequeue();
        }).delay(500).queue(function () {
            $(this).remove();
            $(this).dequeue();
        });
    }
}

class SliderModalAva
    extends SliderModal {
    modalInit() {
        super.modalInit();
        this.$modal_footer = this.$modal_outer_body.find('.modal_slider_footer p');
        this.$upload_btn = this.$modal_outer_body.find('.file_upload');
        this.$send_btn = this.$modal_outer_body.find('.send_button');
        this.$input_file_field = this.$modal_outer_body.find('#id_image_file');

    }

    showModal() {
        super.showModal();
        this.setModalListeners();
    }

    setModalListeners() {
        super.setModalListeners();
        let self = this;

        this.$send_btn.unbind();
        this.$send_btn.click(function () {
            self.sendFile(
                '#id_image_file',
                '/upload_plan_avatar',
                $('.ava_content p').text(),
                '.ava_content'
            );
        });
        this.$input_file_field.unbind();
        this.$input_file_field.on('change', function () {
            self.getFileName();
        });
    }

    getFileName() {
        /*
         *  Функция выводит имя выбранного файла
         *  Причем обрезая до 20 последних символов.
         */
        let fileName = document.getElementById('id_image_file').files[0].name;
        let dots = '';

        if (fileName.length > 30) {
            dots = '...';
        }

        this.$modal_footer.text('Выбранный файл: ' + dots + fileName.slice(-30));
        this.$modal_footer.css({'color': '#000000'});
        this.$upload_btn.hide();
        this.$send_btn.show();
    }

    sendFile(form, address, plan_id, update_avatar) {
        /*
         *  Функция посылает на сервер выбранную пользователем аватарку.
         *  Перед отправкой приозводит валидацию на тип и размер файла.
         *  form: id формы, с коротой приосходит отправка
         *  address: /upload_user_avatar или /upload_plan_avatar
         *  update_avatar: элемент, в котором нужно обновить background-image
         */
        let allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        let currentType = document.getElementById('id_image_file').files[0].type;
        let maxFileSizeByte = 2 * 1024 * 1024;
        let self = this;

        // проверяем, что файл - изображение
        if (allowedTypes.indexOf(currentType) !== -1) {
            // проверяем, что размер файла <= 2 Мб
            if (getFileSize('#id_image_file') <= maxFileSizeByte) {
                let data = new FormData;
                let get_ava_data = {plan_id: $(update_avatar).find('p').text()};

                data.append('avatar', $(form).prop('files')[0]);
                data.append('plan_id', plan_id);

                $.ajax({
                    url: address,
                    data: data,
                    type: 'POST',
                    processData: false,
                    contentType: false,
                    success: function () {
                        $.getJSON('/get_avatar', get_ava_data, function (data) {
                            $(update_avatar).css({'background-image': 'url(' + data.plan_avatar_url + ')'})
                        });
                        self.hideModal();
                    }
                });
            } else {
                this.$upload_btn.show();
                this.$send_btn.hide();
                this.$modal_footer.css({'color': '#FF6068'});
                this.$modal_footer.text('Разрешено загружать файлы размером не больше 2 Мб!');
            }
        } else {
            this.$upload_btn.show();
            this.$send_btn.hide();
            this.$modal_footer.css({'color': '#FF6068'});
            this.$modal_footer.text('Изображение можно загрузить в формате jpg, png или gif.');
        }
    }
}


class SliderModalShare extends SliderModal {
    modalInit(){
        super.modalInit();
        this.text_share = this.$modal_body.find('.text_share');

    }
    showModal() {
        super.showModal();
        super.setModalListeners();
    }
    setModalListeners(){
        super.setModalListeners();

    }
    hideModal(){
        super.hideModal();
        this.text_share.fadeTo(300,0);
    }

}

function getFileSize(inputFileId) {
    /*
     *  Функция возвращает размер файла в байтах
     *  inputFile: id элемента input
     */
    let fileInput = $(inputFileId)[0];

    return fileInput.files[0].size;
}


function avatarEditAccess(data) {
    /*
     *  data - словарь (возможные ключ: plan_id)
     */
    $.getJSON('/get_avatar', data, function (msg) {
        $('.ava_content').css({'background-image': 'url(' + msg.plan_avatar_url + ')'});
    });
}

var modal_ava = new SliderModalAva('#modal_ava');
var modal_share = new SliderModalShare('#modal_share');

