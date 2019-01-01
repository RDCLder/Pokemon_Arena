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

        $('[data-toggle="tooltip"]').tooltip();
        
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
                
                if ("flying" in target.status && "flying" in user.status == false) {
                    return `${user.upperName()} missed!`;
                }
                else if ("dig" in target.status && this.name != "earthquake") {
                    return `${user.upperName()} missed!`;
                }
                let min = Math.ceil(85);
                let max = Math.floor(100);
                if (this.damage_class == "physical") {
                    let baseDamage = (22 * this.power * user.attack[0] / target.defense[0] / 50) + 2;
                    var damage = Math.floor(baseDamage * (Math.floor(Math.random() * (max - min + 1)) + min) / 100);
                    
                    // Check for critical hit
                    let threshold = Math.floor(user.speed[0] * critModifier * 100 / 512);
                    let critChance = Math.floor(Math.random() * 100);
                    if (critChance <= threshold) {
                        damage = damage * 2;
                    }
                    // Check for status effects that affect damage
                    if ("burned" in user.status) {
                        damage = Math.floor(damage / 2);
                    }
                    if ("dig" in target.status && this.name == "earthquake") {
                        damage = damage * 2;
                    }
                    // Check for specific moves that affect damage
                    if (
                        this.name == "jump-kick" ||
                        this.name == "high-jump-kick" && 
                        user == target
                        ) {
                        damage = Math.floor(damage / 2);
                        if (damage > Math.floor(target.hp / 2)) {
                            damage = Math.floor(targe.hp / 2);
                        }
                    }
                    else if (this.name == "counter") {
                        damage = damage * 2;
                    }
                    // Check that damage doesn't exceed target HP
                    if (damage > target.hp) {
                        damage = target.hp;
                    }
                    target.hp -= damage;
                    return damage;
                }
                else if (this.damage_class == "special") {
                    let baseDamage = (22 * this.power * user.specialAttack[0] / target.specialDefense[0] / 50) + 2;
                    var damage = Math.floor(baseDamage * (Math.floor(Math.random() * (max - min + 1)) + min) / 100);
                    
                    // Check for critical hit
                    let threshold = Math.floor(user.speed[0] * critModifier * 100 / 512);
                    let critChance = Math.floor(Math.random() * 100);
                    if (critChance <= threshold) {
                        damage = damage * 2;
                    }
                    if (damage > target.hp) {
                        damage = target.hp;
                    }

                    // Check for status effects that affect damage
                    if ("burned" in user.status) {
                        damage = Math.floor(damage / 2);
                    }
                    if ("dig" in target.status && this.name == "earthquake") {
                        damage = damage * 2;
                    }
                    target.hp -= damage;
                    return damage;
                }
            }

            // Returns a message depending on change in stage value
            stageMessage(target, statName, stageChange) {
                if (stageChange == 1) {
                    return `${target.upperName()}'s ${statName} rose!`;
                }
                else if (stageChange == 2) {
                    return `${target.upperName()}'s ${statName} rose sharply!`;
                }
                else if (stageChange >= 3) {
                    return `${target.upperName()}'s ${statName} rose drastically!`;
                }
                else if (stageChange == -1) {
                    return `${target.upperName()}'s ${statName} fell!`;
                }
                else if (stageChange == -2) {
                    return `${target.upperName()}'s ${statName} harshly fell!`;
                }
                else if (stageChange <= -3) {
                    return `${target.upperName()}'s ${statName} severely fell!`;
                }
                else {
                    return `${target.upperName()}'s ${statName} stayed the same!`
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

            // Start of specialEffect method
            // For effects that change status conditions (e.g. frozen)
            specialEffect(battle, target, effect, chance = 100, duration = 1) {
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
                            return `${target.upperName()} is on fire!`;
                        }
                        else {
                            return `${target.upperName()} is on fire!`;
                        }
                    }

                    else if (effect == "frozen") {
                        if (
                            "burned" in target.status == false &&
                            "frozen" in target.status == false &&
                            "paralyzed" in target.status == false &&
                            "poisoned" in target.status == false &&
                            "badly-poisoned" in target.status == false &&
                            "sleeping" in target.status == false &&
                            !target.type.includes("ice")
                        ) {
                            target.status["frozen"] = [duration += battle.turn];
                            return `${target.upperName()} is frozen!`;
                        }
                        else {
                            return `${target.upperName()} is frozen!`;
                        }
                    }

                    else if (effect == "paralyzed") {
                        if (
                            "burned" in target.status == false &&
                            "frozen" in target.status == false &&
                            "paralyzed" in target.status == false &&
                            "poisoned" in target.status == false &&
                            "badly-poisoned" in target.status == false &&
                            "sleeping" in target.status == false &&
                            !target.type.includes(this.type)
                        ) {
                            target.status["paralyzed"] = [duration += battle.turn];
                            target.speed[0] = Math.floor(target.speed[0] * 3 / 4);
                            return `${target.upperName()} is paralyzed!`;
                        }
                        else {
                            return `${target.upperName()} is paralyzed!`;
                        }
                    }

                    else if (effect == "poisoned") {
                        if (
                            "burned" in target.status == false &&
                            "frozen" in target.status == false &&
                            "paralyzed" in target.status == false &&
                            "poisoned" in target.status == false &&
                            "badly-poisoned" in target.status == false &&
                            "sleeping" in target.status == false &&
                            !target.type.includes("poison")
                        ) {
                            target.status["poisoned"] = [duration += battle.turn];
                            return `${target.upperName()} is poisoned!`;
                        }
                        else {
                            return `${target.upperName()} is poisoned!`;
                        }
                    }

                    else if (effect == "badly-poisoned") {
                        if (
                            "burned" in target.status == false &&
                            "frozen" in target.status == false &&
                            "paralyzed" in target.status == false &&
                            "poisoned" in target.status == false &&
                            "badly-poisoned" in target.status == false &&
                            "sleeping" in target.status == false &&
                            !target.type.includes("poison")
                        ) {
                            target.status["poisoned"] = [duration += battle.turn, battle.turn];
                            return `${target.upperName()} is poisoned!`;
                        }
                        else {
                            return `${target.upperName()} is poisoned!`;
                        }
                    }

                    else if (effect == "sleeping") {
                        if (
                            "burned" in target.status == false &&
                            "frozen" in target.status == false &&
                            "paralyzed" in target.status == false &&
                            "poisoned" in target.status == false &&
                            "badly-poisoned" in target.status == false &&
                            "sleeping" in target.status == false
                        ) {
                            let turns = Math.floor(Math.random() * 7) + 1;
                            target.status["sleeping"] = [duration += battle.turn + turns];
                            return `${target.upperName()} is sleeping!`;
                        }
                        else {
                            return `${target.upperName()} is sleeping!`;
                        }
                    }

                    // Turn-based effects (e.g. skip turn, charge for x turns)
                    else if (effect == "chargeTurn") {
                        if (
                            "chargeTurn" in target.status == false
                        ) {
                            target.status["chargeTurn"] = [duration += battle.turn];
                            return ``;
                        }
                        else {
                            return ``;
                        }
                    }
                    
                    else if (effect == "skipTurn") {
                        if (
                            "skipTurn" in target.status == false
                        ) {
                            target.status["skipTurn"] = [duration += battle.turn];
                            return ``;
                        }
                        else {
                            return ``;
                        }
                    }

                    // Other status conditions
                    else if (effect == "bide") {
                        if (
                            "bide" in target.status == false
                        ) {
                            target.status["bide"] = [duration += battle.turn];
                            return `${target.upperName()} is bidding its time!`;
                        }
                        else {
                            return `${target.upperName()} is bidding its time!`;
                        }
                    }
                    
                    else if (effect == "bound") {
                        if (
                            "bound" in target.status == false
                        ) {
                            target.status["bound"] = [duration += battle.turn];
                            return `${target.upperName()} is bound!`;
                        }
                        else {
                            return `${target.upperName()} is bound!`;
                        }
                    }
                    
                    else if (effect == "confused") {
                        if (
                            "confused" in target.status == false
                        ) {
                            target.status["confused"] = [duration += battle.turn];
                            return `${target.upperName()} is confused!`;
                        }
                        else {
                            return `${target.upperName()} is confused!`;
                        }
                    }

                    else if (effect == "dig") {
                        if (
                            "dig" in target.status == false
                        ) {
                            target.status["dig"] = [duration += battle.turn];
                            return `${target.upperName()} dug underground!`;
                        }
                        else {
                            return `${target.upperName()} dug underground!`;
                        }
                    }

                    else if (effect == "flinched") {
                        if (
                            "flinched" in target.status == false
                        ) {
                            target.status["flinched"] = [duration += battle.turn];
                            return `${target.upperName()} flinched!`;
                        }
                        else {
                            return `${target.upperName()} flinched!`;
                        }
                    }

                    else if (effect == "flying") {
                        if (
                            "flying" in target.status == false
                        ) {
                            target.status["flying"] = [duration += battle.turn];
                            return `${target.upperName()} flew into the air!`;
                        }
                        else {
                            return `${target.upperName()} flew into the air!`;
                        }
                    }

                    else if (effect == "leech-seed") {
                        if (
                            "leech-seed" in target.status == false &&
                            !target.type.includes("grass")
                        ) {
                            target.status["leech-seed"] = [duration += battle.turn];
                            return `${target.upperName()} is afflicted with Leech Seed!`;
                        }
                        else {
                            return `${target.upperName()} is afflicted with Leech Seed!`;
                        }
                    }

                    else if (effect == "light-screen") {
                        if (
                            "light-screen" in target.status == false
                        ) {
                            target.status["light-screen"] = [duration += battle.turn];
                            return `${target.upperName()} is protected by a screen of light!`;
                        }
                        else {
                            return `${target.upperName()} is protected by a screen of light!`;
                        }
                    }

                    else if (effect == "mist") {
                        if (
                            "mist" in target.status == false
                        ) {
                            target.status["mist"] = [duration += battle.turn];
                            return `${target.upperName()} is shrouded in mist!`;
                        }
                        else {
                            return `${target.upperName()} is shrouded in mist!`;
                        }
                    }

                    else if (effect == "rage") {
                        if (
                            "rage" in target.status == false
                        ) {
                            target.status["rage"] = [duration += battle.turn];
                            return `${target.upperName()} is enraged!`;
                        }
                        else {
                            return `${target.upperName()} is enraged!`;
                        }
                    }

                    else if (effect == "reflect") {
                        if (
                            "reflect" in target.status == false
                        ) {
                            target.status["reflect"] = [duration];
                            return `${target.upperName()} is reflecting all attacks!`;
                        }
                        else {
                            return `${target.upperName()} is reflecting all attacks!`;
                        }
                    }

                    else if (effect == "rest") {
                        if (
                            "rest" in target.status == false
                        ) {
                            delete target.status["burned"];
                            delete target.status["frozen"];
                            delete target.status["paralyzed"];
                            delete target.status["poisoned"];
                            delete target.status["badly-poisoned"];
                            delete target.status["sleeping"];
                            target.status["rest"] = [duration += battle.turn];
                            return `${target.upperName()} is resting!`;
                        }
                        else {
                            return `${target.upperName()} is resting!`;
                        }
                    }

                    else if (effect == "substitute") {
                        if (
                            "substitute" in target.status == false
                        ) {
                            target.status["substitute"] = [duration += battle.turn];
                            return `${target.upperName()} is substituted!`;
                        }
                        else {
                            return `${target.upperName()} is substituted!`;
                        }
                    }
                
                }
                else {
                    return "";
                }
            } // End of specialEffect method

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
                    this.name == "flash" ||
                    this.name == "kinesis" ||
                    this.name == "sand-attack" ||
                    this.name == "smokescreen" ||
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
                    return `It does nothing!`; // Need to implement switching feature
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
                        return `${target.upperName()}'s ${disabledMove} is disabled for ${duration} turns!`
                    }
                    else {
                        return `Disable failed!  Only one move can be disabled at a time!`;
                    }
                }

                // "Protects the user's stats from being changed by enemy moves."
                else if (this.name == "mist") {
                    let specialMessage = this.specialEffect(battle, user, "mist", 100, 5);
                    return specialMessage;
                }

                // "Poisons the target."
                else if (
                    this.name == "poison-powder" ||
                    this.name == "poison-gas"
                    ) {
                    let specialMessage = this.specialEffect(battle, target, "poisoned", this.effectChance, "permanent");
                    return specialMessage;
                }

                // "Paralyzes the target."
                else if (
                    this.name == "stun-spore" ||
                    this.name == "thunder-wave" ||
                    this.name == "glare"
                    ) {
                    let specialMessage = this.specialEffect(battle, target, "paralyzed", this.effectChance, "permanent");
                    return specialMessage;
                }

                // "Seeds the target, stealing HP from it every turn."
                else if (this.name == "leech-seed") {
                    let specialMessage = this.specialEffect(battle, target, "leech-seed");
                    return specialMessage;
                }

                // "Badly poisons the target, inflicting more damage every turn."
                else if (this.name == "toxic") {
                    let specialMessage = this.specialEffect(battle, target, "badly-poisoned", this.effectChance, "permanent");
                    return specialMessage;
                }

                // "Immediately ends wild battles. No effect otherwise.";
                else if (this.name == "teleport") {
                    return `It does nothing!`;
                }

                // "Copies the target's last used move."
                else if (this.name == "mimic") {
                    if (
                        target.lastMove == "" ||
                        target.lastMove.name == "metronome" ||
                        target.lastMove.name == "mimic" ||
                        target.lastMove.name == "mirror-move"
                    ) {
                        return `It does nothing!`;
                    }
                    let mimicMessage = user.useMove(battle, target.lastMove, target);
                    return `Mimic copied ${target.lastMove.upperName()}!\n` + mimicMessage;
                }

                // "Raises the user's evasion by one stage."
                else if (this.name == "double-team") {
                    let statMessage = this.statEffect(user, "Evasion", 1, this.effectChance);
                    return statMessage;
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
                    let specialMessage = this.specialEffect(battle, user, "light-screen", this.effectChance, 5);
                    return specialMessage;
                }

                // "Resets all stats."
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
                    let specialMessage = this.specialEffect(battle, user, "reflect", this.effectChance, "permanent");
                    return specialMessage;
                }

                // "Increases the user's chance to score a critical hit."
                else if (this.name == "focus-energy") {
                    return `${user.upperName()} has focused its energy!`;
                    // Implement later if there is time
                }

                // "Randomly selects and uses any move in the game."
                else if (this.name == "metronome") {
                    var randomMove = "";
                    while (randomMove == "") {
                        let index = Math.floor(Math.random() * moves[0].length);
                        randomMove = allMoves[moves[0][index]];
                        if (
                            randomMove.name == "metronome" ||
                            randomMove.name == "mimic" ||
                            randomMove.name == "mirror-move"
                        ) {
                            randomMove = "";
                        }
                    }
                    let metronomeMessage = user.useMove(battle, randomMove, target);
                    return `Metronome selected ${randomMove.upperName()}!\n` + metronomeMessage;
                }

                // "Uses the target's last used move."
                else if (this.name == "mirror-move") {
                    if (
                        target.lastMove == "" ||
                        target.lastMove.name == "metronome" ||
                        target.lastMove.name == "mimic" ||
                        target.lastMove.name == "mirror-move"
                    ) {
                        return `It does nothing!`;
                    }
                    let mirrorMessage = user.useMove(battle, target.lastMove, target);
                    return `Mirror-move copied ${target.lastMove.upperName()}!\n` + mirrorMessage;
                }

                // "User becomes a copy of the target until it leaves battle."
                else if (this.name == "transform") {
                    user.name = target.name + " (Ditto)"
                    user.weight = target.weight;
                    user.type = target.type;
                    user.attack = target.attack;
                    user.defense = target.defense;
                    user.specialAttack = target.specialAttack;
                    user.specialDefense = target.specialDefense;
                    user.speed = target.speed;
                    user.evasion = target.evasion;
                    user.moves = target.moves;
                    return `Ditto has transformed into ${target.upperName()}!`;
                }

                else if (this.name == "splash") {
                    return `It does nothing!`;
                }

                // "User sleeps for two turns, completely healing itself."
                else if (this.name == "rest") {
                    let specialMessage = this.specialEffect(battle, user, "rest", this.effectChance, 2);
                    return specialMessage;
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
                    return `${user.upperName()} has changed types!`;
                }

                // "Transfers 1/4 of the user's max HP into a doll
                else if (this.name == "substitute") {
                    let specialMessage = this.specialEffect(battle, user, "substitute", this.effectChance);
                    return specialMessage;
                }

                else {
                    return `${this.name} is not a valid status move.`;
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
                        return `${target.upperName()} lost ${damage * 2} HP!`;
                    }
                    else if (3 <= chance <= 5) {
                        let damage = this.damageCalc(user, target);
                        let damage2 = this.damageCalc(user, target);
                        let damage3 = this.damageCalc(user, target);
                        return `${target.upperName()} lost ${damage * 3} HP!`;
                    }
                    else if (chance == 6) {
                        let damage = this.damageCalc(user, target);
                        let damage2 = this.damageCalc(user, target);
                        let damage3 = this.damageCalc(user, target);
                        let damage4= this.damageCalc(user, target);
                        return `${target.upperName()} lost ${damage * 4} HP!`;
                    }
                    else {
                        let damage = this.damageCalc(user, target);
                        let damage2 = this.damageCalc(user, target);
                        let damage3 = this.damageCalc(user, target);
                        let damage4 = this.damageCalc(user, target);
                        let damage5 = this.damageCalc(user, target);
                        return `${target.upperName()} lost ${damage * 5} HP!`;
                    }
                }

                // "Has a $effect_chance% chance to burn the target."
                else if (this.name == "fire-punch") {
                    let damage = this.damageCalc(user, target);
                    let specialMessage = this.specialEffect(battle, target, "burned", this.effectChance, "permanent");
                    return `${target.upperName()} lost ${damage} HP!` + specialMessage;
                }

                // "Has a $effect_chance% chance to freeze the target."
                else if (this.name == "ice-punch") {
                    let damage = this.damageCalc(user, target);
                    let specialMessage = this.specialEffect(battle, target, "frozen", this.effectChance, "permanent");
                    return `${target.upperName()} lost ${damage} HP!` + specialMessage;
                }

                // "Has a $effect_chance% chance to paralyze the target."
                else if (
                    this.name == "thunder-punch" ||
                    this.name == "body-slam" ||
                    this.name == "lick"
                    ) {
                    let damage = this.damageCalc(user, target);
                    let specialMessage = this.specialEffect(battle, target, "paralyzed", this.effectChance, "permanent");
                    return `${target.upperName()} lost ${damage} HP!` + specialMessage;
                }

                // "Causes a one-hit KO."
                else if (
                    this.name == "guillotine" ||
                    this.name == "horn-drill" ||
                    this.name == "fissure"
                    ) {
                    let damage = target.hp;
                    return `${target.upperName()} was knocked out!`;
                }

                // "User flies high into the air, dodging all attacks, and hits next turn."
                else if (this.name == "fly") {
                    let specialMessage = this.specialEffect(battle, user, "flying", this.effectChance, 1);
                    return specialMessage;
                }

                // "Prevents the target from fleeing and inflicts damage for 2-5 turns."
                else if (
                    this.name == "bind" ||
                    this.name == "wrap" ||
                    this.name == "clamp"
                    ) {
                    let duration = Math.floor(Math.random() * 4) + 2;
                    let specialMessage = this.specialEffect(battle, target, "bound", this.effectChance, duration);
                    return specialMessage;
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
                    return `${target.upperName()} lost ${damage} HP!` + specialMessage;
                }

                // "Hits twice in one turn."
                else if (
                    this.name == "double-kick" ||
                    this.name == "bonemerang"
                    ) {
                    let damage = this.damageCalc(user, target);
                    let damage2 = this.damageCalc(user, target);
                    return `${target.upperName()} lost ${damage * 2} HP!`;
                }

                // "If the user misses, it takes half the damage it would have inflicted in recoil."
                else if (
                    this.name == "jump-kick" ||
                    this.name == "high-jump-kick"
                    ) {
                    let damage = this.damageCalc(user, target);
                    return `${target.upperName()} lost ${damage} HP!`;
                }

                // "User receives some of the damage it inflicts in recoil."
                else if (
                    this.name == "take-down" ||
                    this.name == "submission"
                    ) {
                    let damage = this.damageCalc(user, target);
                    let recoil = Math.floor(damage / 4);
                    user.hp -= recoil;
                    return `${target.upperName()} lost ${damage} HP!` + `\n${user.upperName()} lost ${recoil} HP!`;
                }

                else if (this.name == "double-edge") {
                    let damage = this.damageCalc(user, target);
                    let recoil = Math.floor(damage / 3);
                    user.hp -= recoil;
                    return `${target.upperName()} lost ${damage} HP! \n${user.upperName()} lost ${recoil} HP!`;
                }

                // "Hits every turn for 2-3 turns, then confuses the user."
                else if (this.name == "thrash") {
                    if (battle.effectTurn == 0) {
                        battle.effectTurn = battle.turn;
                        let damage = this.damageCalc(user, target);
                        return `${target.upperName()} lost ${damage} HP!`;
                    }
                    else {
                        if (battle.turn <= battle.effectTurn + 2) {
                            let damage = this.damageCalc(user, target);
                            return `${target.upperName()} lost ${damage} HP!`;
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
                    let specialMessage = this.specialEffect(battle, target, "poisoned", this.effectChance, "permanent");
                    return `${target.upperName()} lost ${damage} HP!` + specialMessage;
                }

                // "Hits twice in the same turn. Has a $effect_chance% chance to poison the target."
                else if (this.name == "twineedle") {
                    let damage = this.damageCalc(user, target);
                    let damage2 = this.damageCalc(user, target);
                    let specialMessage = this.specialEffect(battle, target, "poisoned", this.effectChance, "permanent");
                    return `${target.upperName()} lost ${damage * 2} HP!` + specialMessage;
                }

                // "Inflicts more damage to heavier targets, with a maximum of 120 power."
                // For Gen 1, damage is not weight-based
                else if (this.name == "low-kick") {
                    let damage = this.damageCalc(user, target);
                    let specialMessage = this.specialEffect(battle, target, "flinched", 30);
                    return `${target.upperName()} lost ${damage} HP!` + specialMessage;
                }

                // "Inflicts twice the damage the user received from the last physical hit it took."
                else if (this.name == "counter") {
                    if (target.lastMove.damage_class == "physical") {
                        let damage = this.damageCalc(user, target);
                        return `${target.upperName()} lost ${damage} HP!`;
                    }
                    else {
                        return `It does nothing!`;
                    }
                }

                // "Inflicts damage equal to the user's level."
                else if (this.name == "seismic-toss") {
                    target.hp -= 50;
                    return `${target.upperName()} lost ${50} HP!`;
                }

                // "Has an increased chance for a critical hit."
                else if (
                    this.name == "razor-leaf" ||
                    this.name == "crabhammer" ||
                    this.name == "slash"
                    ) {
                    let damage = this.damageCalc(user, target, 4);
                    return `${target.upperName()} lost ${damage} HP!`;
                }

                // "Inflicts regular damage and can hit Dig users."
                else if (this.name == "earthquake") {
                    let damage = this.damageCalc(user, target);
                    return `${target.upperName()} lost ${damage * 2} HP!`;
                }

                // "User digs underground, dodging all attacks, and hits next turn."
                else if (this.name == "dig") {
                    let specialMessage = this.specialEffect(battle, user, "dig", this.effectChance, 1);
                    return specialMessage;
                }

                // "If the user is hit after using this move, its Attack rises by one stage."
                else if (this.name == "rage") {
                    let damage = this.damageCalc(user, target);
                    let specialMessage = this.specialEffect(battle, user, "rage");
                    return `${target.upperName()} lost ${damage} HP!` + specialMessage;
                }

                // "User waits for two turns, then hits back for twice the damage it took."
                else if (this.name == "bide") {
                    let specialMessage = this.specialEffect(battle, user, "bide", this.effectChance, 2);
                    return specialMessage;
                }

                // "User faints."
                else if (
                    this.name == "self-destruct" ||
                    this.name == "explosion"
                    ) {
                    let damage = this.damageCalc(user, target);
                    return `${target.upperName()} lost ${damage} HP!`;
                }

                // "Raises the user's Defense by one stage. User charges for one turn before attacking."
                else if (this.name == "skull-bash") {
                    let statMessage = this.statEffect(user, "Defense", 1);
                    let specialMessage = this.specialEffect(battle, user, "chargeTurn", 100, 1);
                    return statMessage + specialMessage;
                }

                // "Has a $effect_chance% chance to lower the target's Speed by one stage."
                else if (this.name == "constrict") {
                    let damage = this.damageCalc(user, target);
                    let statMessage = this.statEffect(target, "Speed", -1, this.effectChance);
                    return `${target.upperName()} lost ${damage} HP!` + statMessage;
                }

                // "Drains half the damage inflicted to heal the user."
                else if (this.name == "leech-life") {
                    let damage = this.damageCalc(user, target);
                    let drain = Math.floor(damage / 2);
                    user.hp += drain;
                    return `${target.upperName()} lost ${damage} HP!
                    ${user.upperName()} gained ${drain} HP!`;
                }

                // "User charges for one turn before attacking. Has a $effect_chance% chance to make the target flinch."
                else if (this.name == "sky-attack") {
                    let specialMessage1 = this.specialEffect(battle, target, "chargeTurn", 100, 1);
                    let specialMessage2 = this.specialEffect(battle, target, "flinched", this.effectChance);
                    return specialMessage1 + specialMessage2;
                }

                // "Has a $effect_chance% chance to confuse the target."
                else if (this.name == "dizzy-punch") {
                    let damage = this.damageCalc(user, target);
                    let specialMessage = this.specialEffect(battle, target, "confused", this.effectChance);
                    return `${target.upperName()} lost ${damage} HP!` + specialMessage;
                }

                // "Inflicts damage equal to half the target's HP."
                else if (this.name == "super-fang") {
                    let damage = Math.floor(target.hp / 2);
                    target.hp -= damage;
                    return `${target.upperName()} lost ${damage} HP!`;
                }

                else {
                    let damage = this.damageCalc(user, target);
                    return `${target.upperName()} lost ${damage} HP!`;
                }
            }

            // All Special moves
            classSpecial(battle, user, target) {

                // "Requires a turn to charge before attacking."
                if (
                    this.name == "razor-wind" ||
                    this.name == "solar-beam"
                    ) {
                    let specialMessage = this.specialEffect(battle, user, "chargeTurn", 100, 1);
                    return specialMessage;
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
                    return `${target.upperName()} lost ${damage} HP!` + statMessage;
                }

                // "Has a $effect_chance% chance to burn the target."
                else if (
                    this.name == "ember" ||
                    this.name == "flamethrower" ||
                    this.name == "fire-blast"
                    ) {
                    let damage = this.damageCalc(user, target);
                    let specialMessage = this.specialEffect(battle, target, "burned", this.effectChance, "permanent");
                    return `${target.upperName()} lost ${damage} HP!` + specialMessage;
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
                    let specialMessage = this.specialEffect(battle, target, "frozen", 10, this.effectChance, "permanent");
                    return `${target.upperName()} lost ${damage} HP!` + specialMessage;
                }

                // "Has a $effect_chance% chance to lower the target's Speed by one stage."
                else if (
                    this.name == "bubble-beam" ||
                    this.name == "bubble"
                    ) {
                    let damage = this.damageCalc(user, target);
                    let statMessage = this.statEffect(target, "Speed", -1, this.effectChance);
                    return `${target.upperName()} lost ${damage} HP!` + statMessage;

                }

                // "Has a $effect_chance% chance to lower the target's Attack by one stage."
                else if (this.name == "aurora-beam") {
                    let damage = this.damageCalc(user, target);
                    let statMessage = this.statEffect(target, "Attack", -1, this.effectChance);
                    return `${target.upperName()} lost ${damage} HP!` + statMessage;
                }

                // "User foregoes its next turn to recharge."
                else if (this.name == "hyper-beam") {
                    let damage = this.damageCalc(user, target);
                    let specialMessage = this.specialEffect(battle, user, "skipTurn", 100, 1);
                    return `${target.upperName()} lost ${damage} HP!`;
                }

                // "Drains half the damage inflicted to heal the user."
                else if (
                    this.name == "absorb" ||
                    this.name == "mega-drain"
                    ) {
                    let damage = this.damageCalc(user, target);
                    let drain = Math.floor(damage / 2);
                    user.hp += drain;
                    return `${target.upperName()} lost ${damage} HP! \n${user.upperName()} gained ${drain} HP!`;
                }

                // "Hits every turn for 2-3 turns, then confuses the user."
                else if (this.name == "petal-dance") {
                    if ("petal-dance" in user.status == false) {
                        let duration = battle.turn + Math.floor(Math.random() * 2) + 1;
                        user.status["petal-dance"] = [duration];
                        let damage = this.damageCalc(user, target);
                        return `${target.upperName()} lost ${damage} HP!`;
                    }
                    else if (battle.turn <= user.status["petal-dance"][0]) {
                        let damage = this.damageCalc(user, target);
                        return `${target.upperName()} lost ${damage} HP!`;
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
                    return `${target.upperName()}'s lost ${damage} HP!`;
                }

                // "Prevents the target from fleeing and inflicts damage for 2-5 turns."
                else if (this.name == "fire-spin") {
                    let duration = Math.floor(Math.random() * 4) + 2;
                    let specialMessage = this.specialEffect(battle, target, "bound", this.effectChance, duration);
                    return specialMessage;
                }

                // "Has a $effect_chance% chance to paralyze the target."
                else if (
                    this.name == "thunder-shock" ||
                    this.name == "thunderbolt" ||
                    this.name == "thunder"
                    ) {
                    let damage = this.damageCalc(user, target);
                    let specialMessage = this.specialEffect(battle, target, "paralyzed", this.effectChance, "permanent");
                    return `${target.upperName()}'s lost ${damage} HP!` + specialMessage;
                }

                // "Has a $effect_chance% chance to confuse the target."
                else if (
                    this.name == "confusion" ||
                    this.name == "psybeam"
                    ) {
                    let damage = this.damageCalc(user, target);
                    let specialMessage = this.specialEffect(battle, target, "confused", 10);
                    return `${target.upperName()} lost ${damage} HP!` + specialMessage;
                }

                // "Has a $effect_chance% chance to lower the target's Special Defense by one stage."
                else if (this.name == "psychic") {
                    let damage = this.damageCalc(user, target);
                    let statMessage = this.statEffect(target, "Special Defense", -1);
                    return `${target.upperName()} lost ${damage} HP!` + statMessage;
                }

                // "Inflicts damage equal to the user's level."
                else if (this.name == "night-shade") {
                    target.hp -= 50;
                    return `${target.upperName()} lost ${50} HP!`;
                }

                // "Has a $effect_chance% chance to poison the target."
                else if (
                    this.name == "smog" ||
                    this.name == "sludge"
                    ) {
                    let damage = this.damageCalc(user, target);
                    let specialMessage = this.specialEffect(battle, target, "poisoned", 10, "permanent");
                    return `${target.upperName()} lost ${damage} HP!` + specialMessage;
                }

                // "Never misses."
                else if (this.name == "swift") {
                    let damage = this.damageCalc(user, target);
                    return `${target.upperName()} lost ${damage} HP!`;
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
                    return `${target.upperName()} lost ${damage} HP!`
                }

                else if (this.name == "tri-attack") {
                    // "Has a $effect_chance% chance to burn, freeze, or paralyze the target."
                    let damage = this.damageCalc(user, target);
                    let effect1 = this.specialEffect(battle, target, "burned", 20, "permanent");
                    let effect2 = this.specialEffect(battle, target, "frozen", 20, "permanent");
                    let effect3 = this.specialEffect(battle, target, "paralyzed", 20, "permanent");
                    return `${target.upperName()} lost ${damage} HP!` + effect1 + effect2 + effect3;
                }

                else {
                    return `${this.upperName()} is not a valid Special move!`;
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

            // useMove method
            useMove(battle, move, target) {   
                if ("paralyzed" in this.status) {
                    let skipMove = Math.floor(Math.random() * 4);
                    if (skipMove = 0) {
                        return `${move.upperName()} failed because ${this.upperName()} is paralyzed!`;
                    }
                }
                if ("confused" in this.status) {
                    let attackSelf = Math.floor(Math.random() * 3);
                    if (attackSelf == 0) {
                        let min = Math.ceil(85);
                        let max = Math.floor(100);
                        let baseDamage = (22 * 40 * this.attack[0] / this.defense[0] / 50) + 2;
                        var damage = Math.floor(baseDamage * (Math.floor(Math.random() * (max - min + 1)) + min) / 100);
                        if (damage > this.hp) {
                            damage = this.hp;
                        }
                        this.hp -= damage;
                        return `${this.upperName()} attacks itself in confusion! \n${this.upperName()} lost ${damage} HP!`;
                    }
                }
                let hitOrMiss = Math.floor(Math.random() * 100); 
                if (
                    hitOrMiss > move.accuracy[0] && 
                    move.name != "swift" && 
                    move.damage_class != "status"
                    ) {
                    if (
                        move.name == "jump-kick" ||
                        move.name == "high-jump-kick"
                        ) {
                        let damage = move.damageCalc(this, this);
                        return `${this.upperName()} missed and kicked itself! ${this.upperName()} lost ${damage} HP!`;
                    }
                    else if (move.name == "explosion" || move.name == "self-destruct") {
                        this.hp = 0;
                    }
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
                            return `${move} has an invalid class.`;
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
                        return `${move} has an invalid class.`;
                    }
                }
            }

            hpLeft() {
                let name = this.upperName();
                if (this.hp <= 0) {
                    return `${name} fainted!`;
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
                this.player = pokemon1;
                this.enemy = pokemon2;
                
                // Assign moves and their properties to the move buttons
                // this.moveArr = [allMoves["mimic"], allMoves["metronome"], pokemon1.moves[2], pokemon1.moves[3]];
                this.moveArr = pokemon1.moves; // Array 
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
                $("#moveButton1").prop("title", this.moveArr[0].description);
                // let testText = $("#moveButton1").prop("title");
                // console.log(testText);

                if (this.moveArr.length > 1) {
                    $("#moveName2").text(this.moveNameArr[1]);
                    $("#moveClass2").text(this.moveClassArr[1]);
                    $("#moveType2").text(this.moveTypeArr[1]);
                    $("#movePP2").text(`${this.movePPLeftArr[1]}/${this.moveArr[1].pp}`);
                    $("#moveButton2").prop("title", this.moveArr[1].description);
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
                    $("#moveButton3").prop("title", this.moveArr[2].description);
                }
                else {
                    $("#moveName3").text("None");
                    $("#moveButton3").prop("disabled", true);
                }

                if (this.moveArr.length > 3) {
                    $("#moveName4").text(this.moveNameArr[3]);
                    $("#moveClass4").text(this.moveClassArr[3]);
                    $("#moveType4").text(this.moveTypeArr[3]);
                    $("#movePP4").text(`${this.movePPLeftArr[3]}/${this.moveArr[3].pp}`);
                    $("#moveButton4").prop("title", this.moveArr[3].description);
                }
                else {
                    $("#moveName4").text("None");
                    $("#moveButton4").prop("disabled", true);
                }
            }

            // checkStatus method
            // This only checks for non-volatile status conditions
            // Other conditions are checked in useMove() or wherever appropriate
            checkStatus(target, otherPokemon) {
                let allMessages = [];
                
                // Non-volatile status conditions are mutually exclusive
                if ("burned" in target.status) {
                    if (target.status["burned"][0] == "permanent") {
                        let damage = Math.floor(target.startHP / 16);
                        target.hp -= damage;
                        allMessages.push(`\n${target.upperName()} is on fire and lost ${damage} HP!`);
                    }
                    else if (this.turn < target.status["burned"][0]) {
                        let damage = Math.floor(target.startHP / 16);
                        target.hp -= damage;
                        allMessages.push(`\n${target.upperName()} is on fire and lost ${damage} HP!`);
                    }
                    else if (this.turn == target.status["burned"][0]) {
                        delete target.status["burned"];
                        allMessages.push(`\n${target.upperName()} is no longer on fire!`);
                    }
                }

                else if ("frozen" in target.status) {
                    if (target.status["frozen"][0] == "permanent") {
                        let thaw = Math.floor(Math.random() * 5);
                        if (thaw == 0) {
                            delete target.status["frozen"];
                            allMessages.push(`\n${target.upperName()} has thawed!`);
                        }
                        else {
                            allMessages.push(`\n${target.upperName()} is frozen!`);
                        }
                    }
                    else if (this.turn < target.status["frozen"][0]) {
                        let thaw = Math.floor(Math.random() * 5);
                        if (thaw == 0) {
                            delete target.status["frozen"];
                            allMessages.push(`\n${target.upperName()} has thawed!`);
                        }
                        else {
                            allMessages.push(`\n${target.upperName()} is frozen!`);
                        }
                    }
                    else if (this.turn == target.status["frozen"][0]) {
                        delete target.status["frozen"];
                        allMessages.push(`\n${target.upperName()} has thawed!`);
                    }
                }

                else if ("paralyzed" in target.status) {
                    if (target.status["paralyzed"][0] == "permanent") {
                        allMessages.push(`\n${target.upperName()} is paralyzed!`);
                    }
                    else if (this.turn < target.status["paralyzed"][0]) {
                        allMessages.push(`\n${target.upperName()} is paralyzed!`);
                    }
                    else if (this.turn == target.status["paralyzed"][0]) {
                        delete target.status["paralyzed"];
                        statEffect(target, "Speed", 0);
                        allMessages.push(`\n${target.upperName()} is no longer paralyzed!`);
                    }
                }
                
                else if ("poisoned" in target.status) {
                    if (target.status["poisoned"][0] == "permanent") {
                        let damage = Math.floor(target.startHP / 8);
                        target.hp -= damage;
                        allMessages.push(`\n${target.upperName()} is poisoned and lost ${damage} HP!`);
                    }
                    else if (this.turn < target.status["poisoned"][0]) {
                        let damage = Math.floor(target.startHP / 8);
                        target.hp -= damage;
                        allMessages.push(`\n${target.upperName()} is poisoned and lost ${damage} HP!`);
                    }
                    else if (this.turn == target.status["poisoned"][0]) {
                        delete target.status["poisoned"];
                        allMessages.push(`\n${target.upperName()} is no longer poisoned!`);
                    }
                }

                else if ("badly-poisoned" in target.status) {
                    if (target.status["poisoned"][0] == "permanent") {
                        let n = this.turn - target.status["poisoned"][1];
                        let damage = Math.floor(target.startHP * n / 16);
                        target.hp -= damage;
                        allMessages.push(`\n${target.upperName()} is badly-poisoned and lost ${damage} HP!`);
                    }
                    else if (this.turn < target.status["poisoned"][0]) {
                        let n = this.turn - target.status["poisoned"][1];
                        let damage = Math.floor(target.startHP * n / 16);
                        target.hp -= damage;
                        allMessages.push(`\n${target.upperName()} is badly-poisoned and lost ${damage} HP!`);
                    }
                    else if (this.turn == target.status["poisoned"][0]) {
                        delete target.status["poisoned"];
                        allMessages.push(`\n${target.upperName()} is no longer poisoned!`);
                    }
                }

                else if ("sleeping" in target.status) {
                    if (target.status["sleeping"][0] == "permanent") {
                        allMessages.push(`\n${target.upperName()} is sleeping!`);
                    }
                    else if (this.turn < target.status["sleeping"][0]) {
                        allMessages.push(`\n${target.upperName()} is sleeping!`);
                    }
                    else if (this.turn == target.status["sleeping"][0]) {
                        delete target.status["sleeping"];
                        allMessages.push(`\n${target.upperName()} is awake!`);
                    }
                }

                // Other status conditions are not mutually exclusive
                if (
                    "confused" in target.status &&
                    this.turn == target.status["confused"][0]
                    ) {
                    delete target.status["confused"];
                    allMessages.push(`\n${target.upperName()} is no longer confused!`);
                }

                if (
                    "flying" in target.status &&
                    this.turn == target.status["flying"][0]
                    ) {
                    delete target.status["flying"];
                    allMessages.push(`\n${target.upperName()} has landed!`);
                }

                if ("dig" in target.status) {
                    // Dig does damage the turn after it's used and counts as that next turn
                    if (this.turn == target.status["dig"][0]) {
                        allMessages.push(`\n${target.upperName()} has surfaced!`);
                        let damage = target.lastMove.damageCalc(target, otherPokemon);
                        allMessages.push(`\n${otherPokemon.upperName()} has lost ${damage} HP!`);
                    }
                    // The turn after dig does damage, the pokemon can use other moves again
                    else if (this.turn == target.status["dig"][0] + 1) {
                        delete target.status["dig"];
                    }
                }

                if (
                    "flinched" in target.status &&
                    this.turn == target.status["flinched"][0]
                    ) {
                    delete target.status["flinched"];
                    // allMessages.push(`\n${target.upperName()} is no longer flinching!`);
                }

                if (
                    "mist" in target.status &&
                    this.turn == target.status["mist"][0]
                    ) {
                    delete target.status["mist"];
                    allMessages.push(`\n${target.upperName()} is no longer shrouded in mist!`);
                }

                if (
                    "substitute" in target.status &&
                    this.turn == target.status["substitute"][0]
                ) {
                    delete target.status["substitute"];
                    allMessages.push(`\n${target.upperName()} is no longer substituted!`);
                }
                return allMessages.join(``);
            }

            // Start of moveSequence method
            moveSequence(actingPokemon, otherPokemon, moveButtonNumber) {
                let allMessages = [];
                
                // actingPokemon has been determined when this function is called by the click event
                if (actingPokemon == this.player) {
                    var move1 = this.moveArr[moveButtonNumber];
                    let i = Math.floor(Math.random() * otherPokemon.moves.length);
                    var move2 = otherPokemon.moves[i];
                }
                else if (actingPokemon == this.enemy) {
                    let i = Math.floor(Math.random() * actingPokemon.moves.length);
                    var move1 = actingPokemon.moves[i];
                    var move2 = this.moveArr[moveButtonNumber];
                }
                // Player is still required to press a button to see these status conditions
                // If status apply, then no move is used and no PP is subtracted when move is clicked
                if (
                    "frozen" in actingPokemon.status || 
                    "sleeping" in actingPokemon.status ||
                    "rest" in actingPokemon.status
                    ) {
                    allMessages.push(`${actingPokemon.upperName()} cannot use any moves!`);
                }
                else if ("dig" in actingPokemon.status) {
                    allMessages.push(`${actingPokemon.upperName()} used Dig last turn!`);
                }
                else {
                    let useMessage1 = `${actingPokemon.upperName()} used ${move1.upperName()}`;
                    let outcomeMessage1 = actingPokemon.useMove(this, move1, otherPokemon);
                    actingPokemon.lastMove = move1;
                    allMessages.push(useMessage1, outcomeMessage1);
                    if (actingPokemon == this.player) {
                        this.movePPLeftArr[moveButtonNumber] --;
                    }
                }
                // otherPokemon uses move if alive
                if (otherPokemon.alive() && actingPokemon.alive()) {
                    if (
                        "frozen" in otherPokemon.status || 
                        "sleeping" in otherPokemon.status ||
                        "rest" in otherPokemon.status
                    ) {
                        allMessages.push(`${otherPokemon.upperName()} cannot use any moves!`);
                    }
                    else if ("dig" in otherPokemon.status) {
                        allMessages.push(`${otherPokemon.upperName()} used Dig last turn!`);
                    }
                    else {
                        let useMessage2 = `${otherPokemon.upperName()} used ${move2.upperName()}`;
                        let outcomeMessage2 = otherPokemon.useMove(this,  move2, actingPokemon);
                        otherPokemon.lastMove = move2;
                        allMessages.push(useMessage2, outcomeMessage2);
                        if (otherPokemon == this.player) {
                            this.movePPLeftArr[moveButtonNumber] --;
                        } 
                    }
                }
                return allMessages;
            } // End of moveSequence method

            // Start of disableButtons method
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
            } // End of disableButtons method
    
            // Start of enableButtons method
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
            } // End of enableButtons method

            // Start of turnHistory method
            turnHistory(message, type) {
                if (type == "turnCount") {
                    let $turnCount = $("<h3>");
                    $turnCount.attr("class", "turnCount");
                    $turnCount.text("Turn " + message);
                    $(".sideBar").append($turnCount);
                }
                else if (type == "turnContent") {
                    let $turnContent = $("<p>");
                    $turnContent.attr("class", "turnContent");
                    $turnContent.text(message);
                    $(".sideBar").append($turnContent);
                }
                else {
                    console.log("Invalid Message/Type");
                }
            } // End of turnHistory method

        } // End of Battle Class

        // ------------------------------------------------------------------------------------

        // Initialize Gameplay 
        
        

        let pokemonIndex1 = Math.floor(Math.random() * pokedex.length);
        let pokemonIndex2 = Math.floor(Math.random() * pokedex.length);
        // let pokemon1 = allPokemon[pokedex[pokemonIndex1][0]];
        // let pokemon2 = allPokemon[pokedex[pokemonIndex2][0]];
        let pokemon1 = allPokemon["pikachu"];
        let pokemon2 = allPokemon["machamp"];
        let encounter = new Battle(pokemon1, pokemon2);
        console.log(pokemon1);
        console.log(pokemon2);

        // Assign sprites for both player and enemy pokemon
        for (let i = 0; i < pokedex.length; i++){
            if(pokemon1 == allPokemon[pokedex[i][0]]) {
                let playerPokemon = document.getElementById("playerPokemon");
                let pokemon1Box = document.createElement("img");
                pokemon1Box.setAttribute("id", "playerPokemonBack");
                pokemon1Box.src = pokemon1.back;
                playerPokemon.appendChild(pokemon1Box);
            };
        }
          
        
        for (let i = 0; i < pokedex.length; i++){
            if(pokemon2 == allPokemon[pokedex[i][0]]) {
                let enemyPokemon = document.getElementById("enemyPokemon");
                let pokemon2Box = document.createElement("img");
                pokemon2Box.setAttribute("id", "enemyPokemonFront");
                pokemon2Box.src = pokemon2.front;
                enemyPokemon.appendChild(pokemon2Box);
            };

        }
        // ------------------------------------------------------------------------------------

        // Main Gameplay

        $("#moveButton1").click(() => {

            encounter.disableButtons();
            encounter.turnHistory(encounter.turn, "turnCount");
            let checkMessage1 = encounter.checkStatus(pokemon1, pokemon2);
            let checkMessage2 = encounter.checkStatus(pokemon2, pokemon1);
            encounter.turnHistory(checkMessage1, "turnContent");
            encounter.turnHistory(checkMessage2, "turnContent");
            if (pokemon2.speed[0] > pokemon1.speed[0]) {
                let combatMessages1 = encounter.moveSequence(pokemon2, pokemon1, 0);
                for (let message of combatMessages1) {
                    encounter.turnHistory(message, "turnContent");
                }
            }
            else {
                let combatMessages2 = encounter.moveSequence(pokemon1, pokemon2, 0);
                for (let message of combatMessages2) {
                    encounter.turnHistory(message, "turnContent");
                }
            }
            encounter.turnHistory(pokemon1.hpLeft() + " " + pokemon2.hpLeft(), "turnContent");
            $("#movePP1").text(`${encounter.movePPLeftArr[0]}/${encounter.moveArr[0].pp}`);
            encounter.turn ++;
            setTimeout(() => {encounter.enableButtons();}, 1000);
        });

        $("#moveButton2").click(() => {
            
            encounter.disableButtons();
            encounter.turnHistory(encounter.turn, "turnCount");
            let checkMessage1 = encounter.checkStatus(pokemon1, pokemon2);
            let checkMessage2 = encounter.checkStatus(pokemon2, pokemon1);
            encounter.turnHistory(checkMessage1, "turnContent");
            encounter.turnHistory(checkMessage2, "turnContent");
            if (pokemon2.speed[0] > pokemon1.speed[0]) {
                let combatMessages1 = encounter.moveSequence(pokemon2, pokemon1, 1);
                for (let message of combatMessages1) {
                    encounter.turnHistory(message, "turnContent");
                }
            }
            else {
                let combatMessages2 = encounter.moveSequence(pokemon1, pokemon2, 1);
                for (let message of combatMessages2) {
                    encounter.turnHistory(message, "turnContent");
                }
            }
            encounter.turnHistory(pokemon1.hpLeft() + " " + pokemon2.hpLeft(), "turnContent");
            $("#movePP2").text(`${encounter.movePPLeftArr[1]}/${encounter.moveArr[1].pp}`);
            encounter.turn ++;
            setTimeout(() => {encounter.enableButtons();}, 1000);
        });

        $("#move3").click(() => {
            
            encounter.disableButtons();
            encounter.turnHistory(encounter.turn, "turnCount");
            let checkMessage1 = encounter.checkStatus(pokemon1, pokemon2);
            let checkMessage2 = encounter.checkStatus(pokemon2, pokemon1);
            encounter.turnHistory(checkMessage1, "turnContent");
            encounter.turnHistory(checkMessage2, "turnContent");
            if (pokemon2.speed[0] > pokemon1.speed[0]) {
                let combatMessages1 = encounter.moveSequence(pokemon2, pokemon1, 2);
                for (let message of combatMessages1) {
                    encounter.turnHistory(message, "turnContent");
                }
            }
            else {
                let combatMessages2 = encounter.moveSequence(pokemon1, pokemon2, 2);
                for (let message of combatMessages2) {
                    encounter.turnHistory(message, "turnContent");
                }
            }
            encounter.turnHistory(pokemon1.hpLeft() + " " + pokemon2.hpLeft(), "turnContent");
            $("#movePP3").text(`${encounter.movePPLeftArr[2]}/${encounter.moveArr[2].pp}`);
            encounter.turn ++;
            setTimeout(() => {encounter.enableButtons();}, 1000);
        });

        $("#move4").click(() => {
            
            encounter.disableButtons();
            encounter.turnHistory(encounter.turn, "turnCount");
            let checkMessage1 = encounter.checkStatus(pokemon1, pokemon2);
            let checkMessage2 = encounter.checkStatus(pokemon2, pokemon1);
            encounter.turnHistory(checkMessage1, "turnContent");
            encounter.turnHistory(checkMessage2, "turnContent");
            if (pokemon2.speed[0] > pokemon1.speed[0]) {
                let combatMessages1 = encounter.moveSequence(pokemon2, pokemon1, 3);
                for (let message of combatMessages1) {
                    encounter.turnHistory(message, "turnContent");
                }
            }
            else {
                let combatMessages2 = encounter.moveSequence(pokemon1, pokemon2, 3);
                for (let message of combatMessages2) {
                    encounter.turnHistory(message, "turnContent");
                }
            }
            encounter.turnHistory(pokemon1.hpLeft() + " " + pokemon2.hpLeft(), "turnContent");
            $("#movePP4").text(`${encounter.movePPLeftArr[3]}/${encounter.moveArr[3].pp}`);
            encounter.turn ++;
            setTimeout(() => {encounter.enableButtons();}, 1000);
        });

        // ------------------------------------------------------------------------------------

    }, 3000)

});

// Assign sprites for both player and enemy pokemon


///// Pokemon Physical Attack Animation //////

// Player Pokemon Physical Attack

function pokemon1AttackPokemon2(){
    let playerPokemon = document.getElementById("playerPokemon");
    let enemyPokemon = document.getElementById("enemyPokemon");
    let starHit = document.createElement("div");
    starHit.setAttribute("id","enemyGetHit");
    enemyPokemon.appendChild(starHit);
    anime.speed = 2;
    anime({
        targets: playerPokemon,
        translateX: '40%',
        translateY: '-60%',
        loop: 2,
        direction: 'alternate',
    });
    anime({
        targets: enemyPokemon,
        translateX: '10%',
        loop: 2,
        direction: 'alternate',
    });
    let starAnimation = anime.timeline({
        targets:"starHit",
        duration: 2500,
    });
    starAnimation
    .add({
        complete: function(anim) {
            starHit.remove();
        }
        
    });
}

// Enemy Pokemon Physical Attack

function pokemon2AttackPokemon1(){
    let enemyPokemon = document.getElementById("enemyPokemon");
    let playerPokemon = document.getElementById("playerPokemon");
    let starHit = document.createElement("div");
    starHit.setAttribute("id","playerGetHit")
    playerPokemon.appendChild(starHit)
    anime.speed = 2;
    anime({
        targets: playerPokemon,
        translateX: '-10%',
        loop: 2,
        direction: 'alternate',
    });
    anime({
        targets: enemyPokemon,
        translateX: '-40%',
        translateY: '50%',
        loop: 2,
        direction: 'alternate',
    });
    let starAnimation = anime.timeline({
        targets:"starHit",
        duration: 2500,
    });
    starAnimation
    .add({
        complete: function() {
            starHit.remove();
        }
        
    });
}




// Pokemon Special Attack Animation

/// Player Pokemon Special Attack Animation ///
function pokemon1SpecialAttackPokemon2(){
    let playerPokemon1 = document.getElementById("playerPokemon");
    let specialAttack = document.createElement("div");
    specialAttack.setAttribute("class","specialAttack");
    specialAttack.style.left = "50%"
    playerPokemon1.appendChild(specialAttack);
    let i = 1;
    while(i < 6){
        let specialAttack = document.createElement("div")
        specialAttack.className = "specialAttack specialAttack"+ i;
        specialAttack.style.left = "50%"
        playerPokemon1.appendChild(specialAttack);
        i++;
    }
    let enemyPokemon = document.getElementById("enemyPokemonFront");
    let pokemon2Hit = anime({
        delay: 750,
        targets: enemyPokemon,
        translateX: '10%',
        scaleX: 1,
        easing: 'easeInOutSine',
        loop: 2,
        direction: 'alternate',
    })
    pokemon2Hit.speed = .8
    anime.speed = .9;
    anime({
        delay: 100,
        targets: specialAttack,
        translateX: '300%',
        translateY: '-300%',
        scale: 1.2,
        rotate: '5turn',
        easing: 'linear',
        complete: function(){
            specialAttack.remove();
        }
    })
    anime({
        delay: 200,
        targets: '.specialAttack1',
        opacity: .85,
        translateX: '300%',
        translateY: '-300%',
        rotate: '5turn',
        easing: 'linear',
        complete: function(){
            document.querySelector('.specialAttack1').remove();
        }
    })
    anime({
        delay: 300,
        targets: '.specialAttack2',
        opacity:.75,
        translateX: '300%',
        translateY: '-300%',
        rotate: '5turn',
        easing: 'linear',
        complete: function(){
            document.querySelector('.specialAttack2').remove();
        }
    })
    anime({
        delay: 400,
        targets: '.specialAttack3',
        opacity:.65,
        translateX: '300%',
        translateY: '-300%',
        rotate: '5turn',
        easing: 'linear',
        complete: function(){
            document.querySelector('.specialAttack3').remove();
        }
    })
    anime({
        delay: 500,
        targets: '.specialAttack4',
        opacity:.55,
        translateX: '300%',
        translateY: '-300%',
        rotate: '5turn',
        easing: 'linear',
        complete: function(){
            document.querySelector('.specialAttack4').remove();
        }
    })
    anime({
        delay: 600,
        targets: '.specialAttack5',
        opacity:.45,
        translateX: '300%',
        translateY: '-300%',
        rotate: '5turn',
        easing: 'linear',
        complete: function(){
            document.querySelector('.specialAttack5').remove();
        }
    })
}

//// Enemy Pokemon Special Attack
function pokemon2SpecialAttackPokemon1(){
    let enemyPokemon1 = document.getElementById("enemyPokemon");
    let specialAttack = document.createElement("div");
    specialAttack.setAttribute("class","specialAttack")
    specialAttack.style.top = "40%"
    specialAttack.style.left = "20%"
    enemyPokemon1.appendChild(specialAttack);
    let i = 1;
    while(i < 6){
        let specialAttack = document.createElement("div")
        specialAttack.className = "specialAttack specialAttack"+ i;
        specialAttack.style.top = "40%"
        specialAttack.style.left = "20%"
        enemyPokemon1.appendChild(specialAttack);
        i++;
    }
    let playerPokemon = document.getElementById("playerPokemonBack");
    let pokemon2Hit = anime({
        delay: 750,
        targets: playerPokemon,
        translateX: '-10%',
        scaleX: 1,
        easing: 'easeInOutSine',
        loop: 2,
        direction: 'alternate',
    })
    pokemon2Hit.speed = .8
    anime.speed = .9;
    anime({
        delay: 100,
        targets: specialAttack,
        translateX: '-310%',
        translateY: '300%',
        scale: 1.,
        rotate: '5turn',
        easing: 'linear',
        complete: function(){
            specialAttack.remove();
        }
    })
    anime({
        delay: 200,
        targets: '.specialAttack1',
        opacity: .85,
        translateX: '-310%',
        translateY: '300%',
        rotate: '5turn',
        easing: 'linear',
        complete: function(){
            document.querySelector('.specialAttack1').remove();
        }
    })
    anime({
        delay: 300,
        targets: '.specialAttack2',
        opacity:.75,
        translateX: '-310%',
        translateY: '300%',
        rotate: '5turn',
        easing: 'linear',
        complete: function(){
            document.querySelector('.specialAttack2').remove();
        }
    })
    anime({
        delay: 400,
        targets: '.specialAttack3',
        opacity:.65,
        translateX: '-310%',
        translateY: '300%',
        rotate: '5turn',
        easing: 'linear',
        complete: function(){
            document.querySelector('.specialAttack3').remove();
        }
    })
    anime({
        delay: 500,
        targets: '.specialAttack4',
        opacity:.55,
        translateX: '-310%',
        translateY: '300%',
        rotate: '5turn',
        easing: 'linear',
        complete: function(){
            document.querySelector('.specialAttack4').remove();
        }
    })
    anime({
        delay: 600,
        targets: '.specialAttack5',
        opacity:.45,
        translateX: '-310%',
        translateY: '300%',
        rotate: '5turn',
        easing: 'linear',
        complete: function(){
            document.querySelector('.specialAttack5').remove();
        }
    })
}

//////////////// Pokemon Status Effect Animation ////////////////

////// Sleep Aniimation

/////// Enemy Pokemon Sleeping /////////////
function pokemon2Sleeping(){
    let enemyPokemon = document.getElementById("enemyPokemon");
    let sleepingAnime = document.createElement("div");
    sleepingAnime.setAttribute("id","sleepingAnime");
    sleepingAnime.textContent = "ZzZ";
    sleepingAnime.style.right = "50%"
    enemyPokemon.appendChild(sleepingAnime)
    let sleepingAnime2 = document.createElement("div");
    sleepingAnime2.setAttribute("id","sleepingAnime2");
    sleepingAnime2.textContent = "ZzZ"
    sleepingAnime2.style.right = "50%"
    enemyPokemon.appendChild(sleepingAnime2)
    let sleepyPokemon = document.getElementById("enemyPokemonFront")
    anime.speed = .9; 
    let pokemon1Sleep = anime({
        targets: sleepyPokemon,
        loop: 2,
        easing: 'easeInOutSine',
        direction: 'alternate',
        filter: 'grayscale(100%)',
        webkitFilter: 'grayscale(100%)',
    })
    pokemon1Sleep.speed = .2;
    anime({
        targets: sleepingAnime,
        translateX: '-200%',
        translateY: '-100%',
        scale: 2,
        loop: 2,
        complete: function() {
            sleepingAnime.remove();
        } 
    });
    anime({
        targets: sleepingAnime2,
        delay: 200,
        translateX: '-200%',
        translateY: '-100%',
        scale: 2,
        loop: 2,
        complete: function() {
            sleepingAnime2.remove();
        } 
    });
}

/////// Player Pokemon Sleeping ////////////////
function pokemon1Sleeping(){
    let playerPokemon = document.getElementById("playerPokemon");
    let sleepingAnime = document.createElement("div");
    sleepingAnime.setAttribute("id","sleepingAnime");
    sleepingAnime.textContent = "ZzZ"
    sleepingAnime.style.right = "20%"
    playerPokemon.appendChild(sleepingAnime)
    let sleepingAnime2 = document.createElement("div");
    sleepingAnime2.setAttribute("id","sleepingAnime2");
    sleepingAnime2.textContent = "ZzZ"
    sleepingAnime2.style.right = "20%"
    playerPokemon.appendChild(sleepingAnime2)
    let sleepyPokemon = document.getElementById("playerPokemonBack")
    anime.speed = .9; 
    let pokemon1Sleep = anime({
        targets: sleepyPokemon,
        loop: 2,
        easing: 'easeInOutSine',
        direction: 'alternate',
        filter: 'grayscale(100%)',
        webkitFilter: 'grayscale(100%)',
    })
    pokemon1Sleep.speed = .2;
    anime({
        targets: sleepingAnime,
        translateX: '200%',
        translateY: '-100%',
        scale: 2,
        loop: 2,
        complete: function() {
            sleepingAnime.remove();
        } 
    });
    anime({
        targets: sleepingAnime2,
        delay: 300,
        translateX: '200%',
        translateY: '-100%',
        scale: 2,
        loop: 2,
        complete: function() {
            sleepingAnime2.remove();
        } 
    });
}


////////////////////Freeze Animation ////////////////

function pokemon1Freeze(){
    let playerPokemon = document.getElementById("playerPokemon");
    let freezeOverlay = document.createElement("div");
    freezeOverlay.setAttribute("id","freezeOverlay");
    freezeOverlay.style.bottom = "7%";
    playerPokemon.appendChild(freezeOverlay);
    let pokemon1Frozen = document.getElementById("playerPokemonBack");
        anime ({
        targets: pokemon1Frozen,
        opacity: .8,
        translateX: '1%',
        easing: 'easeInOutSine',
        direction: 'alternate',
        loop: 8,
        duration: 300,
        complete: function(){
            freezeOverlay.remove()
        }
    })
        anime ({
        targets: freezeOverlay,
        opacity: .6,
        translateX: '.5%',
        easing: 'easeInOutSine',
        direction: 'alternate',
        loop: 8,
        duration: 300,
    })
}
function pokemon2Freeze(){
    let enemyPokemon = document.getElementById("enemyPokemon");
    let freezeOverlay = document.createElement("div");
    freezeOverlay.setAttribute("id","freezeOverlay");
    freezeOverlay.style.right = "0"
    enemyPokemon.appendChild(freezeOverlay);
    let pokemon2Frozen = document.getElementById("enemyPokemonFront");
        anime ({
        targets: pokemon2Frozen,
        opacity: .8,
        translateX: '1%',
        easing: 'easeInOutSine',
        direction: 'alternate',
        loop: 8,
        duration: 300,
        complete: function(){
            freezeOverlay.remove()
        }
    })
        anime ({
        targets: freezeOverlay,
        opacity: .6,
        translateX: '.5%',
        easing: 'easeInOutSine',
        direction: 'alternate',
        loop: 8,
        duration: 300,
    })
}


//////////////////// Burn Animation////////////////////////

///////// Player Pokemon Burn /////////////
function pokemon1Burn(){
    let playerPokemon = document.getElementById("playerPokemon");
    let burnOverlay = document.createElement("div");
    burnOverlay.setAttribute("class","burnOverlay");
    burnOverlay.style.bottom = '15%';
    burnOverlay.style.left = '30%';
    playerPokemon.appendChild(burnOverlay);
    let i =1;
    while(i < 4){
        let burnOverlay = document.createElement("div")
        burnOverlay.className = "burnOverlay burnOverlay"+ i;
        burnOverlay.style.bottom = '15%';
        burnOverlay.style.left = '30%';
        playerPokemon.appendChild(burnOverlay);
        i++;
    }
    let playerPokemonImg = document.getElementById('playerPokemonBack')
    anime({
        targets: playerPokemonImg,
        translateX: '10%', 
        loop:4,
        duration: 1300,
        easing: 'easeInOutSine',
        direction: 'alternate',
        filter: 'sepia(100%) saturate(1000%)',
        webkitFilter: 'sepia(100%) saturate(1000%)',
    })
    anime.speed = 1.2
    anime({
        targets: burnOverlay,
        translateX: '400%',
        translateY:'5%',
        rotate: -45,
        scaleY: [{value: 1.3}, {value:0.8}],
        easing: 'easeInOutSine',
        duration: 1500,
        loop: 3,
        complete: function(){
            burnOverlay.remove();
        }
    });
    anime({
        targets: '.burnOverlay1',
        opacity: .8,
        translateX: '400%',
        translateY:'5%',
        rotate: -45,
        scaleY: [{value: 1.3}, {value:0.8}],
        easing: 'easeInOutSine',
        delay: 75,
        duration: 1500,
        loop: 3, 
        complete: function(){
            document.querySelector('.burnOverlay1').remove();
        }  
    });
    anime({
        targets: '.burnOverlay2',
        opacity:.6,
        translateX: '400%',
        translateY:'5%',
        rotate: -45,
        scaleY: [{value: 1.3}, {value:0.8}],
        easing: 'easeInOutSine',
        delay:150,
        duration: 1500,
        loop: 3,
        complete: function(){
            document.querySelector('.burnOverlay2').remove();
        }   
    });
    anime({
        targets: '.burnOverlay3',
        opacity:.4,
        translateX: '400%',
        translateY:'5%',
        rotate: -45,
        scaleY: [{value: 1.3}, {value:0.8}],
        easing: 'easeInOutSine',
        delay:225,
        duration: 1500,
        loop: 3,
        complete: function(){
            document.querySelector('.burnOverlay3').remove();
        }   
    })
}
//////// Enemy Pokemon Burn ///////////////
function pokemon2Burn(){
    let enemyPokemon = document.getElementById("enemyPokemon");
    let burnOverlay = document.createElement("div");
    burnOverlay.setAttribute("class","burnOverlay");
    burnOverlay.style.bottom = "10%";
    burnOverlay.style.right = "30%"
    enemyPokemon.appendChild(burnOverlay);
    let i =1;
    while(i < 4){
        let burnOverlay = document.createElement("div")
        burnOverlay.className = "burnOverlay burnOverlay"+ i;
        burnOverlay.style.bottom = "10%";
        burnOverlay.style.right = "30%"
        enemyPokemon.appendChild(burnOverlay);
        i++;
    }
    let enemyPokemonImg = document.getElementById('enemyPokemonFront')
    anime({
        targets: enemyPokemonImg,
        translateX: '-10%', 
        loop:4,
        duration: 1300,
        easing: 'easeInOutSine',
        direction: 'alternate',
        filter: 'sepia(100%) saturate(1000%)',
        webkitFilter: 'sepia(100%) saturate(1000%)',
    })
    anime.speed = 1.2
    anime({
        targets: burnOverlay,
        translateX: '-400%',
        translateY:'-5%',
        rotate: -45,
        scaleY: [{value: 1.3}, {value:0.8}],
        easing: 'easeInOutSine',
        duration: 1500,
        loop: 3,
        complete: function(){
            burnOverlay.remove();
        }
    });
    anime({
        targets: '.burnOverlay1',
        opacity: .8,
        translateX: '-400%',
        translateY:'-5%',
        rotate: -45,
        scaleY: [{value: 1.3}, {value:0.8}],
        easing: 'easeInOutSine',
        delay: 75,
        duration: 1500,
        loop: 3, 
        complete: function(){
            document.querySelector('.burnOverlay1').remove();
        }  
    });
    anime({
        targets: '.burnOverlay2',
        opacity:.6,
        translateX: '-400%',
        translateY:'-5%',
        rotate: -45,
        scaleY: [{value: 1.3}, {value:0.8}],
        easing: 'easeInOutSine',
        delay:150,
        duration: 1500,
        loop: 3,
        complete: function(){
            document.querySelector('.burnOverlay2').remove();
        }   
    });
    anime({
        targets: '.burnOverlay3',
        opacity:.4,
        translateX: '-400%',
        translateY:'-5%',
        rotate: -45,
        scaleY: [{value: 1.3}, {value:0.8}],
        easing: 'easeInOutSine',
        delay:225,
        duration: 1500,
        loop: 3,
        complete: function(){
            document.querySelector('.burnOverlay3').remove();
        }   
    })
}

//////// Poison Animation /////////////////

/////// Enemy Pokemon Poison
function pokemon2Poison(){
    let enemyPokemon = document.getElementById("enemyPokemon");
    enemyPokemon.style.webkitFilter = "grayscale(5%) sepia(0) hue-rotate(100deg)";
    enemyPokemon.style.filter = "grayscale(5%) sepia(0) hue-rotate(100deg)";
    let poisonOverlay = document.createElement("div")
    poisonOverlay.setAttribute("id","poisonOverlay");
    enemyPokemon.appendChild(poisonOverlay);
    let poisonOverlay2 = document.createElement("div")
    poisonOverlay2.setAttribute("id","poisonOverlay2");
    enemyPokemon.appendChild(poisonOverlay2);

    anime.timeline({
        targets: enemyPokemon,
        translateX: '.75%',
        loop: 2,
        opacity: .7,
        easing: 'easeInOutSine',
        direction: 'alternate',
    }).add({
        webkitFilter: "invert(100%)",
        filter: "invert(100%)",
    })
    anime({
        targets: [poisonOverlay, poisonOverlay2,],
        translateY: '100%',
        loop: 2,
        easing: 'easeInOutSine',
        complete: function(){
            poisonOverlay.remove();
            poisonOverlay2.remove();
        }
    })
}
//////// Player Pokemon Poison
function pokemon1Poison(){
    let playerPokemon = document.getElementById("playerPokemon");
    playerPokemon.style.webkitFilter = "grayscale(5%) sepia(0) hue-rotate(100deg)";
    playerPokemon.style.filter = "grayscale(5%) sepia(0) hue-rotate(100deg)";
    let poisonOverlay = document.createElement("div")
    poisonOverlay.setAttribute("id","poisonOverlay");
    playerPokemon.appendChild(poisonOverlay);
    let poisonOverlay2 = document.createElement("div")
    poisonOverlay2.setAttribute("id","poisonOverlay2");
    playerPokemon.appendChild(poisonOverlay2);

    anime.timeline({
        targets: playerPokemon,
        translateX: '-.75%',
        loop: 2,
        opacity: .7,
        easing: 'easeInOutSine',
        direction: 'alternate',
    }).add({
        webkitFilter: "invert(100%)",
        filter: "invert(100%)",
    })
    anime({
        targets: [poisonOverlay, poisonOverlay2,],
        translateY: '100%',
        loop: 2,
        easing: 'easeInOutSine',
        complete: function(){
            poisonOverlay.remove();
            poisonOverlay2.remove();
        }
    })
}

// Paralyze Animation

////// Player Pokemon Paralyze ////////
function pokemon1Paralyze() {
    let playerPokemon = document.getElementById("playerPokemon");
    let paralyzeOverlay = document.createElement("img");
    paralyzeOverlay.setAttribute("id", "paralyzeOverlay");
    paralyzeOverlay.src = "./images/lightning-3050.png";
    paralyzeOverlay.style.top = "-20%";
    paralyzeOverlay.style.left = "10%";
    playerPokemon.appendChild(paralyzeOverlay);
    let playerPokemonImg = document.getElementById('playerPokemonBack')
    anime({
        targets: playerPokemonImg,
        translateX: '-10%', 
        loop:4,
        easing: 'easeInOutSine',
        direction: 'alternate',
        filter: 'sepia(100%) saturate(1000%)',
        webkitFilter: 'sepia(100%) saturate(1000%)',
    })
    anime.timeline({
        targets: paralyzeOverlay,
        translateY: '50%',
        scaleX: 1.2,
        scaleY: 1.4,
        loop: 2,
        easing: 'linear',
        direction: 'alternate'
    }).add({
        rotate: '1turn',
        scaleX: 1.2,
        scaleY: 1.4,
        loop: 2,
        duration: 1000,
        easing: 'linear',
        direction: 'normal',
        complete: function (){
            paralyzeOverlay.remove()
        }
    })
};
  

////////////////////////////

// Player Lose Animation 
function player1Lost(){ 
    let theCanvas = document.createElement("canvas");
    theCanvas.setAttribute("id","player1Lost");
    let leftTop = document.getElementById("leftTop");
    leftTop.appendChild(theCanvas);
    let ctx = theCanvas.getContext("2d");

    //making the canvas fit
    theCanvas.style.height = '100%';
    theCanvas.style.width = '100%';

    //binaryNo characters - taken from the unicode charset
    let binaryNo = "YOULOSE!YOULOSE!YOULOSE!YOULOSE!YOULOSE!YOULOSE!YOULOSE!YOULOSE!";
    //converting the string into an array of single characters
    binaryNo = binaryNo.split("");

    let font_size = 7;
    let columns = theCanvas.width/font_size; //number of columns for the rain
    //an array of drops - one per column
    let drops = [];
    //x below is the x coordinate
    //1 = y co-ordinate of the drop(same for every drop initially)
    for(let x = 0; x < columns; x++)
        drops[x] = 1; 

    //drawing the characters
    function draw()
    {
        //Black BG for the canvas
        //translucent BG to show trail
        ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
        ctx.fillRect(0, 0, theCanvas.width, theCanvas.height);
        
        ctx.fillStyle = "#FF0000"; //green text
        ctx.font = font_size + "px arial";
        //looping over drops
        for(let i = 0; i < drops.length; i++)
        {
            //a random binaryNo character to print
            let text = binaryNo[Math.floor(Math.random()*binaryNo.length)];
            //x = i*font_size, y = value of drops[i]*font_size
            ctx.fillText(text, i*font_size, drops[i]*font_size);
            
            //sending the drop back to the top randomly after it has crossed the screen
            //adding a randomness to the reset to make the drops scattered on the Y axis
            if(drops[i]*font_size > theCanvas.height && Math.random() > 0.975)
                drops[i] = 0;
            
            //incrementing Y coordinate
            drops[i]++;
        }
    }

    setInterval(draw, 33);
}


// Background Image for battlefield

let bg1 = "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/intermediary/f/2fb2821a-1406-4a1d-9b04-6668f278e944/d88ppxc-af4394dd-f0d5-4370-801e-13a781f9ae96.png"
let bg2 = "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/intermediary/f/2fb2821a-1406-4a1d-9b04-6668f278e944/d86i02s-5d7bc1ed-0c4f-4171-b48f-1dd1072ea7eb.png"
let bg3 = "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/intermediary/f/2fb2821a-1406-4a1d-9b04-6668f278e944/d85ijvr-c2c4a900-5386-4a6a-bee8-5b73e5235ebf.png"
let bg4 = "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/intermediary/f/2fb2821a-1406-4a1d-9b04-6668f278e944/d85jk85-38ec6987-8e11-49f8-a6af-8cf85bf53e17.png"
let bg5 = "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/intermediary/f/2fb2821a-1406-4a1d-9b04-6668f278e944/d85jegc-5191a123-808e-48af-a9a1-d2049e23da43.png"
let bg6 = "https://i.imgur.com/wN17Epp.png"
let battlefieldBackground = [bg1,bg2,bg3,bg4,bg5,bg6];
function setRandomBackground(){
    let randomBackground = battlefieldBackground[Math.floor(Math.random() * battlefieldBackground.length)]
    let leftTop = document.getElementById("leftTop");
    leftTop.style.backgroundImage = "url(" + randomBackground + ")";
    leftTop.style.backgroundRepeat = "no-repeat";
    leftTop.style.backgroundPosition = "center center";
    leftTop.style.backgroundAttachment = "local";
    leftTop.style.backgroundSize = "100% 100%";
}
setRandomBackground()
