export default function updatePosition (craft, dT) {

    let container = document.getElementById(craft.name)
    
    
    //   If the craft is moving
    if (craft.trip) {
        let dP = dT / craft.trip.tripTime
        let newProgress = craft.trip.progress + dP
        if (newProgress >= 1) {
            craft.arrive(craft.trip.destination)
        } else {
            craft.trip.progress = newProgress
            let origin = document.getElementById(craft.trip.origin).offsetTop
            let destination = document.getElementById(craft.trip.destination).offsetTop

            // Update Position
            let position = origin + (destination - origin) * newProgress
            container.style = "top: " + position + "px;"

            // Update Propellant
            let burnTime = 0.2 // Fuel consumed wthin the first ___ of trip progress
            if (craft.trip.progress <= burnTime) {
                Object.keys(craft.trip.propellant).forEach(field => {
                    let progress = craft.trip.progress / burnTime
                    let propellantLeft = craft.trip.propellant[field] * (1 - progress)
                    let extraPropellant = craft.trip.extraPropellant[field]

                    craft.set(field, extraPropellant + propellantLeft)
                })
            } else if (!craft.trip.burnFinished) {
                Object.keys(craft.trip.propellant).forEach(field => {

                    // Set fuel amounts
                    craft.set(field, craft.trip.extraPropellant[field])
                })
                craft.trip.burnFinished = true
            }
        }
    } else {

        // If base height has changed
        let refreshX
        let y = document.getElementById(craft.location).offsetTop
        if (y !== craft.memory.y) {
            console.log("moved to " + y)
            container.style = "top: " + y + "px;"
            refreshX = true
            craft.memory.y = y
        }

        
        // If base.ships index position has changed
        let i = craft.game.bases[craft.location].ships.indexOf(craft.name)
        if (i !== craft.memory.i || refreshX) {
            let spacing = 100
            $(container).css({
                'left': i * spacing + "px",
                'z-index': 9-i,
            })

            if (i > 0) {
                $(container).click(function() {
                    let newShips = [craft.name]
                    let oldShips = craft.game.bases[craft.location].ships.slice()
                    oldShips.forEach(ship => {
                        if (ship !== craft.name) newShips.push(ship)
                    })
                    craft.game.bases[craft.location].ships = newShips
                })
            }
            craft.memory.i = i
        }
    }
}