//Original game developed by Andy Herbert.
/*
 * The original game involved a pseudorandom attack chance on every click of the fish.
 * Being a cookie clicker type game, the player is given the chance to purchase items.
 * 
 * Changes for the project:
 * * annoying alerts replaced by a status message in the webpage
 * * the game will be divided into testable rounds, approximately 10 clicks.
 * - each user action will be recorded
 * - objective: defeat the fish with the highest remaining gold
 * * auto clicker is removed, but defender and health are kept
 * * the player attacks the fish every click, and the fish attacks the player every time
 * - the amount of damage applied is the random element
 * - amount of gold earned is also randomized
 * * the random algorithms will be replaced by a delegate that supports different randomness
 */

//a beat is a single instance of the game- what actions the player performs and what values have resulted
class beat {
	//used for showing how much of item x you bought
	currentBuy = { health: 0, attack: 0, defend: 0 };

	//round ref
	currentRound = null

	//fish stats
	fish = { beforeHealth: 100, afterHealth: 100, damageReceived: 0};

	//player stats
	player = { beforeHealth: 100, afterHealth: 100, damageReceived: 0, beforeGold: 0, afterGold: 0, goldGained: 0};

	//purchases player made, in the form {itemStr, cost, amount}
	purchases = []

	getAttackBuff(){
		return this.currentRound.roundBuys.attack
	}

	getDefendBuff(){
		return this.currentRound.roundBuys.defend
	}

	

	addPurchase(type){
		let purchaseMade = false
		let cost = 0
		let amt = 0
		let randgen = currentRound.randomGen
		switch(type){
			case "health":
				if (randgen.healthPurchasable()) {
					cost = randgen.healthCostGen()
					amt = randgen.healthEarnGen();
					this.currentBuy.health++;
					this.currentRound.roundBuys.health++;
					this.player.afterHealth+=amt
					purchaseMade = true
				}
				break;
			case "attack":
				if (randgen.attackPurchasable()) {
					cost = randgen.attackCostGen();
					amt = 1
					//increase item 0 of buy[] by 1 (hint: item 0 is amount of health bought)
					this.currentBuy.attack++;
					this.currentRound.roundBuys.attack++;
					purchaseMade = true
				}
				break;
			case "defend":
				if (randgen.defendPurchasable()) {
					cost = randgen.defendCostGen();
					amt = 1
					//increase item 0 of buy[] by 1 (hint: item 0 is amount of health bought)
					this.currentBuy.defend++;
					this.currentRound.roundBuys.defend++;
					purchaseMade = true
				}
				break;
		}
		if(purchaseMade)
			this.currentRound.gold -= cost
			this.afterGold -= cost
			this.purchases.push({type: type, cost: cost, amount: amt})
		
	}

	//does an attack, returns true if player still alive
	//order of attack:
	//player damage generation
	//fish damage generation
	//player damage dealt
	//fish damage dealt
	doAttack(){
		let randgen = currentRound.randomGen
		let playerDmg = Math.round(randgen.playerDamageGeneration());
		let fishDmg = Math.round(randgen.fishDamageGeneration());
		this.fish.damageReceived = playerDmg;
		this.fish.afterHealth -= playerDmg;
		this.fish.afterHealth = Math.max(0, this.fish.afterHealth)
		//if(this.fish.afterHealth > 0){
		this.player.damageReceived = fishDmg;
		this.player.afterHealth -= fishDmg;
		this.player.afterHealth = Math.max(0, this.player.afterHealth);
		//}
		if(this.player.afterHealth > 0){
			this.player.goldGained = Math.round(randgen.goldEarnGeneration())
			this.player.afterGold += this.player.goldGained;
			this.currentRound.gold += this.player.goldGained
		}
		return this.player.afterHealth > 0;
	}

	constructor(roundRef, initFishHealth = 100, initPlayerHealth = 100){
		this.currentRound = roundRef;
		this.fish.beforeHealth = initFishHealth
		this.fish.afterHealth = initFishHealth
		this.player.beforeHealth = initPlayerHealth
		this.player.afterHealth = initPlayerHealth
		this.player.beforeGold = roundRef.gold
		this.player.afterGold = roundRef.gold
	}

	getPurchaseString(){
		let cost = {attack: 0, defend: 0, health: 0}
		let amt = {attack: 0, defend: 0, health: 0}
		let total = 0
		for(let i = 0; i < this.purchases.length; i++){
			switch(this.purchases[i].type){
				case "health":
					cost.health += this.purchases[i].cost
					amt.health += this.purchases[i].amount
				break;
				case "attack":
					cost.attack += this.purchases[i].cost
					amt.attack += this.purchases[i].amount
				break;
				case "defend":
					cost.defend += this.purchases[i].cost
					amt.defend += this.purchases[i].amount
				break;
			}
			total += this.purchases[i].cost;
		}
		return `Spent ${total} total gold; ${cost.health} on ${amt.health} hp, ${cost.attack} on ${amt.attack} attack, ${cost.defend} on ${amt.defend} defend.\n`
	}

	toString(){
		
		return this.getPurchaseString() + 
		`You dealt the fish ${this.fish.damageReceived} damage.
The fish dealt ${this.player.damageReceived} damage to you.
You gained ${this.player.goldGained} gold.\n`
	}
}

//a round consists of multiple beats, and a given set of algorithms
class round {
	//currency
	gold = 0;

	//round buys
	roundBuys = { health: 0, attack: 0, defend: 0 };

	currentBeat = new beat(this)

	//beats sorted in order excluding current
	beats = []

	//func for fish damage generation
	//see algorithms.js
	randomGen = null

	roundActive = false

	constructor(randomGen, startGold = 0){
		this.randomGen = Object.create(randomGen);
		randomGen.roundRef = this;
		this.gold = startGold.valueOf()
	}

	//executes when the player clicks the fish
	roundUpdate(){
		if(!this.isRoundComplete()){
			let val = this.currentBeat.doAttack();
			this.advanceBeat();
			this.roundActive = !this.isRoundComplete();
			return !this.isRoundComplete();
		}
		return false
	}

	advanceBeat(){
		let lastBeat = this.currentBeat;
		this.beats.push(lastBeat);
		this.currentBeat = new beat(this, lastBeat.fish.afterHealth, lastBeat.player.afterHealth)
	}

	purchaseHealth(){
		this.currentBeat.addPurchase("health")
	}

	purchaseAttack(){
		this.currentBeat.addPurchase("attack")
	}

	purchaseDefend(){
		this.currentBeat.addPurchase("defend")
	}

	//score is always gold - fish hp
	getScore(){
		return this.gold - this.currentBeat.fish.afterHealth;
	}

	//stats per round
	getRoundsString(){
		let str = ""
		for(let i = 0; i < this.beats.length; i++){
			str += "Round " + (i+1) + ": " + this.beats[i].toString() + "\n";
		}
		return str;
	}

	//overall stats currently
	getOverallString(){
		return `Player health: ${this.currentBeat.player.afterHealth}; Fish health: ${this.currentBeat.fish.afterHealth};
Gold: ${this.gold};\n Previously purchased ${this.roundBuys.health} health, ${this.roundBuys.attack} attack, ${this.roundBuys.defend} defend.
Turns: ${this.beats.length}; Score: ${this.getScore()}\n`
	}

	//cumulative values- damage, gold spent, health gained
	getSumString(){
		let fishDmg = 0
		let playerDmg = 0
		let goldSpend = 0
		let goldGain = 0
		let healthGain = 0
		for(let i = 0; i < this.beats.length; i++){
			let b = this.beats[i]
			for(let j = 0; j < b.purchases.length; j++){
				let p = b.purchases[j];
				goldSpend += p.cost;
				if(p.type == "health"){
					healthGain += p.amount;
				}
			}
			playerDmg += b.fish.damageReceived;
			fishDmg += b.player.damageReceived;
			goldGain += b.player.goldGained;

		}
		return `Fish dealt total ${fishDmg} damage to player;
Player dealt ${playerDmg} damage to fish, gained ${goldGain} gold;
Player purchased ${healthGain} health and spent ${goldSpend} total gold.\n`
	}

	//all strings
	toString(){
		return this.getOverallString() + this.getSumString() + "\n" + this.getRoundsString();
	}

	getPlayerHealth(){
		return this.currentBeat.player.afterHealth
	}
	getFishHealth(){
		return this.currentBeat.fish.afterHealth
	}

	isRoundComplete(){
		return !this.roundActive || (this.getPlayerHealth() <= 0 || this.getFishHealth() <= 0);
	}
}

//algorithms to play
var algorithms = [new roundAlgorithms(), new fullRandom(), new weightedGoldRandom(), new incrementalAttack(), new shuffledAttack()]

var roundsPlayed = []

//current round
var currentRound = null

var roundInd = 0

function hasNextRound(){
	return roundInd < algorithms.length;
}

//resets code if possible, advances to next algorithm
function reset(replayRound = false){
	if(hasNextRound() || replayRound){
		if(!replayRound){
			roundInd += 1
		}
		currentRound = new round(algorithms[roundInd-1]);
		roundsPlayed.push(currentRound)
		currentRound.roundActive = true
		return true;
	}
	return false;
	
}