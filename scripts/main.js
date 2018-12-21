
// Pokemon priorities

// Stats : // HP = [(((Base + 15)x2 + (85/4)) x level)/100] + level + 10; // OtherStat = [(((Base + 15)x2 + (85/4)) x level)/100] + 5;

// Moves : // level_learned_at:[50]// version_group: {name: 'yellow', 'red-blue'}

// Types : //

// Moves priorities
// Moves are in array from 1-165 in https://pokeapi.co/api/v2/move
// Power: 
// PP: 
// move-ailments = ["unknown","none","paralysis","sleep","freeze","burn","poison","confusion","trap","disable","leech-seed",]
// move-category = ["damage", "net-good-stats", "heal", "damage+ailment", "damage+lower", "damage+raise", "damage+heal", "force-switch","unique"]
// move-damage-classes = ["status","physical","special"]
// move-learn-method = ["level-up", "machine"]
// move-target = ["specific-move","user-field","user","random-opponent","all-other-pokemon","selected-pokemon","all-opponents","entire-field",]
// Accuracy =

class Move {
    constructor (moveName, moveObject){
        this.move = moveName;
        this.movePower = moveObject.power;
        this.moveAilments = moveObject.meta.ailment.name;
        this.moveCategory = moveObject.meta.category.name;
        this.movePP = moveObject.pp;
        this.moveDamageClasses = moveObject.damage_class.name;
        this.moveTarget = moveObject.target.name;
        this.type = moveObject.type.name
    }
     moveStats () {
        for (let i = 0; i < moveObject.length; i++){
            let m
        }
    }
}

// Moves priorities
// Moves are in array from 1-165 in https://pokeapi.co/api/v2/move
// Power: 
// PP: 
// Priority: 
// move-ailments = ["unknown","none","paralysis","sleep","freeze","burn","poison","confusion","trap","disable","leech-seed",]
// move-category = ["damage", "net-good-stats", "heal", "damage+ailment", "damage+lower", "damage+raise", "damage+heal", "force-switch","unique"]
// move-damage-classes = ["status","physical","special"]
// move-learn-method = ["level-up", "machine"]
// move-target = ["specific-move","user-field","user","random-opponent","all-other-pokemon","selected-pokemon","all-opponents","entire-field",]
// types =

$(function () {
    var pokeMove = []
    $.get("https://pokeapi.co/api/v2/move")
    .done((result) => { 
        for(var i = 0; i < 165; i++){
            let moveName = result.results[i].name;
            
            $.get(result.results[i].url)
            .done((result2)=>{
                pokeMove.push(["Name: " + moveName, "Power: " + result2.power, "PowerPoint: " + result2.pp, "Type: " + result2.type.name])
            })
        }

    })
    console.log(pokeMove)

})

// $(function (){
//     var pokeStat = []
//     $.get("https://pokeapi.co/api/v2/move")
//     .done((result))
// })
