// import Chart from '../chart.js'

const WIDTH = 300
const HEIGHT = 200
const MAX_LENGTH = 200

var counter = 0

export default class SparkStack{
  constructor(startingData, info, container) {

    // Create the canvas
    let canvas = document.createElement("canvas")
    canvas.setAttribute("id", counter++)
    canvas.height = HEIGHT
    canvas.width = WIDTH
    container[0].appendChild(canvas)
    let ctx = canvas.getContext('2d')

    // Create the dataset
    let datasets = []
    for (let i = 0; i < info.length; i++) {
      let gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT+5);
      gradient.addColorStop(0, info[i].color);   
      gradient.addColorStop(1, 'white');
      
      let padded = Array(MAX_LENGTH-1).fill(0)
      padded.push(startingData[i])
      datasets.push({
        label: info[i].label,
        data: padded,
        borderColor: info[i].color,
        backgroundColor: gradient,
      })
    }
    
    // Create chart config
    this.cfg = {
        type: 'line',
        data: {
            labels: Array(MAX_LENGTH).fill(0),
            datasets: datasets,
        },
        options: chartOptions,
    }
    
    // Initialize chart
    this.chart = new Chart(ctx, this.cfg)
    this.step = this.step.bind(this)
  }
  
  step(balance, index) {
    
    for (let i = 0; i < balance.length; i++) {
      let chartData = this.cfg.data.datasets[i].data.slice()
      let oldVal = chartData[MAX_LENGTH - 1]

      // Set the actual value
      chartData.push(balance[i])
      chartData.shift()
      this.cfg.data.datasets[i].data = chartData

      // Calculate netFlows -> If new, use netFlows to make forecast
    }
    this.chart.update()
  }
}

const chartOptions = {
  scales: {
    yAxes: [{
      stacked: true
    }],
  },
  elements: {
    point: {
      radius: 0
    },
    line: {
      borderWidth: 1,
    }
  },
  legend: {
    display: false,
  },
  animation: {
    duration: 0,
  },
  tooltips: {enabled: false},
  hover: {mode: null},
  responsive: false,
  maintainAspectRatio: false,
}

  // constructor(actual, info, container) {
  //   // Actual is [[1, 2, 3], [1, 2, 3]] for each field
  //   // Info is [{label, color}, {id, label, color}]
  //   // Container is jQuery object
  //   this.frame = 0

  //   // 'data' is an array of starting values
  //   this.cfg = {
  //       type: 'line',
  //       data: {
  //           labels: [],
  //           datasets: [],
  //       },
  //       options: chartOptions,
  //   }
  //   this.chart = {}
  //   this.memory = {
  //     netFlows: [],
  //   }

  //   this.initialize(actual, info, container)
  //   this.step = this.step.bind(this)
  // }
  
  // initialize(actual, info, container) {
  //   let canvas = document.createElement("canvas")
  //   canvas.setAttribute("id", counter++)
  //   canvas.height = HEIGHT
  //   canvas.width = WIDTH
  //   container[0].appendChild(canvas)
  //   let ctx = canvas.getContext('2d')
    
  //   let labels = this.cfg.data.labels.slice()
  //   let datasets = this.cfg.data.datasets.slice()
  //   for (let i = 0; i < info.length; i++) {
  //     let gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT+5);
  //     gradient.addColorStop(0, info[i].color);   
  //     gradient.addColorStop(1, 'white');

  //     labels.push(Array(MAX_LENGTH).fill(0))
  //     let padding = Array(MAX_LENGTH-1).fill(0)
  //     console.log(actual)
  //     let padded = padding.concat(actual[i])
  //     datasets.push({
  //       data: padded,
  //       borderColor: info[i].color,
  //       backgroundColor: gradient,
  //     })
  //   }
  //   this.cfg.data.labels = labels
  //   this.cfg.data.datasets = datasets
  //   this.chart = new Chart (ctx, this.cfg)
  // }
  
  // step(netFlows, info=[]) {
  //   // For each field, check and add/udpate
  //   let thisDatasets = this.cfg.data.datasets.slice()
  //   let thisFlows = this.memory.netFlows.slice()

  //   for (let i = 0; i < netFlows.length; i++) {      
  //     if (netFlows[i] === thisFlows[i]) {

  //       // No update
  //       let newValue = thisDatasets[i].data[MAX_LENGTH - 1] + thisFlows[i]
  //       thisDatasets[i].data.push(newValue)
  //       thisDatasets[i].data.shift()
  //     } else {

  //       // new netFlow, update forecast
  //       let newValue = thisDatasets[i].data[MAX_LENGTH - 1] + netFlows[i]
  //       thisDatasets[i].data.push(newValue)
  //       thisDatasets[i].data.shift()
  //       thisFlows[i] = netFlows[i]
  //     }
  //   }

  //   this.cfg.data.datasets = thisDatasets
  //   this.memory.netFlows = thisFlows
  //   console.log(thisDatasets)
  //   this.chart.update()
  //   this.frame++
  // }