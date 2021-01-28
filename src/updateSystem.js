import * as data from "./data.js"

export default function updateSystem (craft, dT) {

  let sinksIndex = craft.sinksIndex.slice()
  let sinksBal = craft.sinksBal.slice()

  // Electricity added manually
  if (craft.flags.renderElec) {
    if (sinksIndex.includes("elec")) {
      sinksBal[sinksIndex.indexOf("elec")] = craft.power.available
    } else {
      sinksIndex.push('elec')
      sinksBal.push(0)
    }
  }
  let testBal = []
  
  // Try using last step's net flows.
  let netFlows = (craft.netFlows) ? craft.netFlows.slice() : null
  if (netFlows) {
    testBal = sumArrays(sinksBal, netFlows);
  } else {
    craft.flags.refreshFlows = true
  }

  // Test to see if dT has changed
  let margin = 2
  if (craft.memory.dT < dT / margin || craft.memory.dT > dT * margin ) {
    craft.flags.refreshFlows = true
    craft.memory.dT = dT
  }

  // If that doesn't work..
  if (testBal.some(b => b < 0) || craft.flags.refreshFlows || craft.game.refreshFlows) {
  
    let procsIndex = craft.procsIndex
    let procsQty = craft.procsQty
    let flows = JSON.parse(JSON.stringify(craft.flows))
    let netFlows = Array(sinksIndex.length).fill(0)
    
    let cache = {} // Helper function to make index retreival faster
    let index = (field) => {
      if (!cache[field]) {
        let index = (data.type(field) === 'sink') ? sinksIndex : procsIndex
        cache[field] = index.indexOf(field)
      }
      return cache[field]
    }
    
    // Cycle through procs
    let testNetFlow = Array(sinksIndex.length).fill(0)
    for (let i = 0; i < procsIndex.length; i++) {
      
      // Cycle through flows
      flows[i].forEach(flow => {
        let testFlows = Array(sinksIndex.length).fill(0)
        let limit = 1

        // Cycle through individual {sink: amount} pairs
        Object.keys(flow.in).forEach(s => {
          if (!sinksIndex.includes(s)) {
            sinksIndex.push(s)
            sinksBal.push(0)
            netFlows.push(0)
            testFlows.push(0)
            testNetFlow.push(0)
          }
          let sink = flow.in[s] 
          
          // capacity   = total grams / day
          // max        = capacity * qty * fraction_of_day
          let output = sink.capacity * procsQty[i] * dT
          if (s === 'elec') {
            output = output / dT
          }
          sink.max = Math.round(output * 100) / 100
          
          // target     = max * rate
          let rate = (data.data(procsIndex[i]).type === 'biological') ? 1 : flow.rate
          sink.target = Math.round(sink.max * rate * 100) / 100

          // available  = craft's balance
          let available = sinksBal[index(s)]
          if (available === 0 || sink.target === 0) {
            limit = 0
          } else if (available < sink.target) {
            limit = Math.min(limit, Math.round(available / sink.target * 100) / 100)
          }
          testFlows[index(s)] -= sink.target
        })
        if (limit !== 1) {
          testFlows = Array(sinksIndex.length).fill(0)
          Object.keys(flow.in).forEach(s => {
            let sink = flow.in[s]

            let limited = Math.round(sink.target * limit)
            let available = sinksBal[index(s)]
            
            // limited   = min(target, available * limited)
            sink.target = Math.min(limited, available)
            testFlows[index(s)] -= sink.target
          })
        }
        testNetFlow = sumArrays(testNetFlow, testFlows)
      })
    }
    let rations = Array(sinksIndex.length).fill(1)
    let targetBal = sumArrays(sinksBal, testNetFlow)
    for (let j = 0; j < sinksIndex.length; j++) {
      if (targetBal[j] < 0 && data.data(sinksIndex[j]).ration) {
        
        // ration = available / sum(targets)
        rations[j] = sinksBal[j] / - testNetFlow[j]
      }
    }
    for (let i = 0; i < procsIndex.length; i++) {
      flows[i].forEach(flow => {
        let reLimit = 1
        let inflows = Array(sinksIndex.length).fill(0)
        let inFlowMass = 0
        let maxFlow = 0
        Object.keys(flow.in).forEach(s => {
          let sink = flow.in[s]
          let j = index(s)
          
          // rationed = available * ration
          let rationed = Math.round(sinksBal[j] * rations[j] * 100) / 100
          if (rationed < sink.target) {
            sink.actual = rationed
            
            // reLimit = limited / rationed
            reLimit = Math.min(reLimit, Math.round(sink.actual / sink.target * 100) / 100)
          } else {
            sink.actual = sink.target
          }
          inflows[j] -= sink.actual
          if (s !== 'elec') {
            inFlowMass += sink.actual
            maxFlow += sink.max
          }
        })
        if (reLimit < 1) {
          inFlowMass = 0
          maxFlow = 0
          inflows = Array(sinksIndex.length).fill(0)
          Object.keys(flow.in).forEach(s => {
            let sink = flow.in[s]
            let reLimited = Math.round(sink.target * reLimit * 100) / 100
            let available = Math.round(sinksBal[index(s)] * 100) / 100
            
            // actual = min(rationed, limited)
            sink.actual = Math.min(reLimited, available)
            inflows[index(s)] -= sink.actual
            
            if (s !== 'elec') {
              inFlowMass += sink.actual
              maxFlow += sink.max
            }
          })
        }
        let outFlowMass = 0
        let outflows = Array(sinksIndex.length).fill(0)
        Object.keys(flow.out).forEach(s => {
          if (!sinksIndex.includes(s)) {
            sinksIndex.push(s)
            sinksBal.push(0)
          }
          let sink = flow.out[s]
          let j = index(s)
          
          // outflow  = (actual != electric) * split
          sink.actual = Math.round(Math.min(inFlowMass * sink.split, inFlowMass - outFlowMass) * 100) / 100
          outflows[j] += sink.actual 
          outFlowMass += sink.actual
        })
        // rate   = actual / max
        flow.rate = Math.round(inFlowMass / maxFlow * 100) / 100

        // netflows   = actual * outflows
        let totFlows = sumArrays(inflows, outflows)
        netFlows = sumArrays(netFlows, totFlows)
        
        // sinksBal   = balance + netflows
        sinksBal = sumArrays(sinksBal, totFlows)
      })
    }
    craft.sinksIndex = sinksIndex
    craft.sinksBal = sinksBal
    craft.flows = flows
    craft.netFlows = netFlows
    craft.flags.refreshFlows = false
        
    // Set / Check Electricity
    if (craft.flags.elec) {
      let totalCapacity = 0
      let netPower = 0
      for (let i = 0; i < craft.procsIndex.length; i++) {
        let proc = craft.procsIndex[i]
        if (data.data(proc).type === 'electricity') {
          // Calculate power
          let qty = craft.procsQty[i]
          let capacity = data.data(proc).capacity * qty
          let rate = craft.flows[i][0].rate
          let power = Math.round(capacity * rate)
  
          // Add to netpower
          totalCapacity += capacity
          netPower += power
        }
      }
      if (netPower !== craft.power) {
        craft.flags.refreshFlows
        craft.power = netPower
      }
      craft.power = {
        capacity: totalCapacity,
        available: netPower,
        unused: craft.field('elec')
      }
    }

    // Or just repeat previous update LOL
  } else {
      craft.sinksBal = testBal
  }
}

export function sumArrays(array1, array2) {
    let output = [];
    for (let i in array1) {
      if (!array2[i]) {
        output.push(array1[i]);
      } else {
        output.push(array1[i] + array2[i]);
      }
    }
    return output;
}