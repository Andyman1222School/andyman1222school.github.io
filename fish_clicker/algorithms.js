
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
		this.prevFishDmg += Math.round(Math.random()*5)/(1+this.getCurrentBeat().getDefendBuff())
		return  this.prevFishDmg
	}
}

//attacks are between 10-30 damage base, increments of 10, shuffled
class shuffledAttack extends roundAlgorithms {
	dmgList = [10,20,30]

	toString() {
		return "shuffled damage"
	}

	playerDmgList = []
	playerIndex = 0

	fishDmgList = []
	fishIndex = 0

	constructor(roundRef){
		super(roundRef);
		let shuffled = this.dmgList
		.map(value => ({ value, sort: Math.random() }))
		.sort((a, b) => a.sort - b.sort)
		.map(({ value }) => value)
		this.playerDmgList = shuffled

		let shuffled2 = this.dmgList
		.map(value => ({ value, sort: Math.random() }))
		.sort((a, b) => a.sort - b.sort)
		.map(({ value }) => value)
		this.fishDmgList = shuffled2
	}

	playerDamageGeneration(){
		this.playerIndex++;
		this.playerIndex %= this.dmgList.length;
		return this.playerDmgList[this.playerIndex]*(1+this.getCurrentBeat().getAttackBuff())
	}

	fishDamageGeneration() {
		this.fishIndex++;
		this.fishIndex %= this.dmgList.length
		return this.fishDmgList[this.fishIndex]/(1+this.getCurrentBeat().getDefendBuff())
	}
}

class gaussianRandom extends roundAlgorithms {
    toString() {
        return "gaussian distribution random"
    }
    

	gaussianRand() {
        let u = 0, v = 0;
        while(u === 0) u = Math.random();
        while(v === 0) v = Math.random();
        return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    }


	gaussianRange(min, max) {
        const gaussian = this.gaussianRand();
        const scaled = (gaussian + 3) / 6; 
        return Math.round(min + scaled * (max - min));
    }

    fishDamageGeneration() {
        const damage = this.gaussianRange(5, 30);
        return damage / (1 + this.getCurrentBeat().getDefendBuff());
    }

    playerDamageGeneration() {
        const damage = this.gaussianRange(10, 35);
        return damage * (1 + this.getCurrentBeat().getAttackBuff());
    }

    goldEarnGeneration() {
        return this.gaussianRange(5, 25);
    }
}

class exponentialRandom extends roundAlgorithms {
    toString() {
        return "exponential growth random"
    }

    getRoundCount() {
        return this.roundRef.beats.length;
    }

    fishDamageGeneration() {
        const baseAmount = 5;
        const growth = 1.2;
        const round = this.getRoundCount();
        const randomFactor = 0.5 + Math.random();
        return (baseAmount * Math.pow(growth, round/3) * randomFactor) / 
               (1 + this.getCurrentBeat().getDefendBuff());
    }

    playerDamageGeneration() {
        const baseAmount = 8;
        const growth = 1.15;
        const round = this.getRoundCount();
        const randomFactor = 0.8 + Math.random() * 0.4;
        return (baseAmount * Math.pow(growth, round/3) * randomFactor) * 
               (1 + this.getCurrentBeat().getAttackBuff());
    }

    goldEarnGeneration() {
        const baseAmount = 10;
        const growth = 1.1;
        const round = this.getRoundCount();
        return Math.round(baseAmount * Math.pow(growth, round/4) * Math.random());
    }
}

class progressiveRandom extends roundAlgorithms {
	toString() {
		return "progressively increasing damage"
	}

	roundCount = 0;

	playerDamageGeneration() {
		this.roundCount++;
		return Math.round(Math.random() * 10) + (this.roundCount * 2) + this.getCurrentBeat().getAttackBuff();
	}

	fishDamageGeneration() {
		this.roundCount++;
		return Math.round(Math.random() * 10) + (this.roundCount * 2) - this.getCurrentBeat().getDefendBuff();
	}

	goldEarnGeneration() {
		return Math.round(Math.random() * 10) + (this.roundCount % 5); // small increase every 5 rounds
	}
}

class sinusoidalRandom extends roundAlgorithms {
    toString() {
        return "sinusoidal wave random"
    }

    getRoundCount() {
        return this.roundRef.beats.length;
    }

    sineWaveValue(amplitude, frequency, phase) {
        const round = this.getRoundCount();
        return amplitude * (1 + Math.sin(frequency * round + phase));
    }

    fishDamageGeneration() {
        const baseDamage = this.sineWaveValue(10, 0.3, 0) + Math.random() * 5;
        return baseDamage / (1 + this.getCurrentBeat().getDefendBuff());
    }

    playerDamageGeneration() {
        const baseDamage = this.sineWaveValue(15, 0.2, Math.PI/4) + Math.random() * 8;
        return baseDamage * (1 + this.getCurrentBeat().getAttackBuff());
    }

    goldEarnGeneration() {
        return Math.round(this.sineWaveValue(8, 0.4, Math.PI/2) + Math.random() * 5);
    }
}

class multiModalRandom extends roundAlgorithms {
    toString() {
        return "multi-modal distribution random"
    }

    getRoundCount() {
        return this.roundRef.beats.length;
    }

    multiModalValue(peaks) {
        const selector = Math.random();
        let sum = 0;
        for (const peak of peaks) {
            if (selector < peak.probability + sum) {
                return peak.min + Math.random() * (peak.max - peak.min);
            }
            sum += peak.probability;
        }
        return peaks[peaks.length-1].min + Math.random() * 
               (peaks[peaks.length-1].max - peaks[peaks.length-1].min);
    }

    fishDamageGeneration() {
        const peaks = [
            {min: 5, max: 10, probability: 0.4},
            {min: 15, max: 20, probability: 0.4},
            {min: 25, max: 30, probability: 0.2}
        ];
        return this.multiModalValue(peaks) / (1 + this.getCurrentBeat().getDefendBuff());
    }

    playerDamageGeneration() {
        const peaks = [
            {min: 8, max: 15, probability: 0.3},
            {min: 18, max: 25, probability: 0.5},
            {min: 28, max: 35, probability: 0.2}
        ];
        return this.multiModalValue(peaks) * (1 + this.getCurrentBeat().getAttackBuff());
    }

    goldEarnGeneration() {
        const peaks = [
            {min: 1, max: 8, probability: 0.3},
            {min: 10, max: 15, probability: 0.4},
            {min: 18, max: 25, probability: 0.3}
        ];
        return Math.round(this.multiModalValue(peaks));
    }
}