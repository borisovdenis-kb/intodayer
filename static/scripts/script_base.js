
$(document).ready( function() {
    if (location.href.indexOf('invitation') < 0){
        show_invitations();
    } else {
        var confpos = $('.confirmation').offset().top;
    }



    $(window).on('scroll', function() {
        if ($(window).scrollTop() > confpos) {
            // alert('yes');
            $('.confirmation').css({'position': 'fixed', 'top': '0px'});
        } else {
            $('.confirmation').css({'position': 'relative'});
        }
    });

    var curtxt_accept = $('.accept').text();
    var curtxt_reject = $('.reject').text();

    $('.accept').hover(function() {
        $(this).text('');
        $(this).addClass('accept_img');
    }, function() {
        $(this).text(curtxt_accept);
        $(this).removeClass('accept_img');
    });

    $('.reject').hover(function() {
        $(this).text('');
        $(this).addClass('reject_img');
    }, function() {
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
    
    $('.ava_cover_text p').click(function () {
        blurElement('.effect_blur', 4);
        $('.cover_all').fadeIn(800);
        $('.choose_avatar_wrap').fadeIn();
        $('.choose_avatar').slideToggle(800, 'easeOutBounce');
    });

    $('.close').click(function() {
        blurElement('.effect_blur', 0);
        $('.choose_avatar').slideToggle(800, 'easeOutBounce');
        $('.cover_all').delay(100).fadeOut(800);
    });

    // $('.ava_content').hover(function() {
    //     $('.ava_cover').css({'display': 'block'});
    // }, function () {
    //     // $('.ava_cover').css({'display': 'none'});
    // });

    // $('.ava_cover').hover(function() {
    //     $('.ava_cover').animate({opacity: '0.8'}, 500);
    //     // $('.ava_content').addClass('add_blur');
    // }, function() {
    //     $('.ava_cover').animate({opacity: '0'}, 500);
    //     // $('.ava_content').removeClass('add_blur');
    // })

});

function sendImageToServerAjax(element){

    var data = $(element).serialize();

    $.ajax({
        url : '/upload_user_avatar',
        type : 'POST',
        processData: false,
        contentType: false,
        cache:false,
        data : data,
        success : function (msg){
            alert('Success');
        }
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

function show_invitations() {
    $('.for_invitations').load('/get_invitations', function () {
        // $('.from_user_avatar').hover( function() {
        //
        //     var parent = $(this).parent();
        //     var wrap = $(this).siblings('.message_wrap');
        //     var message = $(this).find('.message_wrap .message');
        //
        //     parent.css({
        //         'background-color': '#ffffff',
        //         'box-shadow': '0px 0px 10px 1px rgba(0,0,0,0.2)'
        //     });
        //     wrap.css({'display': 'block'});
        //     message.css({'display': 'block'});
        // }, function(){
        //
        //     var parent = $(this).parent();
        //     var wrap = $(this).siblings('.message_wrap');
        //     var message = $(this).find('.message_wrap .message');
        //
        //     parent.css({
        //         'background-color': 'rgba(255, 255, 255, 0)',
        //         'border': 'none',
        //         'box-shadow': 'none'
        //     });
        //     wrap.css({'display': 'none'});
        //     message.css({'display': 'none'});
        // });
    });
}