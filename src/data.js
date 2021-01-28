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

// export const shipsData = {
//     SS1: {
//         label: "Space Shuttle 1",
//         location: "CAPE",
//         volume: 75,
//         flags: {
//             renderNavigation: true,
//             renderLifeSupport: true,
//             renderCrew: true,
//             renderDock: true,
//             renderPropellant: true,
//             renderCargo: true,
//         },
//         routes: {
//             CAPE_LEO: {
//                 eta: 0.5, // Days
//                 label: "Low Earth Orbit",
//                 payload: 2.75e7,
//                 propellant: {
//                     LO2: 6e8,
//                     LH2: 1e8,
//                 }
//             },
//             CAPE_LEO_CAPE: {
//                 eta: 0.5, // Days
//                 label: "LEO - Return",
//                 payload: 1.4e7,
//                 propellant: {
//                     LO2: 6e8,
//                     LH2: 1e8,
//                     MMH: 2e6,
//                     N2O4: 3e6,
//                 }
//             },
//             LEO_CAPE: {
//                 eta: 0.5, // Days
//                 label: "Cape Canaveral, FL",
//                 payload: 1.4e7,
//                 propellant: {
//                     MMH: 2e6,
//                     N2O4: 3e6,
//                 },
//             },
//             LEO_GSO: {
//                 eta: 7,
//                 label: "Geostationary Orbit",
//                 payload: 2.3e6,
//                 propellant: {
//                     MMH: 2e6,
//                     N2O4: 3e6,
//                 },
//             },
//             GSO_LEO: {
//                 eta: 7,
//                 Label: "Low Earth Orbit",
//                 payload: 2.3e6,
//                 propellant: {
//                     MMH: 2e6,
//                     N2O4: 3e6,
//                 },
//             },
//           },
//     },
//     HLLV1: {
//         label: "Heavy Lift Launch Vehicle 1",
//         location: "CAPE",
//         flags: {},
//     }
// }

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

// export const basesData = {
//     CAPE: {
//         label: "Cape Canaveral, FL",
//         procsIndex: [],
//         // procsQty: [Infinity],
//         sinksIndex: ["waPot", "hF", "LO2", "LH2", "MMH", "N2O4"],
//         // sinksBal: [Infinity],
//         flags: {
//             renderDock: true,
//             refreshDock: true,
//         },
//     },
//     LEO: {
//         label: "Low Earth Orbit",
//         volume: 75,
//         capacity: 200,
//         sinksIndex: ["labor"],
//         sinksBal: [0],
//         projects: ["unlockO2Tank"],
//         flags: {
//             renderCrew: true,
//             renderDock: true,
//             renderCargo: true,
//             renderProjects: true,
//         },
//     },
//     L5: {
//         label: "Colony at L5",
//         flags: {}
//     },
//     GSO: {
//         label: "Geostationary Orbit",
//         flags: {}
//     },
//     LPO: {
//         label: "Lunar Parking Orbit",
//         flags: {}
//     },
//     LS: {
//         label: "Lunar Surface",
//         flags: {}
//     },
//     L2: {
//         label: "L2 Station",
//         flags: {}
//     },
// }

export const craftType = (craft) => {
    if (shipsData[craft]) {
        return "ship"
    } else if (basesData[craft]) {
        return "base"
    }
}

// ------------------------------------
// ------------   FIELDS   ------------
// -------- ( PROCS and SINKS) --------
// ------------------------------------
// export const sinksData = {
//     // Crew
//     labor: {type: "crew", label: "Labor Hours"},

//     // Atmosphere
//     N2: {type: "atmosphere", label: "Nitrogen", units: 1},
//     O2: {type: "atmosphere", label: "Oxygen", units: 1},
//     H2O: {type: "atmosphere", label: "Water Vapor", units: 1},
//     CO2: {type: "atmosphere", label: "Carbon Dioxide", units: 1},
    
//     // Life Support
//     hF: {type: "lifeSupport", label: "Food"},
//     waPot: {type: "lifeSupport", label: "Potable Water"},
//     waGr: {type: "lifeSupport", label: "Gray Water"},
//     waWst: {type: "lifeSupport", label: "Waste Water"},
//     wst: {type: "lifeSupport", label: "Solid Waste"},
//     elec: {type: "lifeSupport", label: "Electricity"},

//     // Cargo
//     O2Tank: {type: "cargo", label: "Oxygen Tank"}, 
//     H2Tank: {type: "cargo", label: "Hydrogen Tank"},
//     nrWst: {type: "cargo", label: "Non-Recyclable Waste"},
//     PVComp: {type: "cargo", label: "PV Components"},
//     HabComp: {type: "cargo", label: "Habitat Components"},
    
//     // Propellant
//     LO2: {type: "propellant", label: "Liquid Oxygen"}, // O2
//     LH2: {type: "propellant", label: "Liquid Hydrogen"}, // 
//     MMH: {type: "propellant", label: "Monomethylhydrozine"}, // Monomethylhydrozine
//     N2O4: {type: "propellant", label: "Dinitrogen Tetroxide"}, // Dinitrogen Tetroxide  
// }

export const sinksOfType = (type) => {
    let outputs = []
    Object.keys(sinks).forEach(sink => {
        if (data(sink).type === type) outputs.push(sink)
    })
    return outputs
}

// export const procsData = {
//     human: {
//         label: "Humans",
//         type: 'biological',
//         flows: [
//             ["Respiration", [["O2", 686]], [["CO2", 1]]], // in/amt, out/ratio
//             ["Hydration",   [["waPot", 2000]], [["waWst", 1]]],
//             ["Bathing",   [["waPot", 8000]], [["waWst", 1]]],
//             ["Metabolism",   [["hF", 2564]], [["wst", 1]]],
//             ["Domestic",    [["waGr", 5e4]], [["waWst", 1]]]
//         ],
//         weight: 100000,
//     },

//     fuelCell: {
//         // I know the Space shuttle used 12kW fuel cell but the numbers are a TOTAL GUESS
//         label: "12KW Fuel Cell",
//         capacity: 12000,
//         type: 'electricity',
//         flows: [
//             ["Reaction", 
//                 [["O2Tank", 1600], ["H2Tank", 100]],
//                 [["waPot", .98]]] // Calculate electricity separately
//         ],
//         weight: 1e6, // 1 ton (guess)
//     },

//     // REFERENCES FOR LIFE SUPPORT SYSTEM:
//     // 1. https://en.wikipedia.org/wiki/ISS_ECLSS
//     // 2. https://ntrs.nasa.gov/citations/20050207456 
//     // 3. https://sites.nationalacademies.org/cs/groups/depssite/documents/webpage/deps_063596.pdf 
//     //
//     // Designed to support 6 people with ~40% safety margin
//     wrs: {
//         label: "Water Recycler",
//         type: 'water',
//         flows: [ 
//             ["Urine_Processing", 
//                 [["waWst", 9000], ["elec", 424]], 
//                 [["waGr", .7], ["nrWst", .3]]],
//             ["Water_Processing", 
//                 [["waGr", 13600], ["elec", 343]], 
//                 [["waPot", .85], ["nrWst", .15]]]
//         ],
//         weight: 5e6, // 5 tons (guess)
//     },
//     ogs: {
//         label: "Oxygen Generator",
//         type: 'atmosphere',
//         flows: [
//             ["Operation", 
//                 [["waPot", 9775], ["elec", 3573]], // Electricity in Watts
//                 [["O2", .94], ["H2", .06]]], // H2/O2 1:16 mass
//         ],
//         weight: 5e6, // 5 tons (guess)
//     },
//     scrub: {
//         // https://sites.nationalacademies.org/cs/groups/depssite/documents/webpage/deps_063596.pdf (p3)
//         label: "CO2 Scrubber",
//         type: 'atmosphere',
//         flows: [
//             ["Normal_Operation",
//                 [["CO2", 2840],["elec", 6200]],
//                 // CO2 is vented, no products
//             ],
//             ["Sabatier_Operation",
//                 [["CO2", 3400], ["H2", 610], ["elec", 7400]],
//                 [["waPot", .7], ["CH4", .3]]],
//         ],
//         weight: 5e6, // 5 tons (guess)
//     },
// }

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