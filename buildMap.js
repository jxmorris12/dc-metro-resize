// jack morris 06/04/17

// Global variables
var _GoldenRatio = 1.618033988749894848204586834365638117720309179805;
var chartWidth = 800, chartHeight = chartWidth; /* Aspect ratio must be 1:1! */
var margin = { 'vertical': 15, 'horizontal': 20 };
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
    .attr('class', 'station');
}

var _twoDigitString = function(i) {
  return ( (i < 10) ? '0' : '' ) + i;
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
          newLineOrder.push(rangeLetter + _twoDigitString(rangeStart));
        }
      }
    }
    lines[color] = newLineOrder;
  }
}

/* This would be nicer if I knew how to build each path from coordinates using D3. Sad! */
var drawConnectingLines = function() {
  for(let lineColor in lines) {
    let stops = lines[lineColor];
    let d = '';
    for(let i in stops) {
      let stop = stops[i];
      
    }
  }
}

var loadRails = function() {
  // Expand line range info
  expandLineLists();
  // Draw all connecting lines
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

  // Draw lines between points
  loadRails();

  // Set starting positions
  setStartingPositions();
}

$(document).ready(load);