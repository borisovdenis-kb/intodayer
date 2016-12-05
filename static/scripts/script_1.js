/*jslint browser: true*/
/*global alert */
/*jslint white: true */



// Определяем на какой мы странице
var locate = location.toString();
var home = locate.lastIndexOf('home');

if (home >= 0) {
    setCurrentMenu('group');
}

function setCurrentMenu(nameClass) {
    var menu_div = document.getElementsByClassName('menu');
    var menu_elements = menu_div[0].getElementsByTagName('li');
    for (var i = 0; i < menu_elements.length; i++) {
        menu_elements[i].style.width = '100%';
    }
    var setCurrent = menu_div[0].getElementsByClassName(nameClass);
    setCurrent[0].style.boxShadow = 'none';
    setCurrent[0].style.backgroundColor = 'white';

    if (nameClass == 'table'){
        var right_shadow = menu_div[0].getElementsByClassName('home');
        right_shadow[0].style.boxShadow = 'inset -15px 0px 36px -19px rgba(0,0,0,0.5)'

    }
    if (nameClass == 'events'){
        var right_shadow = menu_div[0].getElementsByClassName('table');
        right_shadow[0].style.boxShadow = 'inset -15px 0px 36px -19px rgba(0,0,0,0.5)'
    }
    if (nameClass == 'group'){
        var right_shadow = menu_div[0].getElementsByClassName('events');
        var left_shadow = menu_div[0].getElementsByClassName('about');
        right_shadow[0].style.boxShadow = 'inset -15px 0px 36px -19px rgba(0,0,0,0.5)'
        left_shadow[0].style.boxShadow = 'inset 15px 0px 36px -19px rgba(0,0,0,0.5)'
    }
    if (nameClass == 'about'){
        var right_shadow = menu_div[0].getElementsByClassName('group');
        right_shadow[0].style.boxShadow = 'inset -15px 0px 36px -19px rgba(0,0,0,0.5)'
    }

}

