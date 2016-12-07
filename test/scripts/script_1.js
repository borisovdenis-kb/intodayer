// Определяем на какой мы странице
var locate = location.toString();
var home = locate.lastIndexOf('home');

if (home >= 0) {
	setCurrentMenu('group');
}
setCurrentMenu('group');
function setCurrentMenu(nameClass) {
	"use strict";
	var menu_div = document.getElementsByClassName('menu');
	var menu_elements = menu_div[0].getElementsByTagName('li');
	for (var i = 0; i < menu_elements.length; i++) {
		menu_elements[i].style.width = '100%';
	}
	var setCurrent = menu_div[0].getElementsByClassName(nameClass);
	setCurrent[0].style.boxShadow = 'none';
	setCurrent[0].style.backgroundColor = 'white';
	var right_shadow;
	var left_shadow;
	if (nameClass === 'table') {
		right_shadow = menu_div[0].getElementsByClassName('home');
		right_shadow[0].style.boxShadow = 'inset -15px 0px 36px -19px rgba(0,0,0,0.5)';

	}
	if (nameClass === 'events') {
		right_shadow = menu_div[0].getElementsByClassName('table');
		right_shadow[0].style.boxShadow = 'inset -15px 0px 36px -19px rgba(0,0,0,0.5)';
	}
	if (nameClass === 'group') {
		right_shadow = menu_div[0].getElementsByClassName('events');
		left_shadow = menu_div[0].getElementsByClassName('about');
		right_shadow[0].style.boxShadow = 'inset -15px 0px 36px -19px rgba(0,0,0,0.5)';
		left_shadow[0].style.boxShadow = 'inset 15px 0px 36px -19px rgba(0,0,0,0.5)';
	}
	if (nameClass === 'about') {
		right_shadow = menu_div[0].getElementsByClassName('group');
		right_shadow[0].style.boxShadow = 'inset -15px 0px 36px -19px rgba(0,0,0,0.5)';
	}
}

//выпадающее меню
function DropDown(el) {
	"use strict";
	this.dd = el;
	this.initEvents();
}
DropDown.prototype = {
	initEvents: function () {
		"use strict";
		var obj = this;

		obj.dd.on('click', function (event) {
			$(this).toggleClass('active');
			event.stopPropagation();
		});
	}
};