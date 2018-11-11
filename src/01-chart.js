import * as d3 from 'd3'
import { debounce } from 'debounce'

const margin = {
  top: 50,
  right: 20,
  bottom: 50,
  left: 50
}

const width = 700 - margin.left - margin.right
const height = 400 - margin.top - margin.bottom

const svg = d3
  .select('#chart-1')
  .append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

var xPositionScale = d3.scaleBand().range([0, width])

var yPositionScale = d3
  .scaleLinear()
  .domain([0, 85])
  .range([height, 0])

const colorScale = d3
  .scaleOrdinal()
  .range([
    '#8dd3c7',
    '#ffffb3',
    '#bebada',
    '#fb8072',
    '#80b1d3',
    '#fdb462',
    '#b3de69'
  ])

d3.csv(require('./data/countries.csv'))
  .then(ready)
  .catch(err => {
    console.log(err)
  })

function ready(datapoints) {
  // Sort the countries from low to high
  datapoints = datapoints.sort((a, b) => {
    return a.life_expectancy - b.life_expectancy
  })

  // And set up the domain of the xPositionScale
  // using the read-in data
  const countries = datapoints.map(d => d.country)
  xPositionScale.domain(countries)

  /* Add your rectangles here */

  svg
    .selectAll('rect')
    .data(datapoints)
    .enter()
    .append('rect')
    .attr('width', xPositionScale.bandwidth())
    .attr('height', d => {
      return height - yPositionScale(d.life_expectancy)
    })
    .attr('x', d => {
      return xPositionScale(d.country)
    })
    .attr('y', d => {
      return yPositionScale(d.life_expectancy)
    })
    .attr('fill', 'lightgrey')
    .attr('class', d => {
      return d.continent.toLowerCase().replace(/[^a-z]*/g, '')
    })

  svg
    .append('text')
    .text('higher GDP ⟶')
    .attr('class', 'gdp-note-high')
    .attr('text-anchor', 'middle')
    .attr('font-size', 12)
    .attr('x', width * 0.75)
    .attr('y', height + 15)

  svg
    .append('text')
    .text('⟵ lower GDP')
    .attr('class', 'gdp-note-low')
    .attr('text-anchor', 'middle')
    .attr('font-size', 12)
    .attr('x', width * 0.25)
    .attr('y', height + 15)

  const yAxis = d3
    .axisLeft(yPositionScale)
    .tickSize(-width)
    .ticks(5)
    .tickFormat(d => (d === 80 ? '80 years' : d))

  svg
    .append('g')
    .attr('class', 'axis y-axis')
    .call(yAxis)
    .lower()

  d3.select('.y-axis .domain').remove()

  d3.select('#asia').on('stepin', () => {
    svg
      .selectAll('rect')
      .transition()
      .attr('fill', 'lightgrey')
    svg
      .selectAll('.asia')
      .transition()
      .attr('fill', '#4cc1fc')
  })

  d3.select('#africa').on('stepin', () => {
    svg
      .selectAll('rect')
      .transition()
      .attr('fill', 'lightgrey')
    svg
      .selectAll('.africa')
      .transition()
      .attr('fill', '#4cc1fc')
  })

  d3.select('#na').on('stepin', () => {
    svg
      .selectAll('rect')
      .transition()
      .attr('fill', 'lightgrey')
    svg
      .selectAll('.namerica')
      .transition()
      .attr('fill', '#4cc1fc')
  })

  d3.select('#low-gdp').on('stepin', () => {
    svg
      .selectAll('rect')
      .transition()
      .attr('fill', d => {
        if (d.gdp_per_capita < 3000) {
          return '#4cc1fc'
        } else {
          return 'lightgrey'
        }
      })
  })

  d3.select('#continent').on('stepin', () => {
    svg
      .selectAll('rect')
      .transition()
      .attr('fill', d => {
        return colorScale(d.continent)
      })
  })

  d3.select('#reset').on('stepin', () => {
    svg
      .selectAll('rect')
      .transition()
      .attr('fill', 'lightgrey')
  })

  d3.select('#ready-chart-one').on('stepin', () => {
    svg
      .selectAll('rect')
      .transition()
      .attr('fill', 'lightgrey')
  })

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
    svg
      .selectAll('rect')
      .attr('width', xPositionScale.bandwidth())
      .attr('height', d => {
        return newHeight - yPositionScale(d.life_expectancy)
      })
      .attr('x', d => {
        return xPositionScale(d.country)
      })
      .attr('y', d => {
        return yPositionScale(d.life_expectancy)
      })

    svg
      .selectAll('.gdp-note-high')
      .attr('text-anchor', 'middle')
      .attr('font-size', 12)
      .attr('x', newWidth * 0.75)
      .attr('y', newHeight + 15)

    svg
      .selectAll('.gdp-note-low')
      .attr('text-anchor', 'middle')
      .attr('font-size', 12)
      .attr('x', newWidth * 0.25)
      .attr('y', newHeight + 15)

    svg.select('.y-axis').call(yAxis)

    d3.select('.y-axis .domain').remove()
  }

  window.addEventListener('resize', debounce(render, 1000))
  render()
}
