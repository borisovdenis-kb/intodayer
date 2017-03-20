// $(document).ready(function () {
//      $('body').append(
//         '<div class="triangle">');
// });
//
// var $triangle = $('triangle');
// function set_postition_triangle(){
//    
// }

$(document).ready( function () {
   $('.plan_selector ul li a').click( function () {
       
       jQuery.each($('.plan_selector ul li a'), function() {
          $(this).css({'background-color': 'rgb(244, 243, 248)', 'color' : '#000000'})
       });

       $(this).css({'background-color': '#000000', 'color' : '#FFFFFF'})

       var data = {plan_id: $(this).siblings('p').text(), user_id: 0};

       $('.right_content').load('/home/switch_plan', data);

       $.getJSON('/get_avatar', data, function (msg) {
           $('.ava_content').css({'background-image': 'url(' + msg.url + ')'})
       });
       
   });
});

//############################################################################## отвечает за оптимизацию шрифта
$(window).on("resize", function () {
    normalize_font();
});

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