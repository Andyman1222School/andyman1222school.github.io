
//base class
class roundAlgorithms {
	roundRef = null;

	toString(){
		return "Random gold only"
	}

	//final methods- do not modify

	//get the current beat from the roundRef
	getCurrentBeat() {
		return this.roundRef.currentBeat;
	}

	//returns true if health can be purchased
	healthPurchasable() {
		return (!this.roundRef.isRoundComplete()) && this.roundRef.gold >= this.healthCostGen();
	}

	//returns true if attack can be purchased
	attackPurchasable() {
		return (!this.roundRef.isRoundComplete()) && this.roundRef.gold >= this.attackCostGen();
	}

	//returns true if defend can be purchased
	defendPurchasable() {
		return (!this.roundRef.isRoundComplete()) && this.roundRef.gold >= this.defendCostGen();
	}

	constructor(roundRef) {
		this.roundRef = roundRef;
	}

	//end final methods

	//amount of damage applied by fish
	//default is non-random: gold / 10 - (defend * 10) + 10
	fishDamageGeneration() {
		return (this.roundRef.gold / 10) - (this.getCurrentBeat().getDefendBuff() * 10) + 10
	}

	//amount damage applied by player
	//default is (gold / 10) + (attack * 10) + 10
	playerDamageGeneration() {
		return (this.roundRef.gold / 10) + (this.getCurrentBeat().getAttackBuff() * 10) + 10
	}

	//default a random amount 1-20
	goldEarnGeneration() {
		return Math.round(Math.random() * 20) + 1
	}

	//costs: typically leave them alone.
	//Do not randomize- keep consistent per turn

	//default 10 for 1 point
	//returns cost for healthEarnGen() amount
	healthCostGen() {
		return 10
	}

	//default returns 1 health point
	healthEarnGen() {
		return 1
	}

	//default 30 for 1 attack buff
	//function returns cost for 1 buff
	attackCostGen() {
		return 30
	}

	//default 20 for 1 defense buff
	//function returns cost for 1 buff
	defendCostGen() {
		return 20
	}
}

//all damage and gold is a random value 0-25.
//defence/attack divide/multiply
class fullRandom extends roundAlgorithms {
	toString() {
		return "full random"
	}

	fishDamageGeneration(){
		return Math.round(Math.random()*25) / (1+this.getCurrentBeat().getDefendBuff())
	}

	playerDamageGeneration(){
		return Math.round(Math.random()*25) * (1+this.getCurrentBeat().getAttackBuff())
	}

	goldEarnGeneration(){
		return Math.round(Math.random()*25)
	}
}

//fish damage is random (max random 10) but at least amt in gold player has / defendBuff
//player damage is unchanged
//gold received is max 10

class weightedGoldRandom extends roundAlgorithms {
	toString() {
		return "fish damage weighted based on player's gold"
	}

	fishDamageGeneration() {
		return Math.round(Math.random()*10) + (this.roundRef.gold / (1+this.getCurrentBeat().getDefendBuff()) )
	}
	goldEarnGeneration() {
		return Math.round(Math.random()*10)
	}
}

//Attacks for player and fish increase by up to 5 (*buff for player, /buff for fish) plus random()*5

class incrementalAttack extends roundAlgorithms {
	toString() {
		return "both damage increments randomly"
	}

	getRoundCount() {
		return this.roundRef.beats.length
	}

	prevPlayerDmg = 0

	prevFishDmg = 0
	playerDamageGeneration(){
		this.prevPlayerDmg += Math.round(Math.random()*5)*(1+this.getCurrentBeat().getAttackBuff())
		return  this.prevPlayerDmg
	}

	fishDamageGeneration() {
		this.prevFishDmg += Math.round(Math.random()*5)/(1+this.getCurrentBeat().getAttackBuff())
		return  this.prevFishDmg
	}
}