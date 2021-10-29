let fightButton;
let resetButton;
let spanPlayerHealth;
let spanComputerHealth;
let playerHero;
let computerHero;
let combatInProgress;
let playerFighting;
let computerFighting;
let playerWinTracker = " ";
let computerWinTracker = " ";
let databaseConnected = false;
const fightSound = document.querySelector("#audio-fight")
const chooseSound = document.querySelector("#audio-choose")
const defeatSound = document.querySelector("#audio-defeat")
const victorySound = document.querySelector("#audio-victory")
const appearSound = document.querySelector("#audio-appear")
const playerHitSound = document.querySelector("#audio-playerhit")
const computerHitSound = document.querySelector("#audio-computerhit")
const score = []
const heroes = []

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
        createCombatStats(heroObject);
    }
    displayChoices(heroes);
    chooseSound.play();
}

// Calculate new stats that were not included through the API. These will be used for the combat function.
function createCombatStats(heroObject) {
    const powerStats = heroObject.powerstats
    // Looks at all hero powerstats and replaces any blank values with a preset default, 25.
    Object.keys(powerStats).forEach(key => {
        if (powerStats[key] === "null") {
            powerStats[key] = 25;
        }
    })
    heroObject.health = heroObject.powerstats.strength * 100;
    heroObject.timeToHit = (100 - heroObject.powerstats.speed) * 10;
    if (heroObject.timeToHit <= 175)
    heroObject.timeToHit = 175;
    heroObject.damagePerHit = parseInt(heroObject.powerstats.strength) * 2 + parseInt(heroObject.powerstats.combat) * 3 + parseInt(heroObject.powerstats.power);
    return heroes.push(heroObject);
}

function displayChoices(heroes) {
    let starterBox = document.querySelector("#starter-choices")
    starterBox.replaceChildren();
    for (let i = 0; i < heroes.length; i++) {
        let newHeroObject = heroes[i];
        const newHero = createHeroDisplay(heroes, i, newHeroObject);
        starterBox.append(newHero)
    }
}

function createHeroDisplay(heroes, i, newHeroObject) {
    const heroDisplay = mkElement("img");
    heroDisplay.width = 200;
    heroDisplay.src = heroes[i].image.url;
    heroDisplay.className = 'hero';
    heroDisplay.style.borderRadius = "50%";
    heroDisplay.addEventListener("click", () => selectHero(newHeroObject));
    heroDisplay.onerror = function () {
        this.src = "./assets/unnamed-hero.jpg"
        newHeroObject.image.url = "./assets/unnamed-hero.jpg"
        console.log("Image not found for", newHeroObject.name);
    };
    return heroDisplay;
    
}

function selectHero(newHeroObject) {
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
    combatLog.style.display = "inline-block"
    combatLog.style.backgroundImage = "url('./assets/scroll-2.png')"
    combatLog.style.width = "500px"
    combatLog.style.height = "600px"
    combatLog.scrollTop = combatLog.scrollHeight;
    combatLog.style.backgroundSize = "cover"

    const logContainer = mkElement("div")
    logContainer.className = "log-container"
    logContainer.style.width = "100%"
    logContainer.style.height = "100%"
    logContainer.style.position = "relative"
    logContainer.style.top = "100px"
    logContainer.style.maxHeight = "350px"
    logContainer.style.overflow = "hidden"
    combatLog.append(logContainer)

    createPlayerBox(playerBox);
    createComputerBox(computerBox);

    const vsLogo = mkElement("img")
    vsLogo.src = "./assets/vs.png"
    fightScreen.insertBefore(vsLogo, computerBox)
    vsLogo.style.position = "relative"
    vsLogo.style.bottom = "600px"

    const fightButton = mkElement("button");
    fightButton.id = "fight-btn";
    fightButton.innerText = "Fight!";
    fightButton.addEventListener("click", combat);

    const resetButton = mkElement("button");
    resetButton.id = "reset-btn";
    resetButton.innerText = "Reset";
    resetButton.addEventListener("click", resetFightScreen);

    fightScreen.prepend(fightButton, resetButton, mkElement("br"));
    fightSound.play();
}

function createPlayerBox(playerBox) {
    playerBox.style.display = "inline-block"    
    const playerHeadline = mkElement("h1");
    const playerHeroName = mkElement("h2");
    const playerHeroHealth = mkElement("h3");
    const playerHeroHealthS = mkElement("span");
    const playerStrength = mkElement("span");
    const playerCombat = mkElement("span");
    const playerPower = mkElement("span");
    const playerSpeed = mkElement("span");
    const playerImage = mkElement("img");

    playerHeadline.innerText = "PLAYER" + playerWinTracker;
    playerHeadline.id = "playerHeadline"
    playerHeroName.innerText = playerHero.name;

    playerHeroHealth.id = "spanPlayerHealth";
    playerHeroHealth.innerText = "HP: ";
    playerHeroHealthS.innerText = playerHero.health;
    playerHeroHealthS.id = "spanPlayerHealthS";
    playerHeroHealth.append(playerHeroHealthS);

    playerStrength.innerText = "STRENGTH: " + playerHero.powerstats.strength;
    playerCombat.innerText = "COMBAT: " + playerHero.powerstats.combat;
    playerPower.innerText = "POWER: " + playerHero.powerstats.power;
    playerSpeed.innerText = "SPEED: " + playerHero.powerstats.speed;

    playerImage.src = playerHero.image.url;
    playerImage.alt = playerHero.name;
    playerImage.width = 440;
    playerImage.height = 640;

    playerBox.append(playerHeadline, playerHeroName, playerHeroHealth, mkElement("br"), playerStrength, mkElement("br"), playerCombat, mkElement("br"), playerPower, mkElement("br"), playerSpeed, mkElement("br"), playerImage);

}

function createComputerBox(computerBox) {
    computerBox.style.display = "inline-block"
    const computerHeadline = mkElement("h1");
    const computerHeroName = mkElement("h2");
    const computerHeroHealth = mkElement("h3");
    const computerHeroHealthS = mkElement("span");
    const computerStrength = mkElement("span");
    const computerCombat = mkElement("span");
    const computerPower = mkElement("span");
    const computerSpeed = mkElement("span");
    const computerImage = mkElement("img");
    

    computerHeadline.innerText = "COMPUTER" + computerWinTracker;
    computerHeadline.id = "computerHeadline"
    computerHeroName.innerText = computerHero.name;

    computerHeroHealth.id = "spanComputerHealth";
    computerHeroHealth.innerText = "HP: ";
    computerHeroHealthS.innerText = computerHero.health;
    computerHeroHealthS.id = "spanComputerHealthS";
    computerHeroHealth.append(computerHeroHealthS);

    computerStrength.innerText = "STRENGTH: " + computerHero.powerstats.strength;
    computerCombat.innerText = "COMBAT: " + computerHero.powerstats.combat;
    computerPower.innerText = "POWER: " + computerHero.powerstats.power;
    computerSpeed.innerText = "SPEED: " + computerHero.powerstats.speed;

    computerImage.src = computerHero.image.url;
    computerImage.alt = computerHero.name;
    computerImage.width = 440;
    computerImage.height = 640;

    computerBox.append(computerHeadline, computerHeroName, computerHeroHealth, mkElement("br"), computerStrength, mkElement("br"), computerCombat, mkElement("br"), computerPower, mkElement("br"), computerSpeed, mkElement("br"), computerImage);
}

function combat() {
    const fightButton = document.querySelector("#fight-btn")
    combatInProgress = true;
    fightButton.disabled = true;
    playerFighting = setInterval(playerAttack, playerHero.timeToHit)
    computerFighting = setInterval(computerAttack, computerHero.timeToHit)
}

function playerAttack() {
    playerHitSound.play();
    const spanComputerHealth = document.querySelector("#spanComputerHealthS")
    computerHero.health -= playerHero.damagePerHit;
    spanComputerHealth.innerText = computerHero.health;

    const logContainer = document.querySelector(".log-container")

    const newCombatItem1 = mkElement("p")
    const newCombatItem2 = mkElement("p")

    newCombatItem1.innerHTML = `<strong>${playerHero.name}</strong> hits <strong>${computerHero.name}</strong>!`
    computerHero.health > 0 ? newCombatItem2.innerHTML = `<strong>${computerHero.name}</strong> has ${computerHero.health} health left!` : newCombatItem2.innerHTML = `<strong>${computerHero.name}</strong> has fallen in battle!`

    logContainer.prepend(newCombatItem2, newCombatItem1)

    console.log(`${playerHero.name} hits ${computerHero.name}!`)
    console.log(`${computerHero.name} has ${computerHero.health} health left!`)
    
    determineWinner();
}

function computerAttack() {
    computerHitSound.play();
    const spanPlayerHealth = document.querySelector("#spanPlayerHealthS")
    playerHero.health -= computerHero.damagePerHit
    spanPlayerHealth.innerText = playerHero.health;
    const logContainer = document.querySelector(".log-container")
    const newCombatItem1 = mkElement("p")
    const newCombatItem2 = mkElement("p")

    newCombatItem1.innerHTML = `<strong>${computerHero.name}</strong> hits <strong>${playerHero.name}</strong>!`
    playerHero.health > 0 ? newCombatItem2.innerHTML = `<strong>${playerHero.name}</strong> has ${playerHero.health} health left!` : newCombatItem2.innerHTML = `<strong>${playerHero.name}</strong> has fallen in battle!`

    logContainer.prepend(newCombatItem2, newCombatItem1)

    console.log(`${computerHero.name} hits ${playerHero.name}!`)
    console.log(`${playerHero.name} has ${playerHero.health} health left!`)

    determineWinner();
}

function determineWinner() {
    if (playerHero.health <= 0 || computerHero.health <= 0) {
        combatInProgress = false;
        clearInterval(playerFighting)
        clearInterval(computerFighting)
        switch (playerHero.health > computerHero.health) {
            case true:
                const playerHeadline = document.querySelector("#playerHeadline")
                console.log("Player wins!")
                playerWinTracker +="💢";
                playerHeadline.innerText = "PLAYER" + playerWinTracker;
                const spanComputerHealth = document.querySelector("#spanComputerHealthS")
                spanComputerHealth.innerText = "KIA";
                spanComputerHealth.style.color = "red";
                setTimeout(function(){confetti.start();},5000);
                setTimeout(function(){confetti.stop();},10000);
                victorySound.play();
                score.push("💢")
                if (databaseConnected) sendScoresToDatabase();
                break;
            case false:
                const computerHeadline = document.querySelector("#computerHeadline")
                console.log("Computer wins!")
                computerWinTracker +="💢";
                computerHeadline.innerText = "COMPUTER" + computerWinTracker;
                const spanPlayerHealth = document.querySelector("#spanPlayerHealthS")
                spanPlayerHealth.innerText = "KIA";
                spanPlayerHealth.style.color = "red";
                defeatSound.play()
                score.push("❌")
                if (databaseConnected) sendScoresToDatabase();
                break;
        }
    }
}

function sendScoresToDatabase() {
    fetch("http://localhost:3000/scores/1", {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify({
            score: score
        })})
        .catch(error => console.log(error))
}

function resetFightScreen() {
    clearInterval(playerFighting)
    clearInterval(computerFighting)
    let fightScreen = document.querySelector("#fight-screen")
    let startScreen = document.querySelector("#start-screen")
    fightScreen.innerHTML = `<div id="fs-player"></div>
    <div id="fs-computer"></div>
    <div id="combat-log"></div>
  </div>`
    startScreen.style.display = "block"
    heroes.forEach(hero => hero.health = hero.powerstats.strength * 100)
    displayChoices(heroes);
    chooseSound.play();
}

function loadPreviousScores() {
    const lastScore = document.querySelector("#last-score")
    fetch('http://localhost:3000/scores')
        .then(response => response.json())
        .then(data => data[data.length - 1])
        .then(score => {
            console.log(score.score);
            const scoreCard = document.createElement("span")
            scoreCard.innerText = score.score.join("");
            scoreCard.style.fontSize = "45px"
            lastScore.append(document.createElement("br"), scoreCard)
            databaseConnected = true;
            lastScore.style.display = "block"
        })
        .catch(error => {
            console.log(error);
            console.log('No database active: Removing Previous Score box.')
            databaseConnected = false;
            lastScore.remove();
        })

}

loadPreviousScores()
retrieveHero(5);