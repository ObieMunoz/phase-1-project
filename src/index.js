const heroes = []
const starterBox = document.querySelector("#starter-choices")
const startScreen = document.querySelector("#start-screen")
const playerBox = document.querySelector("#fs-player")
const computerBox = document.querySelector("#fs-computer")

let playerHero;
let computerHero;

async function retrieveHero(num) {
    for (let i = 0; i < num; i++) {
        let randomId = Math.floor(Math.random() * 731 + 1)
        let superHeroAPI = `https://superheroapi.com/api/${API_KEY}/${randomId}`
        const promise = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(superHeroAPI)}`)
        const resolved = await promise.json()
        const heroString = await resolved.contents;
        const heroObject = await JSON.parse(heroString);
        heroes.push(heroObject)
        console.log(heroObject)
    }
    displayChoices(heroes)
}

function displayChoices(heroes) {
    for(let i = 0; i < heroes.length; i++) {
        let newHeroObject = heroes[i];
        newHero = document.createElement("img")
        newHero.width = 200;
        newHero.src = heroes[i].image.url;
        newHero.className = 'hero'
        newHero.style.borderRadius = "50%"
        newHero.addEventListener("click", (e) => selectHero(e, newHeroObject, i))
        starterBox.append(newHero)
        if (newHero.src.includes("404")) {
            newHero.remove()
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
    playerBox.innerHTML = `<h1>PLAYER</h1><br><h2>${playerHero.name}</h2><img src="${playerHero.image.url}" alt="${playerHero.name}">`
    computerBox.innerHTML = `<h1>COMPUTER</h2><br><h2>${computerHero.name}</h2><img src="${computerHero.image.url}" alt="${computerHero.name}">`
}

retrieveHero(5);