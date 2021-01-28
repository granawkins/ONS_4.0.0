import * as builders from "../builders.js"
import { PROC_UNITS } from "../helpers.js"
import Dockable from "./dockableField.js"
import Machine from "./machine.js"

export default function renderCrew (craft) {

    if (!craft.memory.crew) craft.memory.crew = {}
    let memory = craft.memory.crew

    // Initialize Crew Section
    const initialize = (craft) => {
        let container = $('#'+craft.name+'Crew')
        $(`<div class="sectionHeader">CREW</div>`).appendTo(container)
        memory.initialized = true
    }

    // Humans
    let humans = craft.field('human') // Number of humans on board
    if (humans > 0) {
        // Setup
        if (!memory.initializeHumans) {
            if (!memory.initialized) initialize(craft)
            let container = $('#'+craft.name+'Crew')
            craft.memory.machines.human = new Machine(
                'human', craft, container
            )
            memory.initializeHumans = true
            memory.renderHumans = true
        }
        // Show
        if (!memory.renderHumans) {
            $(`#${craft.name}humanWrapper`).css('display', 'block')
            memory.renderHumans = true
        }
        // Update
        craft.memory.machines.human.step(craft)

    } else if (memory.renderHumans) {
        // Hide
        $(`#${craft.name}humanWrapper`).css('display', 'none')
        memory.renderHumans = null
    }


    // Labor
    let labor = Math.floor(craft.field('labor'))
    if (labor > 0) {
        // Setup
        if (!memory.initializeLabor) {
            if (!memory.initialized) initialize(craft)
            let container = $('#'+craft.name+'Crew')
            let labor = builders.addLine(craft.name + "Labor", "Labor Hours", container)
            let laborHours = builders.addFlexValue(craft.name + "Labor", labor)
            memory.initializeLabor = true
            memory.renderLabor = true
        }
        // Show
        if (!memory.renderLabor) {
            $(`#${craft.name}laborWrapper`).css('display', 'block')
            memory.renderLabor = true
        }
        // Update
        if (labor !== memory.labor) {
            $(`#${craft.name}LaborValue`).text(labor)
            memory.labor = labor
        }
    } else if (memory.renderLabor) {
        // Hide
        $(`#${craft.name}laborWrapper`).css('display', 'none')
        memory.renderLabor = null
    }
}