<<<<<<< .merge_file_pAiDC1
// ------------------------------------------------------------------------------

// Test Code Here

console.log(100 * 2 / 3);

// ------------------------------------------------------------------------------

// Archived Code

// ------------------------------------------------------------------------------

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
=======
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

>>>>>>> .merge_file_qGmTQu
