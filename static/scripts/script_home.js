

// установка теней меню

var selectedMenu;
var selectedDay;

var leftShadow = 'leftShadow';
var rightShadow = 'rightShadow';

// Firefox 1.0+
var isFirefox = typeof InstallTrigger !== 'undefined';
if (isFirefox){
	leftShadow = 'leftShadowMoz';
	rightShadow = 'rightShadowMoz';
	$('.top-menu').addClass('menuShadowMoz');
	// $('a').css({'font': 'times'});
}

//Меню
selectedMenu = document.getElementById("home");
setCurrentMenu(selectedMenu);

//Дни недели
selectedDay = document.querySelectorAll('.days')[0];
selectedDay.classList.add('days_select');

function setCurrentMenu(objElem) {
	$(objElem).addClass('select_menu');
	var prev = objElem.previousSibling.previousSibling;
	var next = objElem.nextSibling.nextSibling;
	if ($(prev).is('LI')) {
		$(prev).addClass(leftShadow);
	}
	if ($(next).is('LI')) {
		$(next).addClass(rightShadow);
	}
	selectedMenu = objElem;
}

//Обработка нажатий на меню
function setDefaultMenu() {
	"use strict";
	var next = selectedMenu.nextSibling.nextSibling;
	var prev = selectedMenu.previousSibling.previousSibling;
	$(selectedMenu).removeClass('select_menu');
	$(next).removeClass(rightShadow + ' ' + leftShadow);
	$(prev).removeClass(rightShadow + ' ' + leftShadow);
}

function setMenu(event) {
	"use strict";
	var objElem = event.target.parentElement;
	setDefaultMenu(objElem);
	setCurrentMenu(objElem);
}

var menuElem = document.getElementById("menu");
menuElem.addEventListener('click', setMenu);

//Отключает работу ссылок <a></a> в выборе дней
var elemsA = document.querySelectorAll('.days');
for (var i = 0; i < elemsA.length; i++) {
	elemsA[i].onclick = function () {
		"use strict";
		return false;
	};
}

//Отключает работу ссылок <a></a> в главном меню для тестового режима
//===============================================
var elemsMenu = document.getElementById("menu");
elemsMenu = elemsMenu.getElementsByTagName("LI");
for (var i = 0; i < elemsMenu.length; i++) {
	elemsMenu[i].onclick = function () {
		"use strict";
		return false;
	};
}
//===============================================


//Открытие и закрытие меню профиля в шапке
var droplink = document.getElementsByClassName('droplink')[0];
var ul_menu = droplink.getElementsByTagName("UL")[0];
var arrow = droplink.getElementsByClassName("up-arrow")[0];
var openFlag = false;
var timeMenuEffect = 150;

droplink.addEventListener("click", openMenu);
document.body.addEventListener("click", closeMenu);

function openMenu(event) {
	"use strict";
	if (openFlag === false) {
		arrow.classList.add('select_up-arrow');
		droplink.classList.add('username_color');
		
		$(ul_menu).animate({
			'margin-top': '10px'
		}, timeMenuEffect);
		$('.dropmenu').fadeIn(timeMenuEffect);
		openFlag = true;
		
//	закрыть если нажимаем на username
	} else if (!ul_menu.contains(event.target)) {
		closeDroplist();
	}
}

function closeMenu(event) {
	"use strict";
	if (openFlag && !droplink.contains(event.target)) {
		closeDroplist();
	}
}

function closeDroplist() { //устанавливает свойста для закрытия droplist
	"use strict";
	openFlag = false;
	$('.dropmenu').fadeOut(timeMenuEffect);
	$(ul_menu).animate({
		'margin-top': '20px'
	}, timeMenuEffect);
	if (arrow.classList.contains("select_up-arrow")) {
		arrow.classList.remove("select_up-arrow");
	}
	if (droplink.classList.contains("username_color")) {
		droplink.classList.remove("username_color");
	}
}
//Открытие и закрытие меню профиля в шапке


//появление таблицы и страницы ============================
var main_time = 300;
var heightTable = $('.table-container').height();
// $('#hideme>td').fadeTo("slow", 0.0);
$('.table-container').css({'height':heightTable});
$('tr').hide();

//Обратотка нажаний на вывод таблиц
var daysElem = document.getElementsByClassName("week")[0];
//daysElem.addEventListener('click', setDay);

function setDay(event) {
	"use strict";
	// var eventObj = event || window.event;
	var objElem = event.target.parentElement;
	var prevSelect = selectedDay;

	if (objElem && objElem.tagName === "LI") {
		if (prevSelect.classList.contains('days_select')) {
			prevSelect.classList.remove('days_select');
		}
		objElem.classList.add('days_select');
		selectedDay = objElem;
		$('tr').clearQueue();
		hideTable(40,400);

		//		тут нужно подгружать таблицу из БД




		//

		showTable(40,400);
	}
}


$(document).ready(function () {
	$('.top-menu').slideDown(main_time*2);
	$('.page').fadeTo(main_time*2,1, function () {
		showTable(40,400);
	});
});

function showTable(interval, time){
	"use strict";
	$('.table-container').slideDown(main_time,function() {
		$('tr').each(function (i) {
			$(this).delay((i++) * interval).fadeTo(time, 1);
		});
	});
}

function hideTable(interval, time){
	"use strict";
	$('tr').each(function(i) {
		$(this).delay((i++) * interval).fadeTo(time,0);
	});	
}
//появление таблицы и страницы ============================
$(window).resize(function() {
	$('.top-menu li').css({'width':'100%'});
});






