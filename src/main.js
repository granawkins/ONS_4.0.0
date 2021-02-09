import Controller from "./controller.js"
import Game from "./game.js"
import welcome from "./welcome.js"

$(function() {
    var dps = 0.042 // DAYS PER SECOND
    var fps = 30   // FRAMES PER SECOND
    var lastTime = 0
    var paused = true
    var timerID
    var game
    var mode
    var initialized = false

    const playPause = (m) => {
    if (!initialized) {
        $(`#header`).css("display", "flex")
        mode = m
        game = new Game(mode)
        initialized = true
    }
    if (paused) {
        timerID = setInterval(() => {
        const currentTime = new Date().getTime();
        const dT =
            lastTime === 0
            ? (1000 / fps) / 1000  * dps
            : (currentTime - lastTime) / 1000 * dps;
        lastTime = currentTime;
        if (game.flags.gameOver) {
            controller.display("Game Over: " + game.flags.gameOver)
            clearInterval()
        } else {
            game.step(dT)
            controller.render(game.date, game.settlers)
        }
        }, 1000/fps);
    } else {
        clearInterval(timerID);
        lastTime = 0
    }
    paused = !paused
    }

    const gameSpeed = (newDps) => {
        dps = newDps
        game.flags.refreshFlows = true
    }

    const controller = new Controller(playPause, gameSpeed)

    welcome(playPause)
});