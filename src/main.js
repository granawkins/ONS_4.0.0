import Controller from "./controller.js"
import Game from "./game.js"

$(function() {
    var dps = 0.042 // DAYS PER SECOND
    var fps = 30   // FRAMES PER SECOND
    var lastTime = 0
    var paused = true
    var timerID
    var game

    const playPause = () => {
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
            controller.render(game.date)
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

    game = new Game()
});