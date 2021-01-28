export const procs = {
    human: {
        label: "Humans",
        type: 'biological',
        // flows: [
        //     ["Respiration", [["O2", 686]], [["CO2", 1]]], // in/amt, out/ratio
        //     ["Hydration",   [["waPot", 2000]], [["waWst", 1]]],
        //     ["Bathing",   [["waPot", 8000]], [["waWst", 1]]],
        //     ["Metabolism",   [["hF", 2564]], [["wst", 1]]],
        //     ["Domestic",    [["waGr", 5e4]], [["waWst", 1]]]
        // ],
        flows: [{
            id: 'resp',
            label: "Breathe",
            rate: 1,
            in: {O2: {capacity: 686}},
            out: {CO2: {split: 1}},
        },{
            id: 'hydr',
            label: "Drink",
            rate: 1,
            in: {waPot: {capacity: 2000}},
            out: {waWst: {split: 1}}
        },{
            id: 'bath',
            label: "Wash",
            rate: 1, 
            in: {waPot: {capacity: 8000}},
            out: {waWst: {split: 1}},
        },{
            id: 'meta',
            label: "Eat",
            rate: 1,
            in: {hF: {capacity: 2564}},
            out: {wst: {split: 1}},
        }],
        weight: 100000,
    },

    fuelCell: {
        // I know the Space shuttle used 12kW fuel cell but the numbers are a TOTAL GUESS
        label: "12KW Fuel Cell",
        capacity: 12000,
        type: 'electricity',
        // flows: [
        //     ["Reaction", 
        //         [["O2Tank", 1600], ["H2Tank", 100]],
        //         [["waPot", .98]]] // Calculate electricity separately
        // ],
        flows: [{
            id: 'generate',
            label: "Generate",
            rate: 1,
            in: {O2Tank: {capacity: 1600}, H2Tank: {capacity: 100}},
            out: {waPot: {split: .98}},
        }],
        weight: 1e6, // 1 ton (guess)
    },

    // REFERENCES FOR LIFE SUPPORT SYSTEM:
    // 1. https://en.wikipedia.org/wiki/ISS_ECLSS
    // 2. https://ntrs.nasa.gov/citations/20050207456 
    // 3. https://sites.nationalacademies.org/cs/groups/depssite/documents/webpage/deps_063596.pdf 
    //
    // Designed to support 6 people with ~40% safety margin
    wrs: {
        label: "Water Recycler",
        type: 'water',
        // flows: [ 
        //     ["Urine_Processing", 
        //         [["waWst", 9000], ["elec", 424]], 
        //         [["waGr", .7], ["nrWst", .3]]],
        //     ["Water_Processing", 
        //         [["waGr", 13600], ["elec", 343]], 
        //         [["waPot", .85], ["nrWst", .15]]]
        // ],
        flows: [{
            id: 'recycWst',
            label: 'Waste Recycling',
            rate: 1,
            in: {waWst: {capacity: 9000}, elec: {capacity: 424}},
            out: {waGr: {split: 0.7}, nrWst: {split: 0.3}},
        }, {
            id: 'recycGr',
            label: 'Graywater Recycling',
            rate: 1,
            in: {waGr: {capacity: 13600}, elec: {capacity: 343}},
            out: {waPot: {split: 0.85}, nrWst: {split: 0.15}},
        }],
        weight: 5e6, // 5 tons (guess)
    },
    ogs: {
        label: "Oxygen Generator",
        type: 'atmosphere',
        // flows: [
        //     ["Operation", 
        //         [["waPot", 9775], ["elec", 3573]], // Electricity in Watts
        //         [["O2", .94], ["H2", .06]]], // H2/O2 1:16 mass
        // ],
        flows: [{
            id: 'op',
            label: "Electrolysis",
            rate: 1,
            in: {waPot: {capacity: 9775}, elec: {capacity: 3573}},
            out: {O2: {split: .94}, H2Tank: {split: .06}},
        }],
        weight: 5e6, // 5 tons (guess)
    },
    scrub: {
        // https://sites.nationalacademies.org/cs/groups/depssite/documents/webpage/deps_063596.pdf (p3)
        label: "CO2 Scrubber",
        type: 'atmosphere',
        // flows: [
        //     ["Normal_Operation",
        //         [["CO2", 2840],["elec", 6200]],
        //         // CO2 is vented, no products
        //     ],
        //     ["Sabatier_Operation",
        //         [["CO2", 3400], ["H2", 610], ["elec", 7400]],
        //         [["waPot", .7], ["CH4", .3]]],
        // ],
        flows: [{
            id: 'scrub',
            label: 'Co2 Scrub',
            rate: 1,
            in: {CO2: {capacity: 3400}, elec: {capacity: 6200}},
            out: {CO2Tank: {split: 1}},
        }, {
            id: 'sabat',
            label: 'Sabatier',
            rate: 1,
            in: {CO2: {capacity: 3400}, H2Tank: {capacity: 610}, elec: {capacity: 7400}},
            out: {waPot: {split: .7}, CH4Tank: {split: .3}},
        }],
        weight: 5e6, // 5 tons (guess)
    },
}