import * as data from "../data.js"
import * as builders from "../builders.js"
import Dockable from "./dockableField.js"
import { SINK_UNITS , massUnits } from "../helpers.js"

var cargoCache = {}

export default function renderCargo(craft) {

    if (!craft.memory.cargo) craft.memory.cargo = {
        lifeSupport: craft.flags.renderLifeSupport,
        dockableFields: {},
    }
    let memory = craft.memory.cargo

    // Build the list of all fields that belong in Cargo.
    // This changes based on whether renderLifeSupport === true
    //
    if (!memory.cargoFields || memory.lifeSupport !== craft.flags.renderLifeSupport) {
        
        // Default
        let cargoSinkTypes = ['tank', 'cargo', 'building']
        let cargoProcTypes = []
        
        // Life Support Fields
        if (!craft.flags.renderLifeSupport) {
            cargoSinkTypes.push("lifeSupport")
            cargoProcTypes = cargoProcTypes.concat(["electricity", "water", "atmosphere"])
        }
        let cargoFields = []
        cargoSinkTypes.forEach(type => {
            cargoFields = cargoFields.concat(data.sinksOfType(type))
        })
        cargoProcTypes.forEach(type => {
            cargoFields = cargoFields.concat(data.procsOfType(type))
        })
        
        // Propellant Fields
        if (!craft.flags.renderNavigation && !craft.flags.renderDock) {
            cargoFields = cargoFields.concat(data.sinksOfType('propellant'))
        }
        
        memory.cargoFields = cargoFields
        memory.lifeSupport = craft.flags.renderLifeSupport
    }

    // Build the list of cargo fields with balance for this craft
    //
    let activeFields = craft.procsIndex.concat(craft.sinksIndex)
    let fields = activeFields.filter(f => memory.cargoFields.includes(f) && craft.field(f) > 0)

    // If fields are different, erase and rebuild menu
    //
    if (JSON.stringify(fields) !== memory.fields || memory.refresh) {        
        memory.fields = JSON.stringify(fields)
        memory.refresh = false
        let container = $(`#${craft.name}Cargo`)
        container.empty()
        
        if (fields.length === 0) return

        $(`<div class="sectionHeader">CARGO</div>`).appendTo(container)
        fields.forEach(field => {
            let fieldData = data.data(field)
            let line = builders.addLine(craft.name + field, fieldData.label, container)

            if (field === "O2Tank") builders.addFlexButton(
                craft.name + "O2Vent", "Vent", line, "purple"
            ).mousedown( function() {
                craft.flags.O2Venting = true
            }).mouseup( function() {
                craft.flags.O2Venting = false
            })

            let amount = (data.type(field) === 'proc') ? 1 : fieldData.units 
            memory.dockableFields[field] = new Dockable(craft, field, amount, line)
        })
    }

    // Update each menu item with the current value and dock status
    //
    if (fields.length > 0) {
        fields.forEach(field => {
            memory.dockableFields[field].step(craft.field(field), craft.dockedWith)
        })
    }
}
