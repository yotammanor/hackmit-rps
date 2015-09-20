var Countdown = function countdown(time) {
	console.log($('#countdown'))
	$("#countdown").html('');
	return $("#countdown").countdown360({
		radius      : 60,
		seconds     : time,
		fontColor   : '#FFFFFF',
		autostart   : false,
		onComplete  : function () {
			var rpsImg = document.createElement("img");
			rpsImg.src = "images/go.gif";
			$("#countdown")[0].innerHTML="";
			$("#countdown")[0].appendChild(rpsImg);
			setTimeout(function(){
				document.getElementById("user1").innerHTML = "";
				document.getElementById("user2").innerHTML = "";
				var img1 = document.createElement("img");
				var img2 = document.createElement("img");
				img1.src = "images/loading.gif";
				img2.src = "images/loading.gif";
				img1.className = "loading-image";
				img2.className = "loading-image";
				document.getElementById("user1").appendChild(img1);//src="images/loading.gif";
				document.getElementById("user2").appendChild(img2);//src="images/loading.gif";
			}, 1000);
		}
	});
}

function selectPic() {
	var num = Math.random() * 3;
	if (num < 1) {
		return "images/rock.png";
	} else if (num < 2) {
		return "images/scissors.png";
	}
	return "images/paper.jpg";
}

$(document).on("click","button",function(e){
	e.preventDefault();
});

$(document).ready( function(){
	$('body').on('DOMNodeInserted', '.move-by-player', function(e){
		document.getElementById('user' + $(this).data('user')).innerHTML = '';

		if ($('.move-by-player').length == 2) {
			endOfRound()
		}
	});
});

function reset() {
	document.getElementById("score1").innerHTML = 0;
	document.getElementById("score2").innerHTML = 0;
}

function start() {
	var clock;
	$('#countdown')[0].innerHTML = '';
	var clock = new Countdown(2);
	clock.start();
}

function endOfGame() {
	var winner = Math.round(Math.random()) + 1; // winner will randomly be either 1 or 2
	var msg = "Player " + winner + " is the winner!!";
	var id = document.getElementById("name_of_game");
	id.innerHTML = msg;
	id.style.fontSize = "300%";
	setTimeout(function(){
		id.style.fontSize = "120%";
		id.innerHTML = "Rock, Paper, Scissors, shoot!";	
	}, 3000);
}

function endOfRound() {
	var winner = Math.round(Math.random()) + 1; // winner will randomly be either 1 or 2
	var picNum = Math.round(Math.random() * 5) + 1; // winner will randomly be an integer in the range 1-6
	var id = document.getElementById("countdown");
	// var msg = document.createElement("div");
	// msg.innerHTML = "scissors beats rock, player " + winner + " wins this round!";
	// msg.style.fontSize = "150%";
	id.innerHTML = "";
	var img = document.createElement("img");
	img.src = "images/victory" + picNum + ".png";
	// id.appendChild(msg);
	id.appendChild(img);
	setTimeout(function(){
		id.innerHTML = "";
	}, 3000);
}
