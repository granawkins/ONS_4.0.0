export default class Controller {
  constructor(playPause, gameSpeed) {

    this.dateCounter = document.getElementById("dateCounter")
    this.peopleCounter = document.getElementById("peopleCounter")
    this.playButton = document.getElementById("playButton")
    
    this.playButton.addEventListener("click", event => {
      let newButtonText = (this.playButton.innerHTML === "Play") ? "Pause" : "Play"
      this.playButton.innerHTML = newButtonText
      playPause()
    })
    
    $("#speed1").click( function() {gameSpeed(0.042)})
    $("#speed2").click( function() {gameSpeed(0.5)})
    $("#speed3").click( function() {gameSpeed(0.7)})
    
  }
  
  render(gameDate, people) {
    this.dateCounter.innerHTML = renderDate(gameDate)

    this.peopleCounter.innerHTML = people
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