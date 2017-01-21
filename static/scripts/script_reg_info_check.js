var width_size, raise, is_correct, old_value;
raise = 0;
width_size = 0;
is_correct = 0;
old_value = $('#password1').val();


$(document).ready( function(){
    /*
        Валидация пароля
    */
    $("#password1").focus( function(){

        $('#circle_indicator1').animate({opacity: '0.8'}, 1);
        $("#password1").keyup( function(event){
            if ($('#password1').val() != old_value) {
                var content, secure_pattern;
                secure_pattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])|(?=.*\d)(?=.*[а-я])(?=.*[А-Я])(?!.*\s).*$/;
                content = $('#password1').val();

                if (event.keyCode == 8) { // нажата backspace
                    if (width_size >= 299 && is_correct == 1) {
                        width_size -= raise;
                    }

                    if (content.length >= 16) {
                        width_size -= 3;
                        $('#circle_indicator1').animate({width: width_size + 'px'}, 40);
                    } else if (content.length >= 8 && content.length < 16) {
                        width_size -= 9;
                        $('#circle_indicator1').animate({width: width_size + 'px'}, 40);
                    } else if (content.length <= 8 && width_size > 0) {
                        width_size -= 18;
                        $('#circle_indicator1').animate({width: width_size + 'px'}, 40);
                    }
                } else { // нажата любая другая клавиша
                    if (width_size >= 300) {
                        $('#circle_indicator1').animate({width: width_size + 'px'}, 40);
                    } else if (content.length >= 16) {
                        width_size += 3;
                        $('#circle_indicator1').animate({width: width_size + 'px'}, 40);
                    } else if (content.length > 8 && content.length < 16) {
                        width_size += 9;
                        $('#circle_indicator1').animate({width: width_size + 'px'}, 40);
                    } else {
                        width_size += 18;
                        $('#circle_indicator1').animate({width: width_size + 'px'}, 40);
                    }
                }

                $('#pswdContent').text(content + '|' + width_size + '|' + raise + '|' + old_value);

                if (content.length >= 8) {
                    if (secure_pattern.test(content) == true) {
                        raise = 299 - width_size;
                        width_size = 299;
                        is_correct = 1;
                        $('#circle_indicator1').animate({backgroundColor: '#0DA559'}, 40);
                        $('#circle_indicator1').animate({width: width_size + 'px'}, 80);
                    } else {
                        $('#circle_indicator1').animate({backgroundColor: '#FFD600'}, 40);
                    }
                } else {
                    $('#circle_indicator1').animate({backgroundColor: '#FF4233'}, 40);
                }

                old_value = $('#password1').val();
            }
        });
    });

    $("#password1").blur( function(){
        $('#circle_indicator1').animate({opacity: '0'}, 1000);
    });

    /*
        Проверка на совпадение пароля 1 и пароля 2
    */
    $("#password2").keyup( function(){
        if ($('#password1').val() == $('#password2').val()){
            $('#password1').addClass('active');
            $('#password2').addClass('active');
        } else {
            $('#password1').removeClass('active');
            $('#password2').removeClass('active');
        }
    });
    $("#password2").blur( function() {
        $('#password1').removeClass('active');
        $('#password2').removeClass('active');
    });
});