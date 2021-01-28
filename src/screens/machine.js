import * as builders from "../builders.js"
import { data, type } from "../data.js"
import { massUnits } from "../helpers.js"
import Dockable from "./dockableField.js"

export default class Machine {
    constructor(machine, craft, container) {
        this.machine = machine
        this.type = data(machine).type
        this.flows = JSON.parse(JSON.stringify(data(this.machine).flows))
        this.craft = craft
        this.init(craft, container)
    }
    
    init(craft, container) {
        let id = this.craft.name + this.machine
        let wrapper = $(`<div id="${id}Wrapper"></div>`).appendTo(container)

        let line = builders.addMenu(id, data(this.machine).label, wrapper)
        craft.memory.dockableFields[this.machine] = new Dockable(
            craft, this.machine, 1, line
        )

        let menu = $(`#${id}Menu`)
        

        for (let i = 0; i < this.flows.length; i++) {
            let flow = this.flows[i]
            let rId = id + flow.id
            
            // Add rate line
            let line = builders.addLine(rId, flow.label, menu)
            if (this.type !== 'biological') {

                // Add sliders for each adjustable rate property
                let machine = this.machine
                builders.addFlexSlider(rId, line).change(function() {
                    $(`#${rId}Value`).text(Math.round(this.value) + '%')
                }).mousedown(function() {
                    craft.memory[rId + "mousedown"] = true
                }).mouseup(function() {
                    craft.memory[rId + "mousedown"] = false
                    craft.setRate(machine, Math.round(this.value), i)
                    craft.flags.refreshFlows = true
                })
            }
            builders.addFlexValue(rId, line)

            // Add flows line
            let flowsLine = $(`<div class="line" id=${id}Flows></div>`)
                .appendTo(menu)
                .css("font-size", "0.8em")
            
            let addFlowsList = (label, data, container) => {
                // $(`<p class="flexItem faint">${label}</p>`).appendTo(container)
                let sinks = $(`<div id="${rId + label}" class="flexItem"></div>`)
                    // .css({"display" : "flex" , "flex-direction" : "column"})
                    .appendTo(container)

                Object.keys(data).forEach(sink => {
                    let line = $(`<p class="line">${sink}: </p>`)
                        .appendTo(sinks)

                    $(`<p class="flexItem" id=${rId + sink}></p>`)
                        .appendTo(line)
                })
            }

            addFlowsList("IN", flow.in, flowsLine)
            $(`<p class="flexItem">-></p>`).appendTo(flowsLine)

            addFlowsList("OUT", flow.out, flowsLine)
            
            if (this.type === 'electricity') {
                let container = $(`#${rId}OUT`)
                let sink = "elec"
                let line = $(`<p class="line">${sink}: </p>`)
                        .appendTo(container)

                    $(`<p class="flexItem" id=${rId + sink}></p>`)
                        .appendTo(line)
            }
        }
    }

    step(craft) {

        let connectedTo = (this.type === 'biological') ? craft.airlockedWith : craft.dockedWith

        // Quantity, Dock button
        craft.memory.dockableFields[this.machine].step(
            craft.field(this.machine), connectedTo
        )

        let id = craft.name + this.machine
        if ($(`#${id}Menu`).css('display') !== 'none') {
            
            craft.flows[craft.procsIndex.indexOf(this.machine)].forEach(flow => {
                let rId = id + flow.id

                if (JSON.stringify(flow) !== craft.memory[rId]) {

                    // Rate
                    let slider = $(`#${rId}Slider`)
                    let testRate = Math.round(flow.rate * 100)
                    if (slider.val() !== testRate && !craft.memory[rId + "mousedown"]) {
                        slider.val(testRate)
                        $(`#${rId}Value`).text(testRate + "%")
                    }

                    // Inflows
                    let massFlow = 0
                    Object.keys(flow.in).forEach(s => {
                        let daily = flow.in[s].capacity * flow.rate
                        massFlow += daily
                        $(`#${rId + s}`).text(massUnits(daily) + "/d")
                    })

                    // Outflows
                    Object.keys(flow.out).forEach(s => {
                        let daily = massUnits(flow.out[s].split * massFlow)
                        $(`#${rId + s}`).text(daily + "/d")
                    })

                    // Electricity
                    if (this.type === "electricity") {
                        let output = Math.round(flow.rate * data(this.machine).capacity)
                        $(`#${rId}elec`).text(output + "W")
                    }
                    craft.memory[rId] = JSON.stringify(flow)
                }
            })
        }
    }
}