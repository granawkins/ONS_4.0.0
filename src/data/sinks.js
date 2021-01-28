const LIFE_SUPPORT_UNITS = 1e5
const TANK_UNITS = 1e4
const CARGO_UNITS = 1e4
const BUILDING_UNITS = 1e7

export const sinks = {
    // Crew
    labor: {type: "crew", label: "Labor Hours"},

    // Atmosphere
    O2: {type: "atmosphere", label: "Oxygen", xfer: 1, ration: true, color: 'lightblue'},
    H2O: {type: "atmosphere", label: "Water Vapor", xfer: 1, ration: true, color: 'blue'},
    CO2: {type: "atmosphere", label: "Carbon Dioxide", xfer: 1, ration: true, color: 'orange'},
    N2: {type: "atmosphere", label: "Nitrogen", xfer: 1, ration: true, color: 'white'},
    
    // Life Support
    hF: {type: "lifeSupport", label: "Food", units: 1e5},
    waPot: {type: "lifeSupport", label: "Potable Water", units: LIFE_SUPPORT_UNITS},
    waGr: {type: "lifeSupport", label: "Gray Water", units: LIFE_SUPPORT_UNITS},
    waWst: {type: "lifeSupport", label: "Waste Water", units: LIFE_SUPPORT_UNITS},
    wst: {type: "lifeSupport", label: "Solid Waste", units: LIFE_SUPPORT_UNITS},
    elec: {type: "lifeSupport", label: "Electricity", ration: true},

    // Cargo
    O2Tank: {type: "tank", label: "Oxygen Tank", units: TANK_UNITS}, 
    H2Tank: {type: "tank", label: "Hydrogen Tank", units: TANK_UNITS},
    CO2Tank: {type: "tank", label: "Carbon Dioxide Tank", units: TANK_UNITS},
    CH4Tank: {type: "tank", label: "Methane Tank", units: TANK_UNITS},
    nrWst: {type: "cargo", label: "Non-Recyclable Waste", units: CARGO_UNITS},
    habComp: {type: "building", label: "Habitat Components", units: BUILDING_UNITS},
    PVComp: {type: "building", label: "PV Components", units: BUILDING_UNITS},
    
    // Propellant
    LO2: {type: "propellant", label: "Liquid Oxygen", units: 1e8}, // O2
    LH2: {type: "propellant", label: "Liquid Hydrogen", units: 1e8}, // 
    MMH: {type: "propellant", label: "Monomethylhydrozine", units: 1e6}, // Monomethylhydrozine
    N2O4: {type: "propellant", label: "Dinitrogen Tetroxide", units: 1e6}, // Dinitrogen Tetroxide  
}