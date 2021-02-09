import Controller from "./controller.js"
import * as data from "./data.js"
import * as atm from "./atmosphere.js"
import Craft from "./craft.js"
import Tutorial from "./tutorial.js"

export default class Game {
    constructor(mode) {
        this.frame = 0
        this.date = 157766400000 // January 1, 1975 00:00
        this.settlers = 0
        this.flags = {}
        this.ships = {}
        this.bases = {}
        this.history = []
        this.dockWith = this.dockWith.bind(this)
        this.transfer = this.transfer.bind(this)
        this.zMax = 0
        this.memory = {}

        switch(mode) {
            case 'tutorial' : this.flags.tutorial = true; break;
            case 'sandbox' : this.flags.sandbox = true; break;
            default: break;
        }
    }

    addCraft(name) {
        $('#'+name).css("display", "flex")
        this[data.type(name) + "s"][name] = new Craft(name, this)

        if (name === 'CAPE' && this.flags.sandbox) {
            let allSinks = Object.keys(data.sinksData())
            let excluded = ['waGr', 'waWst', 'wst', 'elec']
            let usefulSinks = allSinks.filter(s => (!(excluded.includes(s))))
            this.bases.CAPE.sinksIndex = usefulSinks
            this.bases.CAPE.procsIndex = Object.keys(data.procsData())
        } 
    }

    step(dT) {

        // Initialize
        if (!this.flags.initialized) {
            let startingCrafts = ["CAPE", "SS1"]
            if (this.flags.sandbox) startingCrafts.push("HLLV1")
            startingCrafts.forEach(craft => this.addCraft(craft))
            if (this.flags.tutorial) {
                this.tutorial = new Tutorial()
            }
            this.flags.initialized = true
        }

        // Updates
        this.frame += 1
        this.date += dT * 86400000

        for (let base in this.bases) {this.bases[base].step(dT)}
        for (let ship in this.ships) {this.ships[ship].step(dT)}

        if (this.flags.tutorial) this.tutorial.check(this)

        this.flags.refreshFlows = false
    }

    dockWith(baseName, shipName) {
        let base = this.bases[baseName]
        // DOCK
        if (!base.dockedWith) {
            base.dockedWith = shipName
            this.ships[shipName].dockedWith = baseName
            $(`#${shipName}`).css("border", "2px solid blue")
            
        // UNDOCK
        } else {
            if (base.airlockedWith) {
                this.airlockWith(baseName, shipName)
            }
            this.ships[shipName].dockedWith = null
            base.dockedWith = null
            $(`#${shipName}`).css("border", "1px solid black")
        }
    }

    airlockWith(baseName, shipName) {
        let base = this.bases[baseName]
        // AIRLOCK
        if (!base.airlockedWith) {
            base.airlockedWith = shipName
            this.ships[shipName].airlockedWith = baseName
            $(`#${shipName}`).css("border", "2px solid red")
        // UNAIRLOCK
        } else {
            this.ships[shipName].airlockedWith = null
            base.airlockedWith = null
            $(`#${shipName}`).css("border", "2px solid blue")
        }
    }


    transfer(fromName, toName, item, amount) {
        // console.log(`Transferring ${amount} ${item} from ${fromName} to ${toName}`)
        let fromType = data.type(fromName)
        let from = (fromType === "base") ? this.bases[fromName] : this.ships[fromName]
        let to = (fromType === "base") ? this.ships[toName] : this.bases[toName]
        let rejected = null

        // Check supply of sender
        if (fromName !== "CAPE") {
            
            let fromBal = (data.type(item) === "proc")
                ? from.procsQty[from.procsIndex.indexOf(item)]
                : from.sinksBal[from.sinksIndex.indexOf(item)]
            if (fromBal === 0) {
                rejected = `${from.data.label} doesn't have any ${item}.`
            } else if (fromBal < amount) {
                amount = fromBal
            }
        }
        
        // Check payload capacity of receiver
        if (toName !== "CAPE" && to.maxPayload) {
            let availablePayload = to.maxPayload - to.payload
            if (availablePayload === 0) {
                rejected = `${to.data.label} is above max payload`
            } else {
                let unitWeight = (data.type(item) === "proc") ? data.data(item).weight : 1
                let totalWeight = unitWeight * amount
                if (availablePayload < totalWeight) {
                    amount = Math.floor(availablePayload / unitWeight)
                }
            }
        }
        
        // Don't accept humans without life support
        if (item === 'human' && !to.flags.renderLifeSupport && to.name !== "CAPE") {
            rejected = `${to.data.label} does not have Life Support`
        }

        if (rejected) {
            console.log(rejected)
        } else {
            if (fromName !== "CAPE") from.increment(item, -amount)
            if (toName !== "CAPE") {
                to.increment(item, amount)
            }
        }
    }

    balanceAtmospheres(baseName, shipName) {
        let base = this.bases[baseName]
        let ship = this.ships[shipName]
        if (baseName === "CAPE") {
            let atmMasses = atm.getEarthAtmosphere(ship.volume)
            Object.keys(atmMasses).forEach(key => {
                ship.set(key, atmMasses[key])
            })
        } else {
            let mass = {}
            let volume = ship.volume + base.volume
            data.sinksOfType("atmosphere").forEach(sink => {
                mass[sink] = 0
                mass[sink] += base.field(sink)
                mass[sink] += ship.field(sink)
            })
            Object.keys(mass).forEach(sink => {
                let shipMass = Math.round(mass[sink] * ship.volume / volume * 100) / 100
                // console.log(`setting ${ship.name} ${sink} to ${shipMass}`)
                ship.set(sink, shipMass)
                base.set(sink, mass[sink] - shipMass)
            })
        }
    }

    alert(id, type="blink") {

        switch(type) {
            case "blink" : {
                $(`#${id}`).fadeToggle(100, "swing", function() { 
                    $(this).fadeToggle(400, "swing"); 
                })
                break;
            }
            default: break;
        }
    }
}