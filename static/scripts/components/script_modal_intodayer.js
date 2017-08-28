/**
 * Created by Alexey on 17.08.2017.
 */


// Эти переменные хранят html модальных окон
// Они загружаются вместе html код, который открывается один раз, при открытие страницы (для каждого модального окна)

    // При добавлении новых модальных окон нужно сделать следующее
    // 0. Создать сам html шаблон модального окна (поместить его изначально на старницу)
    // 1. Добавить новую глобальную переменную, которая будет хранить html код модального окна (который перый раз загружается вместе со страницей)
    // 2. Добавить соответствующий код в функции loadSpecialModalType и setModalProperties

var pause_time = 100;

// Базовые стили для модального окна в стиле Intodayer (простое белое модальное окно на потухающем фоне)
class SimpleIntodayerModal {
    constructor(modalId) {
        this.modalIdAccess = ".in_modal_fade" + modalId;
        this.$modal_fade = $(this.modalIdAccess);
        //создаём модальное окно заново в DOM
        // html модального окна (нужно, чтобы сбрасывать всю DOM информацию о модальном окне
        this.modal_html = this.$modal_fade.html();
        this.$modal_fade.empty();
        this.flag_open = false;
    }

    modalInit() {
        // запоминаем компоненты модального окна
        this.$modal_fade.append($(this.modal_html));
        this.$modal_body = this.$modal_fade.find('.in_modal_body');
    }

    __setBaseListeners() {
        let self = this;
        $('#btn_no').click(function () {
            self.hideModal();
        });
        $('.close').click(function () {
           self.hideModal();
        });
        $(document).unbind('click');

        $(document).click(function (event) {
            if ($(event.target).children(self.$modal_body).length === 1) {
                self.hideModal();
            }
        });
    }

    setInitListeners() {
    }

    showModal() {
        let self = this;
        this.modalInit();

        this.$modal_fade.clearQueue();
        this.$modal_body.clearQueue();

        this.$modal_body.delay(pause_time).queue(function () {
            $(this).css({
                'transform': 'scale(1.4, 1.4)',
                'opacity': 1
            });

            $(this).dequeue();
        });
        this.$modal_fade.show().delay(pause_time).queue(function () {
            $(this).css({
                'opacity': 1
            });
            $(this).dequeue();
        });

        this.__setBaseListeners();
    }

    hideModal(scale_size, opacity_size) {
        this.__hideModalWindow(scale_size, opacity_size);
        this.__hideModalFade();
    }

    __hideModalWindow(scale_size, opacity_size) {
        if (!scale_size) {
            scale_size = 0.5;
            opacity_size = 0;
        }
        this.$modal_body.clearQueue();
        this.$modal_body.queue(function () {
            $(this).css({
                'transform': 'scale(' + scale_size + ', ' + scale_size + ')',
                'opacity': opacity_size
            });
            $(this).dequeue();
        });
    }

    __hideModalFade() {
        let self = this;
        this.$modal_fade.clearQueue();

        this.$modal_fade.queue(function () {
            $(this).css({
                'opacity': 0
            });
            $(this).dequeue();
        }).delay(400).queue(function () {
            $(this).hide();
            self.$modal_fade.empty();
            $(this).dequeue();
        });
    }
}

// Модальное окно, когда староста или админ хотят изменить роль участника (на админа или участника)
class ModalConfirmRole extends SimpleIntodayerModal {
    setInitListeners($click_elem, role_str) {
        let self = this;
        $('#btn_ok').unbind();
        $('#btn_ok').click(function () {
            setRoleServer($click_elem, role_str).then(function () {
                self.hideModal();
            }, function () {
                self.hideModal();
            });
        });
    }

    showModal($click_elem, role_str) {
        super.showModal();
        this.setInitListeners($click_elem, role_str);
    }
}

// Модальное окно, когда админ или староста хотят удалить участники (или админа) из расписания
class ModalDeleteParticipant extends SimpleIntodayerModal {
    setInitListeners($click_elem) {
        let self = this;
        $('#btn_ok').unbind();
        $('#btn_ok').click(function () {
            removeParticipantServer($click_elem).then(function () {
                self.hideModal();
            }, function () {
                self.hideModal();
            });
        });
    }

    showModal($click_elem, role_str) {
        super.showModal();
        this.setInitListeners($click_elem);
    }
}

// Модальное окно, когда староста хочет покинуть (удалить) расписание
class ModalElderRemovePlan extends SimpleIntodayerModal {
    setInitListeners($click_elem) {
        let self = this;
        $('#btn_ok').unbind();
        $('#btn_ok').click(function () {
            removePlan().then(function () {
                self.hideModal();
            }, function () {
                self.hideModal();
            });
        });
    }

    showModal($click_elem, role_str) {
        super.showModal();
        this.setInitListeners($click_elem);
    }

}

// Модальное окно, когда участник или админ хочет покинуть расписание
class ModalParticipantLeavePlan extends SimpleIntodayerModal {
    setInitListeners($click_elem) {
        let self = this;
        $('#btn_ok').unbind();
        $('#btn_ok').click(function () {
            removePlan().then(function () {
                self.hideModal();
            }, function () {
                self.hideModal();
            });
        });
    }

    showModal($click_elem, role_str) {
        super.showModal();
        this.setInitListeners($click_elem);
    }
}