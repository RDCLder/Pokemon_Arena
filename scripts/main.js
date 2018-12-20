// Main file to run

// MVP:  Battle Loop

// import definitions.js

$(function() {

    var pokedex = [];

    $.get("https://pokeapi.co/api/v2/pokemon/")
    .done((result) => {
        for (let i = 0; i < 151; i ++) {
            let pokemon = result.results[i].name;
            pokedex.push([pokemon]);

            $.get(result.results[i].url).done((result) => {
                let pokeStats = result;
                pokedex[i].push(pokeStats);
            });
        }
    });
        
    setTimeout(() => {

        // Things we care about
        
        // Moves / Example / Template 
        // Returns a string
        // console.log(pokedex[1][1].moves[1].move.name);
        // pokedex[i][1].moves[j].move.name

        // Sprites / Example / Template
        // Returns a string URL for a PNG
        // console.log(pokedex[1][1].sprites.back_default);
        // pokedex[i][1].sprites.spriteName
        
        // Stat Name / Stat Value / Example / Template
        // Returns a string & number
        // console.log(pokedex[150][1].stats[1].stat.name)
        // console.log(pokedex[150][1].stats[1].base_stat)
        // pokedex[i][1].stats[j].stat.name
        // pokedex[i][1].stats[j].base_stat

        // Types / Example / Template
        // Returns a string
        console.log(pokedex[150][1].types[0].type.name)
        // pokedex[i][1].types[j].type.name

    }, 2000)

    

});