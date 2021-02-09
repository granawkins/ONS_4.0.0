import * as data from "./data.js"

export default class Tutorial {
    constructor() {
        this.step = 0
        this.age = 0
        this.message = this.popup(this.step)
    }
    
    popup(s) {
        let text = this.steps[s].message
        let message = $(`<div class="print"><p>${text}</p></div>`).appendTo($("#printArea"))
        if (text === "") message.css("display", "none")
        return message
    }

    // What would otherwise be called the 'step' function
    check(game) {
        let s = this.steps[this.step]
        
        // Flash effect every 60 frames (~2 seconds)
        if (this.age === 0) {
            s.effect(game)
        }
        this.age = (this.age + 1) % 60

        // If criteria is fulfilled
        if (s.test(game)) {
            // Remove message
            this.message.remove()

            // load next step
            this.step += 1
            if (this.step < this.steps.length) {
                this.message = this.popup(this.step)
                this.age = 0
            } else {
                game.flags.tutorial = false
                console.log("tutorial complete")
            }
        }
    }

    steps = [
        {
            message: "Before we launch, we need to dock and get supplies. Click a ship's name to dock.",
            effect: function(game) {game.alert('SS1Header')},
            test: function(game) {return (game.ships['SS1'].dockedWith)},
        },{
            message: "First, select a destination from the drop-down menu.",
            effect: function(game) {game.alert('SS1DestinationSelector')},
            test: function(game) {return ($(`#SS1DestinationSelector`).val())}
        },{
            message: "Great! Next add propellant. You can expand the Propellant Depot menu by clicking it, or just click 'Fill' to automatically max-out capacity.",
            effect: function(game) {game.alert('CAPEAutofillButton')},
            test: function(game) {
                let fields = data.sinksOfType('propellant')
                let pFields = game.ships.SS1.sinksIndex.filter(s => fields.includes(s))
                return (pFields.length > 0)
            },
        },{
            message: "Add some food and water before our crew boards.",
            effect: function(game) {
                game.alert('CAPEhF100kgButton')
                game.alert('CAPEwaPot100kgButton')
            },
            test: function(game) {
                return (game.ships.SS1.field('hF') && game.ships.SS1.field('waPot'))
            }
        },{
            message: "Bravo. Before loading crew, you must engage the airlock. As long as the airlock is engaged, pressure will equalize between the ship and the dock.",
            effect: function(game) {game.alert('SS1AirlockButton')},
            test: function(game) {return (game.ships.SS1.airlockedWith)}
        },{
            message: "Ready for crew to board. Load 3 humans on board.",
            effect: function(game) {game.alert('CAPEhuman1Button')},
            test: function(game) {return (game.ships.SS1.field('human') === 3)}
        },{
            message: "You are go to launch.",
            effect: function(game) {game.alert('SS1LaunchButton')},
            test: function(game) {return (game.ships.SS1.trip !== null)}
        },{
            message: "",
            effect: function() {return null},
            test: function(game) {return (game.ships.SS1.location === "LEO")}
        },{
            message: "Welcome to space! Accumulate labor hours to unlock new items.",
            effect: function(game) {
                game.alert('LEOLaborValue')
            },
            test: function(game) {return (game.bases.LEO.field('labor') >= 50)},
        },{
            message: "Click on projects to unlock them.",
            effect: function(game) {game.alert('unlockO2Tank')},
            test: function(game) {return (game.bases.CAPE.sinksIndex.includes("O2Tank"))}
        }
    ]
}


// 1. Click on the header to dock
// 2. Select LEO destination
// 3. Add fuel
// 4. Add water and food
// 5. Airlock
// 6. Add a passenger
// 7. Launch

// 8. Arrive at LEO
// 9. ..click through information
// 10. Unlock Project
// 11. Click Project
// 12. Select EARTH destination
// 13. Launch

// 12. Arrive back at earth