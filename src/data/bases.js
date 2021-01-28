export const bases = {
    CAPE: {
        label: "Cape Canaveral, FL",
        procsIndex: ['human', 'wrs',],
        // procsQty: [Infinity],
        sinksIndex: ["waPot", "hF", "LO2", "LH2", "MMH", "N2O4", "O2Tank"],
        // sinksBal: [Infinity],
        flags: {
            renderDock: true,
        },
    },
    LEO: {
        label: "Low Earth Orbit",
        volume: 600,
        capacity: 200,
        sinksIndex: [],
        sinksBal: [],
        projects: ["unlockO2Tank"],
        flags: {
            renderCrew: true,
            renderDock: true,
            renderCargo: true,
            renderProjects: true,
        },
    },
    L5: {
        label: "Colony at L5",
        flags: {}
    },
    GSO: {
        label: "Geostationary Orbit",
        flags: {}
    },
    LPO: {
        label: "Lunar Parking Orbit",
        flags: {}
    },
    LS: {
        label: "Lunar Surface",
        flags: {}
    },
    L2: {
        label: "L2 Station",
        flags: {}
    },
}