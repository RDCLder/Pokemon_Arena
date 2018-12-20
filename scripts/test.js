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

$(function() {

    var pokedex = [];

    $.get("https://pokeapi.co/api/v2/pokemon/", (result) => {
        for (let i = 0; i < 5; i ++) {
            let pokemon = new Pokemon(result[i].name);
            let properties = $.get(result[i].url);
            pokedex.push([pokemon, properties]);
        }
    });

    console.log(pokedex);

});