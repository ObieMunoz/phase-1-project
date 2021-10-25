const heroes = []
const starterBox = document.querySelector("#starter-choices")
const startScreen = document.querySelector("#start-screen")
const playerBox = document.querySelector("#fs-player")
const computerBox = document.querySelector("#fs-computer")
const fightScreen = document.querySelector("#fight-screen")

let playerHero;
let computerHero;
let combatInProgress;

async function retrieveHero(num) {
    for (let i = 0; i < num; i++) {
        let randomId = Math.floor(Math.random() * 731 + 1)
        let superHeroAPI = `https://superheroapi.com/api/${API_KEY}/${randomId}`
        const promise = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(superHeroAPI)}`)
        const resolved = await promise.json()
        const heroString = await resolved.contents;
        const heroObject = await JSON.parse(heroString);

        if (heroObject.powerstats.strength === "null") heroObject.powerstats.strength = 25;
        if (heroObject.powerstats.intelligence === "null") heroObject.powerstats.intelligence = 25;
        if (heroObject.powerstats.combat === "null") heroObject.powerstats.combat = 25;
        if (heroObject.powerstats.power === "null") heroObject.powerstats.power = 25;
        if (heroObject.powerstats.speed === "null") heroObject.powerstats.speed = 25;
        
        heroObject.health = heroObject.powerstats.strength * 100;
        heroObject.timeToHit = (100 - heroObject.powerstats.speed) * 10;
        if (heroObject.timeToHit <= 175) heroObject.timeToHit = 175;
        heroObject.damagePerHit = parseInt(heroObject.powerstats.strength) * 2 + parseInt(heroObject.powerstats.combat) * 3 + parseInt(heroObject.powerstats.power)

        // set heroObject.damagePerHit to be a random number between -10% and 10% of the heroObject.damagePerHit


        heroes.push(heroObject)
        console.log(heroObject)
    }
    displayChoices(heroes)
}

function displayChoices(heroes) {
    starterBox.replaceChildren();
    for (let i = 0; i < heroes.length; i++) {
        let newHeroObject = heroes[i];
        newHero = document.createElement("img")
        newHero.width = 200;
        newHero.src = heroes[i].image.url;
        newHero.className = 'hero'
        newHero.style.borderRadius = "50%"
        newHero.addEventListener("click", (e) => selectHero(e, newHeroObject, i))
        starterBox.append(newHero)
        newHero.onerror = function () {
            this.remove()
            heroes.splice(i, 1)
            if (heroes.length < 5) {
                retrieveHero(5 - heroes.length)
                console.log(`Retrieving ${5 - heroes.length} new heroes`)
            }
        }
    }
}

function selectHero(e, newHeroObject, index) {
    playerHero = newHeroObject;
    console.log(newHeroObject)
    computerHero = heroes[Math.floor(Math.random() * heroes.length)]
    while (computerHero.name === playerHero.name) {
        computerHero = heroes[Math.floor(Math.random() * heroes.length)]
    }
    console.log(`You chose: ${playerHero.name}! The computer chose: ${computerHero.name}!`)
    setupFight()
}

function setupFight() {
    startScreen.style.display = "none"
    playerBox.style.display = "inline-block"
    computerBox.style.display = "inline-block"
    playerBox.innerHTML = `<h1>PLAYER</h1><br><h2>${playerHero.name}<span id="playerHealthSpan"></span></h2><img src="${playerHero.image.url}" alt="${playerHero.name}">`
    computerBox.innerHTML = `<h1>COMPUTER</h2><br><h2>${computerHero.name}</h2><img src="${computerHero.image.url}" alt="${computerHero.name}">`
    fightScreen.innerHTML = `<button id="fight-btn">Fight!</button><br>` + fightScreen.innerHTML;
    const fightBtn = document.querySelector("#fight-btn")
    fightBtn.addEventListener("click", combat)
}

function combat() {
    combatInProgress = true;
    playerFighting = setInterval(playerAttack, playerHero.timeToHit)
    computerFighting = setInterval(computerAttack, computerHero.timeToHit)
}

function playerAttack() {
    computerHero.health -= playerHero.damagePerHit;
    console.log(`${playerHero.name} hits ${computerHero.name}!`)
    console.log(`${computerHero.name} has ${computerHero.health} health left!`)
    if (computerHero.health <= 0 || playerHero.health <= 0) combatInProgress = false;
    if (!combatInProgress) {
        clearInterval(playerFighting)
        clearInterval(computerFighting)
        playerHero.health > computerHero.health ? console.log("Player wins!") : console.log("Computer wins!")
    }
}

function computerAttack() {
    playerHero.health -= computerHero.damagePerHit
    console.log(`${computerHero.name} hits ${playerHero.name}!`)
    console.log(`${playerHero.name} has ${playerHero.health} health left!`)
    if (computerHero.health <= 0 || playerHero.health <= 0) combatInProgress = false;
    if (!combatInProgress) {
        clearInterval(playerFighting)
        clearInterval(computerFighting)
        playerHero.health > computerHero.health ? console.log("Player wins!") : console.log("Computer wins!")
    }
}

retrieveHero(5);