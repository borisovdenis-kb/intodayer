
$(document).ready( function() {
    if (location.href.indexOf('invitation') < 0){
        show_invitations();
    }

    var confpos = $('.confirmation').offset().top;

    $(window).on('scroll', function() {
        if ($(window).scrollTop() > confpos) {
            // alert('yes');
            $('.confirmation').css({'position': 'fixed', 'top': '0px'});
        } else {
            $('.confirmation').css({'position': 'relative'});
        }
    });

    $('.accept').click(function () {
        var array = location.href.split('/')

        $.ajax({
            url: '/confirm_invitation',
            data: {'decision': 1, 'plan_id': array[array.length - 1]},
            success: function (msg) {
                alert(msg);
            }
        })
    });

    $('.reject').click(function () {
        var array = location.href.split('/')

        $.ajax({
            url: '/confirm_invitation',
            data: {'decision': 0, 'plan_id': array[array.length - 1]},
            success: function (msg) {
                alert(msg);
            }
        })
    });
    
});

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