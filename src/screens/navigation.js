import * as data from "../data.js"
import * as builders from "../builders.js"
import { massUnits, renderHour } from "../helpers.js"
import Dockable from "./dockableField.js"

const PROPELLANT_SINKS = ["LO2", "LH2", "MMH", "N2O4"]

export const ROUTES = {
    CAPE: {
        LEO: {dV: 8600, dT: 0.5}
    },
    LEO: {
        CAPE: {dV: 8600, dT: 0.5},
        LPO: {dV: 4084, dT: 14},
        L5: {dV: 4084, dT: 14},
        GSO: {dV: 3839, dT: 7},
    },
    GSO: {
        LEO: {dV: 3839, dT: 7},
        L5: {dV: 1737, dT: 7},
        LPO: {dV: 1737, dT: 7},
    },
    L5: {
        LPO: {dV: 686, dT: 7},
        LEO: {dV: 4084, dT: 14},
        GSO: {dV: 1737, dT: 7},
    },
    LPO: {
        LEO: {dV: 4084, dT: 14},
        L5: {dV: 686, dT: 7},
        GSO: {dV: 1737, dT: 7},
        LS: {dV: 2195, dT: 0.5},
    },
    LS: {
        LPO: {dV: 1859, dT: 0.5}
    }
}

export function renderNavigation (craft) {

    // Setup Navigation Interface
    if (!craft.flags.initializeNavigation) {
        let navigation = $(`#${craft.name}Navigation`)
        navigation.empty()

        // LABEL
        $(`<div class="sectionHeader">NAVIGATION</div>`).appendTo(navigation)

        // DESTINATION LINE
        let destId = craft.name + "Destination"
        let destination = $(`<div id="${destId}" class="line"></div>`)
            .css("justify-content", "center")
            .appendTo(navigation)

        // SELECTOR and TEXT. Only one is visible at a time.
        builders.addFlexText(destId, "", destination)
            .css("display", "none")
        builders.addFlexSelector(destId, destination, [])
            .change(function() {
                let selection = $(this).val()
                if (selection !== "") {
                    $(`#${craft.name}TripTimeText`)
                        .css("display", "inline")
                        .text("ETA:" + renderHour(craft.data.routes[selection].eta)
                    )

                    $(`#${craft.name}PayloadMaxText`).css("display", "inline")
                        .text("/" + massUnits(craft.data.routes[selection].payload))
                    let propellantFields = craft.data.routes[selection].propellant
                    let maxPropellant = 0
                    Object.keys(propellantFields).forEach(field => {
                        maxPropellant += propellantFields[field]
                    })
                    $(`#${craft.name}PropellantMaxValue`).css("display", "inline")
                        .text("/" + massUnits(maxPropellant))


                } else {
                    $(`#${craft.name}TripTimeText`).css("display", "none")
                    $(`#${craft.name}PayloadMaxText`).css("display", "none")
                    $(`#${craft.name}PropellantMaxValue`).css("display", "none")
                }
                craft.flags.refreshNavigation = true
            })

        // Trip Time
        builders.addFlexText(craft.name + "TripTime", "", destination)
            .css("margin-left", "10px")
            
        // Payload
        let pId = craft.name + "Payload"
        let payload = builders.addLine(pId, "Payload", navigation)
            // Includes ACTUAL and MAX
            let payloadRightBlock = $(`<div id="${pId}RightBlock" class="flexItem"></div>`)
                .appendTo(payload)
            builders.addFlexText(pId + "Actual", craft.payload, payloadRightBlock)
            builders.addFlexText(pId + "Max", "", payloadRightBlock)

        // Propellant
        let prId = craft.name + "Propellant"
        let propellant = builders.addMenu(prId, "Propellant", navigation)
            // Includes ACTUAL and MAX
            let propellantRightBlock = $(`<div id="${prId}RightBlock" class="flexItem"></div>`)
                .appendTo(propellant)
            builders.addFlexValue(prId + "Actual", propellantRightBlock)
            builders.addFlexValue(prId + "Max", propellantRightBlock)

        // Propellant menu
        let propellantMenu = $(`#${craft.name}PropellantMenu`)
        Object.keys(craft.data.maxPropellant).forEach(field => {
            let fId = craft.name + field
            let line = builders.addLine(fId, data.data(field).label, propellantMenu)
            craft.memory.dockableFields[field] = new Dockable(craft, field, 10000000, line)
        })

        // Launch
        // includes BUTTON and DUMMYBUTTON
        let laId = craft.name + "Launch"
        let launch = builders.addLine(laId, "", navigation)
            .css("justify-content", "center")
        builders.addFlexButton(laId, "Launch", launch, 'green')
            .css("display", "none")
            .click(function() {
                craft.launch()
            })
        builders.addFlexButton(laId + "Dummy", "Launch", launch)
            .css({
                "background-color" : "lightgray",
                "color": "gray",
                "border": "1px solid gray",
            })

        craft.flags.refreshNavigation = true
        craft.flags.initializeNavigation = true;
    }

    if (craft.game.flags.refreshDock) {
        craft.flags.refreshNavigation = true
    }

    if (craft.flags.refreshNavigation) {

        let status = (craft.location) ? "port" : "trip"
        if (status !== craft.memory.status) {
            if (status === "port") {
                renderPort(craft)
                craft.memory.status = status
            } else if (status === "trip") {
                renderTrip(craft)
                craft.memory.status = status
            }
        }

        craft.flags.refreshNavigation = false
    }

    // STEP UPDATES
    // Payload
    let payload = massUnits(craft.payload)
    if (payload !== craft.memory.payload) {
        $(`#${craft.name}PayloadActualText`).text(payload)
        craft.memory.payload = payload
    }

    // Trip Time
    if (craft.trip) {
        let remainingTime = craft.trip.tripTime * (1 - craft.trip.progress)
        let value = renderHour(remainingTime)
        $(`#${craft.name}TripTimeText`).text(value)
    }

    // Propellant
    let propellantMass = 0
    let propellantSinks = PROPELLANT_SINKS.filter(sink => craft.sinksIndex.includes(sink))
    propellantSinks.forEach(sink => {
        let val = craft.sinksBal[craft.sinksIndex.indexOf(sink)]
        propellantMass += val
        craft.memory.dockableFields[sink].step(val, craft.dockedWith)
    })
    
    propellantMass = massUnits(propellantMass)
    if (propellantMass !== craft.memory.propellantMass) {
        $(`#${craft.name}PropellantActualValue`).text(propellantMass)
        craft.memory.propellantMass = propellantMass
    }

    // Autofill
    let destination = $(`#${craft.name}DestinationSelector`).val()
    if (!craft.memory.autofill) {
        if (craft.dockedWith) {
            $(`#${craft.name}PropellantAutofillButton`).css("display", "inline")
            craft.memory.autofill = true
        }
    } else {
        if (!craft.dockedWith) {
            $(`#${craft.name}PropellantAutofillButton`).css("display", "none")
            craft.memory.autofill = false
        }
    }

    // Launch Button
    let launchStatus
    if (craft.trip) {
        launchStatus = 'none'
    } else if ($(`#${craft.name}DestinationSelector`).val() === "") {
        launchStatus = 'dummy'
    } else {
        launchStatus = 'launch'
    }
    if (launchStatus !== craft.memory.launchStatus) {
        let button = $(`#${craft.name}LaunchButton`)
        let dummy = $(`#${craft.name}LaunchDummyButton`)
        switch (launchStatus) {
            case "none": {
                button.css("display", "none")
                dummy.css("display", "none")
                break;
            }
            case "dummy": {
                button.css("display", "none")
                dummy.css("display", "inline")
                break;
            }
            case "launch": {
                button.css("display", "inline")
                dummy.css("display", "none")
                break;
            }
            default: break;
        }
        craft.memory.launchStatus = launchStatus
    }
}

const renderTrip = (craft) => {
    $(`#${craft.name}DestinationText`)
    .css("display", "inline")
    .text(craft.trip.destination)
    $(`#${craft.name}DestinationSelector`).css("display", "none")
}

const renderPort = (craft) => {
    // Show selector, hide destination text
    $(`#${craft.name}DestinationText`).css("display", "none")            
    $(`#${craft.name}DestinationSelector`).css("display", "inline").val("")
    
    const fromLocation = (route) => {
        return route.split("_")[0] === craft.location
    }
    // Load destination selector
    let routes = Object.keys(craft.data.routes).filter(fromLocation)
    if (JSON.stringify(routes) !== craft.memory.routes) {
        let selector = $(`#${craft.name}DestinationSelector`).empty()
        routes = routes.map(r => [r, craft.data.routes[r].label])
        routes.unshift(["", "-Select Destination-"])
        routes.forEach(r => {
            selector.append($('<option>', { 
                value: r[0],
                text : r[1],
            }));
        })
        craft.memory.routes = JSON.stringify(routes)
        
        // Hide tripTime and payloadMax (until make a selection)
        $(`#${craft.name}TripTimeText`).css("display", "none")
        $(`#${craft.name}PayloadMaxText`).css("display", "none")
    }
}
  
export const getEta = (origin, destination) => {
    if (!ROUTES[origin] || !ROUTES[origin][destination]) {return null}
    var deltaTime = ROUTES[origin][destination].dT
    return deltaTime
}