import * as builders from "../builders.js"
import * as data from "../data.js"
import * as atm from "../atmosphere.js"
import Sparkline from "../sparkline.js"
import Dockable from "./dockableField.js"
import Machine from "./machine.js"
import { PROC_UNITS, SINK_UNITS, massUnits } from "../helpers.js"



export default function renderLifeSupport (craft) {

    if (!craft.flags.initializeLifeSupport) {
        craft.memory.lifeSupport = {}
        let container = $(`#${craft.name}LifeSupport`)
        container.empty()
        $(`<div class="sectionHeader">LIFE SUPPORT</div>`).appendTo(container)
        craft.flags.initializeLifeSupport = true
    }

    // Refresh SparkLines
    let rsl = false
    if (craft.memory.hour !== craft.memory.lifeSupport.hour) {
        craft.memory.lifeSupport.hour = craft.memory.hour
        rsl = true
    }

    // atm.renderAtmosphere(craft, $(`#${craft.name}LifeSupport`), 'pressure')
    renderAtmosphere(craft, rsl)
    renderWater(craft, rsl)
    renderFood(craft, rsl)
    if (craft.flags.renderElec) renderElectricity(craft, rsl)
}

const renderAtmosphere = (craft, ref) => {

    // Initialize
    if (!craft.memory.initializeAtmosphere) {
        let container = $(`#${craft.name}LifeSupport`)

        let atmosphere = builders.addMenu(craft.name + "Atmosphere", "Atmosphere", container)
        craft.memory.sparklines.oxygen = new Sparkline(
            [craft.field("O2")],
            atmosphere[0],
            "purple"
            )
        builders.addFlexValue(craft.name + "O2", atmosphere)
        
        let atmosphereMenu = $(`#${craft.name}AtmosphereMenu`)
        
        // Volume
        let pvLab = craft.name + "PressurizedVolume"
        let pv = builders.addLine(pvLab, "Pressurized Volume", atmosphereMenu)
        builders.addFlexValue(pvLab, pv)
        
        // Total Pressure
        let tpLab = craft.name + "TotalPressure"
        let tp = builders.addLine(tpLab, "Total Pressure", atmosphereMenu)
        builders.addFlexButton(tpLab, "Vent", tp, 'red').mousedown( function() {
            craft.flags.tpVenting = true
        }).mouseup( function() {
            craft.flags.tpVenting = false
        })
        builders.addFlexValue(tpLab, tp)
        
        // // Relative Humidity
        // let rhLab = craft.name + "RelativeHumidity"
        // let rh = builders.addLine(rhLab, "Relative Humidity", atmosphereMenu)
        // builders.addFlexValue(rhLab, rh)
        
        craft.memory.initializeAtmosphere = true
    }
    
    // Step Updates
    let atmosphere = atm.calculateAtmosphere(
        atm.atmosphereFields(craft),
        craft.volume,
    )
    let fractionO2 = atmosphere.pressure.O2 / atmosphere.totalPressure
    let oxygen = (fractionO2) ? Math.round(fractionO2*100) : 0
    
    // Trigger when drops below..
    if (oxygen <= 5 && craft.game.frame % 30 === 0) {
        craft.game.alert(craft.name + "O2", "red")
    }
    if (oxygen <= 0 && craft.field("human") > 0) {
        craft.game.flags.gameOver = `${craft.data.label} ran out of Oxygen`
    }

    let unitLabel = "% O<sub>2</sub>"
    $("#" + craft.name + "O2Value").html(`<p>${oxygen}% O<sub>2</sub></p>`)
    if (ref) craft.memory.sparklines.oxygen.step(oxygen)

    $(`#${craft.name}PressurizedVolumeValue`).text(craft.volume)
    $(`#${craft.name}TotalPressureValue`).text(Math.floor(atmosphere.totalPressure*10)/10)
    // $(`#${craft.name}RelativeHumidityValue`).text(
    //     Math.floor(atmosphere.relativeHumidity*100) + "%"
    // )

    // Add machines
    if (craft.flags.renderOgs) renderOgs(craft)
    if (craft.flags.renderCO2Scrubber) renderCO2Scrubber(craft)
}



const renderWater = (craft, ref) => {
    
    // Water
    if (!craft.memory.water) {
        let container = $(`#${craft.name}LifeSupport`)
        let water = builders.addMenu(craft.name + "Water", "Water", container)
        craft.memory.sparklines.water = new Sparkline(
            [craft.sinksBal[craft.sinksIndex.indexOf('waPot')]],
            water[0],
            "blue"
        )
        craft.memory.dockableFields.water = new Dockable(craft, "waPot", data.data('waPot').units, water)
        craft.memory.water = true
    }

    if (craft.memory.water) {
        let water = (craft.sinksIndex.includes("waPot"))
            ? Math.floor( craft.sinksBal[craft.sinksIndex.indexOf("waPot")] )
            : 0
        craft.memory.dockableFields.water.step(water, craft.airlockedWith)  
        if (ref) craft.memory.sparklines.water.step(water)
    }    



    // Waste Water
    if (!craft.memory.wasteWater) {
        let container = $(`#${craft.name}WaterMenu`)
        let line = builders.addLine(craft.name + "waWst", "Waste Water", container)
        craft.memory.dockableFields.wasteWater = new Dockable(craft, 'waWst', data.data('waWst').units, line)
        craft.memory.wasteWater = true
    }

    if (craft.memory.wasteWater) {
        let value = (craft.sinksIndex.includes("waWst"))
            ? massUnits(craft.field("waWst"))
            : 0
        craft.memory.dockableFields.wasteWater.step(value, craft.airlockedWith)
    }

    

    // Gray Water
    if (!craft.memory.grayWater) {
        let container = $(`#${craft.name}WaterMenu`)
        let line = builders.addLine(craft.name + "waGr", "Gray Water", container)
        craft.memory.dockableFields.grayWater = new Dockable(craft, 'waGr', data.data('waGr').units, line)
        craft.memory.grayWater = true
    }

    if (craft.memory.grayWater) {
        let value = (craft.sinksIndex.includes("waGr"))
            ? massUnits(craft.field("waGr"))
            : 0
        craft.memory.dockableFields.grayWater.step(value, craft.airlockedWith)
    }

    // Add Machines
    if (craft.flags.renderWaterRecycler) renderWaterRecycler(craft)

}



const renderFood = (craft, ref) => {

    // Food
    if (!craft.memory.initializeFood) {
        let container = $(`#${craft.name}LifeSupport`)
        let food = builders.addLine(craft.name + "Food", "Food", container)
        craft.memory.sparklines.food = new Sparkline(
            [craft.sinksBal[craft.sinksIndex.indexOf('hf')]],
            food[0], // food is a jQuery object
            "green"
        )
        craft.memory.initializeFood = true
        craft.memory.dockableFields.food = new Dockable(craft, "hF", data.data('hF').units, food)
    }

    let food = (craft.sinksIndex.includes("hF"))
        ? Math.floor( craft.sinksBal[craft.sinksIndex.indexOf("hF")] )
        : 0
    craft.memory.dockableFields.food.step(food, craft.airlockedWith)
    if (ref) craft.memory.sparklines.food.step(food)

}



const renderElectricity = (craft, ref) => {
    
    // Initialize
    if (!craft.memory.initializeElectricity) {
        let container = $(`#${craft.name}LifeSupport`)
        let elec = builders.addMenu(craft.name + "Elec", "Electricity", container)
        craft.memory.sparklines.elec = new Sparkline(
            [craft.sinksBal[craft.sinksIndex.indexOf('elec')]],
            elec[0], // food is a jQuery object
            "orange"
        )
        craft.memory.elec = true
        builders.addFlexValue(craft.name + "Elec", elec).text(0)
        
        craft.flags.refreshLifeSupport = true
        craft.memory.initializeElectricity = true
    }

    // Step Updates
    let elec = (craft.power.unused)
        ? craft.power.unused
        : 0
    if (ref) craft.memory.sparklines.elec.step(elec)

    let formatted = Math.floor(elec) + "W"
    if (formatted !== craft.memory.elecValue) {
        $(`#${craft.name}ElecValue`).text(formatted)
        craft.memory.elecValue = formatted
    }

    // Add Machines
    if (craft.flags.renderFuelCell) renderFuelCell(craft)
}

//
//
// MACHINES
//
//

// Oxygen Generator
const renderOgs = (craft) => {
    // initialize
    if (!craft.memory.ogs) {
        let container = $(`#${craft.name}AtmosphereMenu`)
        craft.memory.machines.ogs = new Machine(
            'ogs', craft, container
        )
        craft.memory.ogs = true
    }
    // update
    craft.memory.machines.ogs.step(craft)
}

// Fuel Cell
const renderFuelCell = (craft) => {
    if (!craft.memory.initializeFuelCell) {
        let container = $(`#${craft.name}ElecMenu`)
        craft.memory.machines.fuelCell = new Machine(
            'fuelCell', craft, container
        )
        craft.memory.initializeFuelCell = true
    }

    // Update quantity
    craft.memory.machines.fuelCell.step(craft)
}

// Water Recycler
const renderWaterRecycler = (craft) => {
    if (!craft.memory.initializeWrs) {
        let container = $(`#${craft.name}WaterMenu`)
        craft.memory.machines.wrs = new Machine(
            'wrs', craft, container
        )
        craft.memory.initializeWrs = true
    }

    // Update quantity
    craft.memory.machines.wrs.step(craft)
}

// CO2 Scrubber
const renderCO2Scrubber = (craft) => {
    if (!craft.memory.scrub) {
        let container = $(`#${craft.name}AtmosphereMenu`)
        craft.memory.machines.scrub = new Machine(
            'scrub', craft, container
        )
        craft.memory.scrub = true
    }

    // update 
    craft.memory.machines.scrub.step(craft)

}