
// User Story: I can mouse over the meteorite's data point for additional data.


var width = 960,
    height = 500;


var projection = d3.geoMercator()
  .scale(width / 2 / Math.PI)
  .translate([width / 2, height / 2]);

var path = d3.geoPath().projection(projection);
var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

var url = "https://rawgit.com/Tille88/FCC_data_viz/master/05_map/ne_50m_admin_0_countries.json"
d3.json(url, function(error, topology) {
  if (error) throw error;
  var geojson = topojson.feature(topology, topology.objects.ne_50m_admin_0_countries);
  console.log(geojson);
  svg.selectAll("path")
      .data(geojson.features)
      .enter().append("path")
      .attr("d", path);

  var url_meteor = "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/meteorite-strike-data.json";
  d3.json(url_meteor, function(error, data) {
      if (error) throw error;
      console.log(data);
      // debugger;
      // topojson.feature(data, data);
      data = data.features.filter(function(d) { return d.geometry !== null});

      svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attrs({
          cx: function(d) { return projection(d.geometry.coordinates)[0]; },
          cy: function(d) { return projection(d.geometry.coordinates)[1]; },
          r: function(d) { return Math.sqrt(d.properties.mass) * 0.005; }, //Alter to be dependent on sth... Math.sqrt(area/Math.PI)
          opacity: 0.6
        });

  });


});

