/*
 * Create a list that holds all of your cards
 */
var times = 0;
var current = 0;
var clicked = new Array();
var card_list = ["fa fa-diamond","fa fa-diamond",
				"fa fa-paper-plane-o","fa fa-paper-plane-o",
				"fa fa-anchor","fa fa-anchor",
				"fa fa-bolt","fa fa-bolt",
				"fa fa-cube","fa fa-cube",
				"fa fa-leaf","fa fa-leaf",
				"fa fa-bicycle","fa fa-bicycle",
				"fa fa-bomb","fa fa-bomb"];

function init(){
	$(".ending-page").hide();
	$(".container").show();
	var array = shuffle(card_list);
	times = 0;
	$("#moves").text(times);
	current = 0;	
	clicked = new Array();
	render_cards(array);
}

function moves(){
	$("#moves").text(times);
}
/*
 * Display the cards on the page
 *   - shuffle the list of cards using the provided "shuffle" method below
 *   - loop through each card and create its HTML
 *   - add each card's HTML to the page
 */

// Shuffle function from http://stackoverflow.com/a/2450976
function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

function render_cards(array){
	var array = shuffle(array);
	var str = "";
	for(var i = 0; i < array.length;i++){
		str+="<li class = 'card' onclick = 'click_handler(this);' >";
		str+="<i class = '"+array[i]+"'></i>"
		str+="</li>"
	}
	document.getElementsByClassName("deck")[0].innerHTML = str;
}

function click_handler(obj){
	current++;
	$(".moves").text(++times);
	obj.setAttribute('class','card open show');
	obj.setAttribute('onclick','');
	obj.setAttribute('class','card open show');
	var idx = clicked.push(obj);
	if(current%2==0){
		setTimeout(function(){judge2(idx-1);},700)
	}
}


function judge2(idx){
	if(clicked[idx].getElementsByTagName('i')[0].className==clicked[idx-1].getElementsByTagName('i')[0].className){
		clicked[idx].setAttribute('class','card match');
		clicked[idx].setAttribute('onclick','');
		clicked[idx-1].setAttribute('class','card match');
		clicked[idx-1].setAttribute('onclick','');
		if(document.getElementsByClassName("card match").length == 16){
			setTimeout(function(){EndPage();},700);
		}
	}
	else{
		setTimeout(function(){NoMatch2(idx);},700);
		clicked[idx].setAttribute('class','card notmatch');
		clicked[idx-1].setAttribute('class','card notmatch');
	}
}

function NoMatch2(idx){
	clicked[idx].setAttribute('class','card');
	clicked[idx-1].setAttribute('class','card');
	clicked[idx-1].setAttribute('onclick','click_handler(this);');
	clicked[idx].setAttribute('onclick','click_handler(this);');
}

function EndPage(){
	//setTimeout(function(){	document.getElementsByClassName("ending-page")[0].style.visibility = "visible";},700);
	$(".container").fadeOut(500);
	$(".ending-page").show(500);
	//document.getElementsByClassName("deck")[0].style.visibility = "hidden";
	//document.getElementsByClassName("container")[0].style.visibility = "hidden";
}

/*
 * set up the event listener for a card. If a card is clicked:
 *  - display the card's symbol (put this functionality in another function that you call from this one)
 *  - add the card to a *list* of "open" cards (put this functionality in another function that you call from this one)
 *  - if the list already has another card, check to see if the two cards match
 *    + if the cards do match, lock the cards in the open position (put this functionality in another function that you call from this one)
 *    + if the cards do not match, remove the cards from the list and hide the card's symbol (put this functionality in another function that you call from this one)
 *    + increment the move counter and display it on the page (put this functionality in another function that you call from this one)
 *    + if all cards have matched, display a message with the final score (put this functionality in another function that you call from this one)
 */
