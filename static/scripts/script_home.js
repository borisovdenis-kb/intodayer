// $(document).ready(function () {
//      $('body').append(
//         '<div class="triangle">');
// });
//
// var $triangle = $('triangle');
// function set_postition_triangle(){
//    
// }



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