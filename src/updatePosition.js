export default function updatePosition (craft, dT) {

    let container = document.getElementById(craft.name)

    if (!craft.memory.position) craft.memory.position = {}
    let memory = craft.memory.position
    
    // If the craft is moving
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
            $(container).css("top", position + "px")
            // container.style = "top: " + position + "px;"
            
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
        // turn off listeners / reset
        if (memory.i !== null) {
            $(container).css({
                'left': 0,
            })
            memory.i = null
            memory.y = null
            $(container).off('click')
            
            // bring-to-front
            $(container).click(function() {
                let newZ = craft.game.zMax + 1
                $(container).css('z-index', newZ)
                memory.zIndex = newZ
                craft.game.zMax = newZ
            })
            $(`#${craft.name}Header`).off("click").css("cursor", "default")
        }

    //  If craft is at a base
    } else {

        // If base height has changed
        let refreshX
        let y = document.getElementById(craft.location).offsetTop
        if (y !== memory.y) {
            container.style = "top: " + y + "px;"
            refreshX = true
            memory.y = y
        }

        // If index has changed
        const SPACING = 100
        let ships = craft.game.bases[craft.location].ships
        let i = ships.indexOf(craft.name)
        if (i !== memory.i) {
            $(container).off('click').css('cursor', 'default')
            $(`#${craft.name}Header`).off("click").css('cursor', 'default')

            // Change horizontal position
            let z = 9-i
            craft.game.zMax = Math.max(z, craft.game.zMax)
            memory.zIndex = z
            $(container).css({
                'left': i * SPACING + "px",
                'z-index': z,
            })

            // Add bring-to-front listener
            if (i > 0) {$(container).click(function(e) {
                e.stopPropagation()

                // If ship[0] is docked, undock
                let current = craft.game.ships[ships[0]]
                if (current.dockedWith) {
                    craft.game.dockWith(craft.location, current.name)
                }
        
                // Re-order the ships
                let newShips = [craft.name].concat(ships.filter(s => s !== craft.name))
                craft.game.bases[craft.location].ships = newShips

            })} else {
                // add dock listener back
                $(`#${craft.name}Header`)
                    .css('cursor', 'pointer')
                    .click(function() {
                        craft.game.dockWith(craft.location, craft.name)
                })

                // bring-to-front
                $(container).click(function() {
                    let newZ = craft.game.zMax + 1
                    $(container).css('z-index', newZ)
                    memory.zIndex = newZ
                    craft.game.zMax = newZ
                })
            }
            memory.i = i
        }
    }
}