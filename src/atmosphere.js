import * as data from "./data.js"
import SparkStack from "./sparkStack.js"

export const renderAtmosphere = (craft, container, units="mass") => {

  // Initialize
  if (!craft.memory.initializeAtmChart) {

    craft.memory.atmosphereChart = {}  
    let info = []
    let actual = []
    let atmosphere = atmosphereFields(craft)
    let pressures
    if (units === 'pressure') pressures = calculateAtmosphere(atmosphere, craft.volume).pressure

    Object.keys(atmosphere).forEach(field => {
      let fieldInfo = data.data(field)
      info.push({label: fieldInfo.label, color: fieldInfo.color})
      switch (units) {
        case 'mass' : actual.push(atmosphere[field]); break;
        case 'presure' : {
          actual.push(pressures[field]); break;
        }
        default: break;
      }
    })

    craft.memory.atmosphereChart.sparkStack = new SparkStack(actual, info, container)
    craft.memory.atmosphereChart.hour = craft.memory.hour
    craft.memory.initializeAtmChart = true
  } 

  // Update
  if (craft.memory.hour !== craft.memory.atmosphereChart.hour) {

    let balance = []
    let index = []
    let atmosphere = atmosphereFields(craft)
    let pressures
    if (units === 'pressure') pressures = calculateAtmosphere(atmosphere, craft.volume).pressure
    Object.keys(atmosphere).forEach(field => {
      switch(units) {
        case 'mass' : balance.push(craft.field(field)); break;
        case 'pressure' : {
          balance.push(pressures[field])
        }
      }
      index.push(field)
    })
    
    craft.memory.atmosphereChart.sparkStack.step(balance, index)
    craft.memory.atmosphereChart.hour = craft.memory.hour
  }
  
}

// 3. Add to chart data
//
// forecastAtm(craft): Forecast each field 1 week
// 1. Cycle craft.netFlows with craft.sinksBal (24*7) times, 
// 2. Each cycle, push to data (different color)
// 
// stepAtm(craft) Update chart
// 1. Pull netFlows
// 2. If === current netFlows
//    1. Cycle with last day of forecast
//    2. Update color for current day
// 3. Else
//    1. Remove forecast
//    2. Push value from sinksIndex
//    3. Redo forecast
// 4. Update chart
//
// init(craft) 
// 1. getAtm
// 2. forecastAtm
// 3. craft.mem.field = new Chart(ctx, cfg)

const ATMOSPHERE_DASHBOARD = [["Humidity", "%"], ["Pressure", "kPa"], ["Temperature", '\u00B0' + "C"]]

export const GAS_SINKS = ["O2", "CO2", "H2O", "N2"]

const GAS_CONSTANT = 8.3145e-3

const MOLAR_MASS = {
    N2: 28.0134,
    O2: 31.9988,
    CO2: 44.0095,
    H2O: 18.01528,
  }

export const atmosphereFields = (craft) => {
    let gasSinks = data.sinksOfType('atmosphere')
    let mass = {}
    gasSinks.forEach(sink => {
      let bal = craft.field(sink)
      if (bal === null) {
        mass[sink] = 0
        craft.set(sink)
      } else {
        mass[sink] = craft.field(sink)
      }
    })
    return mass
}

export const getEarthAtmosphere = (volume) => {
    let atmTempK = 296
    let kpaMultiplier = GAS_CONSTANT * atmTempK / volume
    let pressure = {
      O2: 22.7,
      N2: 78.9,
      H2O: 1,
      CO2: 0,
    }
    let mass = {}
    Object.keys(pressure).forEach(element => {
      mass[element] = Math.floor((pressure[element] / kpaMultiplier) * MOLAR_MASS[element])
    })
    return mass
  }

export const maxMoisture = (temp) => {
    var mm = [
      [-25, -20, -15, -10, -5, 0, 5, 10, 15, 20, 30, 40, 50, 60], // degC
      [0.64, 1.05, 1.58, 2.31, 3.37, 4.89, 6.82, 9.39, 12.8, 17.3, 30.4, 51.1, 83.0, 130] // g/m3
    ]
    for (var i = 0; i < mm[0].length; i++) {
        if (temp < mm[0][i]) {
            return(mm[1][i])
        }
    }
  }

export const calculateAtmosphere = (mass, volume, temp = 23) => {
                                 // {g,}  m3      degC
    let N2 = mass.N2
    let O2 = mass.O2
    let CO2 = mass.CO2
    let H2O = mass.H2O
    let atmTempK = temp + 273 // Kelvin
    let atmMaxMoisture = maxMoisture(temp) * volume
    let relativeHumidity = H2O / atmMaxMoisture
    let kpaMultiplier = GAS_CONSTANT * atmTempK / volume
    let N2Kpa = (N2 / MOLAR_MASS.N2) * kpaMultiplier
    let O2Kpa = (O2 / MOLAR_MASS.O2) * kpaMultiplier
    let CO2Kpa = (CO2 / MOLAR_MASS.CO2) * kpaMultiplier
    let H2OKpa = (H2O / MOLAR_MASS.H2O) * kpaMultiplier
    let totalKpa = N2Kpa + O2Kpa + CO2Kpa + H2OKpa
    let output = {
      relativeHumidity: relativeHumidity,
      pressure: {
        N2: N2Kpa,
        O2: O2Kpa,
        CO2: CO2Kpa,
        H2O: H2OKpa,
      },
      totalPressure: totalKpa,
      temp: temp,
    }
    return output
}