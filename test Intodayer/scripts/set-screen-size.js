
// var ScreenWidth;
// var ScreenHeight;
//
// setIntodayerSize();
//
// function setIntodayerSize() {
//     ScreenWidth = document.body.clientWidth;
//     ScreenHeight = document.body.clientHeight;
//     if (ScreenWidth < $('body').css('min-width').slice(0,-2) && (ScreenWidth >= 640)) {
//         alert("размеры окна браузера: " + ScreenWidth + "x" + ScreenHeight);
//         $('body').css({'min-width': ScreenWidth});
//         $('.top').css({'width': ScreenWidth});
//         $('.page').css({'width': ScreenWidth - $('.page').css('padding-left').slice(0, -2) / 2 + 'px'});
//         $('.top-menu ul').css({'width': ScreenWidth});
//     }
// }
//
// $(window).resize(function () {
//     setIntodayerSize();
// });