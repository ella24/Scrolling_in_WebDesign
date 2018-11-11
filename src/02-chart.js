import * as d3 from 'd3'
import { debounce } from 'debounce'

let margin = { top: 100, left: 50, right: 120, bottom: 50 }

let height = 700 - margin.top - margin.bottom

let width = 600 - margin.left - margin.right

let svg = d3
  .select('#chart-2')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

let parseTime = d3.timeParse('%B-%y')

let xPositionScale = d3.scaleLinear().range([0, width])
let yPositionScale = d3.scaleLinear().range([height, 0])

let colorScale = d3
  .scaleOrdinal()
  .range([
    '#8dd3c7',
    '#ffffb3',
    '#bebada',
    '#fb8072',
    '#80b1d3',
    '#fdb462',
    '#b3de69',
    '#fccde5',
    '#d9d9d9',
    '#bc80bd'
  ])

let line = d3
  .line()
  .x(function(d) {
    return xPositionScale(d.datetime)
  })
  .y(function(d) {
    return yPositionScale(d.price)
  })

d3.csv(require('./data/housing-prices.csv'))
  .then(ready)
  .catch(err => {
    console.log(err)
  })

function ready(datapoints) {
  datapoints.forEach(d => {
    d.datetime = parseTime(d.month)
  })
  let dates = datapoints.map(d => d.datetime)
  let prices = datapoints.map(d => +d.price)

  xPositionScale.domain(d3.extent(dates))
  yPositionScale.domain(d3.extent(prices))

  let nested = d3
    .nest()
    .key(function(d) {
      return d.region
    })
    .entries(datapoints)

  svg
    .selectAll('path')
    .data(nested)
    .enter()
    .append('path')
    .attr('d', function(d) {
      return line(d.values)
    })
    .attr('stroke', function(d) {
      return colorScale(d.key)
    })
    .attr('stroke-width', 2)
    .attr('fill', 'none')
    .attr('class', d => {
      return 'price-line ' + d.key.toLowerCase().replace(/[^a-z]*/g, '')
    })

  svg
    .selectAll('circle')
    .data(nested)
    .enter()
    .append('circle')
    .attr('fill', function(d) {
      return colorScale(d.key)
    })
    .attr('r', 4)
    .attr('cy', function(d) {
      return yPositionScale(d.values[0].price)
    })
    .attr('cx', function(d) {
      return xPositionScale(d.values[0].datetime)
    })
    .attr('class', d => {
      return d.key.toLowerCase().replace(/[^a-z]*/g, '')
    })

  svg
    .selectAll('text')
    .data(nested)
    .enter()
    .append('text')
    .attr('y', function(d) {
      return yPositionScale(d.values[0].price)
    })
    .attr('x', function(d) {
      return xPositionScale(d.values[0].datetime)
    })
    .text(function(d) {
      return d.key
    })
    .attr('dx', 6)
    .attr('dy', 4)
    .attr('font-size', '12')
    .attr('class', d => {
      return 'label-text ' + d.key.toLowerCase().replace(/[^a-z]*/g, '')
    })

  svg
    .append('text')
    .attr('font-size', '24')
    .attr('text-anchor', 'middle')
    .attr('class', 'title')
    .text('U.S. housing prices fall in winter')
    .attr('x', width / 2)
    .attr('y', -40)
    .attr('dx', 40)

  let rectWidth =
    xPositionScale(parseTime('February-17')) -
    xPositionScale(parseTime('November-16'))

  svg
    .append('rect')
    .attr('x', xPositionScale(parseTime('December-16')))
    .attr('y', 0)
    .attr('class', 'highlight-bar')
    .attr('width', rectWidth)
    .attr('height', height)
    .attr('fill', '#C2DFFF')
    .lower()

  let xAxis = d3
    .axisBottom(xPositionScale)
    .tickFormat(d3.timeFormat('%b %y'))
    .ticks(9)

  svg
    .append('g')
    .attr('class', 'axis x-axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(xAxis)

  let yAxis = d3.axisLeft(yPositionScale)
  svg
    .append('g')
    .attr('class', 'axis y-axis')
    .call(yAxis)

  // Here goes all the step stuff
  d3.select('#ready-chart-two').on('stepin', () => {
    // Make everything disappear
    // All but the axis
    svg
      .selectAll('.highlight-bar')
      .transition()
      .attr('fill', 'none')
    svg
      .selectAll('circle')
      .transition()
      .attr('fill', 'none')
    svg
      .selectAll('.price-line')
      .transition()
      .attr('stroke', 'none')
    svg
      .selectAll('.label-text')
      .transition()
      .attr('fill', 'none')
  })

  d3.select('#all-line').on('stepin', () => {
    // Make everything appear
    // And in pretty colors
    // But not the bar
    svg
      .selectAll('.highlight-bar')
      .transition()
      .attr('fill', 'none')
    svg
      .selectAll('circle')
      .transition()
      .attr('fill', function(d) {
        return colorScale(d.key)
      })
    svg
      .selectAll('.price-line')
      .transition()
      .attr('stroke', function(d) {
        return colorScale(d.key)
      })
    svg
      .selectAll('.label-text')
      .transition()
      .attr('fill', 'black')
  })

  d3.select('#us-line').on('stepin', () => {
    // Make everything gray
    // Make everything us red
    // And no, no bars
    svg
      .selectAll('.highlight-bar')
      .transition()
      .attr('fill', 'none')
    svg
      .selectAll('circle')
      .transition()
      .attr('fill', 'gray')
    svg
      .selectAll('.price-line')
      .transition()
      .attr('stroke', 'gray')
    svg
      .selectAll('.label-text')
      .transition()
      .attr('fill', 'gray')
    svg
      .selectAll('.us')
      .transition()
      .attr('fill', 'red')
    svg
      .selectAll('.us')
      .filter('.price-line')
      .transition()
      .attr('fill', 'none')
      .attr('stroke', 'red')
  })

  d3.select('#highlight-line').on('stepin', () => {
    // Make everything gray
    // Make everything us red
    // Make everything above blue
    // That's mountain, pacific, westsouthcentral, southatlantic
    // And no, no bars
    svg
      .selectAll('.highlight-bar')
      .transition()
      .attr('fill', 'none')
    svg
      .selectAll('circle')
      .transition()
      .attr('fill', 'gray')
    svg
      .selectAll('.price-line')
      .transition()
      .attr('stroke', 'gray')
    svg
      .selectAll('.label-text')
      .transition()
      .attr('fill', 'gray')
    svg
      .selectAll('.us')
      .transition()
      .attr('fill', 'red')
    svg
      .selectAll('.us')
      .filter('.price-line')
      .transition()
      .attr('fill', 'none')
      .attr('stroke', 'red')

    svg
      .selectAll('.mountain')
      .transition()
      .attr('fill', 'turquoise')
    svg
      .selectAll('.mountain')
      .filter('.price-line')
      .transition()
      .attr('fill', 'none')
      .attr('stroke', 'turquoise')

    svg
      .selectAll('.pacific')
      .transition()
      .attr('fill', 'turquoise')
    svg
      .selectAll('.pacific')
      .filter('.price-line')
      .transition()
      .attr('fill', 'none')
      .attr('stroke', 'turquoise')

    svg
      .selectAll('.westsouthcentral')
      .transition()
      .attr('fill', 'turquoise')
    svg
      .selectAll('.westsouthcentral')
      .filter('.price-line')
      .transition()
      .attr('fill', 'none')
      .attr('stroke', 'turquoise')

    svg
      .selectAll('.southatlantic')
      .transition()
      .attr('fill', 'turquoise')
    svg
      .selectAll('.southatlantic')
      .filter('.price-line')
      .transition()
      .attr('fill', 'none')
      .attr('stroke', 'turquoise')
  })

  d3.select('#highlight-bar').on('stepin', () => {
    // Bar, please
    svg
      .selectAll('.highlight-bar')
      .transition()
      .attr('fill', '#C2DFFF')
    svg
      .selectAll('circle')
      .transition()
      .attr('fill', 'gray')
    svg
      .selectAll('.price-line')
      .transition()
      .attr('stroke', 'gray')
    svg
      .selectAll('.label-text')
      .transition()
      .attr('fill', 'gray')
    svg
      .selectAll('.us')
      .transition()
      .attr('fill', 'red')
    svg
      .selectAll('.us')
      .filter('.price-line')
      .transition()
      .attr('fill', 'none')
      .attr('stroke', 'red')

    svg
      .selectAll('.mountain')
      .transition()
      .attr('fill', 'turquoise')
    svg
      .selectAll('.mountain')
      .filter('.price-line')
      .transition()
      .attr('fill', 'none')
      .attr('stroke', 'turquoise')

    svg
      .selectAll('.pacific')
      .transition()
      .attr('fill', 'turquoise')
    svg
      .selectAll('.pacific')
      .filter('.price-line')
      .transition()
      .attr('fill', 'none')
      .attr('stroke', 'turquoise')

    svg
      .selectAll('.westsouthcentral')
      .transition()
      .attr('fill', 'turquoise')
    svg
      .selectAll('.westsouthcentral')
      .filter('.price-line')
      .transition()
      .attr('fill', 'none')
      .attr('stroke', 'turquoise')

    svg
      .selectAll('.southatlantic')
      .transition()
      .attr('fill', 'turquoise')
    svg
      .selectAll('.southatlantic')
      .filter('.price-line')
      .transition()
      .attr('fill', 'none')
      .attr('stroke', 'turquoise')
  })

  // Here goes all the render stuff
  function render() {
    // console.log('Rendering')
    // Calculate height/width
    let screenWidth = svg.node().parentNode.parentNode.offsetWidth
    let screenHeight = window.innerHeight
    let newWidth = screenWidth - margin.left - margin.right
    let newHeight = screenHeight - margin.top - margin.bottom

    // Update your SVG
    let actualSvg = d3.select(svg.node().parentNode)
    actualSvg
      .attr('height', newHeight + margin.top + margin.bottom)
      .attr('width', newWidth + margin.left + margin.right)

    // Update scales (depends on your scales)
    xPositionScale.range([0, newWidth])
    yPositionScale.range([newHeight, 0])

    // projection.fitSize([newWidth, newHeight], trains)
    svg.selectAll('.price-line').attr('d', function(d) {
      // console.log(d)
      return line(d.values)
    })

    svg
      .selectAll('circle')
      .attr('cy', function(d) {
        return yPositionScale(d.values[0].price)
      })
      .attr('cx', function(d) {
        return xPositionScale(d.values[0].datetime)
      })

    svg
      .selectAll('.label-text')
      .attr('y', function(d) {
        return yPositionScale(d.values[0].price)
      })
      .attr('x', function(d) {
        return xPositionScale(d.values[0].datetime)
      })
      .attr('dx', 6)
      .attr('dy', 4)
      .attr('font-size', '12')

    svg
      .selectAll('.title')
      .attr('font-size', '24')
      .attr('text-anchor', 'middle')
      .text('U.S. housing prices fall in winter')
      .attr('x', newWidth / 2)
      .attr('y', -40)
      .attr('dx', 40)

    let rectWidth =
      xPositionScale(parseTime('February-17')) -
      xPositionScale(parseTime('November-16'))

    svg
      .selectAll('.highlight-bar')
      .attr('x', xPositionScale(parseTime('December-16')))
      .attr('y', 0)
      .attr('width', rectWidth)
      .attr('height', newHeight)
      .attr('fill', '#C2DFFF')
      .lower()

    svg
      .select('.x-axis')
      .attr('transform', 'translate(0,' + newHeight + ')')
      .call(xAxis)

    svg.select('.y-axis').call(yAxis)
  }

  window.addEventListener('resize', debounce(render, 1000))
  render()
}
