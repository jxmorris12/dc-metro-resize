// jack morris 06/04/17

var _GoldenRatio = 1.618033988749894848204586834365638117720309179805;

var createSvg = function() {
  // Global specs
  let chartWidth = 800, chartHeight = chartWidth / _GoldenRatio;
  let containerSelector = 'body';
  let margin = { 'vertical': 15, 'horizontal': 20 };
  let innerChartWidth = chartWidth - margin.horizontal * 2;
  let innerChartHeight = chartHeight - margin.vertical * 2;

  // Create main SVG
  let mainChart = d3.select(containerSelector)
    .append('svg')
    .attr('width', chartWidth)
    .attr('height', chartHeight)
    .attr('class', 'center-block');

  // Compute stuff for scaling
  let stationLats = stations.map(x => { return x["Lat"]});
  let minLat = Math.min.apply(this, stationLats);
  let maxLat = Math.max.apply(this, stationLats);
  let rangeLat = maxLat - minLat;
  console.log(minLat, rangeLat);

  let stationLons = stations.map(x => { return x["Lon"]});
  let minLon = Math.min.apply(this, stationLons);
  let maxLon = Math.max.apply(this, stationLons);
  let rangeLon = maxLon - minLon;

  // Create points
  mainChart.selectAll("text")
    .data(stations)
    .enter()
    .append("circle")
    .attr("cx", function(d, i) { 
      return margin.horizontal + (d["Lat"] - minLat) / rangeLat * innerChartWidth;
    })
    .attr("cy", (d, i) => { 
      return margin.vertical + (d["Lon"] - minLon) / rangeLon * innerChartHeight;
    })
    .attr('r', 3);
}


var load = function() {
  createSvg();
}

$(document).ready(load);