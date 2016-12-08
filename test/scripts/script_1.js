// устанавливает подстветку меню
//var locate = location.toString();
//var home = locate.lastIndexOf('home');

var selectedMenu;
var selectedDay;

//Меню
selectedMenu = document.getElementById("home");
setCurrentMenu(selectedMenu);

//Дни недели
selectedDay = document.querySelectorAll('.days')[0];
selectedDay.classList.add('days_select');

function setCurrentMenu(objElem) {
	"use strict";
	objElem.classList.add('select_menu');
	var prev = objElem.previousSibling.previousSibling;
	var next = objElem.nextSibling.nextSibling;
	if (prev !== null && prev.tagName === 'LI') {
		prev.classList.add('leftShadow');
	}

	if (next !== null && next.tagName === 'LI') {
		next.classList.add('rightShadow');
	}
	selectedMenu = objElem;
}

//Обработка нажатий на меню
function setDefaultMenu() {
	"use strict";
	var next = selectedMenu.nextSibling.nextSibling;
	var prev = selectedMenu.previousSibling.previousSibling;
	selectedMenu.classList.remove('select_menu');
	if (next && next.tagName === 'LI') {
		if (next.classList.contains('leftShadow')) {
			next.classList.remove('leftShadow');
		}
		if (next.classList.contains('rightShadow')) {
			next.classList.remove('rightShadow');
		}
	}
	if (prev && prev.tagName === 'LI') {
		if (prev.classList.contains('leftShadow')) {
			prev.classList.remove('leftShadow');
		}
		if (prev.classList.contains('rightShadow')) {
			prev.classList.remove('rightShadow');
		}
	}
}

function setMenu() {
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

//Обратотка нажаний на вывод таблиц
var daysElem = document.getElementsByClassName("week")[0];
daysElem.addEventListener('click', setDay);

function setDay() {
	"use strict";
	var objElem = event.target.parentElement;
	var prevSelect = selectedDay;

	if (objElem && objElem.tagName === "LI") {
		if (prevSelect.classList.contains('days_select')) {
			prevSelect.classList.remove('days_select');
		}
		objElem.classList.add('days_select');
		selectedDay = objElem;
		
//		тут нужно изменить саму таблицу
		
		
		
		
		
		
//			
				
		$('tr').clearQueue();
		hideTable(40,400);
		showTable(40,400);
	}
}

//Открытие и закрытие меню профиля в шапке
var droplink = document.getElementsByClassName('droplink')[0];
var ul_menu = droplink.getElementsByTagName("UL")[0];
var arrow = document.getElementsByClassName("up-arrow")[0];
var openFlag = false;
var timeMenuEffect = 150;

droplink.addEventListener("click", openMenu);
document.body.addEventListener("click", closeMenu);

function openMenu() {
	"use strict";
	if (openFlag === false) {
		arrow.classList.add('select_up-arrow');
		$(ul_menu).animate({
			'margin-top': '10px'
		}, timeMenuEffect);
		$('.dropmenu').fadeIn(timeMenuEffect);
		openFlag = true;
	} else if (!ul_menu.contains(event.target)) {
		closeDroplist();
	}
}

function closeMenu() {
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
}

//появление таблицы
var heightTable = $('.table-container').height();
$('.table-container').css({'height':heightTable});
$('tr').hide();


$(document).ready ( function(){
	"use strict";
	showTable(40,400);
});

function showTable(interval, time){
	"use strict";
	$('tr').each(function(i) {
		$(this).delay((i++) * interval).fadeTo(time,1);
	});	
}

function hideTable(interval, time){
	"use strict";
	$('tr').each(function(i) {
		$(this).delay((i++) * interval).fadeTo(time,0);
	});	
}








