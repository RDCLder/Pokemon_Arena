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

    //  Adding Pokemon Sprite


    // Adding Sprite for Player Pokemon
    for (let i = 0; i < allPokemon.length; i++)
        if(pokemon1 == allPokemon[i]) {
            let playerPokemon = document.getElementById("playerPokemon");
            let pokemon1Box = document.createElement("img");
            pokemon1Box.setAttribute("id", "playerPokemonBack");
            pokemon1Box.src = pokemon1.back;
            playerPokemon.appendChild(pokemon1Box);
        };
        

    // Adding Sprite for Enemy Pokemon
    for (let i = 0; i < allPokemon.length; i++)
        if(pokemon1 == allPokemon[i]) {
            let enemyPokemon = document.getElementById("enemyPokemon");
            let pokemon2Box = document.createElement("img");
            pokemon2Box.setAttribute("id", "enemyPokemonFront");
            pokemon2Box.src = pokemon2.front;
            enemyPokemon.appendChild(pokemon2Box);
    };




// Pokemon Physical Attack Animation
// function pokemon1AttackPokemon2 (){
//     document.getElementById("playerPokemon")
//     let enemyPokemon = document.getElementById("enemyPokemon")
//     anime.speed = 2;
//     anime({
//     targets: '#playerPokemon',
//     translateX: 40,
//     translateY: -60,
//     loop: 2,
//     direction: 'alternate',
//     });
//     anime({
//     targets: '#enemyPokemon',
//     translateX: 20,
//     loop: 2,
//     direction: 'alternate',
//     });
    

// }



// document.getElementById("enemyPokemon")
// let pokemon2Attack = anime({
//     targets: '#enemyPokemon',
//     translateX: [0,50],
//     translateY: [0,-40],
//     loop: true,
//     direction: 'alternate',
//   });


// Pokemon Special Attack Animation
// function pokemon1SpecialAttackPokemon2 (){
//     let playerPokemon1 = document.getElementById("playerPokemon")
//     let specialAttackImg = document.createElement("div")
//     specialAttackImg.setAttribute("id", "specialAttack")
//     playerPokemon1.appendChild(specialAttackImg)  

//     let pokemon1SpecialAttack = anime.timeline({
//         targets: specialAttackImg,
//         delay: 3000,
//         duration: 2500,
//         easing: 'easeOutExpo',   
//         loop: 1,
//     });
//     pokemon1SpecialAttack
//     .add({
//         translateX: 300,
//         translateY: -250,
//         rotate: 270,
//         elasticity: 500,
//         opacity: .5,
//         scale: 2,
//         offset:0,
//         complete: function(anim) {
//             specialAttackImg.remove();
//         }
//     })
 
// }
//////////////// Pokemon Status Effect Animation ////////////////

// Sleep Aniimation
// function pokemon2Sleeping(){
//     let enemyPokemon = document.getElementById("enemyPokemon");
//     let sleepingAnime = document.createElement("div");
//     sleepingAnime.setAttribute("id","sleepingAnime");
//     sleepingAnime.textContent = "ZzZ"
//     enemyPokemon.appendChild(sleepingAnime)
//     let sleepingAnime2 = document.createElement("div");
//     sleepingAnime2.setAttribute("id","sleepingAnime2");
//     sleepingAnime2.textContent = "ZzZ"
//     enemyPokemon.appendChild(sleepingAnime2)

//     anime.speed = .8; 
//     anime({
//         targets: sleepingAnime,
//         translateX: -40,
//         translateY: -40,
//         scale: 2,
//         loop: 2,
//         complete: function(anim) {
//             sleepingAnime.remove();
//         } 
//     });
//     anime({
//         targets: sleepingAnime2,
//         delay: 200,
//         translateX: -40,
//         translateY: -40,
//         scale: 2,
//         loop: 2,
//         complete: function(anim) {
//             sleepingAnime2.remove();
//         } 
//     });
// }
// function pokemon1Sleeping(){
//     let playerPokemon = document.getElementById("playerPokemon");
//     let sleepingAnime = document.createElement("div");
//     sleepingAnime.setAttribute("id","sleepingAnime");
//     sleepingAnime.textContent = "ZzZ"
//     playerPokemon.appendChild(sleepingAnime)
//     let sleepingAnime2 = document.createElement("div");
//     sleepingAnime2.setAttribute("id","sleepingAnime2");
//     sleepingAnime2.textContent = "ZzZ"
//     playerPokemon.appendChild(sleepingAnime2)

//     anime.speed = .6; 
//     anime({
//         targets: sleepingAnime,
//         translateX: 40,
//         translateY: -50,
//         scale: 2,
//         loop: 2,
//         complete: function(anim) {
//             sleepingAnime.remove();
//         } 
//     });
//     anime({
//         targets: sleepingAnime2,
//         delay: 300,
//         translateX: 40,
//         translateY: -50,
//         scale: 2,
//         loop: 2,
//         complete: function(anim) {
//             sleepingAnime2.remove();
//         } 
//     });
// }
// Pokemon 1 Poison

// function pokemon1Poison (){
//     let playerPokemon = document.getElementById("playerPokemon");
//     let poisonOverlay = document.createElement("div");
//     poisonOverlay.setAttribute("id","poisonOverlay");
//     playerPokemon.appendChild(poisonOverlay);
//     anime.speed = .7;
//     anime({
//         targets: poisonOverlay,
//         opacity: .8,
//         easing: 'easeInOutSine',
//         backgroundColor: '#9D2CA5',
//         direction: 'alternate',
//         complete: function (){
//             poisonOverlay.remove();
//         }
//     })
// }

// Pokemon 1 
// Background Image for battlefield

// let bg1 = "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/intermediary/f/2fb2821a-1406-4a1d-9b04-6668f278e944/d88ppxc-af4394dd-f0d5-4370-801e-13a781f9ae96.png"
// let bg2 = "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/intermediary/f/2fb2821a-1406-4a1d-9b04-6668f278e944/d86i02s-5d7bc1ed-0c4f-4171-b48f-1dd1072ea7eb.png"
// let bg3 = "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/intermediary/f/2fb2821a-1406-4a1d-9b04-6668f278e944/d85ijvr-c2c4a900-5386-4a6a-bee8-5b73e5235ebf.png"
// let bg4 = "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/intermediary/f/2fb2821a-1406-4a1d-9b04-6668f278e944/d85jk85-38ec6987-8e11-49f8-a6af-8cf85bf53e17.png"
// let bg5 = "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/intermediary/f/2fb2821a-1406-4a1d-9b04-6668f278e944/d85jegc-5191a123-808e-48af-a9a1-d2049e23da43.png"
// let battlefieldBackground = [bg1,bg2,bg3,bg4,bg5];
// function setRandomBackground(){
//     let randomBackground = battlefieldBackground[Math.floor(Math.random() * battlefieldBackground.length)]
//     document.getElementById("leftTop");
//     leftTop.style.backgroundImage = "url(" + randomBackground + ")";
//     leftTop.style.backgroundRepeat = "no-repeat";
//     leftTop.style.backgroundPosition = "center center";
//     leftTop.style.backgroundAttachment = "fixed";
//     leftTop.style.backgroundSize = "cover";
// }
// setRandomBackground()