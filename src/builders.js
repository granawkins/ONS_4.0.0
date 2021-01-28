import * as data from "./data.js"
import * as helpers from "./helpers.js"
import Dockable from "./screens/dockableField.js"

export const addMenu = (id, label_text, container) => {
    let wrapper =   $(`<div id="${id}Wrapper"></div>`)
        .appendTo(container)
    
    let line = $(`<div id=${id} class="line menuTitle"></div>`)
        .appendTo(wrapper)
        .click(function(event){
            if (event.target.nodeName !== "BUTTON") {
                $(`#${id}Menu`).slideToggle()
            }
        })
    
    let title = $(`<p class="flexItem">${label_text}</p>`)
        .appendTo(line)
    
    let menu = $(`<div id="${id}Menu" class="menu"></div>`).appendTo(wrapper)
    
    return line
}

export const addLine = (id, label_text, container) => {
    let wrapper = $(`<div id="${id}Wrapper"></div>`)
        .appendTo(container)
    
    let line = $(`<div id="${id}" class="line"></div>`)
        .appendTo(wrapper)
    
    let title = $(`<p class="flexItem">${label_text}</p>`)
        .appendTo(line)
    
    return line
}

export const addFlexButton = (id, label_text, location, color) => {
    let button = $(`<button id="${id}Button">${label_text}</button>`)
        .css({"color": color, "font-size": "0.8em"})
        .appendTo(location)
    return button
}

export const addFlexValue = (id, container) => {
    let value = $(`<p id="${id}Value" class="flexItem"></p>`)
        .appendTo(container)
    
    return value
}

export const addFlexSelector = (id, location, options) => {
    let selector = $(`<select id="${id}Selector" class="flexItem"></select>`)
        .appendTo(location)

    options.forEach(option => {
        selector.append(`<option value=${option[1]}>${option[0]}</option>`)
    })

    return selector
}
  
export const addFlexText = (id, text, location) => {
    let textItem = $(`<p id=${id + "Text"} class="flexItem">${text}</p>`)
        .appendTo(location)

    return textItem
}

export const addDockButton = (value, transfer, from, to, field, units=[[1, 1],[10, 10]]) => {
    let wrapper = $(`<div id="${id + field}DockButton"></div>`).addClass("dockButton")

        $(`<span>${value}</span>`).appendTo(wrapper)
        let arrow = (data.type(from) === "base") ? "&larr;" : "&rarr;"

        $(`<button>${arrow}</button>`)
            .appendTo(wrapper)
            .click(function() {
                transfer(from, to, field, $(`#${id + field}ButtonSelector`).val())
            })

        let selector = $(`<select id="${id + field}ButtonSelector" class="flexItem"></select>`)
            .appendTo(wrapper)

        units.forEach(option => {
            selector.append(`<option value=${option[1]}>${option[0]}</option>`)
        })

    return wrapper
}

export const addFlexSlider = (id, container, value = 100, range = [0, 100]) => {
    let slider = $(`<input 
        type="range" 
        min="${range[0]}" 
        max="${range[1]}" 
        value="${value}" 
        class="slider flexItem" 
        id="${id}Slider"
    >`).appendTo(container)

    return slider
}

export const addMachine = (craft, proc, container) => {
    let procData = data.data(proc)
    let line = addMenu(craft.name + proc, procData.label, container)
    craft.memory.dockableFields[proc] = new Dockable(craft, proc, 1, line)

    let menu = $(`#${craft.name + proc}Menu`)

    // Cycle through flows
    for (let i = 0; i < procData.flows.length; i++) {
        
        // Add sliders for each adjustable rate property
        if (procData.type !== 'biological') {
            let flow = procData.flows[i]
            let rId = craft.name + proc + flow[0]
            let line = addLine(rId, flow[0], menu)
            addFlexSlider(rId, line).change(function() {
                craft.setRate(proc, this.value, i)
                craft.flags.refreshFlows = true
            })
            addFlexValue(rId, line)
        }
    }
}