import { sinks } from "./data/sinks.js"
import { procs } from "./data/procs.js"
import { bases } from "./data/bases.js"
import { ships } from "./data/ships.js"
import { projects } from "./data/projects.js"

// ------------------------------------
// ------------   CRAFTS   ------------
// -------- ( BASES and SHIPS) --------
// ------------------------------------

let dataCache = {}

export const sinksData = () => {return sinks}
export const procsData = () => {return procs}

export const data = (id) => {

    if (!dataCache[id]) {
        dataCache[id] = {}
    }
    if (!dataCache[id].data) {
        let dataType = type(id)
        let output = {}
        switch(dataType) {
            case "sink" : output = sinks[id]; break;
            case "proc" : output = procs[id]; break;
            case "base" : output = bases[id]; break;
            case "ship" : output = ships[id]; break;
            case "project" : output = projects[id]; break;
            default: break;
        }
        dataCache[id].data = output
    } 
    return dataCache[id].data
}

export const type = (id) => {
    if (!dataCache[id]) {
        dataCache[id] = {}
    }
    if (!dataCache[id].type) {
        let output = ""
        if (Object.keys(sinks).includes(id)) output = 'sink'
        if (Object.keys(procs).includes(id)) output = 'proc'
        if (Object.keys(bases).includes(id)) output = 'base'
        if (Object.keys(ships).includes(id)) output = 'ship'
        if (Object.keys(projects).includes(id)) output = 'project'
        dataCache[id].type = output
    }
    return dataCache[id].type
}

export const ofDataType = (dataType) => {
    switch(dataType) {
        case "sink" : return Object.keys(sinks);
        case "proc" : return Object.keys(procs);
        case "base" : return Object.keys(bases);
        case "ship" : return Object.keys(ships);
        case "project" : return Object.keys(projects);
        default: return null;    
    }
}

export const propellantFor = (craft, origin, destination) => {
    let fields = shipsData[craft].routes[origin][destination]
    let propellant = sinksOfType("propellant")
    let propellantFields = {}
    Object.keys(fields).forEach(field => {
        if (propellant.includes(field)) {
            propellantFields[field] = fields[field]
        }
    })
    return propellantFields
}

export const craftType = (craft) => {
    if (shipsData[craft]) {
        return "ship"
    } else if (basesData[craft]) {
        return "base"
    }
}

export const sinksOfType = (type) => {
    let outputs = []
    Object.keys(sinks).forEach(sink => {
        if (data(sink).type === type) outputs.push(sink)
    })
    return outputs
}

export const procsOfType = (type) => {
    let outputs = []
    Object.keys(procs).forEach(proc => {
        if (data(proc).type === type) outputs.push(proc)
    })
    return outputs
}

export const fieldType = (field) => {
    return data(field).type
}


// ------------------------------------
// -----------   PROJECTS   -----------
// ------------------------------------

// export const projectsData = {
//     unlockO2Tank: {
//         label: "Oxygen Tank",
//         description: "Pressurized O2 that can be vented into a habitat.",
//         cost: [["labor", 50]],
//         effect: function(craft) {
//             let cape = craft.game.bases["CAPE"]
//             cape.set("O2Tank")            
//             cape.flags.refreshCape = true

//             let newProjects = craft.projects.slice()
//             newProjects.push("unlockFuelCell")
//             craft.projects = newProjects
//         },
//     },
//     unlockFuelCell: {
//         label: "12 kW Fuel Cell",
//         description: "Generate electricity by converting O2 and H2 into potable water",
//         cost: [["labor", 200]],
//         effect: function(craft) {
//             let cape = craft.game.bases["CAPE"]
//             cape.set("fuelCell")         
//             cape.set("H2Tank")   
//             cape.flags.refreshCape = true

//             let newProjects = craft.projects.slice()
//             newProjects = newProjects.concat(["unlockOgs", "unlockWrs", "unlockScrub"])
//             craft.projects = newProjects
//         },
//     },
//     unlockOgs: {
//         label: "Oxygen Generator",
//         description: "Produces O2 and H2 from potable water",
//         cost: [["labor", 500]],
//         effect: function(craft) {
//             let cape = craft.game.bases["CAPE"]
//             cape.set("ogs")         
//             cape.flags.refreshCape = true

//             if (cape.sinksIndex.includes("scrub") && cape.sinksIndex.includes("wrs")) {
//                 let newProjects = craft.projects.slice()
//                 newProjects.push("unlockHabComp")
//                 craft.projects = newProjects
//             }
//         },
//     },
//     unlockWrs: {
//         label: "Water Recycling System",
//         description: "Produces usable water from waste water",
//         cost: [["labor", 500]],
//         effect: function(craft) {
//             let cape = craft.game.bases["CAPE"]
//             cape.set("wrs")         
//             cape.flags.refreshCape = true

//             if (cape.sinksIndex.includes("ogs") && cape.sinksIndex.includes("scrub")) {
//                 let newProjects = craft.projects.slice()
//                 newProjects.push("unlockHabComp")
//                 craft.projects = newProjects
//             }
//         },
//     },
//     unlockScrub: {
//         label: "CO2 Scrubber",
//         description: "Removes CO2 from the atmosphere",
//         cost: [["labor", 500]],
//         effect: function(craft) {
//             let cape = craft.game.bases["CAPE"]
//             cape.set("scrub")         
//             cape.flags.refreshCape = true

//             if (cape.sinksIndex.includes("ogs") && cape.sinksIndex.includes("wrs")) {
//                 let newProjects = craft.projects.slice()
//                 newProjects.push("unlockHabComp")
//                 craft.projects = newProjects
//             }
//         },
//     },
//     unlockHabComp: {
//         label: "Orbital Habitat Components",
//         description: "Raw materials to construct a habitat",
//         cost: [["labor", 1000]],
//         effect: function(craft) {
//             let cape = craft.game.bases["CAPE"]
//             cape.set("habComp")         
//             cape.flags.refreshCape = true

//             let newProjects = craft.projects.slice()
//             newProjects.push("setupLEOHab")
//             craft.projects = newProjects

//             craft.game.addCraft("HLLV1")
//         },
//     },
//     setupLEOHab: {
//         label: "Setup LEO Habitat",
//         description: "Station crew at LEO",
//         const: [["labor", 1000], ["habComp", 1000000000]],
//         effect: function(craft) {
//             craft.flags.renderLifeSupport = true
//         }
//     }
// }