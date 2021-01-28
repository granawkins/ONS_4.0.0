// import Chart from '../chart.js'

const WIDTH = 100
const HEIGHT = 20
const MAX_LENGTH = 200

var counter = 0

export default class Sparkline{
  constructor(startingData, container, color) {
    this.frame = 0

    // 'data' is an array of starting values
    this.cfg = {
        type: 'line',
        data: {
            labels: Array(MAX_LENGTH).fill(0),
            datasets: [{
                data: Array(MAX_LENGTH).fill(0),
                borderColor: color,
            }],
        },
        options: chartOptions,
    }
    this.chart = {}
    this.initialize(container, color)
    this.step = this.step.bind(this)
  }
  
  initialize(container, color) {
    let canvas = document.createElement("canvas")
    canvas.setAttribute("id", counter++)
    canvas.height = HEIGHT
    canvas.width = WIDTH
    container.appendChild(canvas)
    
    let ctx = canvas.getContext('2d')
    
    var gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT+5);
    gradient.addColorStop(0, color);   
    gradient.addColorStop(1, 'white');
    this.cfg.data.datasets[0].backgroundColor = gradient;
    
    this.chart = new Chart (ctx, this.cfg)
  }
  
  step(val) {
    let newData = this.cfg.data.datasets[0].data.slice()
    newData.push(parseInt(val))
    newData.shift()
    
    this.cfg.data.datasets[0].data = newData
    this.chart.update()
    
    this.frame++
  }
}

const chartOptions = {
  scales: {
    xAxes: [{
      display: false
    }],
    yAxes: [{
      display: false,
      ticks: {
        min: 0,
      },
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

