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
                this.type = moveObject.type.name;
                this.target = moveObject.target.name;
                this.startAccuracy = moveObject.accuracy;
                if (
                    this.startAccuracy == null || 
                    typeof(this.startAccuracy) == "undefined"
                    ) {
                    this.startAccuracy = 100;
                }
                this.accuracy = [this.startAccuracy, 0, this.startAccuracy];
                this.power = moveObject.power;
                this.effectChance = moveObject.effect_chance;
                this.pp = moveObject.pp;
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

            // damageCalc method
            // Pure damage calc for physical and special moves with a Power value
            damageCalc(user, target, critModifier = 1) {
                let min = Math.ceil(85);
                let max = Math.floor(100);
                if (this.damage_class == "physical") {
                    let baseDamage = (22 * this.power * user.attack[0] / target.defense[0] / 50) + 2;
                    var damage = Math.floor(baseDamage * (Math.floor(Math.random() * (max - min + 1)) + min) / 100);
                    let threshold = Math.floor(user.speed[0] * critModifier * 100 / 512);
                    let critChance = Math.floor(Math.random() * 100);
                    if (critChance <= threshold) {
                        damage = damage * 2;
                    }
                    if (damage > target.hp) {
                        damage = target.hp;
                    }
                    target.hp -= damage;
                    if ("burned" in user.status) {
                        damage = Math.floor(damage / 2);
                    }
                    return damage;
                }
                else if (this.damage_class == "special") {
                    let baseDamage = (22 * this.power * user.specialAttack[0] / target.specialDefense[0] / 50) + 2;
                    var damage = Math.floor(baseDamage * (Math.floor(Math.random() * (max - min + 1)) + min) / 100);
                    let threshold = Math.floor(user.speed[0] * critModifier * 100 / 512);
                    let critChance = Math.floor(Math.random() * 100);
                    if (critChance <= threshold) {
                        damage = damage * 2;
                    }
                    if (damage > target.hp) {
                        damage = target.hp;
                    }
                    target.hp -= damage;
                    if ("burned" in user.status) {
                        damage = Math.floor(damage / 2);
                    }
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

            // statEffect method
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

            // accuracyEffect method
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

            // specialEffect method
            // For effects that change status conditions (e.g. frozen)
            specialEffect(battle, target, effect, chance = 100, duration = 5) {
                if (chance == null) {
                    chance = 100;
                }
                let cutoff = Math.floor(Math.random() * 100);
                if (chance >= cutoff) {
                    
                    // Non-volatile status conditions are mutually exclusive
                    if (effect == "burned") {
                        if (
                            "burned" in target.status == false &&
                            "frozen" in target.status == false &&
                            "paralyzed" in target.status == false &&
                            "poisoned" in target.status == false &&
                            "sleeping" in target.status == false &&
                            !target.type.includes("fire")
                        ) {
                            target.status["burned"] = [duration += battle.turn];
                            return `\n${target.upperName()} is on fire!`;
                        }
                        else if (battle.turn < target.status["burned"][0]) {
                            let damage = Math.floor(target.startHP / 16);
                            target.hp -= damage;
                            return `\n${target.upperName()} is on fire and loses ${damage} HP!`;
                        }
                        else if (battle.turn == target.status["burned"][0]) {
                            delete target.status["burned"];
                            return `\n${target.upperName()} is no longer on fire!`;
                        }
                        else {
                            return "";
                        }
                    }

                    else if (effect == "frozen") {
                        if (
                            "burned" in target.status == false &&
                            "frozen" in target.status == false &&
                            "paralyzed" in target.status == false &&
                            "poisoned" in target.status == false &&
                            "sleeping" in target.status == false &&
                            !target.type.includes("ice")
                        ) {
                            target.status["frozen"] = [duration += battle.turn];
                            return `\n${target.upperName()} is frozen!`;
                        }
                        else if (battle.turn < target.status["frozen"][0]) {
                            let thaw = Math.floor(Math.random() * 5);
                            if (thaw == 0) {
                                delete target.status["frozen"];
                                return `\n${target.upperName()} has thawed!`;
                            }
                            else {
                                return `\n${target.upperName()} is frozen!`;
                            }
                        }
                        else if (battle.turn == target.status["frozen"][0]) {
                            delete target.status["frozen"];
                            return `\n${target.upperName()} has thawed!`;
                        }
                        else {
                            return "";
                        }
                    }

                    else if (effect == "paralyzed") {
                        if (
                            "burned" in target.status == false &&
                            "frozen" in target.status == false &&
                            "paralyzed" in target.status == false &&
                            "poisoned" in target.status == false &&
                            "sleeping" in target.status == false &&
                            !target.type.includes(this.type)
                        ) {
                            target.status["paralyzed"] = [duration += battle.turn];
                            target.speed[0] = Math.floor(target.speed[0] * 3 / 4);
                            return `\n${target.upperName()} is paralyzed!`
                        }
                        else if (battle.turn < target.status["paralyzed"][0]) {
                            return `\n${target.upperName()} is paralyzed!`
                        }
                        else if (battle.turn == target.status["paralyzed"][0]) {
                            delete target.status["paralyzed"];
                            statEffect(target, "Speed", 0)
                            return `\n${target.upperName()} is no longer paralyzed!`
                        }
                    }

                    else if (effect == "poisoned") {
                        if (
                            "burned" in target.status == false &&
                            "frozen" in target.status == false &&
                            "paralyzed" in target.status == false &&
                            "poisoned" in target.status == false &&
                            "sleeping" in target.status == false &&
                            !target.type.includes("poison")
                        ) {
                            target.status["poisoned"] = [duration += battle.turn];
                            return `\n${target.upperName()} is poisoned!`;
                        }
                        else if (battle.turn < target.status["poisoned"][0]) {
                            let damage = Math.floor(target.startHP / 8);
                            target.hp -= damage;
                            return `\n${target.upperName()} is poisoned and loses ${damage} HP!`;
                        }
                        else if (battle.turn == target.status["poisoned"][0]) {
                            delete target.status["poisoned"];
                            return `\n${target.upperName()} is no longer poisoned!`;
                        }
                        else {
                            return "";
                        }
                    }

                    else if (effect == "sleeping") {
                        if (
                            "burned" in target.status == false &&
                            "frozen" in target.status == false &&
                            "paralyzed" in target.status == false &&
                            "poisoned" in target.status == false &&
                            "sleeping" in target.status == false
                        ) {
                            target.status["sleeping"] = [duration += battle.turn];
                            return `\n${target.upperName()} is sleeping!`;
                        }
                        else if (battle.turn < target.status["sleeping"][0]) {
                            return `\n${target.upperName()} is sleeping!`;
                        }
                        else {
                            delete target.status["sleeping"];
                            return `\n${target.upperName()} is awake!`;
                        }
                    }

                    // Other status conditions
                    else if (effect == "confused") {
                        if (
                            "confused" in target.status == false
                        ) {
                            return `\n${target.upperName()} is confused!`;
                        }
                    }

                    else if (effect == "flying") {
                        if (
                            "flying" in target.status == false
                        ) {
                            return `\n${target.upperName()} flew into the air!`;
                        }
                    }

                    else if (effect == "dig") {
                        if (
                            "dig" in target.status == false
                        ) {
                        return `\n${target.upperName()} dug underground!`;
                        }
                    }

                    else if (effect == "flinched") {
                        if (
                            "flinched" in target.status == false
                        ) {
                        return `\n${target.upperName()} flinched!`;
                        }
                    }

                    else if (effect == "mist") {
                        if (
                            "mist" in target.status == false
                        ) {
                        return `\n${target.upperName()} is hidden behind mist!`;
                        }
                    }
                
                }
                else {
                    return "";
                }
            }

            // All Status moves
            classStatus(battle, user, target) {

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
                    return `Not Available` // Need to implement switching feature
                }

                // "Puts the target to sleep."
                else if (
                    this.name == "sing" ||
                    this.name == "sleep-powder" ||
                    this.name == "hypnosis" ||
                    this.name == "lovely-kiss" ||
                    this.name == "spore"
                    ) {
                    let specialMessage = this.specialEffect(battle, target, "sleeping", this.effectChance);
                    return specialMessage;
                }

                // "Confuses the target."
                else if (
                    this.name == "supersonic" ||
                    this.name == "confuse-ray"
                    ) {
                    let specialMessage = this.specialEffect(battle, target, "confused", this.effectChance);
                    return specialMessage;
                }

                // "Disables the target's last used move for 1-8 turns."
                else if (this.name == "disable") {
                    if ("disable" in target.status == false) {
                        let duration = Math.floor(Math.random() * 8) + battle.turn + 1;
                        let disabledMove = target.lastMove;
                        target.status["disable"] = [duration, disabledMove];
                        return `The opposing ${target.upperName()}'s ${disabledMove} is disabled for ${duration} turns!`
                    }
                    else {
                        return `Disable failed!  Only one move can be disabled at a time!`;
                    }
                }

                // "Protects the user's stats from being changed by enemy moves."
                else if (this.name == "mist") {
                    if ("mist" in user.status == false) {
                        let duration = 5;
                        user.status["mist"] = [duration];
                        return `${user.upperName()} is cloaked in mist!`
                    }
                }

                // "Poisons the target."
                else if (
                    this.name == "poison-powder" ||
                    this.name == "poison-gas"
                    ) {
                    let specialMessage = this.specialEffect(battle, target, "poisoned", this.effectChance);
                    return specialMessage;
                }

                // "Paralyzes the target."
                else if (
                    this.name == "stun-spore" ||
                    this.name == "thunder-wave" ||
                    this.name == "glare"
                    ) {
                    let specialMessage = this.specialEffect(battle, target, "paralyzed", this.effectChance);
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
                    return `Not Available`;
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
                    return `Not Available`;
                }

                else {
                    console.log(`${this.name} is not a valid status move.`)
                }
            }

            // All Physical moves that have an effect
            classPhysical(battle, user, target) {
                
                // "Inflicts regular damage. Hits 2-5 times in one turn.
                if (
                    this.name == "double-slap" ||
                    this.name == "comet-punch" ||
                    this.name == "fury-attack" ||
                    this.name == "pin-missile" ||
                    this.name == "spike-cannon" ||
                    this.name == "barrage" ||
                    this.name == "fury-swipes" 
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
                    let specialMessage = this.specialEffect(battle, target, "burned", this.effectChance);
                    return `The opposing ${target.upperName()} lost ${damage} HP!` + specialMessage;
                }

                // "Has a $effect_chance% chance to freeze the target."
                else if (this.name == "ice-punch") {
                    let damage = this.damageCalc(user, target);
                    let specialMessage = this.specialEffect(battle, target, "frozen", this.effectChance);
                    return `The opposing ${target.upperName()} lost ${damage} HP!` + specialMessage;
                }

                // "Has a $effect_chance% chance to paralyze the target."
                else if (
                    this.name == "thunder-punch" ||
                    this.name == "body-slam" ||
                    this.name == "lick"
                    ) {
                    let damage = this.damageCalc(user, target);
                    let specialMessage = this.specialEffect(battle, target, "paralyzed", this.effectChance);
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
                    this.name == "waterfall" ||
                    this.name == "rock-slide" ||
                    this.name == "hyper-fang"
                    ) {
                    let damage = this.damageCalc(user, target);
                    let specialMessage = this.specialEffect(battle, target, "flinched", this.effectChance);
                    return `The opposing ${target.upperName()} lost ${damage} HP!` + specialMessage;
                }

                // "Hits twice in one turn."
                else if (
                    this.name == "double-kick" ||
                    this.name == "bonemerang"
                    ) {
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
                    if (battle.effectTurn == 0) {
                        battle.effectTurn = battle.turn;
                        let damage = this.damageCalc(user, target);
                        return `The opposing ${target.upperName()} lost ${damage} HP!`;
                    }
                    else {
                        if (battle.turn <= battle.effectTurn + 2) {
                            let damage = this.damageCalc(user, target);
                            return `The opposing ${target.upperName()} lost ${damage} HP!`;
                        }
                        else {
                            battle.effectTurn = 0;
                            let specialMessage = this.specialEffect(battle, user, "confused");
                            return specialMessage;
                        }
                    }
                }

                // "Has a $effect_chance% chance to poison the target."
                else if (this.name == "poison-sting") {
                    let damage = this.damageCalc(user, target);
                    let specialMessage = this.specialEffect(battle, target, "poisoned", this.effectChance);
                    return `The opposing ${target.upperName()} lost ${damage} HP!` + specialMessage;
                }

                // "Hits twice in the same turn. Has a $effect_chance% chance to poison the target."
                else if (this.name == "twineedle") {
                    let damage = this.damageCalc(user, target);
                    let damage2 = this.damageCalc(user, target);
                    let specialMessage = this.specialEffect(battle, target, "poisoned", this.effectChance);
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
                    return `Not Available`;
                }

                // "Has an increased chance for a critical hit."
                else if (
                    this.name == "razor-leaf" ||
                    this.name == "crabhammer" ||
                    this.name == "slash"
                    ) {
                    let damage = this.damageCalc(user, target, 4);
                    return `The opposing ${target.upperName()} lost ${damage} HP!`;
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
                else if (
                    this.name == "self-destruct" ||
                    this.name == "explosion"
                    ) {
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

                // "If the user misses, it takes half the damage it would have inflicted in recoil."
                else if (this.name == "high-jump-kick") {
                    return `Not Available`;
                }

                // "Drains half the damage inflicted to heal the user."
                else if (this.name == "leech-life") {
                    let damage = this.damageCalc(user, target);
                    let drain = Math.floor(damage / 2);
                    user.hp += drain;
                    return `The opposing ${target.upperName()} lost ${damage} HP!
                    ${user.upperName()} gained ${drain} HP!`;
                }

                // "User charges for one turn before attacking. Has a $effect_chance% chance to make the target flinch."
                else if (this.name == "sky-attack") {
                    return `Not Available`;
                }

                // "Has a $effect_chance% chance to confuse the target."
                else if (this.name == "dizzy-punch") {
                    let damage = this.damageCalc(user, target);
                    let specialMessage = this.specialEffect(battle, target, "confused", this.effectChance);
                    return `The opposing ${target.upperName()} lost ${damage} HP!` + specialMessage;
                }

                // "Inflicts damage equal to half the target's HP."
                else if (this.name == "super-fang") {
                    let damage = Math.floor(target.hp / 2);
                    target.hp -= damage;
                    return `The opposing ${target.upperName()} lost ${damage} HP!`;
                }

                else if (this.name == "") {
                }

                else {
                    let damage = this.damageCalc(user, target);
                    if ("flying" in target.status && "flying" in user.status == false) {
                        return `${target.upperName()} is in the air! ${user.upperName()} missed!`;
                    }
                    else if ("dig" in target.status && this.name != "earthquake") {
                        return `${target.upperName()} is underground! ${user.upperName()} missed!`;
                    }
                    else {
                        return `The opposing ${target.upperName()} lost ${damage} HP!`;
                    }
                }
            }

            // All Special moves
            classSpecial(battle, user, target) {

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
                    let specialMessage = this.specialEffect(battle, target, "burned", this.effectChance);
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
                    let specialMessage = this.specialEffect(battle, target, "frozen", 10, this.effectChance);
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
                    return `The opposing ${target.upperName()} lost ${damage} HP! \n${user.upperName()} gained ${drain} HP!`;
                }

                // "Hits every turn for 2-3 turns, then confuses the user."
                else if (this.name == "petal-dance") { 
                    // if ("petal-dance" in battle.effects[user.name] == false) {
                    //     let duration = battle.turn + Math.floor(Math.random() * 1) + 1;
                    //     battle.effects[user.name]["petal-dance"] = [duration];
                    //     let damage = this.damageCalc(user, target);
                    //     return `The opposing ${target.upperName()} lost ${damage} HP!`;
                    // }
                    // else if (battle.turn <= battle.effects[user.name]["petal-dance"][0]) {
                    //     let damage = this.damageCalc(user, target);
                    //     return `The opposing ${target.upperName()} lost ${damage} HP!`;
                    // }
                    // else {
                    //     delete battle.effects[user.name]["petal-dance"];
                    //     let specialMessage = this.specialEffect(battle, user, "confused");
                    //     return specialMessage;
                    // }

                    if ("petal-dance" in user.status == false) {
                        let duration = battle.turn + Math.floor(Math.random() * 2) + 1;
                        user.status["petal-dance"] = [duration];
                        let damage = this.damageCalc(user, target);
                        return `The opposing ${target.upperName()} lost ${damage} HP!`;
                    }
                    else if (battle.turn <= user.status["petal-dance"][0]) {
                        let damage = this.damageCalc(user, target);
                        return `The opposing ${target.upperName()} lost ${damage} HP!`;
                    }
                    else {
                        // delete user.status["petal-dance"];
                        let duration = Math.floor(Math.random() * 4) + 1;
                        let specialMessage = this.specialEffect(battle, user, "confused", 100, duration);
                        return specialMessage;
                    }
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
                    let specialMessage = this.specialEffect(battle, target, "paralyzed", this.effectChance);
                    return `The opposing ${target.upperName()}'s lost ${damage} HP!` + specialMessage;
                }

                // "Has a $effect_chance% chance to confuse the target."
                else if (
                    this.name == "confusion" ||
                    this.name == "psybeam"
                    ) {
                    let damage = this.damageCalc(user, target);
                    let specialMessage = this.specialEffect(battle, target, "confused", 10);
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
                    let specialMessage = this.specialEffect(battle, target, "poisoned", 10);
                    return `The opposing ${target.upperName()} lost ${damage} HP!` + specialMessage;
                }

                // "Never misses."
                else if (this.name == "swift") {
                    return `Not Available`
                }

                // "Only works on sleeping Pokémon. Drains half the damage inflicted to heal the user."
                else if (this.name == "dream-eater") {
                    if ("sleeping" in target.status) {
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
                    let baseDamage = (22 * this.power * user.attack[0] / target.defense[0] / 50) + 2;
                    let percentage = Math.floor(baseDamage * (Math.floor(Math.random() * (max - min + 1)) + min) / 100)
                    var damage = Math.floor(50 * percentage);
                    if (critChance <= threshold) {
                        damage = damage * 2;
                    }
                    if (damage > target.hp) {
                        damage = target.hp;
                    }
                    target.hp -= damage;
                    return `The opposing ${target.upperName()} lost ${damage} HP!`
                }

                else if (this.name == "tri-attack") {
                    // "Has a $effect_chance% chance to burn, freeze, or paralyze the target."
                    let damage = this.damageCalc(user, target);
                    let effect1 = this.specialEffect(battle, target, "burned", 20);
                    let effect2 = this.specialEffect(battle, target, "frozen", 20);
                    let effect3 = this.specialEffect(battle, target, "paralyzed", 20);
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
                this.startHP = statCalc(pokeObject.stats[5].base_stat, 7, 60);
                this.startAttack = statCalc(pokeObject.stats[4].base_stat, 8, 5);
                this.startDefense = statCalc(pokeObject.stats[3].base_stat, 13, 5);
                this.startSpecialAttack = statCalc(pokeObject.stats[2].base_stat, 9, 5);
                this.startSpecialDefense = statCalc(pokeObject.stats[1].base_stat, 9, 5);
                this.startSpeed = statCalc(pokeObject.stats[0].base_stat, 5, 5);
                this.startEvasion = 100;
                this.startType = [];
                for (let i = 0; i < pokeObject.types.length; i ++) {
                    let typeName = pokeObject.types[i].type.name;
                    this.startType.push(typeName);
                }
                this.hp = this.startHP;
                this.weight = pokeObject.weight;

                // Stat arrays are structured as [current value, stage value, initial value]
                // Current values change as a function of initial value and stage value
                this.attack = [this.startAttack, 0, this.startAttack];
                this.defense = [this.startDefense, 0, this.startDefense];
                this.specialAttack = [this.startSpecialAttack, 0, this.startSpecialAttack];
                this.specialDefense = [this.startSpecialDefense, 0, this.startSpecialDefense];
                this.speed = [this.startSpeed, 0, this.startSpeed];
                this.evasion = [this.startEvasion, 0, this.startEvasion];
                
                this.front = pokeObject.sprites.front_default;
                this.back = pokeObject.sprites.back_default;
                this.moves = [];
                this.type = this.startType; // Array
                this.lastMove = "";
                this.status = {};

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
            }

            upperName() {
                return this.name[0].toUpperCase() + this.name.slice(1, this.name.length);
            }

            useMove(battle, move, target) {
                console.log(`${this.upperName()} used ${move.upperName()}!`)
                console.log(battle.effects);
                let hitOrMiss = Math.floor(Math.random() * 100);
                
                if (
                    "frozen" in this.status ||
                    "sleeping" in this.status
                ) {
                    return "";
                }
                else if ("paralyzed" in this.status) {
                    let skipMove = Math.floor(Math.random() * 4);
                    if (skipMove = 0) {
                        return ""
                    }
                }

                if (hitOrMiss > move.accuracy[0] && move.name != "swift") {
                    return `${this.upperName()} missed!`;
                }
                else if (move.accuracy[0] < target.evasion[0]) {
                    let evade = target.evasion[0] - move.accuracy[0];
                    let hit = Math.floor(Math.random() * 100);
                    if (hit >= evade) {
                        if (move.damage_class == "physical") {
                            let message = move.classPhysical(battle, this, target);
                            return message;
                        }
                        else if (move.damage_class == "special") {
                            let message = move.classSpecial(battle, this, target);
                            return message;
                        }
                        else if (move.damage_class == "status") {
                            let message = move.classStatus(battle, this, target);
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
                        let message = move.classPhysical(battle, this, target);
                        return message;
                    }
                    else if (move.damage_class == "special") {
                        let message = move.classSpecial(battle, this, target);
                        return message;
                    }
                    else if (move.damage_class == "status") {
                        let message = move.classStatus(battle, this, target);
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
                // return true;
                if (this.hp > 0) {
                    return true;
                }
                else {
                    return false;
                }
            }

        } // End of Pokemon Class

        var allPokemon = {};
        for (let i = 0; i < pokedex.length; i ++) {
            let name = pokedex[i][0];
            let pokemon = new Pokemon(pokedex[i][0], pokedex[i][1]);
            allPokemon[name] = pokemon;
        }

        class Battle {

            constructor(pokemon1, pokemon2) {
                this.turn = 1;
                this.effects = {};
                // this.effects[pokemon1.name] = {lastMove: ""};
                // this.effects[pokemon2.name] = {lastMove: ""};
                // this.lastMove1 = "";
                // this.lastMove2 = "";
                
                // Assign moves and their properties to the move buttons
                // this.moveArr = pokemon1.moves; // Array 
                this.moveArr = [allMoves["petal-dance"], pokemon1.moves[1], pokemon1.moves[2], pokemon1.moves[3]];
                this.moveNameArr = [];
                this.moveClassArr = [];
                this.moveTypeArr = [];
                this.movePPLeftArr = [];

                for (let i = 0; i < pokemon1.moves.length; i ++) {
                    let move = this.moveArr[i];
                    this.moveNameArr.push(move.upperName());
                    this.moveClassArr.push(move.damage_class[0].toUpperCase() + move.damage_class.slice(1, move.damage_class.length));
                    this.moveTypeArr.push(move.type[0].toUpperCase() + move.type.slice(1, move.type.length));
                    this.movePPLeftArr.push(move.pp);
                }

                // Assign previous values to button text
                $("#moveName1").text(this.moveNameArr[0]);
                $("#moveClass1").text(this.moveClassArr[0]);
                $("#moveType1").text(this.moveTypeArr[0]);
                $("#movePP1").text(`${this.movePPLeftArr[0]}/${this.moveArr[0].pp}`);

                if (this.moveArr.length > 1) {
                    $("#moveName2").text(this.moveNameArr[1]);
                    $("#moveClass2").text(this.moveClassArr[1]);
                    $("#moveType2").text(this.moveTypeArr[1]);
                    $("#movePP2").text(`${this.movePPLeftArr[1]}/${this.moveArr[1].pp}`);
                }
                else {
                    $("#moveName2").text("None");
                    $("#moveButton2").prop("disabled", true);
                }

                if (this.moveArr.length > 2) {
                    $("#moveName3").text(this.moveNameArr[2]);
                    $("#moveClass3").text(this.moveClassArr[2]);
                    $("#moveType3").text(this.moveTypeArr[2]);
                    $("#movePP3").text(`${this.movePPLeftArr[2]}/${this.moveArr[2].pp}`);

                    $("#moveName4").text(this.moveNameArr[3]);
                    $("#moveClass4").text(this.moveClassArr[3]);
                    $("#moveType4").text(this.moveTypeArr[3]);
                    $("#movePP4").text(`${this.movePPLeftArr[3]}/${this.moveArr[3].pp}`);
                }
                else {
                    $("#moveName3").text("None");
                    $("#moveName4").text("None");
                    $("#moveButton3").prop("disabled", true);
                    $("#moveButton4").prop("disabled", true);
                }
            }

            // checkStatus method
            checkStatus(pokemon, move) {
                let allStatus = Object.keys(pokemon.status);
                let allMessages = [];
                for (let i = 0; i < allStatus.length; i ++) {
                    let message = move.specialEffect(this, pokemon, pokemon.status[allStatus[i]]);
                    allMessages.push(message);
                }
                return allMessages.join("");
                // if (pokemon.status.includes("burned")) {
                // }
                // if (pokemon.status.includes("frozen")) {
                // }
                // if (pokemon.status.includes("poisoned")) {
                // }
                // if (pokemon.status.includes("paralyzed")) {
                // }
                // if (pokemon.status.includes("sleeping")) {
                // }
                // if (pokemon.status.includes("substituted")) {
                // }
                // if (pokemon.status.includes("flying")) {
                // }
                // if (pokemon.status.includes("dig")) {
                // }
                // if (pokemon.status.includes("flinched")) {
                // }
                // if (pokemon.status.includes("mist")) {
                // }
            }

            // disableButtons method
            disableButtons() {
                if (
                    this.movePPLeftArr[0] > 0 ||
                    this.movePPLeftArr[1] > 0 ||
                    this.movePPLeftArr[2] > 0 ||
                    this.movePPLeftArr[3] > 0
                    ) {
                    $("#moveButton1").prop("disabled", true);
                }
                else {
                    let checkAllPP = 0;
                    for (let i = 0; i < this.movePPLeftArr.length; i ++) {
                        if (this.movePPLeftArr[i] < 1) {
                            checkAllPP ++;
                        }
                    }
                    if (checkAllPP == this.movePPLeftArr.length) {
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
    
            // enableButtons method
            enableButtons() {
                if (this.movePPLeftArr[0] > 0 || $("#moveName1").text() == "Struggle") {
                    $("#moveButton1").prop("disabled", false);
                }
                if (this.movePPLeftArr[1] > 0) {
                    $("#moveButton2").prop("disabled", false);
                }
                if (this.movePPLeftArr[2] > 0) {
                    $("#moveButton3").prop("disabled", false);
                }
                if (this.movePPLeftArr[3] > 0) {
                    $("#moveButton4").prop("disabled", false);
                }
            }

        } // End of Battle Class

        // ------------------------------------------------------------------------------------

        // Initialize Gameplay

        let pokemonIndex1 = Math.floor(Math.random() * pokedex.length);
        let pokemonIndex2 = Math.floor(Math.random() * pokedex.length);
        let pokemon1 = allPokemon[pokedex[pokemonIndex1][0]];
        let pokemon2 = allPokemon[pokedex[pokemonIndex2][0]];
        let encounter = new Battle(pokemon1, pokemon2);
        console.log(pokemon1);
        console.log(pokemon2);

        // ------------------------------------------------------------------------------------

        // Main Gameplay

        $("#moveButton1").click(() => {
            
            encounter.movePPLeftArr[0] --;
            $("#movePP1").text(`${encounter.movePPLeftArr[0]}/${encounter.moveArr[0].pp}`);
            encounter.disableButtons();
            let i = Math.floor(Math.random() * pokemon2.moves.length);
            let enemyMove = pokemon2.moves[i];
            let checkMessage1 = encounter.checkStatus(pokemon1, enemyMove);
            let checkMessage2 = encounter.checkStatus(pokemon2, enemyMove);
            console.log(checkMessage1);
            console.log(checkMessage2);
            if (pokemon2.speed[0] > pokemon1.speed[0]) {
                let message1 = pokemon2.useMove(encounter, enemyMove, pokemon1);
                pokemon2.lastMove = enemyMove;
                console.log(message1);
                if (pokemon1.alive() && pokemon2.alive()) {
                    let message2 = pokemon1.useMove(encounter, encounter.moveArr[0], pokemon2);
                    pokemon1.lastMove = encounter.moveArr[0];
                    console.log(message2);
                }
            }
            else {
                let message1 = pokemon1.useMove(encounter, encounter.moveArr[0], pokemon2);
                pokemon1.lastMove = encounter.moveArr[0];
                console.log(message1);
                if (pokemon1.alive() && pokemon2.alive()) {
                    let message2 = pokemon2.useMove(encounter, enemyMove, pokemon1);
                    pokemon2.lastMove = enemyMove;
                    console.log(message2);
                }
            }
            console.log(pokemon1.hpLeft());
            console.log(pokemon2.hpLeft());
            encounter.turn ++;
            encounter.enableButtons();
        });

    
        $("#moveButton2").click(() => {
            
            encounter.movePPLeftArr[1] --;
            $("#movePP2").text(`${encounter.movePPLeftArr[1]}/${encounter.moveArr[1].pp}`);
            encounter.disableButtons();
            let i = Math.floor(Math.random() * pokemon2.moves.length);
            let enemyMove = pokemon2.moves[i];
            let checkMessage1 = encounter.checkStatus(pokemon1, enemyMove);
            let checkMessage2 = encounter.checkStatus(pokemon2, enemyMove);
            console.log(checkMessage1);
            console.log(checkMessage2);
            if (pokemon2.speed[0] > pokemon1.speed[0]) {
                let message1 = pokemon2.useMove(encounter, enemyMove, pokemon1);
                pokemon2.lastMove = enemyMove;
                console.log(message1);
                if (pokemon1.alive() && pokemon2.alive()) {
                    let message2 = pokemon1.useMove(encounter, encounter.moveArr[1], pokemon2);
                    pokemon1.lastMove = encounter.moveArr[1];
                    console.log(message2);
                }
            }
            else {
                let message1 = pokemon1.useMove(encounter, encounter.moveArr[1], pokemon2);
                pokemon1.lastMove = encounter.moveArr[1];
                console.log(message1);
                if (pokemon1.alive() && pokemon2.alive()) {
                    let message2 = pokemon2.useMove(encounter, enemyMove, pokemon1);
                    pokemon2.lastMove = enemyMove;
                    console.log(message2);
                }
            }
            console.log(pokemon1.hpLeft());
            console.log(pokemon2.hpLeft());
            encounter.turn ++;
            encounter.enableButtons();
        });

        $("#moveButton3").click(() => {
            
            encounter.movePPLeftArr[2] --;
            $("#movePP3").text(`${encounter.movePPLeftArr[2]}/${encounter.moveArr[2].pp}`);
            encounter.disableButtons();
            let i = Math.floor(Math.random() * pokemon2.moves.length);
            let enemyMove = pokemon2.moves[i];
            let checkMessage1 = encounter.checkStatus(pokemon1, enemyMove);
            let checkMessage2 = encounter.checkStatus(pokemon2, enemyMove);
            console.log(checkMessage1);
            console.log(checkMessage2);
            if (pokemon2.speed[0] > pokemon1.speed[0]) {
                let message1 = pokemon2.useMove(encounter, enemyMove, pokemon1);
                pokemon2.lastMove = enemyMove;
                console.log(message1);
                if (pokemon1.alive() && pokemon2.alive()) {
                    let message2 = pokemon1.useMove(encounter, encounter.moveArr[2], pokemon2);
                    pokemon1.lastMove = encounter.moveArr[2];
                    console.log(message2);
                }
            }
            else {
                let message1 = pokemon1.useMove(encounter, encounter.moveArr[2], pokemon2);
                pokemon1.lastMove = encounter.moveArr[2];
                console.log(message1);
                if (pokemon1.alive() && pokemon2.alive()) {
                    let message2 = pokemon2.useMove(encounter, enemyMove, pokemon1);
                    pokemon2.lastMove = enemyMove;
                    console.log(message2);
                }
            }
            console.log(pokemon1.hpLeft());
            console.log(pokemon2.hpLeft());
            encounter.turn ++;
            encounter.enableButtons();
        });

        $("#moveButton4").click(() => {
            
            encounter.movePPLeftArr[3] --;
            $("#movePP4").text(`${encounter.movePPLeftArr[3]}/${encounter.moveArr[3].pp}`);
            encounter.disableButtons();
            let i = Math.floor(Math.random() * pokemon2.moves.length);
            let enemyMove = pokemon2.moves[i];
            let checkMessage1 = encounter.checkStatus(pokemon1, enemyMove);
            let checkMessage2 = encounter.checkStatus(pokemon2, enemyMove);
            console.log(checkMessage1);
            console.log(checkMessage2);
            if (pokemon2.speed[0] > pokemon1.speed[0]) {
                let message1 = pokemon2.useMove(encounter, enemyMove, pokemon1);
                pokemon2.lastMove = enemyMove;
                console.log(message1);
                if (pokemon1.alive() && pokemon2.alive()) {
                    let message2 = pokemon1.useMove(encounter, encounter.moveArr[3], pokemon2);
                    pokemon1.lastMove = encounter.moveArr[3];
                    console.log(message2);
                }
            }
            else {
                let message1 = pokemon1.useMove(encounter, encounter.moveArr[3], pokemon2);
                pokemon1.lastMove = encounter.moveArr[3];
                console.log(message1);
                if (pokemon1.alive() && pokemon2.alive()) {
                    let message2 = pokemon2.useMove(encounter, enemyMove, pokemon1);
                    pokemon2.lastMove = enemyMove;
                    console.log(message2);
                }
            }
            console.log(pokemon1.hpLeft());
            console.log(pokemon2.hpLeft());
            encounter.turn ++;
            encounter.enableButtons();
        });

        // ------------------------------------------------------------------------------------

    }, 3000)

});