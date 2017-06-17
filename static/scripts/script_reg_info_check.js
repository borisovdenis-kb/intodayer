var width_size, raise, is_correct, old_content;
var input_width = $('.reg input').outerWidth();
var factor = input_width / 10;
raise = 0;
width_size = 0;
is_correct = 0;
old_content = $('#password1').val();


$(document).ready( function(){
    /*
        Валидация пароля
    */
    // $("#password1").focus( function(){
    //     $('#circle_indicator1').animate({opacity: '0.8'}, 1);
    //
    //     $("#password1").keyup( function(event){
    //         var content, secure_pattern, len;
    //         secure_pattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])|(?=.*\d)(?=.*[а-я])(?=.*[А-Я])(?!.*\s).*$/;
    //         content = $('#password1').val();
    //         len = content.length;
    //
    //         /*!!!! Есть косяк:
    //         - весь алгоритм рпивязан к конкретным значениям. он
    //           не универсален
    //         */
    //         // if (content != old_content) {
    //         //     if (event.keyCode == 8) { // если backspace
    //         //         if (width_size >= 299 && is_correct == 1) {
    //         //             width_size -= raise;
    //         //         }
    //         //         for(var i=0; i < Math.abs(len - old_content.length); i++){
    //         //             if (width_size <= 144){
    //         //                 width_size -= 18;
    //         //             } else if (width_size > 144 && width_size <= 216){
    //         //                 width_size -= 9;
    //         //             } else if (width_size > 216 && width_size < 300){
    //         //                 width_size -= 3;
    //         //             }
    //         //         }
    //         //     } else {
    //         //         for (var i = 0; i < Math.abs(len - old_content.length); i++) {
    //         //             if (width_size < 144) {
    //         //                 width_size += 18;
    //         //             } else if (width_size >= 144 && width_size < 216) {
    //         //                 width_size += 9;
    //         //             } else if (width_size >= 216 && width_size < 300) {
    //         //                 width_size += 3;
    //         //             }
    //         //         }
    //         //     }
    //         //
    //         //     if (!is_correct) {
    //         //         $('#circle_indicator1').animate({width: width_size + 'px'}, 40);
    //         //     }
    //
    //         if (secure_pattern.test(content) == false) {
    //             width_size = len * factor / (1.1 + len/10);
    //             $('#circle_indicator1').animate({width: width_size + 'px'}, 40);
    //             $('#circle_indicator1').clearQueue();
    //         }
    //
    //         if (content.length >= 8) {
    //             if (secure_pattern.test(content) == true) {
    //                 // raise = 299 - width_size;
    //                 // width_size = 299;
    //                 // is_correct = 1;
    //                 $('#circle_indicator1').animate({backgroundColor: '#0DA559'}, 40);
    //                 $('#circle_indicator1').animate({width: input_width-1 + 'px'}, 80);
    //             } else {
    //                 is_correct = 0;
    //                 $('#circle_indicator1').animate({backgroundColor: '#FFD600'}, 40);
    //             }
    //         } else {
    //             is_correct = 0;
    //             $('#circle_indicator1').animate({backgroundColor: '#FF4233'}, 40);
    //         }
    //
    //         old_content = $('#password1').val();
    //     });
    // });
    //
    // $("#password1").blur( function(){
    //     $('#circle_indicator1').animate({opacity: '0'}, 1000);
    // });


    $("#inputPassword_re").on('input', function() {
        /*
            Проверка на совпадение пароля 1 и пароля 2
        */
        console.log($(this).val());

        if($(this).val() && $(this).val() == $("#inputPassword").val()){
            $(this).addClass('pswd_equal_pswd_confirm');
            $("#inputPassword").addClass('pswd_equal_pswd_confirm');
        } else {
            $(this).removeClass('pswd_equal_pswd_confirm');
            $("#inputPassword").removeClass('pswd_equal_pswd_confirm');
        }
    });
    $("#inputPassword").on('input', function() {
        /*
            Проверка на совпадение пароля 1 и пароля 2
        */
        console.log($(this).val());

        if($(this).val() && $(this).val() == $("#inputPassword_re").val()){
            $(this).addClass('pswd_equal_pswd_confirm');
            $("#inputPassword_re").addClass('pswd_equal_pswd_confirm');
        } else {
            $(this).removeClass('pswd_equal_pswd_confirm');
            $("#inputPassword_re").removeClass('pswd_equal_pswd_confirm');
        }
    });
});