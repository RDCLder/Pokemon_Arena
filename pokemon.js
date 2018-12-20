


var moves = new Array();
moves[0] = new attack("flamethrower", 5);
moves[1] = new attack("Surf", 4);
moves[2] = new attack("Tackle", 3);
moves[3] = new attack("Cut", 4);

function attack (attack, basedmg) {
    this.attack = attack;
    this.basedmg = basedmg;
    }

function playerAttack(){
    alert ("Player uses " + moves[playerMove].move + " dealing " + damage + " damage!");
    if (wildPokemonHealth > 0) 
    {
    wildPokemonHealth = wildPokemonHealth - damage;
    alert(pokemonStats[wildPokemonid].type + " has " + wildPokemonHealth + " health remaining!");
    playerTurn = false;
    wildPokemonFaint()
    }
    else
    {
    alert(wildPokemonid.type + " fainted");
    }
}

function enemyAttack(){
    alert 
}

})