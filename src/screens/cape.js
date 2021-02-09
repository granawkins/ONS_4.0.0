import * as data from "../data.js"
import * as builders from "../builders.js"
import { SINK_UNITS, PROPELLANT_UNITS } from "../helpers.js"
import renderCargo from "./cargo.js"

export const MASS_UNITS = [
    ["10kg", 10000], 
    ["100kg", 100000], 
    ["1t", 1000000], 
    ["10t", 10000000], 
    ["100t", 100000000]
]

export default function renderCape(craft) {

    if (!craft.memory.cape) craft.memory.cape = {}
    let memory = craft.memory.cape

    // Get list
    // Render available fields in order

    if (!craft.flags.capeInitialized || craft.flags.refreshCape || 
        craft.dockedWith !== memory.dockedWith) {

        $(`#CAPEFields`).empty()
        craft.memory.fields = {
            buttons: [],
            dockedWith: null,
            airlockedWith: null,
        }

        const addField = (field, units, container=$(`#CAPEFields`)) => {
            let fId = "CAPE" + field
            let line = $(`<div id="${fId}Line" class="line"></div>`)
                .appendTo(container)
            
            let title = $(`<p class="flexItem"></div>`)
                .text(data.data(field).label)
                .appendTo(line)

            let block = $(`<div class="flexItem"></div>`).appendTo(line)
            // let inf = $(`<p class="flexItem">&#8734</p>`).appendTo(block)
            
            units.forEach(unit => {
                let bId = fId + unit[0] + "Button"
                let button = $(`<button id="${bId}" class="flexItem">${unit[0]}</button>`)
                    .appendTo(block)
                    .css("display", "none")

                craft.memory.fields.buttons.push({
                    field: field,
                    bId: bId,
                    increment: unit[1]
                })
            })
        }

        $(`<div class="sectionHeader">CREW</div>`).appendTo($(`#CAPEFields`))
        addField("human", [["1", 1]])

        $(`<div class="sectionHeader">LIFE SUPPORT</div>`).appendTo($(`#CAPEFields`))
        data.sinksOfType("lifeSupport").forEach(sink => {
            if (craft.sinksIndex.includes(sink)) {
                addField(sink, MASS_UNITS.slice(1, 2))
            }
        })
        craft.procsIndex.forEach(proc => {
            if (proc !== "human") {
                addField(proc, [[1, 1]])
            }
        })

        $(`<div class="sectionHeader">CARGO</div>`).appendTo($(`#CAPEFields`))
        
        data.sinksOfType("tank").forEach(sink => {
            if (craft.sinksIndex.includes(sink)) {
                addField(sink, MASS_UNITS.slice(1, 2))
            }
        })
        data.sinksOfType("building").forEach(sink => {
            if (craft.sinksIndex.includes(sink)) {
                addField(sink, MASS_UNITS.slice(3,5))
            }
        })


        renderCargo(craft)
        
        craft.flags.capeInitialized = true;
        craft.flags.refreshCape = false;
        memory.dockedWith = craft.dockedWith
    }

    // Compile 'active buttons' list
    let airlockFields = ['human']

    if (craft.dockedWith !== craft.memory.fields.dockedWith ||
        craft.airlockedWith !== craft.memory.fields.airlockedWith) 
    {
        craft.memory.fields.buttons.forEach(button => {
            let b = $(`#${button.bId}`).off()
            let connected = (airlockFields.includes(button.field)) 
                ? craft.airlockedWith 
                : craft.dockedWith
            if (connected) {
                b.css("display", "inline").click(() => {
                    craft.game.transfer(craft.name, connected, button.field, button.increment)
                })
            }
        })
        craft.memory.fields.dockedWith = craft.dockedWith
        craft.memory.fields.airlockedWith = craft.airlockedWith

    }

}