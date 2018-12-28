let target = 100;
let baseDamage = 25;
function damageCalc (baseDamage) {
    min = Math.ceil(85);
    max = Math.floor(100);
    return Math.floor(baseDamage * (Math.floor(Math.random() * (max - min + 1)) + min) / 100);
}
let damage = damageCalc(baseDamage);
target -= damage;
console.log(target);

// Main file to run

$(function() {

    let pokedex = [];
    let moves = [[], []];

    // Retrieve data from API
    $.get("https://pokeapi.co/api/v2/move-damage-class/2/")
    .done((result) => {
        for (let i = 0; i < 74; i ++) {
            let moveName = result.moves[i].name;
            moves[0].push(moveName);

            // Retrieve object from nested URL
            $.get(result.moves[i].url).done((result) => {
                moves[1].push(result);
            });
        }
    })
    

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
        
        class Move {

            constructor(moveName, moveObject) {
                this.name = moveName;
                this.power = moveObject.power;
                this.pp = moveObject.pp;
                this.damageClass = moveObject.damage_class.name;
                this.type = moveObject.type.name;
            }

        }

        class Pokemon {

            constructor(pokeName, pokeObject) {
                this.name = pokeName;
                this.hp = pokeObject.stats[5].base_stat;
                this.attack = pokeObject.stats[4].base_stat;
                this.defense = pokeObject.stats[3].base_stat;
                this.specialAttack = pokeObject.stats[2].base_stat;
                this.specialDefense = pokeObject.stats[1].base_stat;
                this.speed = pokeObject.stats[0].base_stat;
                this.front = pokeObject.sprites.front_default;
                this.back = pokeObject.sprites.back_default;

                this.moves = [];
                for (let i = 0; i < 4; i ++) {
                    let index = Math.floor(Math.random() * pokeObject.moves.length);
                    let move = pokeObject.moves[index].move.name;
                    this.moves.push(move);
                }

                this.type = [];
                for (let i = 0; i < pokeObject.types.length; i ++) {
                    let typeName = pokeObject.types[i].type.name;
                    this.type.push(typeName);
                }
            }

            attack(target, move) {
                // Assuming all pokemon are level 10, no special attacks, and no modifiers
                let baseDamage = (6 * allMoves[move].power * this.attack / target.defense / 50) + 2;
                function damageCalc (baseDamage) {
                    min = Math.ceil(85);
                    max = Math.floor(100);
                    return Math.floor(baseDamage * (Math.floor(Math.random() * (max - min + 1)) + min) / 100);
                }
                let damage = damageCalc(baseDamage);
                target.hp -= damage;

                // Message to add to the side display
                return `${this.name} dealt ${damage} damage to ${target.name}!`
            }

            status() {
                return `${this.name} has ${this.hp} health.`
            }

            alive() {
                if (this.hp > 0) {
                    return true;
                }
                else {
                    return false;
                }
            }

        }

        // class Battle necessary?

        // class Battle {

        //     constructor(pokemon1, pokemon2) {
        //         this.pokemon1 = pokemon1;
        //         this.pokemon2 = pokemon2;
        //     }

        //     turn() {
                
        //     }

        // }

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
            $("#move1").prop("disabled", true);
            $("#move2").prop("disabled", true);
            $("#move3").prop("disabled", true);
            $("#move4").prop("disabled", true);
        }

        function enableButtons() {
            $("#move1").prop("disabled", false);
            $("#move2").prop("disabled", false);
            $("#move3").prop("disabled", false);
            $("#move4").prop("disabled", false);
        }

        // ------------------------------------------------------------------------------------

        // Main Gameplay

        let turn = 1;
        let i = Math.floor(Math.random() * allPokemon.length);
        let j = Math.floor(Math.random() * allPokemon.length);
        let pokemon1 = allPokemon[i];
        let pokemon2 = allPokemon[j];
        let move1 = allMoves[pokemon1.moves[0]];
        let move2 = allMoves[pokemon1.moves[1]];
        let move3 = allMoves[pokemon1.moves[2]];
        let move4 = allMoves[pokemon1.moves[3]];
        
        //  Adding Pokemon Sprite
        // console.log([pokemon1.back])
        // for (let i = 0; i < allPokemon.length; i++)
        //     if(pokemon1 == allPokemon[i]) {
        //         let playerPokemon = document.getElementById("playerPokemon")
        //         let playerBack = document.createElement("div")
        //         playerback = pokemon1.back
        //         playerPokemon.appendChild(playerBack)
        //     };




        $("#move1").click(() => {
            
            disableButtons();
            let i = Math.floor(Math.random() * 4);
            let enemyMove = allMoves[pokemon2.moves[i]];
            
            if (pokemon1.speed < pokemon2.speed) {
                pokemon2.attack(pokemon1, enemyMove);
                if (pokemon1.alive() && pokemon2.alive()) {
                    pokemon1.attack(pokemon2, move1);
                }
            }
            else {
                pokemon1.attack(pokemon2, move1)
                if (pokemon1.alive() && pokemon2.alive()) {
                    pokemon2.attack(pokemon1, enemyMove);
                }
            }
            turn ++;
            enableButtons();
        });

    
        $("#move2").click(() => {
            
            disableButtons();
            let i = Math.floor(Math.random() * 4);
            let enemyMove = allMoves[pokemon2.moves[i]];
            
            if (pokemon1.speed < pokemon2.speed) {
                pokemon2.attack(pokemon1, enemyMove);
                if (pokemon1.alive() && pokemon2.alive()) {
                    pokemon1.attack(pokemon2, move2);
                }
            }
            else {
                pokemon1.attack(pokemon2, move2)
                if (pokemon1.alive() && pokemon2.alive()) {
                    pokemon2.attack(pokemon1, enemyMove);
                }
            }
            turn ++;
            enableButtons();
        });

        $("#move3").click(() => {
            
            disableButtons();
            let i = Math.floor(Math.random() * 4);
            let enemyMove = allMoves[pokemon2.moves[i]];
            
            if (pokemon1.speed < pokemon2.speed) {
                pokemon2.attack(pokemon1, enemyMove);
                if (pokemon1.alive() && pokemon2.alive()) {
                    pokemon1.attack(pokemon2, move3);
                }
            }
            else {
                pokemon1.attack(pokemon2, move3)
                if (pokemon1.alive() && pokemon2.alive()) {
                    pokemon2.attack(pokemon1, enemyMove);
                }
            }
            turn ++;
            enableButtons();
        });

        $("#move4").click(() => {
            
            disableButtons();
            let i = Math.floor(Math.random() * 4);
            let enemyMove = allMoves[pokemon2.moves[i]];
            
            if (pokemon1.speed < pokemon2.speed) {
                pokemon2.attack(pokemon1, enemyMove);
                if (pokemon1.alive() && pokemon2.alive()) {
                    pokemon1.attack(pokemon2, move4);
                }
            }
            else {
                pokemon1.attack(pokemon2, move4)
                if (pokemon1.alive() && pokemon2.alive()) {
                    pokemon2.attack(pokemon1, enemyMove);
                }
            }
            turn ++;
            enableButtons();
        });

        // ------------------------------------------------------------------------------------


    }, 5000)

});
// {
//     name: "pound",
//     url: "https://pokeapi.co/api/v2/move/1/"
//     },
//     {
//     name: "karate-chop",
//     url: "https://pokeapi.co/api/v2/move/2/"
//     },
//     {
//     name: "double-slap",
//     url: "https://pokeapi.co/api/v2/move/3/"
//     },
//     {
//     name: "comet-punch",
//     url: "https://pokeapi.co/api/v2/move/4/"
//     },
//     {
//     name: "mega-punch",
//     url: "https://pokeapi.co/api/v2/move/5/"
//     },
//     {
//     name: "pay-day",
//     url: "https://pokeapi.co/api/v2/move/6/"
//     },
//     {
//     name: "fire-punch",
//     url: "https://pokeapi.co/api/v2/move/7/"
//     },
//     {
//     name: "ice-punch",
//     url: "https://pokeapi.co/api/v2/move/8/"
//     },
//     {
//     name: "thunder-punch",
//     url: "https://pokeapi.co/api/v2/move/9/"
//     },
//     {
//     name: "scratch",
//     url: "https://pokeapi.co/api/v2/move/10/"
//     },
//     {
//     name: "vice-grip",
//     url: "https://pokeapi.co/api/v2/move/11/"
//     },
//     {
//     name: "guillotine",
//     url: "https://pokeapi.co/api/v2/move/12/"
//     },
//     {
//     name: "cut",
//     url: "https://pokeapi.co/api/v2/move/15/"
//     },
//     {
//     name: "wing-attack",
//     url: "https://pokeapi.co/api/v2/move/17/"
//     },
//     {
//     name: "fly",
//     url: "https://pokeapi.co/api/v2/move/19/"
//     },
//     {
//     name: "bind",
//     url: "https://pokeapi.co/api/v2/move/20/"
//     },
//     {
//     name: "slam",
//     url: "https://pokeapi.co/api/v2/move/21/"
//     },
//     {
//     name: "vine-whip",
//     url: "https://pokeapi.co/api/v2/move/22/"
//     },
//     {
//     name: "stomp",
//     url: "https://pokeapi.co/api/v2/move/23/"
//     },
//     {
//     name: "double-kick",
//     url: "https://pokeapi.co/api/v2/move/24/"
//     },
//     {
//     name: "mega-kick",
//     url: "https://pokeapi.co/api/v2/move/25/"
//     },
//     {
//     name: "jump-kick",
//     url: "https://pokeapi.co/api/v2/move/26/"
//     },
//     {
//     name: "rolling-kick",
//     url: "https://pokeapi.co/api/v2/move/27/"
//     },
//     {
//     name: "headbutt",
//     url: "https://pokeapi.co/api/v2/move/29/"
//     },
//     {
//     name: "horn-attack",
//     url: "https://pokeapi.co/api/v2/move/30/"
//     },
//     {
//     name: "fury-attack",
//     url: "https://pokeapi.co/api/v2/move/31/"
//     },
//     {
//     name: "horn-drill",
//     url: "https://pokeapi.co/api/v2/move/32/"
//     },
//     {
//     name: "tackle",
//     url: "https://pokeapi.co/api/v2/move/33/"
//     },
//     {
//     name: "body-slam",
//     url: "https://pokeapi.co/api/v2/move/34/"
//     },
//     {
//     name: "wrap",
//     url: "https://pokeapi.co/api/v2/move/35/"
//     },
//     {
//     name: "take-down",
//     url: "https://pokeapi.co/api/v2/move/36/"
//     },
//     {
//     name: "thrash",
//     url: "https://pokeapi.co/api/v2/move/37/"
//     },
//     {
//     name: "double-edge",
//     url: "https://pokeapi.co/api/v2/move/38/"
//     },
//     {
//     name: "poison-sting",
//     url: "https://pokeapi.co/api/v2/move/40/"
//     },
//     {
//     name: "twineedle",
//     url: "https://pokeapi.co/api/v2/move/41/"
//     },
//     {
//     name: "pin-missile",
//     url: "https://pokeapi.co/api/v2/move/42/"
//     },
//     {
//     name: "bite",
//     url: "https://pokeapi.co/api/v2/move/44/"
//     },
//     {
//     name: "peck",
//     url: "https://pokeapi.co/api/v2/move/64/"
//     },
//     {
//     name: "drill-peck",
//     url: "https://pokeapi.co/api/v2/move/65/"
//     },
//     {
//     name: "submission",
//     url: "https://pokeapi.co/api/v2/move/66/"
//     },
//     {
//     name: "low-kick",
//     url: "https://pokeapi.co/api/v2/move/67/"
//     },
//     {
//     name: "counter",
//     url: "https://pokeapi.co/api/v2/move/68/"
//     },
//     {
//     name: "seismic-toss",
//     url: "https://pokeapi.co/api/v2/move/69/"
//     },
//     {
//     name: "strength",
//     url: "https://pokeapi.co/api/v2/move/70/"
//     },
//     {
//     name: "razor-leaf",
//     url: "https://pokeapi.co/api/v2/move/75/"
//     },
//     {
//     name: "rock-throw",
//     url: "https://pokeapi.co/api/v2/move/88/"
//     },
//     {
//     name: "earthquake",
//     url: "https://pokeapi.co/api/v2/move/89/"
//     },
//     {
//     name: "fissure",
//     url: "https://pokeapi.co/api/v2/move/90/"
//     },
//     {
//     name: "dig",
//     url: "https://pokeapi.co/api/v2/move/91/"
//     },
//     {
//     name: "quick-attack",
//     url: "https://pokeapi.co/api/v2/move/98/"
//     },
//     {
//     name: "rage",
//     url: "https://pokeapi.co/api/v2/move/99/"
//     },
//     {
//     name: "bide",
//     url: "https://pokeapi.co/api/v2/move/117/"
//     },
//     {
//     name: "self-destruct",
//     url: "https://pokeapi.co/api/v2/move/120/"
//     },
//     {
//     name: "egg-bomb",
//     url: "https://pokeapi.co/api/v2/move/121/"
//     },
//     {
//     name: "lick",
//     url: "https://pokeapi.co/api/v2/move/122/"
//     },
//     {
//     name: "bone-club",
//     url: "https://pokeapi.co/api/v2/move/125/"
//     },
//     {
//     name: "waterfall",
//     url: "https://pokeapi.co/api/v2/move/127/"
//     },
//     {
//     name: "clamp",
//     url: "https://pokeapi.co/api/v2/move/128/"
//     },
//     {
//     name: "skull-bash",
//     url: "https://pokeapi.co/api/v2/move/130/"
//     },
//     {
//     name: "spike-cannon",
//     url: "https://pokeapi.co/api/v2/move/131/"
//     },
//     {
//     name: "constrict",
//     url: "https://pokeapi.co/api/v2/move/132/"
//     },
//     {
//     name: "high-jump-kick",
//     url: "https://pokeapi.co/api/v2/move/136/"
//     },
//     {
//     name: "barrage",
//     url: "https://pokeapi.co/api/v2/move/140/"
//     },
//     {
//     name: "leech-life",
//     url: "https://pokeapi.co/api/v2/move/141/"
//     },
//     {
//     name: "sky-attack",
//     url: "https://pokeapi.co/api/v2/move/143/"
//     },
//     {
//     name: "dizzy-punch",
//     url: "https://pokeapi.co/api/v2/move/146/"
//     },
//     {
//     name: "crabhammer",
//     url: "https://pokeapi.co/api/v2/move/152/"
//     },
//     {
//     name: "explosion",
//     url: "https://pokeapi.co/api/v2/move/153/"
//     },
//     {
//     name: "fury-swipes",
//     url: "https://pokeapi.co/api/v2/move/154/"
//     },
//     {
//     name: "bonemerang",
//     url: "https://pokeapi.co/api/v2/move/155/"
//     },
//     {
//     name: "rock-slide",
//     url: "https://pokeapi.co/api/v2/move/157/"
//     },
//     {
//     name: "hyper-fang",
//     url: "https://pokeapi.co/api/v2/move/158/"
//     },
//     {
//     name: "super-fang",
//     url: "https://pokeapi.co/api/v2/move/162/"
//     },
//     {
//     name: "slash",
//     url: "https://pokeapi.co/api/v2/move/163/"
//     },
// ------------------------------------------------------------------------------

// Test Code Here

console.log(
    Math.floor(Math.random() * 2)
);

// ------------------------------------------------------------------------------

// Archived Code

// ------------------------------------------------------------------------------

// const statusMoves = [
//     {
//         name: "recover",
//         target: "user",
//         accuracy: 100,
//         power: 0,
//         duration: 0,
//         pp: 5,
//         damage_class: "status",
//         type: "normal",
//         effect: "User restores its own HP by half of its max HP."
//     },
//     {   
//         name: "confuse",
//         target: "all-opponents",
//         accuracy: 100,
//         power: 40,
//         duration: 4,
//         pp: 10,
//         damage_class: "status",
//         type: "normal",
//         effect: "Confuses the target, causing a chance for target to attack itself."
//     },
//     {
//         name: "agility",
//         target: "user",
//         accuracy: 100,
//         power: 0,
//         pp: 5,
//         damage_class: "status",
//         type: "normal",
//         effect: "User sleeps for two turns, completely healing itself."
//     },
//     {
//         name: "sleep",
//         target: "all-opponents",
//         accuracy: 75,
//         power: 0,
//         pp: 5,
//         damage_class: "status",
//         type: "normal",
//         effect: "Puts the target to sleep."
//     },
// ];

// if (moveObject.damage_class.name == "status") {
//     let statusChoice = Math.floor(Math.random() * statusMoves.length);
//     this.name = statusMoves[statusChoice].name;
//     this.target = statusMoves[statusChoice].target;
//     this.accuracy = statusMoves[statusChoice].accuracy;
//     this.power = statusMoves[statusChoice].power;
//     this.duration = statusMoves[statusChoice].duration;
//     this.pp = statusMoves[statusChoice].pp;
//     this.damage_class = statusMoves[statusChoice].damage_class;
//     this.type = statusMoves[statusChoice].type;
//     this.description = statusMoves[statusChoice].effect;
// }
// else {
//     this.name = moveName;
//     this.target = moveObject.target;
//     this.accuracy = moveObject.accuracy;
//     this.power = moveObject.power;
//     this.effectChance = moveObject.effect_chance;
//     this.pp = moveObject.pp;
//     this.damage_class = moveObject.damage_class.name;
//     this.type = moveObject.type.name;
//     this.description = moveObject.effect_entries[0].short_effect;
// }

// attack(target, move) {
//     // Assuming all pokemon are level 10, no special attacks, and no modifiers
//     let hitOrMiss = Math.floor(Math.random() * 100);
//     if (hitOrMiss > move.accuracy) {
//         return `${this.name} missed!`;
//     }
//     else {

//         if (move.target == "user") {

//         }
//         else {

//         }

//         let baseDamage = (6 * allMoves[move].power * this.attack / target.defense / 50) + 2;
//         function damageCalc (baseDamage) {
//             min = Math.ceil(85);
//             max = Math.floor(100);
//             return Math.floor(baseDamage * (Math.floor(Math.random() * (max - min + 1)) + min) / 100);
//         }
//         let damage = damageCalc(baseDamage);
//         target.hp -= damage;

//         // Message to add to the side display
//         return `${this.name} dealt ${damage} damage to ${target.name}!`;
//     }
// }

// let move1 = allMoves[pokemon1.moves[0]];
// let move2 = allMoves[pokemon1.moves[1]];
// let move3 = allMoves[pokemon1.moves[2]];
// let move4 = allMoves[pokemon1.moves[3]];
// let moveName1 = move1.name[0].toUpperCase() + move1.name.slice(1, move1.name.length);
// let moveName2 = move2.name[0].toUpperCase() + move2.name.slice(1, move2.name.length);
// let moveName3 = move3.name[0].toUpperCase() + move3.name.slice(1, move3.name.length);
// let moveName4 = move4.name[0].toUpperCase() + move4.name.slice(1, move4.name.length);
// let moveType1 = move1.type[0].toUpperCase() + move1.type.slice(1, move1.type.length);
// let moveType2 = move2.type[0].toUpperCase() + move2.type.slice(1, move2.type.length);
// let moveType3 = move3.type[0].toUpperCase() + move3.type.slice(1, move3.type.length);
// let moveType4 = move4.type[0].toUpperCase() + move4.type.slice(1, move4.type.length);
// let move1PPcurrent = move1.pp;
// let move2PPcurrent = move2.pp;
// let move3PPcurrent = move3.pp;
// let move4PPcurrent = move4.pp;

// $("#moveName1").text(moveName1);
// $("#moveType1").text(moveType1);
// $("#movePP1").text(`${move1PPcurrent}/${move1.pp}`);

// if (moveArr.length > 1) {
//     $("#moveName2").text(moveName2);
//     $("#moveType2").text(moveType2);
//     $("#movePP2").text(`${move2PPcurrent}/${move2.pp}`);
// }

// if (moveArr.length > 2) {
//     $("#moveName3").text(moveName3);
//     $("#moveType3").text(moveType3);
//     $("#movePP3").text(`${move3PPcurrent}/${move3.pp}`);

//     $("#moveName4").text(moveName4);
//     $("#moveType4").text(moveType4);
//     $("#movePP4").text(`${move4PPcurrent}/${move4.pp}`);
// }

// console.log(pokemon1.moves);
// console.log(pokemon2.moves);
// let k = Math.floor(Math.random() * 4);
// let enemyMove = allMoves[pokemon2.moves[k]];
// console.log(enemyMove);
{/* <path d="M58 80V50.12C57.7 41.6 51.14 35 43 35a15 15 0 0 0 0 30h7.5v15H43a30 30 0 1 1 0-60c16.42 0 29.5 13.23 30 29.89V80H58z" stroke-dasharray="316.85528564453125" style="stroke-dashoffset: 316.855px;"></path>
        <path d="M73 80V20H58v60h15z" stroke-dasharray="150" style="stroke-dashoffset: 150px;"></path>
        <path d="M58 80V49.77C58.5 33.23 71.58 20 88 20a30 30 0 0 1 30 30v30h-15V50a15 15 0 0 0-15-15c-8.14 0-14.7 6.6-15 15.12V80H58zm75 0V20h-15v60h15z" stroke-dasharray="441.1739501953125" style="stroke-dashoffset: 441.174px;"></path>
        <path d="M118 80V49.77C118.5 33.23 131.58 20 148 20a30 30 0 0 1 30 30v30h-15V50a15 15 0 0 0-15-15c-8.14 0-14.7 6.6-15 15.12V80h-15zm-7.5-60a7.5 7.5 0 1 1-7.48 8v-1c.25-3.9 3.5-7 7.48-7z" stroke-dasharray="338.3053894042969" style="stroke-dashoffset: 338.305px;"></path>
        <path d="M133 65a15 15 0 0 1-15-15v-7.5h-15V50a30 30 0 0 0 30 30V65zm30 15V49.77C163.5 33.23 176.58 20 193 20a30 30 0 0 1 30 30v30h-15V50a15 15 0 0 0-15-15c-8.14 0-14.7 6.6-15 15.12V80h-15z" stroke-dasharray="406.8699035644531" style="stroke-dashoffset: 406.87px;"></path>
        <path d="M238 65a15 15 0 0 1 0-30c8.1 0 14.63 6.53 15 15h-15v15h30V49.89C267.5 33.23 254.42 20 238 20a30 30 0 0 0 0 60V65z" stroke-dasharray="301.8561706542969" style="stroke-dashoffset: 301.856px;"></path>
        <path d="M260.48 65a7.5 7.5 0 1 1-7.48 8v-1c.26-3.9 3.5-7 7.48-7z" stroke-dasharray="47.128875732421875" style="stroke-dashoffset: 47.1289px;"></path> */} 