import * as data from "./data.js"
import * as helpers from "./helpers.js"
import * as atm from "./atmosphere.js"

import updateSystem from "./updateSystem.js"
import updatePosition from "./updatePosition.js"

import renderDock from "./screens/dock.js"
import renderProjects from "./screens/projects.js"
import renderCape from "./screens/cape.js"
import renderCrew from "./screens/crew.js"
import renderLifeSupport from "./screens/lifeSupport.js"
import renderCargo from "./screens/cargo.js"
import { getEta, renderNavigation } from "./screens/navigation.js"
import renderPropellant from "./screens/propellant.js"

export default class Craft {
    constructor(name, game) {
        this.name = name
        this.game = game
        this.type = data.type(name)
        this.data = data.data(name)
        this.volume = this.data.volume // SQUARE METERS
        this.payload = 0 // GRAMS
        this.power = 0 // WATTS
        this.labor = 0 // HOURS
        
        if (this.type === "ship") {
            this.location = null
            this.trip = null
        }
        
        if (this.type === "base") {
            this.ships = []
            this.laborForce = 0
        }
        
        // Initialize empty system
        this.procsIndex = (this.data.procsIndex) ? this.data.procsIndex : []    // ["human", ...]
        this.procsQty = (this.data.procsQty) ? this.data.procsQty : []      // ["1", ...]
        this.procsRates = (this.data.procsRates) ? this.data.procsRates : []    // [[1, .8, 1], ...] One for each sub-process
        this.sinksIndex = (this.data.sinksIndex) ? this.data.sinksIndex : []    // ["oxygen", ...]
        this.sinksBal = (this.data.sinksBal) ? this.data.sinksBal : []      // ["1188092", ...] Grams
        this.flows = (this.data.flows) ? this.data.flows : []
        
        this.projects = (this.data.projects) ? this.data.projects : []
        this.flags = (this.data.flags) ? this.data.flags : []
        this.dockedWith = null
        this.airlockedWith = null
        this.memory = {
            sparklines: {},
            dockableFields: {},
            machines: {},
            dT: 0,
            history: [],
        }

        this.set = this.set.bind(this)
        this.launch = this.launch.bind(this)
        this.updateLaborForce = this.updateLaborForce.bind(this)
    }

    step(dT) {
        // Initialize
        if (!this.flags.initialized) {
            if (this.type === "ship") this.arrive("CAPE")
            this.flags.refreshFlows = true
            this.flags.initialized = true
        }

        // Equalize air/pressure if airlocked
        if (this.type === "ship"
            && this.flags.renderLifeSupport 
            && this.game.frame % 10 === 0
            && this.airlockedWith 
            && (this.game.bases[this.airlockedWith].flags.renderLifeSupport 
                || this.airlockedWith === "CAPE")
        ) {
            this.game.balanceAtmospheres(this.airlockedWith, this.name)
        }

        if (this.name !== "CAPE") updateSystem(this, dT) // agent/process flows
        if (this.type === 'ship') updatePosition(this, dT)
        if (this.type === 'base' && this.name !== "CAPE" && this.laborForce > 0) {
            let laborHours = this.laborForce * dT * 8 // 8 hours per day
            this.increment("labor", laborHours)
        }
        if (this.flags.tpVenting) this.vent("tp", dT)
        if (this.flags.O2Venting) this.vent("O2", dT)

        // Update history
        let dateCode = new Date(this.game.date)
        let hour = dateCode.toString().slice(15, 18)
        if (hour !== this.memory.hour) {
            this.memory.history.push({
                date: new Date(this.game.date),
                sinksIndex: this.sinksIndex,
                sinskBal: this.sinksBal,
                procsIndex: this.procsIndex,
                procsQty: this.procsQty,
            })
            this.memory.hour = hour
        }

        if (this.type === 'ship') renderDock(this)
        if (this.flags.renderProjects) renderProjects(this)
        if (this.name === "CAPE") renderCape(this)
        if (this.flags.renderCrew) renderCrew(this)
        if (this.flags.renderLifeSupport) renderLifeSupport(this)
        if (this.flags.renderCargo) renderCargo(this)
        if (this.flags.renderNavigation) renderNavigation(this)
        if (this.type === 'base' && this.flags.renderPropellant) renderPropellant(this)
    }

    field(field) {
        switch(data.type(field)) {
            case "sink" : {
                if (!this.sinksIndex.includes(field)) {
                    return null
                } else {
                    return this.sinksBal[this.sinksIndex.indexOf(field)];
                }
            }
            case "proc" : {
                if (!this.procsIndex.includes(field)) {
                    return null
                } else {
                    return this.procsQty[this.procsIndex.indexOf(field)]
                }
            }
            default: return null
        }
    }

    setRate(proc, percent, i=0) {
        this.flows[this.procsIndex.indexOf(proc)][i].rate = Math.round(percent)/100
        this.flags.refreshFlows = true
    }

    set(field, amount = 0, preserve = false, decimalPlaces = 0) {
        let fieldType = data.type(field)
        let index = (fieldType === "proc") ? this.procsIndex.slice() : this.sinksIndex.slice()
        let values = (fieldType === "proc") ? this.procsQty.slice() : this.sinksBal.slice()
        let netAmount = amount
        
        if (!index.includes(field)) {
            index.push(field)
            values.push(netAmount)
            
            if (fieldType === "proc") {
                this.procsIndex = index
                
                // Initialize flows object
                this.flows.push(data.data(field).flows)

            } else {
                this.sinksIndex = index
            }
    
        } else {
            if (!preserve) {
                netAmount = netAmount -values[index.indexOf(field)]
                values[index.indexOf(field)] = amount
            } else {
                values[index.indexOf(field)] += netAmount
            }
        }
    
        if (fieldType === "proc") {
            this.procsQty = values
            this.flags.refreshFlows = true
        } else {
            this.sinksBal = values
        }
        
        let addPayload = true

        // Misc Trigger Routing
        if (this.name !== "CAPE") {
            switch(field) {
                case "human" : {
                    if (this.type === "base") this.updateLaborForce(); break;
                    if (!this.memory.renderCrew) this.memory.renderCrew = true
                }
                case "labor" : {
                    if (!this.memory.renderCrew) this.memory.renderCrew = true
                    addPayload = false
                }
                case "ogs" : {
                    this.flags.renderOgs = true;
                    break;
                }
                case "wrs" : {
                    this.flags.renderWaterRecycler = true;
                    break;
                }
                case "fuelCell" : {
                    this.flags.renderElec = true;
                    this.flags.renderFuelCell = true;
                    break;
                }
                case "scrub" : {
                    this.flags.renderCO2Scrubber = true
                    break;
                }
                default: break;
            }

            switch(data.data(field).type) {
                case "lifeSupport" : this.flags.refreshLifeSupport = true; break;
                case "cargo" : this.flags.refreshCargo = true; break;
                case "propellant" : {
                    this.flags.renderPropellant = true
                    addPayload = false; break;
                }
                case "electricity" : addPayload = false; this.flags.elec = true; break;
            }
        }

        if (addPayload) {
            let unitMass = (fieldType === "proc") ? data.data(field).weight : 1
            this.payload += netAmount * unitMass
        }

    }
    
    increment(field, amount) {
        this.set(field, amount, true)
    }

    launch = () => {
        let selection = $(`#${this.name}DestinationSelector`).val()
        if (!selection) return
        
        if (this.dockedWith) this.game.dockWith(this.dockedWith, this.name)

        // Correct for multi-leg trip
        let locations = `${selection}`
        let origin, destination, rest
        [origin, destination, ...rest] = locations.split("_")
        let route = origin + "_" + destination

        let enoughPropellant = true
        let propellantFields = this.data.routes[route].propellant
        let extraPropellant = {}
        Object.keys(propellantFields).forEach(field => {
            let bal = this.field(field)
            let amt = propellantFields[field]
            if (bal < amt) {
                enoughPropellant = false
            } else {
                extraPropellant[field] = bal - amt
            }
        })
        if (!enoughPropellant) return

        if (!this.game.bases[destination]) {
          this.game.addCraft(destination)
        }

        this.trip = {
            origin: origin,
            destination: destination,
            tripTime: this.data.routes[route].eta,
            eta: "",
            progress: 0,
            extraPropellant: extraPropellant,
            propellant: propellantFields,
        }
        this.location = null
        this.flags.refreshNavigation = true
    
        // Reset origin's ship object
        let base = this.game.bases[origin]
        let newShips = base.ships.filter(s => s !== this.name)
        base.ships = newShips
        if (origin !== "CAPE") base.updateLaborForce()

        if (origin === "CAPE" && this.field('human')) {
            this.game.settlers = this.game.settlers + this.field('human')
        }
    }
      
    arrive = (destination) => {
        this.location = destination
        this.trip = null
    
        let newBase = this.game.bases[this.location]
        newBase.ships.push(this.name)
        newBase.flags.refreshDock = true
        if (destination !== "CAPE") newBase.updateLaborForce()

        if (destination === "CAPE") {
            if (this.flags.renderLifeSupport) {
                this.game.balanceAtmospheres("CAPE", this.name)
            }
            if (this.field("human")) {
                this.game.settlers = this.game.settlers - this.field("human")
            }
        }
    
        // Position ship(s) next to base
        let base = document.getElementById(this.location)
        let ship = document.getElementById(this.name)
        ship.style.top = base.offsetTop + "px"

        this.flags.refreshNavigation = true
        
    }
    
    unloadAll = () => {
        let exclude = [atm.GAS_SINKS]
        if (!this.airlockedWith) {
            exclude.concat(['biological', 'lifeSupport'])
        }
        for (let i = 0; i < this.procsIndex.length; i++) {
            if (exclude.includes(this.procsIndex[i])) continue
            this.game.transfer(
                this.name, 
                this.dockedWith, 
                this.procsIndex[i],
                this.procsQty[i]
            )
        }
        for (let i = 0; i < this.sinksIndex.length; i++) {
            if (exclude.includes(this.sinksIndex[i])) continue
            this.game.transfer(
                this.name, 
                this.dockedWith, 
                this.sinksIndex[i],
                this.sinksBal[i]
            )
        }
    }

    addLifeSupport = () => {
        this.flags.renderCrew = true;
        data.sinksOfType('atmosphere').forEach(sink => this.increment(sink, 0))
        this.flags.renderLifeSupport = true;

        this.flags.pendingHabitat = true;
        this.flags.refreshLifeSupport = true;
    }

    updateLaborForce = () => {
        let baseCrew = 0
        let shipCrew = 0
        if (this.procsIndex.includes("human")) {
            let i = this.procsQty[this.procsIndex.indexOf('human')]
            baseCrew += i
        }
        this.ships.forEach(s => {
            let ship = this.game.ships[s]
            if (ship.procsIndex.includes("human")) {
                let n = ship.field('human')
                shipCrew += n
            }
        })
        this.laborForce = baseCrew + shipCrew
    }

    vent = (type, dT) => {
        switch (type) {
            case "tp" : {
                let rate = 0.5 // % per step
                Object.keys(atm.atmosphereFields(this)).forEach(gas => {
                    this.increment(gas, -rate/100 * this.field(gas))
                })
                break;
            }
            case "O2" : {
                let rate = 100 // grams per second
                let amt
                let tank = this.field('O2Tank')
                if (tank > 0) {
                    amt = Math.min(rate, tank)
                    this.increment('O2Tank', -rate)
                    this.increment('O2', rate)
                }
            }
        }
    }

    autofill = () => {
        let selection = $(`#${this.name}DestinationSelector`).val()
        if (!this.dockedWith) {
            console.log("Connect to a Dock"); return
        }

        let maxP = this.data.maxPropellant

        Object.keys(maxP).forEach(field => {
            let amount = maxP[field]

            // How much the ship needs
            if (this.field(field)) amount = amount - this.field(field)

            // How much the base has
            let base = this.game.bases[this.dockedWith]
            if (base.name !== 'CAPE') {
                amount = Math.min(amount, base.field(field))
            }

            // console.log(`transferring ${amount} ${field} from ${this.dockedWith} to ${this.name}`)
            this.game.transfer(this.dockedWith, this.name, field, amount)
        })
    }
}