$(document).ready( function () {

    avatarEditAccess({plan_id: $('.ava_content p').text()});

   $('.plan_selector ul li a').click( function () {
        var data = {plan_id: $(this).siblings('p').text()};

       jQuery.each($('.plan_selector ul li a'), function() {
          $(this).css({'background-color': 'rgb(244, 243, 248)', 'color' : '#000000'})
       });

       $(this).css({'background-color': '#000000', 'color' : '#FFFFFF'})

       $('.right_content').load('/home/switch_plan', data);

       avatarEditAccess(data);
   });
});

// отвечает за оптимизацию шрифта
$(window).on("resize", function () {
    normalize_font();
});


function avatarEditAccess(data) {
    /*
    *  data - словарь (возможные ключ: plan_id)
    */
    $.getJSON('/get_avatar', data, function (msg) {
        $('.ava_content').css({'background-image': 'url(' + msg.url + ')'});
        if (msg.isOwner == true) {
            $('.ava_cover').css({'display': 'block'});
        } else {
            $('.ava_cover').css({'display': 'none'});
        }
    });
}

function normalize_font() {
    // var $objects = $('.str_plan ul li');
    // $objects.each(function () {
    //     var $this_text_block = $(this, 'p');
    //
    //     $this_text_block.wrapInner('<div class="fake"/>')
    //         .each(function (i, el) {
    //             if ($('.fake', el).height() > $(el).height()) {
    //                 $(el).css('background', 'black');
    //             } else {
    //                 // $(el).after('Контент нормально помещается в блоке');
    //             }
    //         });
    // });
}