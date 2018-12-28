// Main file to run

$(function() {

    let pokedex = [];
    let moves = [[], []];

    // Retrieve move data from API
    $.get("https://pokeapi.co/api/v2/move/")
    .done((result) => {
        for (let i = 0; i < 164; i ++) {
            let moveName = result.results[i].name;
            moves[0].push(moveName);

            // Retrieve object from nested URL
            $.get(result.results[i].url).done((result) => {
                moves[1].push(result);
            });
        }
    })
    

    // Retrieve pokemon data from API
    $.get("https://pokeapi.co/api/v2/pokemon/")
    .done((result) => {
        for (let i = 0; i < 151; i ++) {
            let pokeName = result.results[i].name;
            pokedex.push([pokeName]);

            // Retrieve object from nested URL
            $.get(result.results[i].url).done((result) => {
                pokedex[i].push(result);
            });
        }
    });
    
    // Account for async with time delay
    setTimeout(() => {
        
        // ------------------------------------------------------------------------------------

        
        // Class Definitions

        class Move {

            constructor(moveName, moveObject) {
                this.name = moveName;
                this.target = moveObject.target.name;
                this.startAccuracy = Number(moveObject.accuracy);
                this.accuracy = [this.startAccuracy, 0, this.startAccuracy];
                this.power = Number(moveObject.power);
                this.effectChance = Number(moveObject.effect_chance);
                this.pp = Number(moveObject.pp);
                this.damage_class = moveObject.damage_class.name;
                // How to account for moves that last multiple turns?
                // if (this.damage_class == "physical") {
                //     this.duration = 1;
                // }
                this.type = moveObject.type.name;
                this.description = moveObject.effect_entries[0].short_effect;
            }

            upperName() {
                return this.name[0].toUpperCase() + this.name.slice(1, this.name.length);
            }

            // Pure damage calc for physical and special moves with a Power value
            damageCalc(user, target) {
                let min = Math.ceil(85);
                let max = Math.floor(100);
                if (this.damage_class == "physical") {
                    let baseDamage = (22 * this.power * user.attack / target.defense / 50) + 2;
                    let damage = Math.floor(baseDamage * (Math.floor(Math.random() * (max - min + 1)) + min) / 100);
                    if (damage > target.hp) {
                        damage = target.hp;
                    }
                    target.hp = Number(target.hp) - Number(damage);
                    // target.hp -= damage;
                    return damage;
                }
                else if (this.damage_class == "special") {
                    let baseDamage = (22 * this.power * user.specialAttack / target.specialDefense / 50) + 2;
                    let damage = Math.floor(baseDamage * (Math.floor(Math.random() * (max - min + 1)) + min) / 100);
                    if (damage > target.hp) {
                        damage = target.hp;
                    }
                    target.hp -= damage;
                    return damage;
                }
            }

            // Returns a message depending on change in stage value
            stageMessage(target, statName, stageChange) {
                if (stageChange == 1) {
                    return `\n${target.upperName()}'s ${statName} rose!`;
                }
                else if (stageChange == 2) {
                    return `\n${target.upperName()}'s ${statName} rose sharply!`;
                }
                else if (stageChange >= 3) {
                    return `\n${target.upperName()}'s ${statName} rose drastically!`;
                }
                else if (stageChange == -1) {
                    return `\n${target.upperName()}'s ${statName} fell!`;
                }
                else if (stageChange == -2) {
                    return `\n${target.upperName()}'s ${statName} harshly fell!`;
                }
                else if (stageChange <= -3) {
                    return `\n${target.upperName()}'s ${statName} severely fell!`;
                }
                else {
                    return `\n${target.upperName()}'s ${statName} stayed the same!`
                }
            }

            // For effects that change stat stage values (e.g. attack +1 stage)
            statEffect(target, statName, stageChange, chance = 100) {
                if (chance == null) {
                    chance = 100;
                }
                let cutoff = Math.floor(Math.random() * 100);
                if (chance >= cutoff) {
                    if (statName == "Attack") {
                        var stat = target.attack;
                    }
                    else if (statName == "Defense") {
                        var stat = target.defense;
                    }
                    else if (statName == "Special Attack") {
                        var stat = target.specialAttack;
                    }
                    else if (statName == "Special Defense") {
                        var stat = target.specialDefense;
                    }
                    else if (statName == "Speed") {
                        var stat = target.speed;
                    }
                    else if (statName == "Evasion") {
                        var stat = target.evasion;
                    }
                    else {
                        return "Invalid Stat";
                    } 
                    
                    // Check that stage value is between -6 and 6
                    stat[1] += stageChange;
                    if (stat[1] < -6) {
                        stat[1] = -6;
                    }
                    else if (stat[1] > 6) {
                        stat[1] = 6;
                    }

                    // Determine multiplier based on stage value
                    if (stat[1] == -6) {
                        stat[0] = Math.floor(stat[2] * 25 / 100);
                    }
                    else if (stat[1] == -5) {
                        stat[0] = Math.floor(stat[2] * 28 / 100);
                    }
                    else if (stat[1] == -4) {
                        stat[0] = Math.floor(stat[2] * 33 / 100);
                    }
                    else if (stat[1] == -3) {
                        stat[0] = Math.floor(stat[2] * 40 / 100);
                    }
                    else if (stat[1] == -2) {
                        stat[0] = Math.floor(stat[2] * 50 / 100);
                    }
                    else if (stat[1] == -1) {
                        stat[0] = Math.floor(stat[2] * 66 / 100);
                    }
                    else if (stat[1] == 0) {
                        stat[0] = stat[2];
                    }
                    else if (stat[1] == 1) {
                        stat[0] = Math.floor(stat[2] * 150 / 100);
                    }
                    else if (stat[1] == 2) {
                        stat[0] = Math.floor(stat[2] * 200 / 100);
                    }
                    else if (stat[1] == 3) {
                        stat[0] = Math.floor(stat[2] * 250 / 100);
                    }
                    else if (stat[1] == 4) {
                        stat[0] = Math.floor(stat[2] * 300 / 100);
                    }
                    else if (stat[1] == 5) {
                        stat[0] = Math.floor(stat[2] * 350 / 100);
                    }
                    else if (stat[1] == 6) {
                        stat[0] = Math.floor(stat[2] * 400 / 100);
                    }
                    let message = this.stageMessage(target, statName, stageChange);
                    return message;
                }
                else {
                    return "";
                }
            }

            // For effects that change accuracy stage value
            accuracyEffect(target, stageChange, chance = 100) {
                if (chance == null) {
                    chance = 100;
                }
                let cutoff = Math.floor(Math.random() * 100);
                if (chance >= cutoff) {
                    for (let i = 0; i < target.moves.length; i ++) {
                        
                        // Check that stage value is between -6 and 6
                        target.moves[i].accuracy[1] += stageChange;
                        if (target.moves[i].accuracy[1] < -6) {
                            target.moves[i].accuracy[1] = -6;
                        }
                        else if (target.moves[i].accuracy[1] > 6) {
                            target.moves[i].accuracy[1] = 6;
                        }

                        // Determine multiplier based on stage value
                        if (target.moves[i].accuracy[1] == -6) {
                            target.moves[i].accuracy[0] = Math.floor(target.moves[i].accuracy[2] * 25 / 100);
                        }
                        else if (target.moves[i].accuracy[1] == -5) {
                            target.moves[i].accuracy[0] = Math.floor(target.moves[i].accuracy[2] * 28 / 100);
                        }
                        else if (target.moves[i].accuracy[1] == -4) {
                            target.moves[i].accuracy[0] = Math.floor(target.moves[i].accuracy[2] * 33 / 100);
                        }
                        else if (target.moves[i].accuracy[1] == -3) {
                            target.moves[i].accuracy[0] = Math.floor(target.moves[i].accuracy[2] * 40 / 100);
                        }
                        else if (target.moves[i].accuracy[1] == -2) {
                            target.moves[i].accuracy[0] = Math.floor(target.moves[i].accuracy[2] * 50 / 100);
                        }
                        else if (target.moves[i].accuracy[1] == -1) {
                            target.moves[i].accuracy[0] = Math.floor(target.moves[i].accuracy[2] * 66 / 100);
                        }
                        else if (target.moves[i].accuracy[1] == 0) {
                            target.moves[i].accuracy[0] = target.moves[i].accuracy[2];
                        }
                        else if (target.moves[i].accuracy[1] == 1) {
                            target.moves[i].accuracy[0] = Math.floor(target.moves[i].accuracy[2] * 150 / 100);
                        }
                        else if (target.moves[i].accuracy[1] == 2) {
                            target.moves[i].accuracy[0] = Math.floor(target.moves[i].accuracy[2] * 200 / 100);
                        }
                        else if (target.moves[i].accuracy[1] == 3) {
                            target.moves[i].accuracy[0] = Math.floor(target.moves[i].accuracy[2] * 250 / 100);
                        }
                        else if (target.moves[i].accuracy[1] == 4) {
                            target.moves[i].accuracy[0] = Math.floor(target.moves[i].accuracy[2] * 300 / 100);
                        }
                        else if (target.moves[i].accuracy[1] == 5) {
                            target.moves[i].accuracy[0] = Math.floor(target.moves[i].accuracy[2] * 350 / 100);
                        }
                        else if (target.moves[i].accuracy[1] == 6) {
                            target.moves[i].accuracy[0] = Math.floor(target.moves[i].accuracy[2] * 400 / 100);
                        }
                    }
                    let message = this.stageMessage(target, "Accuracy", stageChange);
                    return message;
                }
                else {
                    return "";
                }
            }

            // For effects that change status conditions (e.g. frozen)
            specialEffect(target, effect, chance = 100) {
                if (chance == null) {
                    chance = 100;
                }
                let cutoff = Math.floor(Math.random() * 100);
                if (chance >= cutoff) {
                    if (effect == "burned") {
                        target.status.push("burned");
                        return `\nThe opposing ${target.upperName()} is on fire!`
                    }
                    else if (effect == "frozen") {
                        target.status.push("frozen");
                        return `\nThe opposing ${target.upperName()} is frozen!`
                    }
                    else if (effect == "paralyzed") {
                        target.status.push("paralyzed");
                        return `\nThe opposing ${target.upperName()} is paralyzed!`
                    }
                    else if (effect == "confused") {
                        target.status.push("confused");
                        return `\nThe opposing ${target.upperName()} is confused!`
                    }
                    else if (effect == "poisoned") {
                        target.status.push("poisoned");
                        return `\nThe opposing ${target.upperName()} is poisoned!`
                    }
                    else if (effect == "sleeping") {
                        target.status.push("sleeping");
                        return `\nThe opposing ${target.upperName()} fell asleep!`
                    }
                    else if (effect == "flying") {
                        target.status.push("flying");
                        return `\nThe opposing ${target.upperName()} flew into the air!`
                    }
                }
                else {
                    return ""
                }
            }

            classStatus(user, target) {

                // "Raises the user's Attack."
                if (this.name == "swords-dance" ) {
                    let statMessage = this.statEffect(user, "Attack", 2);
                    return statMessage;
                }

                else if (this.name == "growth") {
                    let statMessage1 = this.statEffect(user, "Attack", 1);
                    let statMessage2 = this.statEffect(user, "Special Attack", 1);
                    return statMessage1 + statMessage2;
                }

                else if (
                    this.name == "meditate" ||
                    this.name == "sharpen"
                    ) {
                    let statMessage = this.statEffect(user, "Attack", 1);
                    return statMessage;
                }

                // "Raises the user's Defense."
                
                else if (
                    this.name == "barrier" ||
                    this.name == "acid-armor"
                    ) {
                    let statMessage = this.statEffect(user, "Defense", 2);
                    return statMessage;
                }
                
                else if (
                    this.name == "harden" ||
                    this.name == "withdraw" ||
                    this.name == "defense-curl"
                    ) {
                    let statMessage = this.statEffect(user, "Defense", 1);
                    return statMessage;
                }

                else if (this.name == "amnesia") {
                    let statMessage = this.statEffect(user, "Special Defense", 2);
                    return statMessage;
                }

                // "Raises the user's Speed."
                else if (this.name == "agility") {
                    let statMessage = this.statEffect(user, "Speed", 2);
                    return statMessage;
                }

                // "Raises the user's Evasion."
                else if (this.name == "minimize") {
                    let statMessage = this.statEffect(user, "Evasion", 2);
                    return statMessage;
                }

                // "Lowers the target's Attack."
                else if (this.name == "growl") {
                    let statMessage = this.statEffect(target, "Attack", -1);
                    return statMessage;
                }

                // "Lowers the target's Defense."
                else if (
                    this.name == "tail-whip" ||
                    this.name == "leer"
                    ) {
                    let statMessage = this.statEffect(target, "Defense", -1);
                    return statMessage;
                }

                else if (this.name == "screech") {
                    let statMessage = this.statEffect(target, "Defense", -2);
                    return statMessage;
                }
                
                // "Lowers the target's Speed."
                else if (this.name == "string-shot") {
                    let statMessage = this.statEffect(target, "Speed", -2);
                    return statMessage;
                }

                // "Lowers the target's Evasion."

                // "Lowers the target's Accuracy."
                else if (
                    this.name == "sand-attack" ||
                    this.name == "smokescreen" ||
                    this.name == "kinesis" ||
                    this.name == "spore"
                    ) {
                    let accuracyMessage = this.accuracyEffect(target, -1);
                    return accuracyMessage;
                }

                // "Immediately ends wild battles. Forces trainers to switch Pokémon."
                else if (
                    this.name == "whirlwind" ||
                    this.name == "roar"
                    ) {
                    return `Not Available`
                }

                // "Puts the target to sleep."
                else if (
                    this.name == "sing" ||
                    this.name == "sleep-powder" ||
                    this.name == "hypnosis" ||
                    this.name == "lovely-kiss" ||
                    this.name == "spore"
                    ) {
                    let specialMessage = this.specialEffect(target, "sleeping", this.effectChance);
                    return specialMessage;
                }

                // "Confuses the target."
                else if (
                    this.name == "supersonic" ||
                    this.name == "confuse-ray"
                    ) {
                    let specialMessage = this.specialEffect(target, "confused", this.effectChance);
                    return specialMessage;
                }

                // "Disables the target's last used move for 1-8 turns."
                else if (this.name == "disable") {
                    return `Not Available`
                }

                // "Protects the user's stats from being changed by enemy moves."
                else if (this.name == "mist") {
                    // Tie this to user.status
                    // e.g. user.status.push("mist")
                    // Add checks to previous status effects that only work if target pokemon doesn't have "mist" for its status.
                    return `Not Available`
                }

                // "Poisons the target."
                else if (
                    this.name == "poison-powder" ||
                    this.name == "poison-gas"
                    ) {
                    let specialMessage = this.specialEffect(target, "poisoned", this.effectChance);
                    return specialMessage;
                }

                // "Paralyzes the target."
                else if (
                    this.name == "stun-spore" ||
                    this.name == "thunder-wave" ||
                    this.name == "glare"
                    ) {
                    let specialMessage = this.specialEffect(target, "paralyzed", this.effectChance);
                    return specialMessage;
                }

                // "Seeds the target, stealing HP from it every turn."
                else if (this.name == "leech-seed") {
                    return `Not Available`
                }

                // "Badly poisons the target, inflicting more damage every turn."
                else if (this.name == "toxic") {
                    return `Not Available`
                }

                // "Immediately ends wild battles. No effect otherwise.";
                else if (this.name == "teleport") {
                    return `Not Available`
                }

                // "Copies the target's last used move."
                else if (this.name == "mimic") {
                    return `Not Available`
                }

                else if (this.name == "double-team") {
                    "Raises the user's evasion by one stage."
                    user.evasion = Math.floor(user.evasion * 1.25);
                    // for (let i = 0; i < target.moves.length; i ++) {
                    //     target.moves[i].accuracy = Math.floor(target.moves[i].accuracy * 2 / 3);
                    // }
                    return `${user.upperName()}'s Evasion rose!`;
                }

                // "Heals the user by half its max HP."
                else if (
                    this.name == "recover" ||
                    this.name == "soft-boiled"
                    ) {
                    user.hp += Math.floor(user.startHP / 2);
                    if (user.hp > user.startHP) {
                        user.hp = user.startHP;
                    }
                    return `${user.upperName()} recovererd HP!`;
                }

                // "Reduces damage from special attacks by 50% for five turns."
                else if (this.name == "light-screen") {
                    return `Not Available`
                }

                // Resets all stats.
                else if (this.name == "haze") {
                    user.attack[0] = user.startAttack;
                    user.defense[0] = user.startDefense;
                    user.specialAttack[0] = user.startSpecialAttack;
                    user.specialDefense[0] = user.startSpecialDefense;
                    user.speed[0] = user.startSpeed;
                    user.evasion[0] = user.startEvasion;
                    for (let i = 0; i < user.moves.length; i ++) {
                        user.moves[i].accuracy[0] = user.moves[i].startAccuracy;
                    }
                    target.attack[0] = target.startAttack;
                    target.defense[0] = target.startDefense;
                    target.specialAttack[0] = target.startSpecialAttack;
                    target.specialDefense[0] = target.startSpecialDefense;
                    target.speed[0] = target.startSpeed;
                    target.evasion[0] = target.startEvasion;
                    for (let i = 0; i < target.moves.length; i ++) {
                        target.moves[i].accuracy[0] = target.moves[i].startAccuracy;
                    }
                }

                // "Reduces damage from physical attacks by half."
                else if (this.name == "reflect") {
                    return `Not Available`
                }

                // "Increases the user's chance to score a critical hit."
                else if (this.name == "focus-energy") {
                    return `Not Available`
                }

                // "Randomly selects and uses any move in the game."
                else if (this.name == "metronome") {
                    return `Not Available`
                }

                // "Uses the target's last used move."
                else if (this.name == "mirror-move") {
                    return `Not Available`
                }

                // "User becomes a copy of the target until it leaves battle."
                else if (this.name == "transform") {
                    return `Not Available`
                }

                else if (this.name == "splash") {
                    return `It does nothing.`;
                }

                // "User sleeps for two turns, completely healing itself."
                else if (this.name == "rest") {
                    // currentTurn = turn;
                    // if (turn < currentTurn + 2) {
                    //     return `${user.upperName()} is sleeping.`
                    // }
                    // else {
                    //     return `${this.name} has completely recovered its HP!`;
                    // }
                    return `Not Available`
                }

                // "User's type changes to the type of one of its moves at random."
                else if (this.name == "conversion") {
                    let types = [];
                    for (let i = 0; i < user.moves.length; i ++) {
                        types.push(user.moves[i].type);
                    }
                    let index = Math.floor(Math.random() * types.length);
                    if (!user.type.includes(types[index])) {
                        user.type.push(types[index]);
                    }
                }

                // "Transfers 1/4 of the user's max HP into a doll, 
                // protecting the user from further damage or status changes until it breaks."
                // This means you need to hardcode the effects for each special effect (e.g. poisoned)
                else if (this.name == "substitute") {
                    user.status.push("substitute");
                }

                else {
                    console.log(`${this.name} is not a valid status move.`)
                }
            }

            classPhysical(user, target) {
                
                // "Inflicts regular damage. Hits 2-5 times in one turn.
                if (
                    this.name == "double-slap" ||
                    this.name == "comet-punch" ||
                    this.name == "fury-attack" ||
                    this.name == "pin-missile" ||
                    this.name == "spike-cannon"
                    ) {
                    let chance = Math.floor(Math.random() * 8);
                    if (0 <= chance <= 2) {
                        let damage = this.damageCalc(user, target);
                        let damage2 = this.damageCalc(user, target);
                        return `The opposing ${target.upperName()} lost ${damage * 2} HP!`;
                    }
                    else if (3 <= chance <= 5) {
                        let damage = this.damageCalc(user, target);
                        let damage2 = this.damageCalc(user, target);
                        let damage3 = this.damageCalc(user, target);
                        return `The opposing ${target.upperName()} lost ${damage * 3} HP!`;
                    }
                    else if (chance == 6) {
                        let damage = this.damageCalc(user, target);
                        let damage2 = this.damageCalc(user, target);
                        let damage3 = this.damageCalc(user, target);
                        let damage4= this.damageCalc(user, target);
                        return `The opposing ${target.upperName()} lost ${damage * 4} HP!`;
                    }
                    else {
                        let damage = this.damageCalc(user, target);
                        let damage2 = this.damageCalc(user, target);
                        let damage3 = this.damageCalc(user, target);
                        let damage4 = this.damageCalc(user, target);
                        let damage5 = this.damageCalc(user, target);
                        return `The opposing ${target.upperName()} lost ${damage * 5} HP!`;
                    }
                }

                // "Has a $effect_chance% chance to burn the target."
                else if (this.name == "fire-punch") {
                    let damage = this.damageCalc(user, target);
                    let specialMessage = this.specialEffect(target, "burned", this.effectChance);
                    return `The opposing ${target.upperName()} lost ${damage} HP!` + specialMessage;
                }

                // "Has a $effect_chance% chance to freeze the target."
                else if (this.name == "ice-punch") {
                    let damage = this.damageCalc(user, target);
                    let specialMessage = this.specialEffect(target, "frozen", this.effectChance);
                    return `The opposing ${target.upperName()} lost ${damage} HP!` + specialMessage;
                }

                // "Has a $effect_chance% chance to paralyze the target."
                else if (
                    this.name == "thunder-punch" ||
                    this.name == "body-slam" ||
                    this.name == "lick"
                    ) {
                    let damage = this.damageCalc(user, target);
                    let specialMessage = this.specialEffect(target, "paralyzed", this.effectChance);
                    return `The opposing ${target.upperName()} lost ${damage} HP!` + specialMessage;
                }

                // "Causes a one-hit KO."
                else if (
                    this.name == "guillotine" ||
                    this.name == "horn-drill" ||
                    this.name == "fissure"
                    ) {
                    let damage = target.hp;
                    return `The opposing ${target.upperName()} was knocked out!`;
                }

                // "User flies high into the air, dodging all attacks, and hits next turn."
                else if (this.name == "fly") {
                    // var currentTurn = turn;
                    // if (turn == currentTurn) {
                    //     let specialMessage = this.specialEffect(target, "flying", this.effectChance);
                    //     return specialMessage;
                    // }
                    // else if (turn == currentTurn + 1) {
                    //     let damage = this.damageCalc(user, target);
                    //     return `The opposing ${target.upperName()} lost ${damage} HP!`;
                    // }
                    return `Not Available`
                }

                // "Prevents the target from fleeing and inflicts damage for 2-5 turns."
                else if (
                    this.name == "bind" ||
                    this.name == "wrap" ||
                    this.name == "clamp"
                    ) {
                    return `Not Available`
                }

                // "Has a $effect_chance% chance to make the target flinch."
                else if (
                    this.name == "stomp" ||
                    this.name == "rolling-kick" ||
                    this.name == "headbutt" ||
                    this.name == "bite" ||
                    this.name == "bone-club" ||
                    this.name == "waterfall"
                    ) {
                    let damage = this.damageCalc(user, target);
                    let specialMessage = this.specialEffect(target, "flinched", this.effectChance);
                    return `The opposing ${target.upperName()} lost ${damage} HP!` + specialMessage;
                }

                // "Hits twice in one turn."
                else if (this.name == "double-kick") {
                    let damage = this.damageCalc(user, target);
                    let damage2 = this.damageCalc(user, target);
                    return `The opposing ${target.upperName()} lost ${damage * 2} HP!`;
                }

                // "If the user misses, it takes half the damage it would have inflicted in recoil."
                else if (this.name == "jump-kick") {
                    return `Not Available`;
                }

                // "User receives some of the damage it inflicts in recoil."
                else if (
                    this.name == "take-down" ||
                    this.name == "submission"
                    ) {
                    let damage = this.damageCalc(user, target);
                    let recoil = Math.floor(damage / 4);
                    user.hp -= recoil;
                    return `The opposing ${target.upperName()} lost ${damage} HP! \n${user.upperName()} lost ${recoil} HP!`;
                }

                else if (this.name == "double-edge") {
                    let damage = this.damageCalc(user, target);
                    let recoil = Math.floor(damage / 3);
                    user.hp -= recoil;
                    return `The opposing ${target.upperName()} lost ${damage} HP! \n${user.upperName()} lost ${recoil} HP!`;
                }

                // "Hits every turn for 2-3 turns, then confuses the user."
                else if (this.name == "thrash") {
                }

                // "Has a $effect_chance% chance to poison the target."
                else if (this.name == "poison-sting") {
                    let damage = this.damageCalc(user, target);
                    let specialMessage = this.specialEffect(target, "poisoned", this.effectChance);
                    return `The opposing ${target.upperName()} lost ${damage} HP!` + specialMessage;
                }

                // "Hits twice in the same turn. Has a $effect_chance% chance to poison the target."
                else if (this.name == "twineedle") {
                    let damage = this.damageCalc(user, target);
                    let damage2 = this.damageCalc(user, target);
                    let specialMessage = this.specialEffect(target, "poisoned", this.effectChance);
                    return `The opposing ${target.upperName()} lost ${damage * 2} HP!` + specialMessage;
                }

                // "Inflicts more damage to heavier targets, with a maximum of 120 power."
                else if (this.name == "low-kick") {
                    return `Not Available`;
                }

                // "Inflicts twice the damage the user received from the last physical hit it took."
                else if (this.name == "counter") {
                    return `Not Available`;
                }

                // "Inflicts damage equal to the user's level."
                else if (this.name == "seismic-toss") {
                }

                // "Has an increased chance for a critical hit."
                else if (this.name == "razor-leaf") {
                }

                // "Inflicts regular damage and can hit Dig users."
                else if (this.name == "earthquake") {
                    let damage = this.damageCalc(user, target);
                    return `The opposing ${target.upperName()} lost ${damage * 2} HP!`;
                }

                // "User digs underground, dodging all attacks, and hits next turn."
                else if (this.name == "dig") {
                    return `Not Available`;
                }

                // "If the user is hit after using this move, its Attack rises by one stage."
                else if (this.name == "rage") {
                    return `Not Available`;
                }

                // "User waits for two turns, then hits back for twice the damage it took."
                else if (this.name == "bide") {
                    return `Not Available`;
                }

                // "User faints."
                else if (this.name == "self-destruct") {
                    return `Not Available`;
                }

                // "Raises the user's Defense by one stage. User charges for one turn before attacking."
                else if (this.name == "skull-bash") {
                    return `Not Available`;
                }

                // "Has a $effect_chance% chance to lower the target's Speed by one stage."
                else if (this.name == "constrict") {
                    let damage = this.damageCalc(user, target);
                    let statMessage = this.statEffect(target, "Speed", -1, this.effectChance);
                    return `The opposing ${target.upperName()} lost ${damage} HP!` + statMessage;
                }

                else if (this.name == "") {
                }

                else {
                    let damage = this.damageCalc(user, target);
                    if (target.status.includes("flying") && !user.status.includes("flying")) {
                        return `${target.upperName()} is in the air! ${user.upperName()} missed!`;
                    }
                    else if (target.status.includes("dig") && this.name != "earthquake") {
                        return `${target.upperName()} is underground! ${user.upperName()} missed!`;
                    }
                    else {
                        return `The opposing ${target.upperName()} lost ${damage} HP!`;
                    }
                }
            }

            classSpecial(user, target) {

                // "Requires a turn to charge before attacking."
                if (
                    this.name == "razor-wind" ||
                    this.name == "solar-beam"
                    ) {
                    let damage = this.damageCalc(user, target);
                    return `${target.upperName()} lost ${damage} HP!`;
                }

                // "Inflicts regular damage and can hit Pokémon in the air."
                else if (this.name == "gust") {
                    let damage = this.damageCalc(user, target);
                    return `${target.upperName()} lost ${damage} HP!`;
                }

                // "Inflicts 20 points of damage."
                else if (this.name == "sonic-boom") {
                    let damage = 20;
                    return `${target.upperName()} lost ${damage} HP!`;
                }

                // "Has a $effect_chance% chance to lower the target's Special Defense by one stage."
                else if (this.name == "acid") {
                    let damage = this.damageCalc(user, target);
                    let statMessage = this.statEffect(target, "Defense", -1, this.effectChance);
                    return `The opposing ${target.upperName()} lost ${damage} HP!` + statMessage;
                }

                // "Has a $effect_chance% chance to burn the target."
                else if (
                    this.name == "ember" ||
                    this.name == "flamethrower" ||
                    this.name == "fire-blast"
                    ) {
                    let damage = this.damageCalc(user, target);
                    let specialMessage = this.specialEffect(target, "burned", this.effectChance);
                    return `The opposing ${target.upperName()} lost ${damage} HP!` + specialMessage;
                }

                // "Inflicts regular damage with no additional effect."
                else if (
                    this.name == "water-gun" ||
                    this.name == "hydro-pump"
                    ) {
                    let damage = this.damageCalc(user, target);
                    return `${target.upperName()} lost ${damage} HP!`;
                }

                // "Inflicts regular damage and can hit Dive users."
                else if (this.name == "surf") {
                    let damage = this.damageCalc(user, target);
                    return `${target.upperName()} lost ${damage} HP!`;
                }

                // "Has a $effect_chance% chance to freeze the target."
                else if (
                    this.name == "ice-beam" ||
                    this.name == "blizzard"
                    ) {
                    let damage = this.damageCalc(user, target);
                    let specialMessage = this.specialEffect(target, "frozen", 10, this.effectChance);
                    return `The opposing ${target.upperName()} lost ${damage} HP!` + specialMessage;
                }

                // "Has a $effect_chance% chance to lower the target's Speed by one stage."
                else if (
                    this.name == "bubble-beam" ||
                    this.name == "bubble"
                    ) {
                    let damage = this.damageCalc(user, target);
                    let statMessage = this.statEffect(target, "Speed", -1, this.effectChance);
                    return `The opposing ${target.upperName()} lost ${damage} HP!` + statMessage;

                }

                // "Has a $effect_chance% chance to lower the target's Attack by one stage."
                else if (this.name == "aurora-beam") {
                    let damage = this.damageCalc(user, target);
                    let statMessage = this.statEffect(target, "Attack", -1, this.effectChance);
                    return `The opposing ${target.upperName()} lost ${damage} HP!` + statMessage;
                }

                // "User foregoes its next turn to recharge."
                else if (this.name == "hyper-beam") {
                    let damage = this.damageCalc(user, target);
                    return `The opposing ${target.upperName()} lost ${damage} HP!`;
                }

                // "Drains half the damage inflicted to heal the user."
                else if (
                    this.name == "absorb" ||
                    this.name == "mega-drain"
                    ) {
                    let damage = this.damageCalc(user, target);
                    let drain = Math.floor(damage / 2);
                    user.hp += drain;
                    return `The opposing ${target.upperName()} lost ${damage} HP!
                    ${user.upperName()} gained ${drain} HP!`;
                }

                // "Hits every turn for 2-3 turns, then confuses the user."
                else if (this.name == "petal-dance") {
                }

                // "Inflicts 40 points of damage."
                else if (this.name == "dragon-rage") {
                    let damage = 40;
                    target.hp -= damage;
                    return `The opposing ${target.upperName()}'s lost ${damage} HP!`;
                }

                // "Prevents the target from fleeing and inflicts damage for 2-5 turns."
                else if (this.name == "fire-spin") {
                    return `Not Available`
                }

                // "Has a $effect_chance% chance to paralyze the target."
                else if (
                    this.name == "thunder-shock" ||
                    this.name == "thunderbolt" ||
                    this.name == "thunder"
                    ) {
                    let damage = this.damageCalc(user, target);
                    let specialMessage = this.specialEffect(target, "paralyzed", this.effectChance);
                    return `The opposing ${target.upperName()}'s lost ${damage} HP!` + specialMessage;
                }

                // "Has a $effect_chance% chance to confuse the target."
                else if (
                    this.name == "confusion" ||
                    this.name == "psybeam"
                    ) {
                    let damage = this.damageCalc(user, target);
                    let specialMessage = this.specialEffect(target, "confused", 10);
                    return `The opposing ${target.upperName()} lost ${damage} HP!` + specialMessage;
                }

                // "Has a $effect_chance% chance to lower the target's Special Defense by one stage."
                else if (this.name == "psychic") {
                    let damage = this.damageCalc(user, target);
                    let statMessage = this.statEffect(target, "Special Defense", -1);
                    return `The opposing ${target.upperName()} lost ${damage} HP!` + statMessage;
                }

                // "Inflicts damage equal to the user's level."
                else if (this.name == "night-shade") {
                    return `Not Available`
                }

                // "Has a $effect_chance% chance to poison the target."
                else if (
                    this.name == "smog" ||
                    this.name == "sludge"
                    ) {
                    let damage = this.damageCalc(user, target);
                    let specialMessage = this.specialEffect(target, "poisoned", 10);
                    return `The opposing ${target.upperName()} lost ${damage} HP!` + specialMessage;
                }

                // "Never misses."
                else if (this.name == "swift") {
                    return `Not Available`
                }

                // "Only works on sleeping Pokémon. Drains half the damage inflicted to heal the user."
                else if (this.name == "dream-eater") {
                    if (target.status.includes("sleeping")) {
                        let damage = this.damageCalc(user, target);
                        let drain = Math.floor(damage / 2);
                        user.hp += drain;
                        return `${target.upperName()} lost ${damage} HP!
                        ${user.upperName()} gained ${drain} HP!`
                    }
                    else {
                        return `It's not very effective.`
                    }
                }

                else if (this.name == "psywave") {
                    // "Inflicts damage between 50% and 150% of the user's level."
                    let min = Math.ceil(50);
                    let max = Math.floor(150);
                    let percentage = Math.floor(baseDamage * (Math.floor(Math.random() * (max - min + 1)) + min) / 100)
                    let damage = Math.floor(50 * percentage);
                    target.hp -= damage;
                    return `The opposing ${target.upperName()} lost ${damage} HP!`
                }

                else if (this.name == "tri-attack") {
                    // "Has a $effect_chance% chance to burn, freeze, or paralyze the target."
                    let damage = this.damageCalc(user, target);
                    let effect1 = this.specialEffect(target, "burned", 20);
                    let effect2 = this.specialEffect(target, "frozen", 20);
                    let effect3 = this.specialEffect(target, "paralyzed", 20);
                    return `The opposing ${target.upperName()} lost ${damage} HP!` + effect1 + effect2 + effect3;
                }
            }

        } // End of Move Class

        var allMoves = {};
        for (let i = 0; i < moves[0].length; i ++) {
            let name = moves[0][i];
            let move = new Move(moves[0][i], moves[1][i]);
            allMoves[name] = move;
        }
        
        function statCalc(base, iv, modifier) {
            return Math.floor(((base + iv) * 2 + (107690 ** 0.5) / 4) * 0.5 + modifier);
        }
        class Pokemon {

            constructor(pokeName, pokeObject) {
                this.name = pokeName;
                this.startHP = statCalc(Number(pokeObject.stats[5].base_stat), 7, 60);
                this.startAttack = statCalc(Number(pokeObject.stats[4].base_stat), 8, 5);
                this.startDefense = statCalc(Number(pokeObject.stats[3].base_stat), 13, 5);
                this.startSpecialAttack = statCalc(Number(pokeObject.stats[2].base_stat), 9, 5);
                this.startSpecialDefense = statCalc(Number(pokeObject.stats[1].base_stat), 9, 5);
                this.startSpeed = statCalc(Number(pokeObject.stats[0].base_stat), 5, 5);
                this.startEvasion = 100;
                this.startType = [];
                this.hp = this.startHP;
                // Stat arrays are structured as [current value, stage, initial value]
                this.attack = [this.startAttack, 0, this.startAttack];
                this.defense = [this.startDefense, 0, this.startDefense];
                this.specialAttack = [this.startSpecialAttack, 0, this.startSpecialAttack];
                this.specialDefense = [this.startSpecialDefense, 0, this.startSpecialDefense];
                this.speed = [this.startSpeed, 0, this.startSpeed];
                this.evasion = [this.startEvasion, 0, this.startEvasion];
                this.front = pokeObject.sprites.front_default;
                this.back = pokeObject.sprites.back_default;
                this.moves = [];
                this.type = this.startType;
                this.status = [];

                const exceptions1 = [
                    "caterpie",
                    "metapod",
                    "weedle",
                    "kakuna",
                    "magikarp"
                ];

                const exceptions2 = [
                    "ditto"
                ];

                if (exceptions1.includes(this.name)) {
                    var maxLength = 2;
                }
                else if (exceptions2.includes(this.name)) {
                    var maxLength = 1;
                }
                else {
                    var maxLength = 4;
                }
                while (this.moves.length < maxLength) {
                    let index = Math.floor(Math.random() * pokeObject.moves.length);
                    let move = pokeObject.moves[index].move.name;
                    if (moves[0].includes(move)) {
                        if (!this.moves.includes(allMoves[move])) {
                            this.moves.push(allMoves[move]);
                        }
                    }
                }

                for (let i = 0; i < pokeObject.types.length; i ++) {
                    let typeName = pokeObject.types[i].type.name;
                    this.startType.push(typeName);
                }
            }

            upperName() {
                return this.name[0].toUpperCase() + this.name.slice(1, this.name.length);
            }

            useMove(move, target) {
                console.log(`${this.upperName()} used ${move.upperName()}!`) // Testing Line
                let hitOrMiss = Math.floor(Math.random() * 100);
                if (hitOrMiss > move.accuracy && move.name != "swift") {
                    return `${this.upperName()} missed!`;
                }
                else if (move.accuracy < target.evasion) {
                    let evade = target.evasion - move.accuracy;
                    let hit = Math.floor(Math.random() * 100);
                    if (hit >= evade) {
                        if (move.damage_class == "physical") {
                            let message = move.classPhysical(this, target);
                            return message;
                        }
                        else if (move.damage_class == "special") {
                            let message = move.classSpecial(this, target);
                            return message;
                        }
                        else if (move.damage_class == "status") {
                            let message = move.classStatus(this, target);
                            return message;
                        }
                        else {
                            console.log(`${move} has an invalid class.`)
                        }
                    }
                    else {
                        return `${this.upperName()} missed!`;
                    }
                // If pokemon evasion is above move accuracy, the difference is the chance the move misses.
                }
                else {
                    if (move.damage_class == "physical") {
                        let message = move.classPhysical(this, target);
                        return message;
                    }
                    else if (move.damage_class == "special") {
                        let message = move.classSpecial(this, target);
                        return message;
                    }
                    else if (move.damage_class == "status") {
                        let message = move.classStatus(this, target);
                        return message;
                    }
                    else {
                        console.log(`${move} has an invalid class.`)
                    }
                }
            }

            hpLeft() {
                let name = this.upperName();
                if (this.hp <= 0) {
                    return `${name} has fainted!`;
                }
                return `${name} has ${this.hp} hp.`;
            }

            alive() {
                return true;
                // if (this.hp > 0) {
                //     return true;
                // }
                // else {
                //     return false;
                // }
            }

        } // End of Pokemon Class

        var allPokemon = {};
        for (let i = 0; i < pokedex.length; i ++) {
            let name = pokedex[i][0];
            let pokemon = new Pokemon(pokedex[i][0], pokedex[i][1]);
            allPokemon[name] = pokemon;
        }

        // console.log(allPokemon);
        // console.log(allMoves["barrage"]);

        // ------------------------------------------------------------------------------------

        // Function Definitions

        function disableButtons() {
            if (
                movePPLeftArr[0] > 0 ||
                movePPLeftArr[1] > 0 ||
                movePPLeftArr[2] > 0 ||
                movePPLeftArr[3] > 0
                ) {
                $("#moveButton1").prop("disabled", true);
            }
            else {
                let checkAllPP = 0;
                for (let i = 0; i < movePPLeftArr.length; i ++) {
                    if (movePPLeftArr[i] < 1) {
                        checkAllPP ++;
                    }
                }
                if (checkAllPP == movePPLeftArr.length) {
                    pokemon1.moves[0] == "struggle";
                    $("#moveName1").text("Struggle");
                    $("#moveClass1").text("Physical");
                    $("#moveType1").text("Normal");
                    $("#movePP1").text(`1/1`);
                }
            }
            $("#moveButton2").prop("disabled", true);
            $("#moveButton3").prop("disabled", true);
            $("#moveButton4").prop("disabled", true);
        }

        function enableButtons() {
            if (movePPLeftArr[0] > 0 || $("#moveName1").text() == "Struggle") {
                $("#moveButton1").prop("disabled", false);
            }
            if (movePPLeftArr[1] > 0) {
                $("#moveButton2").prop("disabled", false);
            }
            if (movePPLeftArr[2] > 0) {
                $("#moveButton3").prop("disabled", false);
            }
            if (movePPLeftArr[3] > 0) {
                $("#moveButton4").prop("disabled", false);
            }
        }

        function checkStatus(pokemon) {
            if (pokemon.status.includes("burned")) {

            }
            if (pokemon.status.includes("frozen")) {

            }
            if (pokemon.status.includes("poisoned")) {

            }
            if (pokemon.status.includes("paralyzed")) {

            }
            if (pokemon.status.includes("sleeping")) {

            }
            if (pokemon.status.includes("substituted")) {

            }
            if (pokemon.status.includes("flying")) {

            }
            if (pokemon.status.includes("dig")) {

            }
        }

        // ------------------------------------------------------------------------------------

        // Main Gameplay
        

        var turn = 1;
        let pokemonIndex1 = Math.floor(Math.random() * pokedex.length);
        let pokemonIndex2 = Math.floor(Math.random() * pokedex.length);
        let pokemon1 = allPokemon[pokedex[pokemonIndex1][0]];
        let pokemon2 = allPokemon[pokedex[pokemonIndex2][0]];
        // let pokemon1 = allPokemon[131]; // Index for Ditto
        console.log(pokemon1);
        console.log(pokemon2);

        // Assign moves, types, and pp values
        let moveArr = [];
        let moveNameArr = [];
        let moveClassArr = [];
        let moveTypeArr = [];
        let movePPLeftArr = [];

        for (let i = 0; i < pokemon1.moves.length; i ++) {
            let move = pokemon1.moves[i];
            let moveName = move.upperName();
            // let moveName = move.name[0].toUpperCase() + move.name.slice(1, move.name.length);
            let moveClass = move.damage_class[0].toUpperCase() + move.damage_class.slice(1, move.damage_class.length);
            let moveType = move.type[0].toUpperCase() + move.type.slice(1, move.type.length);
            let movePPLeft = move.pp;
            moveArr.push(move);
            moveNameArr.push(moveName);
            moveClassArr.push(moveClass);
            moveTypeArr.push(moveType);
            movePPLeftArr.push(movePPLeft);
        }

        // Assign previous values to button text
        $("#moveName1").text(moveNameArr[0]);
        $("#moveClass1").text(moveClassArr[0]);
        $("#moveType1").text(moveTypeArr[0]);
        $("#movePP1").text(`${movePPLeftArr[0]}/${moveArr[0].pp}`);

        if (moveArr.length > 1) {
            $("#moveName2").text(moveNameArr[1]);
            $("#moveClass2").text(moveClassArr[1]);
            $("#moveType2").text(moveTypeArr[1]);
            $("#movePP2").text(`${movePPLeftArr[1]}/${moveArr[1].pp}`);
        }
        else {
            $("#moveName2").text("None");
            $("#moveButton2").prop("disabled", true);
        }

        if (moveArr.length > 2) {
            $("#moveName3").text(moveNameArr[2]);
            $("#moveClass3").text(moveClassArr[2]);
            $("#moveType3").text(moveTypeArr[2]);
            $("#movePP3").text(`${movePPLeftArr[2]}/${moveArr[2].pp}`);

            $("#moveName4").text(moveNameArr[3]);
            $("#moveClass4").text(moveClassArr[3]);
            $("#moveType4").text(moveTypeArr[3]);
            $("#movePP4").text(`${movePPLeftArr[3]}/${moveArr[3].pp}`);
        }
        else {
            $("#moveName3").text("None");
            $("#moveName4").text("None");
            $("#moveButton3").prop("disabled", true);
            $("#moveButton4").prop("disabled", true);
        }

        // ------------------------------------------------------------------------------------

        // Main Gameplay

            

        // Adding Sprite for Enemy Pokemon
        for (let i = 0; i < allPokemon.length; i++)
            if(pokemon1 == allPokemon[i]) {
                let enemyPokemon = document.getElementById("enemyPokemon")
                let pokemon2Box = document.createElement("img")
                pokemon2Box.setAttribute("id", "playerPokemonBack")
                pokemon2Box.src = pokemon2.front
                enemyPokemon.appendChild(pokemon2Box)
        };




        $("#move1").click(() => {
            
            movePPLeftArr[0] --;
            $("#movePP1").text(`${movePPLeftArr[0]}/${moveArr[0].pp}`);
            disableButtons();
            checkStatus(pokemon1);
            checkStatus(pokemon2);
            let i = Math.floor(Math.random() * pokemon2.moves.length);
            let enemyMove = pokemon2.moves[i];
            if (pokemon2.speed[0] > pokemon1.speed[0]) {
                let message1 = pokemon2.useMove(enemyMove, pokemon1);
                console.log(message1);
                if (pokemon1.alive() && pokemon2.alive()) {
                    let message2 = pokemon1.useMove(moveArr[0], pokemon2);
                    console.log(message2);
                }
            }
            else {
                let message1 = pokemon1.useMove(moveArr[0], pokemon2);
                console.log(message1);
                if (pokemon1.alive() && pokemon2.alive()) {
                    let message2 = pokemon2.useMove(enemyMove, pokemon1);
                    console.log(message2);
                }
            }
            console.log(pokemon1.hpLeft());
            console.log(pokemon2.hpLeft());
            turn ++;
            enableButtons();
        });

    
        $("#move2").click(() => {
            
            movePPLeftArr[1] --;
            $("#movePP2").text(`${movePPLeftArr[1]}/${moveArr[1].pp}`);
            disableButtons();
            checkStatus(pokemon1);
            checkStatus(pokemon2);
            let i = Math.floor(Math.random() * pokemon2.moves.length);
            let enemyMove = pokemon2.moves[i];
            if (pokemon2.speed[0] > pokemon1.speed[0]) {
                let message1 = pokemon2.useMove(enemyMove, pokemon1);
                console.log(message1);
                if (pokemon1.alive() && pokemon2.alive()) {
                    let message2 = pokemon1.useMove(moveArr[1], pokemon2);
                    console.log(message2);
                }
            }
            else {
                let message1 = pokemon1.useMove(moveArr[1], pokemon2);
                console.log(message1);
                if (pokemon1.alive() && pokemon2.alive()) {
                    let message2 = pokemon2.useMove(enemyMove, pokemon1);
                    console.log(message2);
                }
            }
            console.log(pokemon1.hpLeft());
            console.log(pokemon2.hpLeft());
            turn ++;
            enableButtons();
        });

        $("#move3").click(() => {
            
            movePPLeftArr[2] --;
            $("#movePP3").text(`${movePPLeftArr[2]}/${moveArr[2].pp}`);
            disableButtons();
            checkStatus(pokemon1);
            checkStatus(pokemon2);
            let i = Math.floor(Math.random() * pokemon2.moves.length);
            let enemyMove = pokemon2.moves[i];
            if (pokemon2.speed[0] > pokemon1.speed[0]) {
                let message1 = pokemon2.useMove(enemyMove, pokemon1);
                console.log(message1);
                if (pokemon1.alive() && pokemon2.alive()) {
                    let message2 = pokemon1.useMove(moveArr[2], pokemon2);
                    console.log(message2);
                }
            }
            else {
                let message1 = pokemon1.useMove(moveArr[2], pokemon2);
                console.log(message1);
                if (pokemon1.alive() && pokemon2.alive()) {
                    let message2 = pokemon2.useMove(enemyMove, pokemon1);
                    console.log(message2);
                }
            }
            console.log(pokemon1.hpLeft());
            console.log(pokemon2.hpLeft());
            turn ++;
            enableButtons();
        });

        $("#move4").click(() => {
            
            movePPLeftArr[3] --;
            $("#movePP4").text(`${movePPLeftArr[3]}/${moveArr[3].pp}`);
            disableButtons();
            checkStatus(pokemon1);
            checkStatus(pokemon2);
            let i = Math.floor(Math.random() * pokemon2.moves.length);
            let enemyMove = pokemon2.moves[i];
            if (pokemon2.speed[0] > pokemon1.speed[0]) {
                let message1 = pokemon2.useMove(enemyMove, pokemon1);
                console.log(message1);
                if (pokemon1.alive() && pokemon2.alive()) {
                    let message2 = pokemon1.useMove(moveArr[3], pokemon2);
                    console.log(message2);
                }
            }
            else {
                let message1 = pokemon1.useMove(moveArr[3], pokemon2);
                console.log(message1);
                if (pokemon1.alive() && pokemon2.alive()) {
                    let message2 = pokemon2.useMove(enemyMove, pokemon1);
                    console.log(message2);
                }
            }
            console.log(pokemon1.hpLeft());
            console.log(pokemon2.hpLeft());
            turn ++;
            enableButtons();
        });

        // ------------------------------------------------------------------------------------

    }, 4000)

});
function wiggleclick(){
document.getElementById("playerPokemon")
var loop = anime({
    targets: '#playerPokemon',
    translateX: 50,
    translateY: -90,
    loop: 6,
    direction: 'alternate'
});
}
function wiggleclick2(){
    document.getElementById("enemyPokemon")
    var loop = anime({
        targets: '#enemyPokemon',
        translateX: -50,
        translateY: 90,
        loop: 6,
        direction: 'alternate'
    });
    }
    //