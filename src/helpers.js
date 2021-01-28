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

export function massUnits(v) {
    if (typeof(v) !== "number") {return v}
    let value, label
    if (v > 999999999) {
        value = Math.round(v/10000000)/100
        label = "kt" 
    } else if (v > 999999) {
        value = Math.round(v/10000)/100
        label = "t" 
    } else if (v > 999) {
        value = Math.round(v/10)/100
        label = "kg" 
    } else {
        value = Math.round(v)
        label = "g"
    }
    value = value.toString()
    if (value.length > 3) {value = value.slice(0, 3)}
    if (value[2] === ".") {value = value.slice(0, 2)}
    return(value+label)
}

export function renderHour (fraction_of_day) {
    let string = ""
    if (fraction_of_day >= 1) {
        string += Math.floor(fraction_of_day) + "d "
    }

    let ms = fraction_of_day * 86400000 - 28800000
    let newDate = new Date(ms)
    newDate = newDate.toString()
    string += newDate.slice(15, 21)

   
    return string
  }

export function deepCopy (object) {
    let output = {}
}

export const SINK_UNITS = [
    ["10kg", 10000], 
    ["100kg", 100000], 
    // ["1t", 1000000], 
    // ["10t", 10000000], 
    // ["100t", 100000000]
]

export const PROPELLANT_UNITS = [
    // ["10 kg", 10000], 
    // [".1t", 100000], 
    // ["1t", 1000000], 
    ["10t", 10000000], 
    ["100t", 100000000]
]
  
export const PROC_UNITS = [
    ["1", 1], 
    ["10", 10], 
    // ["100x", 100]
]