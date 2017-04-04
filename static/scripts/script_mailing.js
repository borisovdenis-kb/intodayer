
$(document).ready(function () {
    $('.share_button').click(function() {
        htmlToImage($('.plan_window'));
    });
});


function htmlToImage(element) {
    /*
     *  Функция конвертирует блок HTML в изображение
     */
    html2canvas(element, {
        onrendered: function (canvas) {
            var imageData = canvas.toDataURL("image/png");
            imageData.replace("image/png", "image/octet-stream");

            alert(imageData);
        }
    });
}
