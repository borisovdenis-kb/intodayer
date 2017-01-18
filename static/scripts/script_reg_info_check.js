$(document).ready( function(){
    // валидация пароля
    $("#password1").keyup( function(){
        var content, secure_pattern;

        secure_pattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])|(?=.*\d)(?=.*[а-я])(?=.*[А-Я])(?!.*\s).*$/;
        
        content = $('#password1').val();
        
        //$('#pswdContent').text(content);

        if (content.length >= 8) {
            if (secure_pattern.test(content) == true){
                $('#circle_indicator1').css('background-color', '#0DA559');
            } else {
                $('#circle_indicator1').css('background-color', '#FFD600');
            }
        } else {
            $('#circle_indicator1').css('background-color', '#FF4233');
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