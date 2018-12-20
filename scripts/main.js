// let generationName = document.getElementById("generationName")
// function theItems(result) {
//     var xhr = new XMLHttpRequest();
//     xhr.onreadystatechange = function() {
//     if (this.readyState == 4 && this.status == 200) {
//         let theObject = JSON.parse(this.responseText);
//         for (let i = 0; i < theObject.length; i++) {
//             let theDiv = document.createElement("div");
//             let generation = document.createTextNode(theObject[i].name);                  
//             console.log(theObject[i].name)
//             theDiv.appendChild(generation);
//             generationName.appendChild(theDiv);
//             }
//        }
//     };
//     xhr.open("GET", "https://pokeapi.co/docs/api/v2/generation/?limit=" + result + "20", true);
//     xhr.send(data);
// };
// for (let i = 1; i <= 10; i++) {
//     theItems(i)
// }
// var data = null;

// var xhr = new XMLHttpRequest();
// xhr.withCredentials = true;

// xhr.addEventListener("readystatechange", function () {
//     if (this.readyState === this.DONE) {
//         console.log(JSON.parse(this.responseText));
//     }
// });

// xhr.open("GET", "https://pokeapi.co/docs/api/v2/generation/");

// xhr.send(data);

// Main file to run

// MVP:  Battle Loop

// import definitions.js

// $(function() {

//     var pokedex = [];

//     $.get("https://pokeapi.co/api/v2/pokemon/")
//     .done((result) => {
//         for (let i = 0; i < 1; i ++) {
//             let pokemon = result.results[i].name;
//             // pokedex.push([pokemon,]);
//             // let pokeStats = $.ajax(result.results[i].url).done((result2) => {return result2;});
//             let pokeStats = $.ajax("https://pokeapi.co/api/v2/pokemon/1/").done((result2) => {return result2;});
//             pokedex.push([pokemon, pokeStats]);
//             console.log(pokeStats.abilities);
//             console.log(pokedex);
//         }
//     });

//     $.get("https://pokeapi.co/api/v2/pokemon/1/")
//     .done((result) => {
//         console.log(result.abilities);
//     })

    // console.log(pokedex[3][1].abilities[1].name);

    // var battleStart = true;

    // while (battleStart == true) {

    //     var pokemon1 = [];
    //     var pokemon2 = [];

    //     // Move 1
    //     $("#move1").click(() => {

    //         pokemon1.attack(pokemon2, pokemon1.move1); // Maybe store all moves in arr and use random generator to choose specific move
    //         pokemon2.attack(pokemon1, pokemon1.move1); // Randomize maybe?

    //     });

    //     // Move 2
    //     $("#move2").click(() => {

    //         pokemon1.attack(pokemon2, pokemon1.move2);

    //     });

    //     // Move 3
    //     $("#move3").click(() => {

    //         pokemon1.attack(pokemon2, pokemon1.move3);

    //     });

    //     // Move 4
    //     $("#move4").click(() => {

    //         pokemon1.attack(pokemon2, pokemon1.move4);

    //     });

    // }

// });

// Pokemon priorities

// Stats : // HP = [(((Base + 15)x2 + (85/4)) x level)/100] + level + 10; // OtherStat = [(((Base + 15)x2 + (85/4)) x level)/100] + 5;

// Moves : // level_learned_at:[50]// version_group: {name: 'yellow', 'red-blue'}

// Types : //

// Moves priorities
// Moves are in array from 1-165 in https://pokeapi.co/api/v2/move
// Power: 
// PP: 
// move-ailments:  ["unknown","none","paralysis","sleep","freeze","burn","poison","confusion","trap","disable","leech-seed",]
// move-category: ["damage", "net-good-stats", "heal", "damage+ailment", "damage+lower", "damage+raise", "damage+heal", "force-switch","unique"]
// move-damage-classes: 
// move-learn-method: ["level-up", "machine"]
// move-target: 

// class Move {
//     constructor (){
//         this.Power 
    
//     }

// }