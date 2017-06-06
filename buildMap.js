// jack morris 06/04/17

// Metro color scheme (approximated from image)
var metroLineColors = {
  'blue'   : '#0095df',
  'green'  : '#00b24a',
  'orange' : '#f78a00',
  'red'    : '#df0a2d',
  'silver' : '#a5a5a5',
  'yellow' : '#ffd500'
}

// Stations that were never provided by the API (I don't know why)
let metroNonexistentStations = 'N05 C11';

// Global variables
var _GoldenRatio = 1.618033988749894848204586834365638117720309179805; /* Ahhh.... */
let _mapVerticalRatio = 816 / 950.0; /* Since the original map wasn't square */

// Chart definitions
var margin = { 'vertical': 15, 'horizontal': 30 }; /* Manual SVG padding, just in case */
var chartWidth = 950 + margin.vertical * 2, chartHeight = (chartWidth - margin.vertical * 2) * _mapVerticalRatio + margin.horizontal * 2; /* Aspect ratio must be 1:1! */
var mainChart;

var createSvg = function() {
  let containerSelector = 'body';
  // Create main SVG
  mainChart = d3.select(containerSelector)
    .append('svg')
    .attr('width', chartWidth)
    .attr('height', chartHeight)
    .attr('class', 'center-block');
}

var loadStations = function() {
  let innerChartWidth = chartWidth - margin.horizontal * 2;
  let innerChartHeight = chartHeight - margin.vertical * 2;

  // Get data from map
  let mapDataCache = {};
  for(let i in stationMapLocs) {
    let station = stationMapLocs[i];
    let stationName = station['Name'];
    let stationMapCoords = station['Map Coords'];
    mapDataCache[stationName] = stationMapCoords;
  }

  // Add map data to stations
  stations.forEach(entry => {
    let name = entry['Name'];
    entry['mapX'] = mapDataCache[name][0];
    entry['mapY'] = mapDataCache[name][1];
  })

  // Compute stuff for scaling map coords
  let mapX = stations.map(x => { return x['mapX'] });
  let minMapX = Math.min.apply(this, mapX);
  let maxMapX = Math.max.apply(this, mapX);
  let rangeMapX = maxMapX - minMapX;

  let mapY = stations.map(x => { return x['mapY'] });
  let minMapY = Math.min.apply(this, mapY);
  let maxMapY = Math.max.apply(this, mapY);
  let rangeMapY = maxMapY - minMapY;

  // Compute stuff for scaling lat & lon
  let stationLats = stations.map(x => { return x["Lat"]});
  let minLat = Math.min.apply(this, stationLats);
  let maxLat = Math.max.apply(this, stationLats);
  let rangeLat = maxLat - minLat;

  let stationLons = stations.map(x => { return x["Lon"]});
  let minLon = Math.min.apply(this, stationLons);
  let maxLon = Math.max.apply(this, stationLons);
  let rangeLon = maxLon - minLon;

  // Create points
  mainChart.selectAll("text")
    .data(stations)
    .enter()
    .append("circle")
    .attr("cx1", function(d, i) { 
      return margin.horizontal + (d["Lat"] - minLat) / rangeLat * innerChartWidth;
    })
    .attr("cy1", (d, i) => { 
      return margin.vertical + (d["Lon"] - minLon) / rangeLon * innerChartHeight;
    })
    .attr("cx2", function(d, i) {
      return margin.horizontal + (d['mapX'] - minMapX) / rangeMapX * innerChartWidth;
    })
    .attr("cy2", function(d, i) {
      return margin.vertical + (d['mapY'] - minMapY) / rangeMapY * innerChartHeight;
    })
    .attr('station-code', d => { return d['Code'] })
    .attr('station-name', d => { return d['Name'] })
    .attr('class', 'station');
}

var _twoDigitString = function(i) {
  return ((i < 10) ? '0' : '') + i;
}

var expandLineLists = function() {
  for(let color in lines) {
    let lineOrder = lines[color];
    let newLineOrder = [];
    for(let i in lineOrder) {
      let lineRange = lineOrder[i];
      // return;
      if(!lineRange.includes(':')) {
        newLineOrder.push(lineRange);
      } else {
        // Get numbers and letter
        let rangePoints = lineRange.split(':');
        let rangeLetter = lineRange[0];
        // Get range endpoints
        let rangeStart = rangePoints[0];
        let rangeEnd = rangePoints[1];
        // Parse ints from strings
        rangeStart = parseInt(rangeStart.substr(1));
        rangeEnd = parseInt(rangeEnd.substr(1));
        // Push first stop to queue
        newLineOrder.push(rangePoints[0]);
        // Create range
        let rangeStep = (rangeStart < rangeEnd) ? +1 : -1;
        while(rangeStart != rangeEnd) {
          rangeStart += rangeStep;
          let nextStationName = rangeLetter + _twoDigitString(rangeStart);
          if(metroNonexistentStations.includes(nextStationName)) {
            continue;
          }
          newLineOrder.push(nextStationName);
        }
      }
    }
    lines[color] = newLineOrder;
  }
}

/* This would be nicer if I knew how to build each path from coordinates using D3. Sad! */
var drawConnectingLines = function() {
  for(let lineName in lines) {
    let stops = lines[lineName];
    let d1 = ''; let d2 = '';
    for(let i in stops) {
      // Get station element for this circle
      let stop = stops[i];
      let stationSelector = '[station-code^="' + stop + '"]';
      let stationCircle = $(stationSelector);
      // Get circle coordinates
      let cx1 = stationCircle.attr('cx1');
      let cy1 = stationCircle.attr('cy1');
      let cx2 = stationCircle.attr('cx2');
      let cy2 = stationCircle.attr('cy2');
      // Add letter
      let nextLetter = (i == 0) ? 'M' : ' L';
      d1 += nextLetter;
      d2 += nextLetter;
      // Add coords
      d1 += ' ' + cx1 + ' ' + cy1;
      d2 += ' ' + cx2 + ' ' + cy2;
    }
    // Create element
    mainChart
      .insert('path', ":first-child")
      .attr('d', d2)
      .attr('class', 'rail')
      .style('stroke', metroLineColors[lineName])
      .append('animate')
      .attr('dur', '5s')
      .attr('repeatCount', 'indefinite')
      .attr('attributeName', 'd')
      .attr('values', d1 + '; ' + d2)
  }
}

var loadRails = function() {
  // Expand line range info
  expandLineLists();
  // Draw all connecting lines
  drawConnectingLines();
}

var setStartingPositions = function() {
  $('circle').each(function(x) {
    $(this).attr('cx', $(this).attr('cx2'));
    $(this).attr('cy', $(this).attr('cy2'));
  })
}


var load = function() {
  // Create main SVG
  createSvg();

  // Load station circles
  loadStations();

  // Set starting positions
  setStartingPositions();

  // Draw lines between points
  loadRails();

  // Scale SVG to fit in width
  let windowBoundary = Math.min( $(window).width(), $(window).height() );
  let desiredSvgHeight = windowBoundary * (5/6.0);
  let necessarySvgScale = desiredSvgHeight / $('svg').height();
  let heightDifference = desiredSvgHeight - $('svg').height();
  let svgTransform = 'scale(' + necessarySvgScale + ') translateY(' + heightDifference/2 + 'px)';
  $('svg').css('transform', svgTransform);
  console.log(svgTransform);
}

$(document).ready(load);