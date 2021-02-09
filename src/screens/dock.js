import * as data from "../data.js"
import * as builders from "../builders.js"
import Dockable from "./dockableField.js"

export default function renderDock(craft) {

    if (craft.type === 'base') return null;

    if (!craft.memory.dock) craft.memory.dock = {dockableFields: {}}
    let memory = craft.memory.dock

    // When Docked, show dock line
    if (craft.dockedWith !== memory.dockedWith) {
        let dock = $(`#${craft.name}Dock`).empty()
        if (!craft.dockedWith) {
            dock.css('display', 'none')
        } else {
            dock.css('display', 'block')
            let base = craft.game.bases[craft.dockedWith]

            // Airlock
            if (craft.flags.renderLifeSupport &&
                (base.name === 'CAPE' || base.flags.renderLifeSupport)
            ) {
                let bId = craft.name + "Airlock"
                let alButton = builders.addFlexButton(bId, "Airlock", dock)
                alButton.click(function() {
                    craft.game.airlockWith(base.name, craft.name)
                    if (craft.airlockedWith) {
                        alButton.addClass('flexHighlight')
                    } else {
                        alButton.removeClass('flexHighlight')
                    }
                })
            }
            // Unload All
            let uId = craft.name + "UnloadAll"
            let uaButton = builders.addFlexButton(uId, "Unload All", dock).click(function() {
                craft.unloadAll()
            })
            let uaCost = $(`<i id="${uId}Cost">: 0h</i>`).appendTo(uaButton)
        }
        memory.dockedWith = craft.dockedWith
    }

    // update Unload All cost based on payload
    let payload = craft.payload
    if (craft.flags.renderLifeSupport) {
        data.sinksOfType('atmosphere').forEach(gas => {
            payload = payload - craft.field(gas)
        })
    }
    payload = Math.round(payload)
    if (payload !== memory.payload) {
        let hours = payload / 100000 // Workers move 100 kg/hr
        let bId = craft.name + "UnloadAllCost"
        $(`#${bId}`).text(hours + "h")
        memory.payload = payload
    }
}