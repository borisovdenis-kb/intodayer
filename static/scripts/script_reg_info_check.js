$(document).ready( function(){
    // валидация пароля
    var width_size;
    width_size = 0;

    $("#password1").keyup( function(event){
        var content, secure_pattern;

        secure_pattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])|(?=.*\d)(?=.*[а-я])(?=.*[А-Я])(?!.*\s).*$/;
        content = $('#password1').val();
        $('#pswdContent').text(content);

        if (event.keyCode == 8) { // нажата backspace
            if (width_size >= 18){
                width_size -= 18;
            }
            $('#circle_indicator1').animate({width: String(width_size) + 'px'}, 40);
        } else {
            if (width_size == 299) {
                $('#circle_indicator1').animate({width: String(width_size) + 'px'}, 40);
            } else if (content.length >= 12){
                width_size += 4;
                $('#circle_indicator1').animate({width: String(width_size) + 'px'}, 40);
            } else if (content.length >= 8 && content.length < 12){
                width_size += 9;
                $('#circle_indicator1').animate({width: String(width_size) + 'px'}, 40);
            } else {
                width_size += 18;
                $('#circle_indicator1').animate({width: String(width_size) + 'px'}, 40);
            }

        }

        // $('#circle_indicator1').animate({width: '10px', height: '38px'}, 40);

        if (content.length >= 8) {
            if (secure_pattern.test(content) == true){
                // $('#circle_indicator1').css('background-color', '#0DA559');
                width_size = 299;
                $('#circle_indicator1').animate({backgroundColor: '#0DA559'}, 40);
                $('#circle_indicator1').animate({width: String(width_size) + 'px'}, 100);
                $('#circle_indicator1').animate({opacity: '0'}, 2000);
            } else {
                // $('#circle_indicator1').css('background-color', '#FFD600');
                $('#circle_indicator1').animate({backgroundColor: '#FFD600'}, 40);
            }
        } else {
            // $('#circle_indicator1').css('background-color', '#FF4233');
            $('#circle_indicator1').animate({backgroundColor: '#FF4233'}, 40);
        }
    });
    // проверка на сопадение пароля1 и пароля2
    $("#password2").keyup( function() {
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