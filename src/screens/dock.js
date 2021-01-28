import * as data from "../data.js"
import * as builders from "../builders.js"
import Dockable from "./dockableField.js"

export default function renderDock(craft) {

    if (craft.type !== 'base') return null;

    if (!craft.memory.dock) craft.memory.dock = {dockableFields: {}}
    let memory = craft.memory.dock

    if (!memory.initialized) {
        let dock = $(`#${craft.name}Dock`)
        $(`<div class="sectionHeader">DOCK</div>`).appendTo(dock)
        $(`<div id="${craft.name}DockBox" class="dockBox"></div>`).appendTo(dock)
        let p = builders.addMenu(craft.name + "Propellant", "Propellant Depot", dock)
        builders.addFlexButton(craft.name + "Autofill", "Fill", p).css('display', 'none')

        memory.initialized = true
    }

    // Dock Box
    if (craft.flags.refreshDock || JSON.stringify(craft.ships) !== memory.ships) {
        
        let dockBox = $(`#${craft.name}DockBox`)
        dockBox.empty()
        craft.ships.forEach(ship => {
            let bId = craft.name + "Dock" + ship
            let buttonWrapper = $(`<div></div>`).appendTo(dockBox)
            
            // Button Objects
            let dockButton = builders.addFlexButton(bId, ship, buttonWrapper)
            let airlockButton = builders.addFlexButton(bId + "Air", "Airlock", buttonWrapper)
                .css("display", "none")
            let unloadAllButton = builders.addFlexButton(bId + "All", "Unload All", buttonWrapper)
                .css("display", "none")

            // Dock
            dockButton.click(function() {
                craft.game.dockWith(craft.name, ship)
                if (craft.dockedWith) {
                    dockButton.addClass('flexHighlight')
                    unloadAllButton.css("display", "inline")

                    // Airlock button
                    if (craft.dockedWith &&
                        craft.game.ships[ship].flags.renderLifeSupport && 
                       (craft.flags.renderLifeSupport || craft.name === "CAPE")
                    ) {
                        airlockButton.click(function() {
                            craft.game.airlockWith(craft.name, craft.dockedWith)
                            if (craft.airlockedWith) {
                                airlockButton.addClass('flexHighlight')
                            } else {
                                airlockButton.removeClass('flexHighlight')
                            }
                        }).css("display", "inline")
                    }
                } else {
                    dockButton.removeClass('flexHighlight')
                    unloadAllButton.css("display", "none")
                    airlockButton.css("display", "none")
                }
            })

            console.log(craft.dockedWith)
            console.log(craft.game.ships[ship].flags.renderLifeSupport)
            console.log(craft.flags.renderLifeSupport)
            console.log(craft.name)

            // Unload all button
            unloadAllButton.click(function() {
                craft.game.ships[ship].unloadAll()
            })
        })
        
        memory.ships = JSON.stringify(craft.ships)
        craft.flags.refreshDock = false
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
