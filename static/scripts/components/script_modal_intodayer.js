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

// Базовые стили для модального окна в стиле Intodayer (простое белое локаничное модальное окно на затемнённом фоне)
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
        this.$modal_fade.unbind();
        this.$modal_fade.on('keypress', function (e) {
            // при нажатии на Enter
            if (self.flag_open && e.keyCode === 13) {
                self.$modal_fade.find('.enter').trigger('click');
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
        this.flag_open = true;

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

    hideModalNoAnimate() {
        this.$modal_fade.empty();
        this.$modal_fade.fadeTo(1, 0);
    }

    __hideModalWindow(scale_size, opacity_size) {
        this.flag_open = false;
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
                self.hideModalNoAnimate();
            }, function () {
                self.hideModalNoAnimate();
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
            leavePlan().then(function () {
                self.hideModalNoAnimate();
            }, function () {
                self.hideModalNoAnimate();
            });
        });
    }

    showModal($click_elem, role_str) {
        super.showModal();
        this.setInitListeners($click_elem);
    }
}

// Модальное окно изменения пароля
class ModalPassword extends SimpleIntodayerModal {
    modalInit() {
        super.modalInit();
        this.$input_pass = this.$modal_body.find('#pass');
        this.$ok_btn = this.$modal_body.find('#okay');
        this.$modal_title = this.$modal_fade.find('.in_modal_title');
        this.$in_stage_content = this.$modal_fade.find('.in_stage_content');

        this.wrong_color = '#d9534f';
        this.success_color = '#2BBBAD';
    }

    showModal() {
        super.showModal();
        this.$input_pass.focus();
        this.setInitListeners();
    }

}

//переменные для модального окна ввода пароля
var modal_new_pass;
var modal_confirm_new_pass;

var new_pass = "";

$(document).ready(function () {
    modal_new_pass = new ModalPasswordNewPass('#modal_password_new');
    modal_confirm_new_pass = new ModalPasswordNewPassConfirm('#modal_password_new_confirm');
});

// Модальное окно изменения пароля (подтверждение старого пароля)
class ModalPasswordOldPass extends ModalPassword {
    // после подтверждения старого пароля

    setInitListeners() {
        let self = this;
        this.$ok_btn.unbind();
        this.$ok_btn.click(function () {
            if (!self.$input_pass.val()) {
                self.hideModal();
                return false;
            }
            else {
                self.completeOldPass(self.$input_pass.val()).then(function () {
                    self.hideModal(1.5, 0.5);
                    modal_new_pass.showModal();
                }, function () {
                    self.showWrongFrameMessage();
                });
            }
        });
    }

    completeOldPass(old_pass) {
        return new Promise(function (resolve, reject) {
            let data = JSON.stringify({old_password: old_pass});
            console.log(data);
            $.ajax({
                url: '/check_old_password',
                type: 'POST',
                contentType: 'json',
                data: data,
                success: function () {
                    return resolve();
                },
                error: function () {
                    return reject();
                }
            });
        });
    }


    showWrongFrameMessage() {
        // Выводит переданное сообещение (message) внизу формы.
        this.$in_stage_content.text("Текущий и введённый пароли не совпадают");
        this.$in_stage_content.clearQueue();
        this.$in_stage_content.hide().slideDown(100).animate({'color': this.wrong_color}, 200);
    }
}

class ModalPasswordNewPass extends ModalPassword {
    setInitListeners() {
        let self = this;
        this.$ok_btn.unbind();
        this.$ok_btn.click(function () {
            if (validate_password(self.$input_pass.val())) {
                new_pass = self.$input_pass.val();
                self.hideModal(1.5, 0.5);
                modal_confirm_new_pass.showModal();
            }
            else {
                self.showWrongFrameMessage();
            }
        });
    }

    showModal() {
        super.showModal();
        new_pass = "";
    }

    showWrongFrameMessage() {
        // Выводит переданное сообещение (message) внизу формы.
        this.$in_stage_content.text("Пароль должен быть не меньше 8 символов и содержать: заглавные буквы, строчные буквы и цифры.");
        this.$in_stage_content.clearQueue();
        this.$in_stage_content.hide().slideDown(100).animate({'color': this.wrong_color}, 200);

    }
}

class ModalPasswordNewPassConfirm extends ModalPassword {
    setInitListeners() {
        let self = this;
        this.$ok_btn.unbind();
        this.$ok_btn.click(function () {
            if (self.$input_pass.val() === new_pass) {
                self.completeConfirmPass(self.$input_pass.val()).then(function () {
                    self.showSuccessFrameMessage();
                    setTimeout(function () {
                        location.href = '/login';
                    }, 1000);
                }, function () {
                    alert("Ошибка изменения пароля на сервере. Перезагрузите страницу");
                });
            }
            else {
                self.showWrongFrameMessage();
            }
        });
    }

    showWrongFrameMessage() {
        // Выводит переданное сообещение (message) внизу формы.
        this.$in_stage_content.text("Пароли не совпадают.");
        this.$in_stage_content.clearQueue();
        this.$in_stage_content.hide().slideDown(100).animate({'color': this.wrong_color}, 200);

    }

    showSuccessFrameMessage() {
        this.$in_stage_content.text("Пароль успешно измененён!");
        this.$in_stage_content.clearQueue();
        this.$in_stage_content.hide().slideDown(100).animate({'color': this.success_color}, 200);

    }

    completeConfirmPass(new_password) {
        return new Promise(function (resolve, reject) {
            var data = JSON.stringify({new_password: new_password});
            $.ajax({
                url: '/make_new_password',
                type: 'POST',
                contentType: 'json',
                data: data,
                success: function () {
                    return resolve();
                },
                error: function () {
                    return reject();
                }
            });
        });
    }
}


function validate_password(new_pass) {
    let re = /(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;
    return new_pass.search(re) !== -1;
}

