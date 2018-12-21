// File containing all definitions

// --------------------------------------------------------------------------------------------------------

$(function() {

    var pokedex = [];

    // Retrieve data from API
    $.get("https://pokeapi.co/api/v2/pokemon/")
    .done((result) => {
        for (let i = 0; i < 151; i ++) {
            let pokeName = result.results[i].name;
            pokedex.push([pokeName]);

            // Retrieve object from nested URL
            $.get(result.results[i].url).done((result) => {
                let pokeStats = result;
                pokedex[i].push(pokeStats);
            });
        }
    });
    
    // Account for async with 2000 ms delay
    setTimeout(() => {
        
        // ------------------------------------------------------------------------------------

        // Class Definitions
        
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
                for (let i = 0; i < pokeObject.moves.length; i ++) {
                    let moveName = pokeObject.moves[i].move.name;
                    this.moves.push(moveName);
                }

                this.types = [];
                for (let i = 0; i < pokeObject.types.length; i ++) {
                    let typeName = pokeObject.types[i].type.name;
                    this.types.push(typeName);
                }
            }

            attack(target, move) {
                let damage = move.something;
                target.hp -= damage;
            }

        }

        var allPokemon = [];
        for (let i = 0; i < pokedex.length; i ++) {
            let pokemon = new Pokemon(pokedex[i][0], pokedex[i][1]);
            allPokemon.push(pokemon);
        }

        // ------------------------------------------------------------------------------------

        class Battle {

            constructor(pokemon1, pokemon2) {
                this.pokemon1 = pokemon1;
                this.pokemon2 = pokemon2;
            }

            turn() {
                
            }

        }

        // ------------------------------------------------------------------------------------

    }, 2000)

});