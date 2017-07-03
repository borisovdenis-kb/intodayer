$(document).ready(function () {
    setInvitationsListeners();
    setAvatarFrameListeners();

});

function setAvatarFrameListeners() {
    $('.ava_cover_text p').click(function () {
        blurElement('.effect_blur', 4);
        $('.cover_all').fadeIn(800);
        $('.choose_avatar_wrap').delay(300).fadeIn(500);
        $('.choose_avatar').slideToggle(800, 'easeInOutBack').css({'display': 'flex'});
    });

    $('.close').click(function () {
        blurElement('.effect_blur', 0);
        $('.choose_avatar').slideToggle(800, 'easeInOutBack');
        $('.choose_avatar_wrap').delay(400).fadeOut(500);
        $('.cover_all').delay(400).fadeOut(800);
        $('.file_upload').css({'display': 'block'});
        $('.send_button').css({'display': 'none'});
        $('.choose_avatar_footer').text('Изображение можно загузить в формате jpg, png или gif.');
    });

    $('.send_button').click(function () {
        sendFile(
            '#id_image_file',
            '/upload_plan_avatar/' + $('.ava_content p').text(),
            '.ava_content'
        );
    });
}

function setInvitationsListeners() {
    if (location.href.indexOf('invitation') < 0) {
        show_invitations();
    } else {
        var confpos = $('.confirmation').offset().top;
    }

    $(window).on('scroll', function () {
        if ($(window).scrollTop() > confpos) {
            $('.confirmation').css({'position': 'fixed', 'top': '0px'});
        } else {
            $('.confirmation').css({'position': 'relative'});
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
        var array = location.href.split('/');

        $.ajax({
            url: '/confirm_invitation',
            data: {'decision': 1, 'plan_id': array[array.length - 1]},
            success: function (msg) {
                blurElement('.effect_blur', 4);
                $('.cover_all p').text('Расписание добавлено');
                $('.cover_all').fadeIn(800);
                $('.cover_all a').delay(1100).fadeIn(0);
                // $('.perform_confirmation').animate({display: 'block'}, 300, 'easeInOutExpo');
            }
        });
    });

    $('.reject').click(function () {
        var array = location.href.split('/');

        $.ajax({
            url: '/confirm_invitation',
            data: {'decision': 0, 'plan_id': array[array.length - 1]},
            success: function (msg) {
                blurElement('.effect_blur', 4);
                $('.cover_all p').text('Приглашение отклонено');
                $('.cover_all').fadeIn(800);
                $('.cover_all a').delay(1100).fadeIn(0);
                // $('.perform_confirmation').animate({display: 'block'}, 300, 'easeInOutExpo');
            }
        });
    });
}



function setInputCursorToEnd($this_input) {
    $this_input.val($this_input.val());
}


function setScrollTop() {
    $('html, body').animate({scrollTop: 0}, 400); //1100 - скорость
}


function switchPlan($this_plan) {
    /*
     * Это функция общая для всего сайта.
     * Отвечает за подгрузку и замену данных в right_content при переключении расписания.
     * Какие данные будут погружаться зависит от того, на какой странице мы находимся.
     * Соответственно обращение на сервер будет происходить вот так:
     * --- /<page_name>/switch_plan
     *
     * Пока возможны всего два варианта:
     * --- /home/switch_plan
     * --- /plan/switch_plan
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

    $('.right_content').load('/' + address + '/switch_plan', data, function () {
        $('.plan_load_progres_indicator').css('display', 'none');
        // навешиваем обработчики
        if (address == 'plan') {
            setListenersTitleBlock();
            setListenersRightContent();
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
    });
}


function createPlan($plus_button) {
    /*
     *  Функция создает новое расписание. Т.е.:
     *  1. Добавляет кнопку в панели переключения расписаний;
     *  2. Создает для данного пользователя в базе "дефолтное" расписание.
     */
    var $new_plan_li, $new_plan_li_a;

    // если мы нажимаем на меню справа, то плюс исчезает на мгновение
    if ($plus_button) {
        $plus_button.fadeTo(50, 0).delay(100).fadeTo(200, 1);
    }

    $.ajax({
        url: '/create_new_plan',
        type: 'GET',
        dataType: 'json',
        success: function (msg) {
            // создаем новую кнопку
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
                    switchPlan($(this));
                });
                // переключаемся на него, иммитируя клик
                $new_plan_li_a.trigger('click');
            }, 600);
        }
    });
}

function getFileName() {
    /*
     *  Функция выводит имя выбранного файла
     *  Причем обрезая до 20 последних символов.
     */
    var fileName = document.getElementById('id_image_file').files[0].name;
    var dots = '';

    if (fileName.length > 30) {
        dots = '...';
    }

    $('.choose_avatar_footer').text('Выбранный файл: ' + dots + fileName.slice(-30));
    $('.choose_avatar_footer').css({'color': '#000000'});
    $('.file_upload').css({'display': 'none'});
    $('.send_button').css({'display': 'block'});
}


function getFileSize(inputFileId) {
    /*
     *  Функция возвращает размер файла в байтах
     *  inputFile: id элемента input
     */
    var fileInput = $(inputFileId)[0];

    return fileInput.files[0].size;
}

function sendFile(form, address, update_avatar) {
    /*
     *  Функция посылает на сервер выбранную пользователем аватарку.
     *  Перед отправкой приозводит валидацию на тип и размер файла.
     *  form: id формы, с коротой приосходит отправка
     *  address: /upload_user_avatar или /upload_plan_avatar
     *  update_avatar: элемент, в котором нужно обновить background-image
     */
    var allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    var currentType = document.getElementById('id_image_file').files[0].type;
    var maxFileSize = 2 * 1024 * 1024; // кол-во байт

    // проверяем, что файл - изображение
    if (allowedTypes.indexOf(currentType) != -1) {
        // проверяем, что размер файла <= 2 Мб
        if (getFileSize('#id_image_file') <= maxFileSize) {
            var data = new FormData;
            var get_ava_data = {plan_id: $(update_avatar).find('p').text()};

            data.append('avatar', $(form).prop('files')[0]);

            $.ajax({
                url: address,
                data: data,
                type: 'POST',
                processData: false,
                contentType: false,
                success: function (msg) {
                    $.getJSON('/get_avatar', get_ava_data, function (msg) {
                        $(update_avatar).css({'background-image': 'url(' + msg.url + ')'})
                    });
                    $('.close').trigger('click');
                    $('#send_avatar_form')[0].reset();
                }
            });
        } else {
            $('.file_upload').css({'display': 'block'});
            $('.send_button').css({'display': 'none'});
            $('.choose_avatar_footer').css({'color': '#FF6068'});
            $('.choose_avatar_footer').text('Разрешено загружать файлы размером не больше 2 Мб!');
            $('#send_avatar_form')[0].reset();
        }
    } else {
        $('.file_upload').css({'display': 'block'});
        $('.send_button').css({'display': 'none'});
        $('.choose_avatar_footer').css({'color': '#FF6068'});
        $('.choose_avatar_footer').text('Изображение можно загрузить в формате jpg, png или gif.');
        $('#send_avatar_form')[0].reset();
    }
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


function show_invitations() {
    $('.for_invitations').load('/get_invitations');
}