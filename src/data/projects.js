export const projects = {
    unlockO2Tank: {
        label: "Oxygen Tank",
        description: "Pressurized O2 that can be vented into a habitat.",
        cost: [["labor", 50]],
        effect: function(craft) {
            let cape = craft.game.bases["CAPE"]
            cape.set("O2Tank")            
            cape.flags.refreshCape = true

            let newProjects = craft.projects.slice()
            newProjects.push("unlockFuelCell")
            craft.projects = newProjects
        },
    },
    unlockFuelCell: {
        label: "12 kW Fuel Cell",
        description: "Generate electricity by converting O2 and H2 into potable water",
        cost: [["labor", 200]],
        effect: function(craft) {
            let cape = craft.game.bases["CAPE"]
            cape.set("fuelCell")         
            cape.set("H2Tank")   
            cape.flags.refreshCape = true

            let newProjects = craft.projects.slice()
            newProjects = newProjects.concat(["unlockOgs", "unlockWrs", "unlockScrub"])
            craft.projects = newProjects
        },
    },
    unlockOgs: {
        label: "Oxygen Generator",
        description: "Produces O2 and H2 from potable water",
        cost: [["labor", 500]],
        effect: function(craft) {
            let cape = craft.game.bases["CAPE"]
            cape.set("ogs")         
            cape.flags.refreshCape = true

            if (!cape.sinksIndex.includes('habComp') && !craft.projcs.includes('unlockHabComp')) {
                let newProjects = craft.projects.slice()
                newProjects.push("unlockHabComp")
                craft.projects = newProjects
            }
        },
    },
    unlockWrs: {
        label: "Water Recycling System",
        description: "Produces usable water from waste water",
        cost: [["labor", 500]],
        effect: function(craft) {
            let cape = craft.game.bases["CAPE"]
            cape.set("wrs")         
            cape.flags.refreshCape = true

            if (!cape.sinksIndex.includes('habComp') && !craft.projects.includes('unlockHabComp')) {
                let newProjects = craft.projects.slice()
                newProjects.push("unlockHabComp")
                craft.projects = newProjects
            }
        },
    },
    unlockScrub: {
        label: "CO2 Scrubber",
        description: "Removes CO2 from the atmosphere",
        cost: [["labor", 500]],
        effect: function(craft) {
            let cape = craft.game.bases["CAPE"]
            cape.set("scrub")         
            cape.flags.refreshCape = true

            if (!cape.sinksIndex.includes('habComp') && !craft.projcs.includes('unlockHabComp')) {
                let newProjects = craft.projects.slice()
                newProjects.push("unlockHabComp")
                craft.projects = newProjects
            }
        },
    },
    unlockHabComp: {
        label: "Orbital Habitat Components",
        description: "Raw materials to construct a habitat",
        cost: [["labor", 1000]],
        effect: function(craft) {
            let cape = craft.game.bases["CAPE"]
            cape.set("habComp")         
            cape.flags.refreshCape = true

            craft.game.addCraft("HLLV1")

            let newProjects = craft.projects.slice()
            newProjects.push("setupLEOHab")
            craft.projects = newProjects
        },
    },
    setupLEOHab: {
        label: "Setup LEO Habitat",
        description: "Station crew at LEO",
        cost: [["labor", 1000], ["habComp", 1000000000]],
        effect: function(craft) {
            craft.flags.renderLifeSupport = true
        }
    }
}