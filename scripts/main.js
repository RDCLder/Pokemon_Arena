// Main file to run

$(function() {

    let pokedex = [];
    var moves = [[], []];
  
    // Retrieve data from API
    
    // $.get("https://pokeapi.co/api/v2/move/")
    // .done((result) => {
    //     for (let i = 0; i < 165; i ++) {
    //         let moveName = result.results[i].name;
    //         moves[0].push(moveName);

    //         // Retrieve object from nested URL
    //         $.get(result.results[i].url).done((result) => {
    //             moves[1].push(result);
    //         });
    //     }
    // })

    console.log("test 1");

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
                while (this.moves.length < 4) {
                    let index = Math.floor(Math.random() * pokeObject.moves.length);
                    let move = pokeObject.moves[index].move.name;
                    if (moves[0].includes(move)) {
                        this.moves.push(move);
                    }
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

        // Initialize Gameplay

        let turn = 1;
        let i = Math.floor(Math.random() * allPokemon.length);
        let j = Math.floor(Math.random() * allPokemon.length);
        let pokemon1 = allPokemon[i];
        let pokemon2 = allPokemon[j];

        let move1 = allMoves[pokemon1.moves[0]];
        let move2 = allMoves[pokemon1.moves[1]];
        let move3 = allMoves[pokemon1.moves[2]];
        let move4 = allMoves[pokemon1.moves[3]];
        $("#move1 .class:first-of-type").text(move1.name);
        $("#move2 .class:first-of-type").text(move2.name);
        $("#move3 .class:first-of-type").text(move3.name);
        $("#move4 .class:first-of-type").text(move4.name);

        console.log(moves);
        console.log(pokemon1);
        console.log(pokemon2);
        console.log(move1);
        console.log(move2);
        console.log(move3);
        console.log(move4);

        // Main Gameplay

        $("#moveButton1").click(() => {
            
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

    
        $("#moveButton2").click(() => {
            
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

        $("#moveButton3").click(() => {
            
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

        $("#moveButton4").click(() => {
            
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