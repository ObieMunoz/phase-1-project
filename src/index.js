const heroes = []
let fightButton;
let resetButton;
let spanPlayerHealth;
let spanComputerHealth;
let playerHero;
let computerHero;
let combatInProgress;

function mkElement(element) {
    return document.createElement(element)
}

async function retrieveHero(numberOfHeroes) {
    for (let i = 0; i < numberOfHeroes; i++) {
        let randomId = Math.floor(Math.random() * 731 + 1)
        let superHeroAPI = `https://superheroapi.com/api/${API_KEY}/${randomId}`
        const promise = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(superHeroAPI)}`)   // To bypass CORS errors, we need to use a proxy. All Origins works great.
        const resolved = await promise.json();
        const heroString = await resolved.contents;
        const heroObject = await JSON.parse(heroString);
        const powerStats = heroObject.powerstats

        // Looks at all hero powerstats and replaces any blank values with a preset default, 25.
        Object.keys(powerStats).forEach(key => {
            if (powerStats[key] === "null") {
                powerStats[key] = 25;
            }
        })

        // Calculate new stats that were not included through the API. These will be used for the combat function.
        heroObject.health = heroObject.powerstats.strength * 100;
        heroObject.timeToHit = (100 - heroObject.powerstats.speed) * 10;
        if (heroObject.timeToHit <= 175) heroObject.timeToHit = 175;
        heroObject.damagePerHit = parseInt(heroObject.powerstats.strength) * 2 + parseInt(heroObject.powerstats.combat) * 3 + parseInt(heroObject.powerstats.power)

        heroes.push(heroObject)
    }
    displayChoices(heroes)
}

function displayChoices(heroes) {
    let starterBox = document.querySelector("#starter-choices")
    starterBox.replaceChildren();
    for (let i = 0; i < heroes.length; i++) {
        let newHeroObject = heroes[i];
        const newHero = createHeroDisplay(heroes, i, newHeroObject);
        starterBox.append(newHero)
    }
    if (starterBox.children.length < 5) {
        retrieveHero(5 - starterBox.children.length)
        console.log(`Retrieving ${5 - starterBox.children.length} new heroes`)
    }
}

function createHeroDisplay(heroes, i, newHeroObject) {
    const heroDisplay = mkElement("img");
    heroDisplay.width = 200;
    heroDisplay.src = heroes[i].image.url;
    heroDisplay.className = 'hero';
    heroDisplay.style.borderRadius = "50%";
    heroDisplay.addEventListener("click", (e) => selectHero(e, newHeroObject, i));
    heroDisplay.onerror = function () {
        this.remove();
        heroes.splice(i, 1);
    };
    return heroDisplay;
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
    let startScreen = document.querySelector("#start-screen")
    let playerBox = document.querySelector("#fs-player")
    let computerBox = document.querySelector("#fs-computer")
    let fightScreen = document.querySelector("#fight-screen")
    const combatLog = document.querySelector("#combat-log")
    startScreen.style.display = "none"
    playerBox.style.display = "inline-block"
    computerBox.style.display = "inline-block"
    combatLog.style.display = "inline-block"
    playerBox.innerHTML = `<h1>PLAYER</h1>
        <br>
        <h2>${playerHero.name}</h2>
        <br>
        <h3 id="playerHealthSpan"></h3>
        <br>
        <span id="playerStrength">STRENGTH: ${playerHero.powerstats.strength}</span>
        <br><span id="playerCombat">COMBAT: ${playerHero.powerstats.combat}</span>
        <br>
        <span id="playerPower">POWER: ${playerHero.powerstats.power}</span>
        <br>
        <span id="playerSpeed">SPEED: ${playerHero.powerstats.speed}</span><br>
        <img src="${playerHero.image.url}" alt="${playerHero.name}">`
    computerBox.innerHTML = `<h1>COMPUTER</h1>
        <br>
        <h2>${computerHero.name}</h2>
        <br>
        <h3 id="spanComputerHealth"></h3>
        <br>
        <span id="computerStrength">STRENGTH: ${computerHero.powerstats.strength}</span>
        <br>
        <span id="computerCombat">COMBAT: ${computerHero.powerstats.combat}</span>
        <br>
        <span id="computerPower">POWER: ${computerHero.powerstats.power}</span>
        <br>
        <span id="computerSpeed">SPEED: ${computerHero.powerstats.speed}</span><br>
        <img src="${computerHero.image.url}" alt="${computerHero.name}">`
    fightScreen.innerHTML = `<button id="fight-btn">Fight!</button><button id="reset-btn">Reset</button><br>` + fightScreen.innerHTML;
    fightButton = document.querySelector("#fight-btn")
    resetButton = document.querySelector("#reset-btn")
    spanPlayerHealth = document.querySelector("#playerHealthSpan")
    spanComputerHealth = document.querySelector("#spanComputerHealth")
    spanPlayerHealth.innerHTML = `<br>HP: ${playerHero.health}`
    spanComputerHealth.innerHTML = `<br>HP: ${computerHero.health}`
    fightButton.addEventListener("click", combat)
    resetButton.addEventListener("click", resetFightScreen)
}

function combat() {
    const fightButton = document.querySelector("#fight-btn")
    combatInProgress = true;
    fightButton.disabled = true;
    playerFighting = setInterval(playerAttack, playerHero.timeToHit)
    computerFighting = setInterval(computerAttack, computerHero.timeToHit)
}

function playerAttack() {
    const spanComputerHealth = document.querySelector("#spanComputerHealth")
    computerHero.health -= playerHero.damagePerHit;
    spanComputerHealth.innerHTML = `<br>HP: ${computerHero.health}`

    const combatLog = document.querySelector("#combat-log")

    const newCombatItem1 = mkElement("p")
    const newCombatItem2 = mkElement("p")

    newCombatItem1.innerHTML = `<strong>${playerHero.name}</strong> hits <strong>${computerHero.name}</strong>!`
    newCombatItem2.innerHTML = `<strong>${computerHero.name}</strong> has ${computerHero.health} health left!`

    combatLog.prepend(newCombatItem2, newCombatItem1)

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
    const playerHealthSpan = document.querySelector("#playerHealthSpan")
    playerHero.health -= computerHero.damagePerHit
    playerHealthSpan.innerHTML = `<br>HP: ${playerHero.health}`

    const combatLog = document.querySelector("#combat-log")
    const newCombatItem1 = mkElement("p")
    const newCombatItem2 = mkElement("p")

    newCombatItem1.innerHTML = `<strong>${computerHero.name}</strong> hits <strong>${playerHero.name}</strong>!`
    newCombatItem2.innerHTML = `<strong>${playerHero.name}</strong> has ${playerHero.health} health left!`

    combatLog.prepend(newCombatItem2, newCombatItem1)

    console.log(`${computerHero.name} hits ${playerHero.name}!`)
    console.log(`${playerHero.name} has ${playerHero.health} health left!`)

    if (computerHero.health <= 0 || playerHero.health <= 0) combatInProgress = false;
    if (!combatInProgress) {
        clearInterval(playerFighting)
        clearInterval(computerFighting)
        playerHero.health > computerHero.health ? console.log("Player wins!") : console.log("Computer wins!")
    }
}

function resetFightScreen() {
    clearInterval(playerFighting)
    clearInterval(computerFighting)
    let fightScreen = document.querySelector("#fight-screen")
    let startScreen = document.querySelector("#start-screen")
    fightScreen.innerHTML = `<div id="fight-screen">
    <div id="fs-player"></div>
    <div id="fs-computer"></div>
    <div id="combat-log"></div>
  </div>`
    startScreen.style.display = "block"
    heroes.forEach(hero => hero.health = hero.powerstats.strength * 100)
    displayChoices(heroes);
}

retrieveHero(5);