// // $(window).ready(function () {
// // showWelcome();
// // startAllFunctions();
// //
// // setTimeout(function () {
// //     startAllFunctions();
// // }, 200);
//
// //     particlesJS('particles-js',
// //         {
// //             "particles": {
// //                 "number": {
// //                     "value": 158,
// //                     "density": {
// //                         "enable": true,
// //                         "value_area": 3000
// //                     }
// //                 },
// //                 "color": {
// //                     "value": "#8b1deb"
// //                 },
// //                 "shape": {
// //                     "type": "image",
// //                     "stroke": {
// //                         "width": 0,
// //                         "color": "#37a930"
// //                     },
// //                     "polygon": {
// //                         "nb_sides": 3
// //                     },
// //                     "image": {
// //                         "src": "http://www.clker.com/cliparts/8/c/0/3/13683124941965114447graduation_cap-78-th.png",
// //                         "width": 50,
// //                         "height": 50
// //                     }
// //                 },
// //                 "opacity": {
// //                     "value": 1,
// //                     "random": false,
// //                     "anim": {
// //                         "enable": false,
// //                         "speed": 1,
// //                         "opacity_min": 0.1,
// //                         "sync": false
// //                     }
// //                 },
// //                 "size": {
// //                     "value": 80,
// //                     "random": true,
// //                     "anim": {
// //                         "enable": false,
// //                         "speed": 26.75531052375549,
// //                         "size_min": 0.1,
// //                         "sync": false
// //                     }
// //                 },
// //                 "line_linked": {
// //                     "enable": false,
// //                     "distance": 0,
// //                     "color": "#4aa6cc",
// //                     "opacity": 1,
// //                     "width": 12.327396437862724
// //                 },
// //                 "move": {
// //                     "enable": true,
// //                     "speed": 2,
// //                     "direction": "top",
// //                     "random": true,
// //                     "straight": false,
// //                     "out_mode": "out",
// //                     "bounce": false,
// //                     "attract": {
// //                         "enable": false,
// //                         "rotateX": 600,
// //                         "rotateY": 1200
// //                     }
// //                 }
// //             },
// //             "interactivity": {
// //                 "detect_on": "canvas",
// //                 "events": {
// //                     "onhover": {
// //                         "enable": false,
// //                         "mode": "repulse"
// //                     },
// //                     "onclick": {
// //                         "enable": false,
// //                         "mode": "push"
// //                     },
// //                     "resize": true
// //                 },
// //                 "modes": {
// //                     "grab": {
// //                         "distance": 400,
// //                         "line_linked": {
// //                             "opacity": 1
// //                         }
// //                     },
// //                     "bubble": {
// //                         "distance": 400,
// //                         "size": 40,
// //                         "duration": 2,
// //                         "opacity": 8,
// //                         "speed": 3
// //                     },
// //                     "repulse": {
// //                         "distance": 200,
// //                         "duration": 0.4
// //                     },
// //                     "push": {
// //                         "particles_nb": 4
// //                     },
// //                     "remove": {
// //                         "particles_nb": 2
// //                     }
// //                 }
// //             },
// //             "retina_detect": true
// //         }
// //     );
// // });
//
//
// // function setInvisible() {
// // $('.bottom_text').css('opacity', '0');
// // $('.welcome_text').css('opacity', '0');
// // $('.buttons_row').css('opacity', '0');
// // $('.about_service_text').css('opacity', '0');
// // $('#sign_up').css('opacity', '0');
// // $('#sign_in').css('opacity', '0');
// }
//
// // function showWelcome() {
// //     $('.bottom_text').delay(100).fadeTo(main_time * 2, 1);
// //     $('.welcome_text').delay(100).fadeTo(main_time * 1.5, 1, function () {
// //         $('.buttons_row').fadeTo(main_time * 2, 1).queue(function () {
// //             $('.about_service_text').fadeTo(main_time * 3, 1).queue(function () {
// //                 // на этом этапе анимации ставим обработчики на кнопки
// //
// //                 $('#sign_up').on('click', function () {
// //                     sing_up_Action();
// //                     return false;
// //                 });
// //
// //                 $('#sign_in').on('click', function () {
// //                     sing_in_Action();
// //                     return false;
// //                 });
// //             });
// //         });
// //     });
// // }
//
// // var main_time = 150;
// // // // анимация скрытия конента
// // function hideContentWelcome(time, mode) {
// //     // эта штука очень удобная и нужна, чтобы выполнить какое-то действие только по завершении этой фукнции
// //     // индикатор завершения  return dfd.resolve();
// //     var dfd = $.Deferred();
// //     // чтобы при нажатии вся текущая анимация до нажатия завершилась мгновенно
// //     $('#sign_up').off();
// //     $('#sign_in').off();
// //     $('.bottom_text').stop(true, true);
// //     $('.welcome_text').stop(true, true);
// //     $('.buttons_row').stop(true, true);
// //     $('.about_service_text').stop(true, true);
// //
// //     $('.about_service_text').fadeTo(time, 0);
// //     $('.bottom_text').fadeTo(time / 1.5, 0);
// //
// //
// //     $('h1').fadeTo(time, 0).queue(function () {
// //         $('h2').fadeTo(time / 2, 0).queue(function () {
// //             if (mode == 1) {
// //                 $('#sign_up').fadeTo(time / 3, 0, function () {
// //                     $('#sign_in').delay(150).fadeTo(time / 4, 0, function () {
// //                         //знак того, что все объекты скрылись
// //                         setTimeout(function () {
// //                             return dfd.resolve();
// //                         }, 100);
// //                     });
// //                 });
// //             }
// //             if (mode == 2) {
// //
// //                 $('#sign_in').fadeTo(time / 3, 0, function () {
// //                     $('#sign_up').delay(150).fadeTo(time / 4, 0, function () {
// //                         //знак того, что все объекты скрылись
// //                         setTimeout(function () {
// //                             return dfd.resolve();
// //                         }, 100);
// //                     });
// //                 });
// //             }
// //         });
// //     });
// //
// //
// //     return dfd.promise();
// // }
//
// // действия при нажатии на кнопку Регистрация
// // function sing_up_Action() {
// //     $.when(hideContentWelcome(main_time, 2)).then(function () {
// //         window.location.href = "/registration";
// //     });
// // }
// // // действия при нажатии на кнопку Авторизация
// // function sing_in_Action() {
// //     $.when(hideContentWelcome(main_time, 1)).then(function () {
// //         window.location.href = "/login";
// //     });
// // }
//
// // $(window).on('resize', function () {
// //     startAllFunctions();
// // });
//
//
// // function startAllFunctions() {
// //     setContentToCenter();
// // }
// //
// //
// // // когда высота страницы становится маленькой, выравнивает весь контент
// // // в точности по центру (а обычно контент чуть выше центра)
