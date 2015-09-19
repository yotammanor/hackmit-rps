function countdown(time) {
	var countdown =  $("#countdown").countdown360({
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
				document.getElementById("actions1").src="images/loading.gif";
				document.getElementById("actions2").src="images/loading.gif";
			}, 1000);
		}
		   });
			countdown.start();
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

function reset() {
	document.getElementById("score1").innerHTML = 0;
	document.getElementById("score2").innerHTML = 0;
}

function start() {
	countdown(2);
}
