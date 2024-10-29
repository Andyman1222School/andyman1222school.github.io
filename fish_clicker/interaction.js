
function resetUI(redoRound = false){
	if(reset(redoRound)) {
		document.getElementById("game").style.display = "block";
		//document.getElementById("log").style.display = "none";
		document.getElementById("shop").style.display = "block";
		document.getElementById("currentRound").style.display = "block";
		document.getElementById("prevRound").innerText = "";
		document.getElementById("resetBtn").style.display = "none";
		document.getElementById("replayBtn").style.display = "none";
		document.getElementById("statsString").innerText = ""
		updateButtons();
		updateStats();
	}
}

//what happens if you press the fish
function press() {

	//the fish quickly gets wide eyes then goes to normal
	document.getElementById("fish").src = "fish-click.png";

	//waits 100 ms before switching fish to normal
	setTimeout(poke, 100);

	nextTurn = currentRound.roundUpdate();
	if(!nextTurn){
		if(currentRound.getPlayerHealth() <= 0)
			youAreDead();
		else if(currentRound.getFishHealth() <= 0)
			fishIsDead();
		else runToSafety()
	}
	updateButtons();
}

//code that changes fish image to big eye fish
function poke() {
	document.getElementById("fish").src = "fish.png";
}

//onclick in web elements

//what happens when you buy health
function healthAdd() {

	currentRound.purchaseHealth()
	updateButtons();
}

//what happens when you buy defenders
function defenderAdd() {

	currentRound.purchaseDefend()
	updateButtons();
}

//what happens when you buy attackers
function attackerAdd() {

	currentRound.purchaseAttack();
	updateButtons();
}

function updateStats(){
	if(currentRound.beats.length > 0){
		len = currentRound.beats.length;
		document.getElementById("prevRound").innerText = currentRound.beats[len-1].toString();
	}

	document.getElementById("currentRound").innerText =  currentRound.getOverallString();
	document.getElementById("statsString").innerText = currentRound.toString();
	document.getElementById("score").innerText = currentRound.getScore();
	document.getElementById("roundNum").innerText = roundInd;
	//document.getElementById("currentRound").innerText = currentRound.currentBeat.getPurchaseString();
	//document.getElementById("heal-buy").innerText = currentRound.currentBuy.health;
	//document.getElementById("def-buy").innerText = currentRound.currentBuy.defend;
	//document.getElementById("att-buy").innerText = currentRound.currentBuy.attack;
}

function updateButtons() {
	document.getElementById("prices").innerText = `health ${currentRound.randomGen.healthCostGen()} gold for ${currentRound.randomGen.healthEarnGen()} hp; attack buff ${currentRound.randomGen.attackCostGen()} gold; defend buff ${currentRound.randomGen.defendCostGen()} gold;`
	//if you have 10 or more gold, change shoppe status and show button to add health
	if (currentRound.randomGen.healthPurchasable()) {

		//shoppe status change
		//document.getElementById("shoppe status").innerHTML = "Look at that! Now you can buy something! Why not be greedy and collect some belongings...";

		//button is block
		document.getElementById("health").style.display = "block";
		document.getElementById("healthCost").innerText = currentRound.randomGen.healthCostGen();
		document.getElementById("healthAmt").innerText = currentRound.randomGen.healthEarnGen();
	}

	//else, change status to default and hide the buttin
	else {

		//shoppe status change
		//document.getElementById("shoppe status").innerHTML = "Welcome to the shoppe! Nothing's on sale, why not try to tap that fish over there?";

		//button is none
		document.getElementById("health").style.display = "none";
	}

	//if you have 300 or more gold, show the defender buy button.
	if (currentRound.randomGen.defendPurchasable()) {
		document.getElementById("defender").style.display = "block";
		document.getElementById("defendCost").innerText = currentRound.randomGen.defendCostGen();
	}

	//if you dont have 300 or more gold, hide the defender buy button
	else {
		document.getElementById("defender").style.display = "none";
	}

	//if you have 400 or more gold, show the attacker buy button
	if (currentRound.randomGen.attackPurchasable()) {
		document.getElementById("attacker").style.display = "block";
		document.getElementById("attackCost").innerText = currentRound.randomGen.attackCostGen();
	}

	//if you do not have 400 or more gold, hide the attacker buy button
	else {
		document.getElementById("attacker").style.display = "none";
	}
	updateStats();
}

function onComplete() {
	currentRound.roundActive = false
	document.getElementById("game").style.display = "none";
	//document.getElementById("log").style.display = "block";
	document.getElementById("shop").style.display = "none";
	if(hasNextRound()){
		document.getElementById("resetBtn").style.display = "block";
	}
	else {
		document.getElementById("showStatsBtn").style.display = "block";
	}
	document.getElementById("replayBtn").style.display = "block";
}

//what happens when fish kills you
function youAreDead() {

	onComplete();
	//tells player you die and update shoppe status
	alert("The fish ate you!!! You lose!");
}

function fishIsDead() {
	onComplete();
	//tells player you die and update shoppe status
	alert(`You defeated the fish! You win with ${currentRound.getScore()} points.`);
}

function runToSafety() {
	onComplete();
	//tells player you die and update shoppe status
	alert(`You ran to safety! You win with ${currentRound.getScore()} points.`);
}

function showStats(){
	document.getElementById("resetBtn").style.display = "none";
	document.getElementById("replayBtn").style.display = "none";
	document.getElementById("showStatsBtn").style.display = "none";
	document.getElementById("gameReview").style.display = "block";

	let maxCols = 3
	roundsPlayed.forEach(element => {
		maxCols = Math.max(maxCols, element.beats+2);
	})
	let elem = document.getElementById("statsTable");
	let top = document.getElementById("topRow")
	for(i = 3; i < maxCols; i++){
		k = document.createElement("td");
		k.innerText = "Turn " + (i-2);
		top.appendChild(k);
	}

	for(i = 0; i < roundsPlayed.length; i++) {
		r = roundsPlayed[i]
		k = document.createElement("tr");
		count = document.createElement("td")
		count.innerText = "Round " + (i+1);
		algo = document.createElement("td")
		algo.innerHTML = "<span class='algorithm'>" + r.randomGen.toString() + "</span>";
		total = document.createElement("td")
		total.innerText = r.toString();
		k.appendChild(count);
		k.appendChild(algo);
		k.appendChild(total);
		for(j = 0; j < r.beats.length; j++){
			item = document.createElement("td")
			item.innerText = r.beats[j].toString();
			k.appendChild(item)
		}
		elem.appendChild(k)
	}
}

resetUI(false);