/*
 * Create a list that holds all of your cards
 */
var times = 0;
var seconds = 0;
var stars = 3;
var timeCounter;
var clicked = new Array();
var card_list = ["fa fa-diamond","fa fa-diamond",
				"fa fa-paper-plane-o","fa fa-paper-plane-o",
				"fa fa-anchor","fa fa-anchor",
				"fa fa-bolt","fa fa-bolt",
				"fa fa-cube","fa fa-cube",
				"fa fa-leaf","fa fa-leaf",
				"fa fa-bicycle","fa fa-bicycle",
				"fa fa-bomb","fa fa-bomb"];

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

function init(){
	stars = 3;
	$(".stars li").show();
	$(".container").show();
	card_list = shuffle(card_list);
	times = 0;
	$("#moves").text(times+" Moves");
	seconds = 0;
	$("#timeCounter").text(seconds+" Seconds");
	clearInterval(timeCounter);
	clicked = [];
	render_cards(card_list);
}

function render_cards(array){
	var array = shuffle(array);
	$(".card").each(function(idx){
		$(this).attr("class","card");
		$(this).children().attr("class",array[idx]);
	});
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
$(".card").click(function() {
	times+=1;
	$("#moves").text(times+" Moves");
	if(times == 1){
		timeCounter = setInterval(function(){
			seconds++;
			$("#timeCounter").text(seconds + " Seconds");
			if(seconds == 12 || seconds == 24){				
				$(".stars").children("li:nth-child("+stars+")").hide();
				stars--;
			}
		},1000);
	}
	if($(this).attr("class")!="card"){
		return;
	}
	if(clicked.length == 2){
		return;
	}
	$(this).addClass('open show');
	var idx = clicked.push(this);
	if(clicked.length == 2){
		judge();
	}
});

function judge(){
	if($(clicked[0]).children().attr("class") == $(clicked[1]).children().attr("class")){
		$(".open.show").attr("class","card match");
		clicked = [];
		if($(".card.match").length == 16){
			setTimeout(function(){EndPage();},700);
		}
	}
	else{
		setTimeout(function(){
			$(".card.notmatch").attr("class","card");
		},700);
		$(".open.show").attr("class","card notmatch");
		clicked=[];
	}
}

function EndPage(){
	clearInterval(timeCounter);
	swal({
			title: 'Congradulations!',
			html: "<span>"+'<i class="fa fa-star"></i>'.repeat(stars)+'<i class="fa fa-star-o"></i>'.repeat(3-stars)+"</span><br>"+"You finished the game in " + seconds +" seconds!",
			type: "success",
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Retry'
			}).then((result) => {
			if (result.value) {
				init();
			}
	  });
}