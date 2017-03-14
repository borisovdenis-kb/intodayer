/**
 * Created by Борисов on 14.03.2017.
 */

$(document).ready( function() {
    show_invitations();
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