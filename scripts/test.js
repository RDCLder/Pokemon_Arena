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

