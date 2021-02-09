import * as data from "../data.js"
import * as builders from "../builders.js"
import Dockable from "./dockableField.js"

export default function renderPropellant(craft) {

    if (!craft.memory.propellant) craft.memory.propellant = {dockableFields: {}}
    let memory = craft.memory.propellant

    if (!memory.initialized) {
        let dock = $(`#${craft.name}Dock`)
        $(`<div class="sectionHeader">PROPELLANT DEPOT</div>`).appendTo(dock)
        let p = builders.addMenu(craft.name + "Propellant", "Propellant Depot", dock)
        builders.addFlexButton(craft.name + "Autofill", "Fill", p).css('display', 'none')
        memory.initialized = true
    }

    // Propellant
    let fields = data.sinksOfType('propellant').filter(p => craft.sinksIndex.includes(p))

    // Update menu
    if (JSON.stringify(fields) !== memory.fields) {
        let pId = craft.name + "Propellant"
        let container = $(`#${pId}Wrapper`)
        if (fields.length === 0) {
            $(`#${pId}Wrapper`).css('display', 'none')
        } else {
            $(`#${pId}Wrapper`).css('display', 'inline')
            let menu = $(`#${pId}Menu`)
            menu.empty()
            fields.forEach(field => {
                let d = data.data(field)
                let line = builders.addLine(pId + field, d.label, menu)
                memory.dockableFields[field] = new Dockable(craft, field, d.units, line)
            })
        }
        memory.fields = JSON.stringify(fields)
    }

    // Step updates
    if (fields.length > 0) {

        // Update Dockable Fields
        fields.forEach(field => {
            let val = (craft.name === "CAPE") ? "" : craft.field(field)
            memory.dockableFields[field].step(val, craft.dockedWith)
        })

        // Autofill button
        if (craft.dockedWith !== memory.autofill) {
            if (!craft.dockedWith) {
                $(`#${craft.name}AutofillButton`)
                    .css("display", "none")
                    .off()
            } else {
                let ship = craft.game.ships[craft.dockedWith]
                $(`#${craft.name}AutofillButton`)
                    .css("display", "inline")
                    .click(function() {ship.autofill()})
            }
            memory.autofill = craft.dockedWith
        }
    }
}
