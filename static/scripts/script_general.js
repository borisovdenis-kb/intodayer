$(document).ready(function () {
    setInvitationsListeners();
    $(".repeat_activation_btn").click(function () {
        console.log(('CLICKED'));
        $.ajax({
            url: '/send_activation_link',
            type: 'POST',
            success: function () {
                window.location = "/" + location.href.split("/")[3] + "/activation_link_sent";
            },
            error: function () {
                window.location = "/" + location.href.split("/")[3] + "/to_many_requests";
            }
        });
    });
});


function confirmInvitation(is_accept) {
    /*
     *  is_accept: true/false
     */
    var uuid, data;

    uuid = location.href.split('/');
    uuid = uuid[uuid.length - 1];
    data = JSON.stringify({is_accept: is_accept});

    $.ajax({
        url: '/invitation/confirm/' + uuid,
        type: "POST",
        contentType: "application/json",
        data: data,
        success: function () {
            window.location.href = "/";
        }
    });
}


function setInvitationsListeners() {
    if (location.href.indexOf('invitation') < 0) {
        show_invitations();
    } else {
        var confposTop = $('.confirmation').offset().top;
        var confposLeft = $('.confirmation').offset().left;
    }

    $(window).on('scroll', function () {
        var $confirm_header = $('.confirmation');
        if ($(window).scrollTop() > confposTop) {
            $('.center_page').css({'margin-top': $confirm_header.outerHeight() + 15});
            $('.confirmation').css({'position': 'fixed', 'top': '0px'});
        } else {
            $('.center_page').css({'margin-top': 0});
            $('.confirmation').css({'position': 'relative', 'top': '0'});
        }
    });

    var curtxt_accept = $('.accept').text();
    var curtxt_reject = $('.reject').text();

    $('.accept').hover(function () {
        $(this).text('');
        $(this).addClass('accept_img');
    }, function () {
        $(this).text(curtxt_accept);
        $(this).removeClass('accept_img');
    });

    $('.reject').hover(function () {
        $(this).text('');
        $(this).addClass('reject_img');
    }, function () {
        $(this).text(curtxt_reject);
        $(this).removeClass('reject_img');
    });

    $('.accept').click(function () {
        confirmInvitation(true);
    });

    $('.reject').click(function () {
        confirmInvitation(false);
    });
}


function setInputCursorToEnd($this_input) {
    let val = $this_input.val();
    $this_input.val("");
    $this_input.val(val);
}

// если передан флаг, значит при вызове функции сразу откроются настройки расписания (нужно для create нового расписания)
function switchPlan($this_plan, flag_open_editing) {
    /*
     * Это функция общая для всего приложения.
     * Отвечает за подгрузку и замену данных в right_content при переключении расписания.
     * Какие данные будут подгружаться зависит от того, на какой странице мы находимся.
     * Соответственно обращение на сервер будет происходить вот так:
     * --- /<page_name>/switch_plan
     *
     * Пока возможны всего два варианта:
     * --- /home/switch_plan
     * --- /plan/switch_plan
     * --- /participants/switch_plan
     */

    var data = {plan_id: $this_plan.attr('plan_id')};
    var $this_button = $(this);

    // подгружаем правый контент, изменяем стиль кнопок слева
    var loc = location.href.split('/');
    var address = loc[loc.length - 2];

    $.each($('.right_content').children(), function () {
        if (!$(this).hasClass('plan_load_progres')) {
            $(this).remove();
        }
    });

    $('.plan_load_progres_indicator').css('display', 'flex');
    // alert('/' + address + '/switch_plan');
    $('.right_content').load('/' + address + '/switch_plan', data, function (responseText) {
        $('.plan_load_progres_indicator').css('display', 'none');

        // навешиваем обработчики, учитывая права редактирования пользователей
        if (address === 'plan') {
            rightContentActionsAllUsers();

            if ($('.plan_title').attr('user_has_edit_plan') === 'yes') {
                pushAvaModalClickBlock();
                setAvaModalListeners();
                setListenersAdminRightContent();
            }
            else {
                deleteAvaModalClickBlock();
                userHasNotRightsEdidting();
            }
        }
        if (address === 'participants') {
            setTimeout(function () {
                pushExpectedParticipants();
            }, 200);
            if ($('.plan_title').attr('user_has_edit_role') === 'yes') {
                setAdminParticipantsActions();
            }
        }

        // смена аватарки при изменении расписания
        avatarEditAccess(data);


        // установка цвета левой панели
        jQuery.each($('.plan_list li a'), function () {
            $(this).css({'background-color': 'rgb(244, 243, 248)', 'color': '#000000'})
        });
        $this_button.css({'background-color': '#000000', 'color': '#FFFFFF'});
        // установить выбранный цвет
        var plan_menu = $('.plan_selector').find('[plan_id=' + data.plan_id + ']');
        plan_menu.css({'background': 'black', 'color': 'white'});

        // когда создаём новое расписание открываются настройки
        if (flag_open_editing) {
            localStorage.setItem('new_plan_editing', 'true');
            $('.plan_settings').trigger('click');
        }
        // для того, чтобы если мы только создали расписание, то в настройках кнопка Сохранить сразу активна

    });
}


function createPlan($plus_button) {
    /*
     *  Функция создает новое расписание. Т.е.:
     *  1. Добавляет кнопку в панели переключения расписаний;
     *  2. Создает для данного пользователя в базе "дефолтное" расписание.
     */
    return new Promise(function (resolve, reject) {

        var $new_plan_li, $new_plan_li_a;

        // если мы нажимаем на меню справа, то плюс исчезает на мгновение
        if ($plus_button) {
            $plus_button.fadeTo(50, 0).delay(100).fadeTo(200, 1);
        }

        $.ajax({
            url: '/create_plan',
            type: 'GET',
            dataType: 'json',
            success: function (msg) {
                $('.plan_list').append('<li style="display: none; opacity: 0"><a>No name</a></li>');

                $new_plan_li = $('.plan_list li').last();

                $new_plan_li.slideToggle(200);

                $new_plan_li_a = $new_plan_li.find('a');
                // добавляем этой кнопке в атрибуты id нового расписания
                $new_plan_li_a.attr('plan_id', msg.new_plan_id);

                setTimeout(function () {
                    $new_plan_li.fadeTo(100, 1);
                }, 200);

                setTimeout(function () {
                    // навешиваем возможность переключения
                    $new_plan_li_a.click(function () {
                        switchPlan($(this), true);
                    });
                    // переключаемся на него, иммитируя клик
                    $new_plan_li_a.trigger('click');
                }, 600);
                return resolve();
            },
            error: function () {
                return reject();
            }
        });
    });
}


function blurElement(element, size) {
    var filterVal = 'blur(' + size + 'px)';
    $(element).css({
        'filter': filterVal,
        'webkitFilter': filterVal,
        'mozFilter': filterVal,
        'oFilter': filterVal,
        'msFilter': filterVal,
        'transition': 'all 0.2s ease-out',
        '-webkit-transition': 'all 0.2s ease-out',
        '-moz-transition': 'all 0.2s ease-out',
        '-o-transition': 'all 0.2s ease-out'
    });
}

function showFlexCenter($elem) {
    $elem.css({
        'display': 'flex',
        'align-items': 'center',
        'align-content': 'center',
        'justify-content': 'center'
    });
}


function show_invitations() {
    $('.for_invitations').load('/get_invitations');
}


function preventDefault(e) {
    e = e || window.event;
    if (e.preventDefault)
        e.preventDefault();
    e.returnValue = false;
}

function preventDefaultForScrollKeys(e) {
    // if (keys[e.keyCode]) {
    //     preventDefault(e);
    //     return false;
    // }
}

function disableScroll() {
    if (window.addEventListener) // older FF
        window.addEventListener('DOMMouseScroll', preventDefault, false);
    window.onwheel = preventDefault; // modern standard
    window.onmousewheel = document.onmousewheel = preventDefault; // older browsers, IE
    window.ontouchmove = preventDefault; // mobile
    document.onkeydown = preventDefaultForScrollKeys;
}

function enableScroll() {
    if (window.removeEventListener)
        window.removeEventListener('DOMMouseScroll', preventDefault, false);
    window.onmousewheel = document.onmousewheel = null;
    window.onwheel = null;
    window.ontouchmove = null;
    document.onkeydown = null;
}


// устанавливают стили INPUT валидации
function setInputSuccess($input) {
    $input.prop('validate', true);
    if ($input.next().hasClass('popover')) {
        $input.popover('hide');
    }
    if ($input.next().hasClass('tooltip')) {
        $input.tooltip('hide');
    }

    setInputDefault($input);
    $input.addClass('success_input_validate');
}

function setInputError($input) {
    setInputDefault($input);
    $input.prop('validate', false);
    $input.addClass('error_input_validate');
}

function setInputDefault($input) {
    $input.removeClass('success_input_validate error_input_validate');
}

// некоторые функции валидации
function validatePassword(pass) {
    var regex = /(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;
    return regex.test(pass);
}

function validateEmail(email) {
    var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return regex.test(email);
}

function inputNotEmpty(input_val) {
    if (input_val || input_val !== "") {
        return true;
    } else {
        return false;
    }
}