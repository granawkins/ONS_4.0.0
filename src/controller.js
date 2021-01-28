var dateCounter

export default class Controller {
  constructor(playPause, gameSpeed) {
    dateCounter = document.getElementById("dateCounter")
    
    const playButton = document.getElementById("playButton")
    
    playButton.addEventListener("click", event => {
      let newButtonText = (playButton.innerHTML === "Play") ? "Pause" : "Play"
      playButton.innerHTML = ""
      playButton.innerHTML = newButtonText
      playPause()
    })
    
    $("#speed1").click( function() {gameSpeed(0.042)})
    $("#speed2").click( function() {gameSpeed(0.5)})
    $("#speed3").click( function() {gameSpeed(0.7)})
    
  }
  
  render(gameDate) {
    dateCounter.innerHTML = ""
    dateCounter.innerHTML = renderDate(gameDate)
  }

  display(message) {
    dateCounter.innerHTML = message
  }
}

function renderDate (ms) {
  var newDate = new Date(ms)
  newDate = newDate.toString()
  newDate = newDate.slice(4, 21)
  return newDate
}