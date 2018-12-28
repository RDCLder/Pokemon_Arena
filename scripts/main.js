// Main file to run

$(function() {

    let pokedex = [];
    let moves = [[], []];
  
    // Retrieve data from API
    
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
    

    // $.get("https://pokeapi.co/api/v2/move-damage-class/2/")
    // .done((result) => {
    //     for (let i = 0; i < 74; i ++) {
    //         let moveName = result.moves[i].name;
    //         moves[0].push(moveName);

    //         // Retrieve object from nested URL
    //         $.get(result.moves[i].url).done((result) => {
    //             moves[1].push(result);
    //         });
    //     }
    // })

    // Retrieve data from API
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
    
    // Account for async with 3000 ms delay
    setTimeout(() => {
        
        // ------------------------------------------------------------------------------------

        
        // Class Definitions
        
        // Consider adding turn durations of some kind
        // For normal moves, turn duration would be 1 to indicate happens one time.

        class Move {

            constructor(moveName, moveObject) {
                this.name = moveName;
                this.target = moveObject.target.name;
                this.accuracy = moveObject.accuracy;
                this.power = moveObject.power;
                this.effectChance = moveObject.effect_chance;
                this.pp = moveObject.pp;
                this.damage_class = moveObject.damage_class.name;
                this.type = moveObject.type.name;
                this.description = moveObject.effect_entries[0].short_effect;
            }

            damageCalc(user, target) {
                if (this.damage_class == "physical") {
                    let baseDamage = (6 * this.power * user.attack / target.defense / 50) + 2;
                    let min = Math.ceil(85);
                    let max = Math.floor(100);
                    return Math.floor(baseDamage * (Math.floor(Math.random() * (max - min + 1)) + min) / 100);
                }
                else if (this.damage_class == "special") {
                    let baseDamage = (6 * this.power * user.specialAttack / target.specialDefense / 50) + 2;
                    let min = Math.ceil(85);
                    let max = Math.floor(100);
                    return Math.floor(baseDamage * (Math.floor(Math.random() * (max - min + 1)) + min) / 100);
                }
            }

            physical(user, target) {
                // Assuming all pokemon are level 10, no special attacks, and no modifiers
                let damage = this.damageCalc(user, target);
                target.hp -= damage;
                // Message to add to the side display
                return `${this.name} dealt ${damage} damage to ${target.name}!`;
            }

            special(user, target) {

                if (this.name == "razor-wind") {
                    "Requires a turn to charge before attacking."
                }
                else if (this.name == "gust") {
                    "Inflicts regular damage and can hit Pokémon in the air."
                }
                else if (this.name == "sonic-boom") {
                    "Inflicts 20 points of damage."
                }
                else if (this.name == "acid") {
                    "Has a $effect_chance% chance to lower the target's Special Defense by one stage."
                }
                else if (this.name == "ember") {
                    "Has a $effect_chance% chance to burn the target."
                }
                else if (this.name == "flamethrower") {
                    "Has a $effect_chance% chance to burn the target."
                }
                else if (this.name == "water-gun") {
                    "Inflicts regular damage with no additional effect."
                }
                else if (this.name == "hydro-pump") {
                    "Inflicts regular damage with no additional effect."
                }
                else if (this.name == "surf") {
                    "Inflicts regular damage and can hit Dive users."
                }
                else if (this.name == "ice-beam") {
                    "Has a $effect_chance% chance to freeze the target."
                }
                else if (this.name == "blizzard") {
                    "Has a $effect_chance% chance to freeze the target."
                }
                else if (this.name == "psybeam") {
                    "Has a $effect_chance% chance to confuse the target."
                }
                else if (this.name == "bubble-beam") {
                    "Has a $effect_chance% chance to lower the target's Speed by one stage."
                }
                else if (this.name == "aurora-beam") {
                    "Has a $effect_chance% chance to lower the target's Attack by one stage."
                }
                else if (this.name == "hyper-beam") {
                    "User foregoes its next turn to recharge."
                }
                else if (this.name == "absorb") {
                    "Drains half the damage inflicted to heal the user."
                }
                else if (this.name == "mega-drain") {
                    "Drains half the damage inflicted to heal the user."
                }
                else if (this.name == "solar-beam") {
                    "Requires a turn to charge before attacking."
                }
                else if (this.name == "petal-dance") {
                    "Hits every turn for 2-3 turns, then confuses the user."
                }
                else if (this.name == "dragon-rage") {
                    "Inflicts 40 points of damage."
                }
                else if (this.name == "fire-spin") {
                    "Prevents the target from fleeing and inflicts damage for 2-5 turns."
                }
                else if (this.name == "thunder-shock") {
                    "Has a $effect_chance% chance to paralyze the target."
                }
                else if (this.name == "thunderbolt") {
                    "Has a $effect_chance% chance to paralyze the target."
                }
                else if (this.name == "thunder") {
                    "Has a $effect_chance% chance to paralyze the target."
                }
                else if (this.name == "confusion") {
                    "Has a $effect_chance% chance to confuse the target."
                }
                else if (this.name == "psychic") {
                    "Has a $effect_chance% chance to lower the target's Special Defense by one stage."
                }
                else if (this.name == "night-shade") {
                    "Inflicts damage equal to the user's level."
                }
                else if (this.name == "smog") {
                    "Has a $effect_chance% chance to poison the target."
                }
                else if (this.name == "sludge") {
                    "Has a $effect_chance% chance to poison the target."
                }
                else if (this.name == "fire-blast") {
                    "Has a $effect_chance% chance to burn the target."
                }
                else if (this.name == "swift") {
                    "Never misses."
                }
                else if (this.name == "dream-eater") {
                    "Only works on sleeping Pokémon. Drains half the damage inflicted to heal the user."
                }
                else if (this.name == "bubble") {
                    "Has a $effect_chance% chance to lower the target's Speed by one stage."
                }
                else if (this.name == "psywave") {
                    "Inflicts damage between 50% and 150% of the user's level."
                }
                else if (this.name == "tri-attack") {
                    "Has a $effect_chance% chance to burn, freeze, or paralyze the target."
                }
                else {
                    // Assuming all pokemon are level 10, no special attacks, and no modifiers
                    var damage = this.damageCalc(user, target);
                }
                target.hp -= damage;
                return `${this.name} dealt ${damage} damage to ${target.name}!`;
            }

            status(user, target) {

                // Hard code EVERY single status move from generation 1 (i.e. # 1-164) using pokeapi as a guide

                if (this.name == "swords-dance" ) {

                }
                else if (this.name == "whirlwind") {

                }
                else if (this.name == "sand-attack") {
                    
                }
                else if (this.name == "tail-whip") {
                    
                }
                else if (this.name == "leer") {
                    
                }
                else if (this.name == "growl") {

                }
                else if (this.name == "roar") {
                    
                }
                else if (this.name == "sing") {
                    
                }
                else if (this.name == "supersonic") {
                    
                }
                else if (this.name == "disable") {

                }
                else if (this.name == "mist") {
                    
                }
                else if (this.name == "leech-seed") {
                    
                }
                else if (this.name == "growth") {
                    
                }
                else if (this.name == "poison-powder") {

                }
                else if (this.name == "stun-spore") {
                    
                }
                else if (this.name == "sleep-powder") {
                    
                }
                else if (this.name == "string-shot") {
                    
                }
                else if (this.name == "thunder-wave") {

                }
                else if (this.name == "toxic") {
                    
                }
                else if (this.name == "hypnosis") {
                    
                }
                else if (this.name == "meditate") {
                    
                }
                else if (this.name == "agility") {

                }
                else if (this.name == "teleport") {
                    
                }
                else if (this.name == "mimic") {
                    
                }
                else if (this.name == "screech") {
                    
                }
                else if (this.name == "double-team") {

                }
                else if (this.name == "recover") {
                    
                }
                else if (this.name == "harden") {
                    
                }
                else if (this.name == "minimize") {
                    
                }
                else if (this.name == "smokescreen") {

                }
                else if (this.name == "confuse-ray") {
                    
                }
                else if (this.name == "withdraw") {
                    
                }
                else if (this.name == "defense-curl") {
                    
                }
                else if (this.name == "barrier") {

                }
                else if (this.name == "light-screen") {
                    
                }
                else if (this.name == "haze") {
                    
                }
                else if (this.name == "reflect") {
                    
                }
                else if (this.name == "focus-energy") {

                }
                else if (this.name == "metronome") {
                    
                }
                else if (this.name == "mirror-move") {
                    
                }
                else if (this.name == "amnesia") {
                    
                }
                else if (this.name == "kinesis") {

                }
                else if (this.name == "soft-boiled") {
                    
                }
                else if (this.name == "glare") {
                    
                }
                else if (this.name == "poison-gas") {
                    
                }
                else if (this.name == "lovely-kiss") {

                }
                else if (this.name == "transform") {
                    
                }
                else if (this.name == "spore") {
                    
                }
                else if (this.name == "flash") {
                    
                }
                else if (this.name == "splash") {

                }
                else if (this.name == "acid-armor") {
                    
                }
                else if (this.name == "rest") {
                    
                }
                else if (this.name == "sharpen") {
                    
                }
                else if (this.name == "conversion") {

                }
                else if (this.name == "substitute") {
                    
                }
                else {
                    console.log(`${this.name} is not a valid status move.`)
                }
            }

        } // End of Move Class

        class Pokemon {

            constructor(pokeName, pokeObject) {
                this.name = pokeName;
                this.hp = Math.floor(((pokeObject.stats[5].base_stat + 15) * 2 + (30000 ** (1 / 2) / 4)) / 10 + 20);
                this.attack = pokeObject.stats[4].base_stat;
                this.defense = pokeObject.stats[3].base_stat;
                this.specialAttack = pokeObject.stats[2].base_stat;
                this.specialDefense = pokeObject.stats[1].base_stat;
                this.speed = pokeObject.stats[0].base_stat;
                this.front = pokeObject.sprites.front_default;
                this.back = pokeObject.sprites.back_default;
                this.moves = [];
                this.type = [];

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
                        if (!this.moves.includes(move)) {
                            this.moves.push(move);
                        }
                    }
                }

                for (let i = 0; i < pokeObject.types.length; i ++) {
                    let typeName = pokeObject.types[i].type.name;
                    this.type.push(typeName);
                }
            }

            useMove(move, target) {
                let hitOrMiss = Math.floor(Math.random() * 100);
                if (hitOrMiss > move.accuracy) {
                    return `${this.name} missed!`;
                }
                else {
                    if (move.damage_class == "physical") {
                        let message = move.physical(this, target);
                        return message;
                    }
                    else if (move.damage_class == "special") {
                        let message = move.special(this, target);
                        return message;
                    }
                    else if (move.damage_class == "status") {
                        let message = move.status(this, target);
                        return message;
                    }
                    else {
                        console.log(`${move} has an invalid class.`)
                    }
                }
            }

            status() {
                let name = this.name[0].toUpperCase() + this.name.slice(1, this.name.length);
                return `${name} has ${this.hp} health.`;
            }

            alive() {
                if (this.hp > 0) {
                    return true;
                }
                else {
                    return false;
                }
            }

        } // End of Pokemon Class

        // ------------------------------------------------------------------------------------

        // Create Global Variables

        var allPokemon = [];
        var allMoves = {};
        
        for (let i = 0; i < pokedex.length; i ++) {
            let pokemon = new Pokemon(pokedex[i][0], pokedex[i][1]);
            allPokemon.push(pokemon);
        }
        for (let i = 0; i < moves[0].length; i ++) {
            let move = new Move(moves[0][i], moves[1][i]);
            let name = moves[0][i];
            allMoves[name] = move;
        }

        // console.log(allPokemon);
        // console.log(allMoves["barrage"]);

        // ------------------------------------------------------------------------------------

        // Function Definitions

        function disableButtons() {
            if (movePPLeftArr[0] > 0) {
                $("#moveButton1").prop("disabled", true);
            }
            else {
                $("#moveName1").text("Struggle");
                $("#moveClass1").text("Physical");
                $("#moveType1").text("Normal");
                $("#movePP1").text(`1/1`);
            }
            $("#moveButton2").prop("disabled", true);
            $("#moveButton3").prop("disabled", true);
            $("#moveButton4").prop("disabled", true);
        }

        function enableButtons() {
            $("#moveButton1").prop("disabled", false);
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

        // ------------------------------------------------------------------------------------

        // Main Gameplay
        

        var turn = 1;
        let pokemonIndex1 = Math.floor(Math.random() * allPokemon.length);
        let pokemonIndex2 = Math.floor(Math.random() * allPokemon.length);
        let pokemon1 = allPokemon[pokemonIndex1];
        let pokemon2 = allPokemon[pokemonIndex2];

        // Assign moves, types, and pp values

        let moveArr = [];
        let moveNameArr = [];
        let moveClassArr = [];
        let moveTypeArr = [];
        let movePPLeftArr = [];

        for (let i = 0; i < pokemon1.moves.length; i ++) {
            let move = allMoves[pokemon1.moves[i]];
            let moveName = move.name[0].toUpperCase() + move.name.slice(1, move.name.length);
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
        }

        // console.log([pokemon1.back])
    
        // Adding Sprite for Player Pokemon
        for (let i = 0; i < allPokemon.length; i++)
            if(pokemon1 == allPokemon[i]) {
                let playerPokemon = document.getElementById("playerPokemon")
                let pokemon1Box = document.createElement("img")
                pokemon1Box.setAttribute("id", "playerPokemonBack")
                pokemon1Box.src = pokemon1.back
                playerPokemon.appendChild(pokemon1Box)  
            };

            

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
            let i = Math.floor(Math.random() * pokemon2.moves.length);
            let enemyMove = allMoves[pokemon2.moves[i]];
            
            console.log(pokemon1.hp, pokemon2.hp);

            if (pokemon2.speed > pokemon1.speed) {
                pokemon2.useMove(enemyMove, pokemon1);
                if (pokemon1.alive() && pokemon2.alive()) {
                    pokemon1.useMove(moveArr[0], pokemon2);
                }
            }
            else {
                pokemon1.useMove(moveArr[0], pokemon2);
                if (pokemon1.alive() && pokemon2.alive()) {
                    pokemon2.useMove(enemyMove, pokemon1);
                }
            }
            console.log(moveArr[0]);
            console.log(enemyMove);
            console.log(pokemon1.status());
            console.log(pokemon2.status());
            turn ++;
            enableButtons();
        });

    
        $("#move2").click(() => {
            
            movePPLeftArr[1] --;
            $("#movePP2").text(`${movePPLeftArr[1]}/${moveArr[1].pp}`);
            disableButtons();
            let i = Math.floor(Math.random() * pokemon2.moves.length);
            let enemyMove = allMoves[pokemon2.moves[i]];
            
            console.log(pokemon1.hp, pokemon2.hp);

            if (pokemon2.speed > pokemon1.speed) {
                pokemon2.useMove(enemyMove, pokemon1);
                if (pokemon1.alive() && pokemon2.alive()) {
                    pokemon1.useMove(moveArr[1], pokemon2);
                }
            }
            else {
                pokemon1.useMove(moveArr[1], pokemon2);
                if (pokemon1.alive() && pokemon2.alive()) {
                    pokemon2.useMove(enemyMove, pokemon1);
                }
            }
            console.log(moveArr[1]);
            console.log(enemyMove);
            console.log(pokemon1.status());
            console.log(pokemon2.status());
            turn ++;
            enableButtons();
        });

        $("#move3").click(() => {
            
            movePPLeftArr[2] --;
            $("#movePP3").text(`${movePPLeftArr[2]}/${moveArr[2].pp}`);
            disableButtons();
            let i = Math.floor(Math.random() * pokemon2.moves.length);
            let enemyMove = allMoves[pokemon2.moves[i]];
            
            console.log(pokemon1.hp, pokemon2.hp);

            if (pokemon2.speed > pokemon1.speed) {
                pokemon2.useMove(enemyMove, pokemon1);
                if (pokemon1.alive() && pokemon2.alive()) {
                    pokemon1.useMove(moveArr[2], pokemon2);
                }
            }
            else {
                pokemon1.useMove(moveArr[2], pokemon2);
                if (pokemon1.alive() && pokemon2.alive()) {
                    pokemon2.useMove(enemyMove, pokemon1);
                }
            }
            console.log(moveArr[2]);
            console.log(enemyMove);
            console.log(pokemon1.status());
            console.log(pokemon2.status());
            turn ++;
            enableButtons();
        });

        $("#move4").click(() => {
            
            movePPLeftArr[3] --;
            $("#movePP4").text(`${movePPLeftArr[3]}/${moveArr[3].pp}`);
            disableButtons();
            let i = Math.floor(Math.random() * pokemon2.moves.length);
            let enemyMove = allMoves[pokemon2.moves[i]];
            
            console.log(pokemon1.hp, pokemon2.hp);

            if (pokemon2.speed > pokemon1.speed) {
                pokemon2.useMove(enemyMove, pokemon1);
                if (pokemon1.alive() && pokemon2.alive()) {
                    pokemon1.useMove(moveArr[3], pokemon2);
                }
            }
            else {
                pokemon1.useMove(moveArr[3], pokemon2);
                if (pokemon1.alive() && pokemon2.alive()) {
                    pokemon2.useMove(enemyMove, pokemon1);
                }
            }
            console.log(moveArr[3]);
            console.log(enemyMove);
            console.log(pokemon1.status());
            console.log(pokemon2.status());
            turn ++;
            enableButtons();
        });

        // ------------------------------------------------------------------------------------

    }, 3000)

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