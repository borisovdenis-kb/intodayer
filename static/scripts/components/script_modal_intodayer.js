/**
 * Created by Alexey on 17.08.2017.
 */


// Эти переменные хранят html модальных окон
// Они загружаются вместе html код, который открывается один раз, при открытие страницы (для каждого модального окна)

    // При добавлении новых модальных окон нужно сделать следующее
    // 0. Создать сам html шаблон модального окна (поместить его изначально на старницу)
    // 1. Добавить новую глобальную переменную, которая будет хранить html код модального окна (который перый раз загружается вместе со страницей)
    // 2. Добавить соответствующий код в функции loadSpecialModalType и setModalProperties


var modal_confirm_role;
var modal_delete_participant;
var modal_elder_leave;




$(document).ready(function () {

    modal_confirm_role = $(".in_modal_fade[modal_type=confirm_role]").html();
    modal_delete_participant = $(".in_modal_fade[modal_type=delete_participants]").html();
    modal_elder_leave = $(".in_modal_fade[modal_type=elder_leave]").html();
    // alert(modal_elder_leave);
    $(".in_modal_fade").remove();

});

var pause_time = 100;


function test() {
    this.a = 100;
}


class simpleModal {
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
        // отвечает за задний фон
        this.setInitListeners();
    }

    setInitListeners() {
    }

    showModal($click_elem) {
        // var modal_window = modal_fade.find('.in_modal_body');var modal_fade = $(".in_modal_fade[modal_type='" + m_type + "']")
        // получаем модальное окно определённого типа
        // при нажании на "изменить пароль" получаем окно типа oldPassword
        // $('body').append("<div class='in_modal_fade'></div>");
        //загрузка html кода модального окна на страницу
        // loadSpecialModalType(m_type);
        this.modalInit();

        this.$modal_fade.clearQueue();
        this.$modal_body.clearQueue();

        this.$modal_body.delay(pause_time).queue(function () {
            $(this).css({
                'transform': 'scale(1.4, 1.4)',
                'opacity': 1
            });

            // навешивает обработчики событий на конкретный тип модального окна
            // setModalProperties(m_type, $click_elem);

            $(this).dequeue();
        });
        this.$modal_fade.show().delay(pause_time).queue(function () {
            $(this).css({
                'opacity': 1
            });
            $(this).dequeue();
        });
        $(document).unbind('click');
        $(document).click(function (event) {
            let self = this;
            if ($(event.target).children(this.$modal_body).length === 1) {
                self.hideModalWindow();
                self.hideModalFade();
            }
        });
    }

    hideModalWindow(scale_size, opacity_size) {
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

    hideModalFade() {
        this.$modal_fade.clearQueue();

        this.$modal_fade.queue(function () {
            $(this).css({
                'opacity': 0
            });
            $(this).dequeue();
        }).delay(400).queue(function () {
            $(this).hide();
            this.$modal_fade.empty();
            $(this).dequeue();
        });
    }
}


function showModal(m_type, $click_elem) {
    // var modal_window = modal_fade.find('.in_modal_body');var modal_fade = $(".in_modal_fade[modal_type='" + m_type + "']")
    // получаем модальное окно определённого типа
    // при нажании на "изменить пароль" получаем окно типа oldPassword
    $('body').append("<div class='in_modal_fade'></div>");
    //загрузка html кода модального окна на страницу
    loadSpecialModalType(m_type);

    let $modal_fade = $(".in_modal_fade");
    let $modal_window = $(".in_modal_body");

    $modal_window.clearQueue();
    $modal_fade.clearQueue();

    $modal_window.delay(pause_time).queue(function () {
        $(this).css({
            'transform': 'scale(1.4, 1.4)',
            'opacity': 1
        });

        // навешивает обработчики событий на конкретный тип модального окна
        setModalProperties(m_type, $click_elem);

        $modal_window.dequeue();
    });
    $modal_fade.show().delay(pause_time).queue(function () {
        $(this).css({
            'opacity': 1
        });
        $(this).dequeue();
    });
    $(document).unbind('click');
    $(document).click(function (event) {
        if ($(event.target).children(".in_modal_body").length == 1) {
            hideModalWindow();
            hideModalFade();
        }
    });
}

function loadSpecialModalType(m_type) {
    let $modal_fade = $(".in_modal_fade");

    if (m_type == 'modal_set_admin') {
        $modal_fade.html(modal_confirm_role);
    }
    if (m_type == 'modal_delete_part') {
        $modal_fade.html(modal_delete_participant);
    }
    if (m_type == 'modal_elder_leave') {
        $modal_fade.html(modal_elder_leave);
    }

}

function setModalProperties(m_type, $click_elem) {
    // если вызвано модальное окно назанчения прав
    if (m_type == 'modal_set_admin') {
        $('#btn_ok').unbind();
        $('#btn_ok').click(function () {
            setRoleServer($click_elem, 'admin');
        });
        $('#btn_no').unbind();
        $('#btn_no').click(function () {
            hideModalWindow();
            hideModalFade();
        });
    }

    // если вызвано модальное окно удаления участника
    if (m_type == 'modal_delete_part') {
        $('#btn_ok').unbind();
        $('#btn_ok').click(function () {
            removeParticipantServer($click_elem);
        });
        $('#btn_no').unbind();
        $('#btn_no').click(function () {
            hideModalWindow();
            hideModalFade();
        });
    }

    if (m_type == 'modal_elder_leave') {
        $('#btn_no').unbind();
        $('#btn_no').click(function () {
            hideModalWindow();
            hideModalFade();
        });
    }
}

function hideModalWindow(scale_size, opacity_size) {
    if (!scale_size) {
        scale_size = 0.5;
        opacity_size = 0;
    }
    $(".in_modal_body").clearQueue();
    $(".in_modal_body").queue(function () {
        $(this).css({
            'transform': 'scale(' + scale_size + ', ' + scale_size + ')',
            'opacity': opacity_size
        });
        $(this).dequeue();
    });
}

function hideModalFade() {
    $(".in_modal_fade").clearQueue();

    $(".in_modal_fade").queue(function () {
        $(this).css({
            'opacity': 0
        });
        $(this).dequeue();
    }).delay(400).queue(function () {
        $(this).hide();
        $(".in_modal_fade").remove();
        $(this).dequeue();
    });
}