

var width = 500,
    height = 500;


var projection = d3.geoAzimuthalEqualArea()//d3.geoMercator()
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

      var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

      svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attrs({
          cx: function(d) { return projection(d.geometry.coordinates)[0]; },
          cy: function(d) { return projection(d.geometry.coordinates)[1]; },
          r: function(d) { return Math.sqrt(d.properties.mass) * 0.005; }, //Math.sqrt(area/Math.PI), constant cancel out
          opacity: 0.6
        })
        .on("mouseover", function(d) {
            div.transition()
                .duration(50)
                .style("opacity", .9);
            div .html("Name: " + d.properties.name + "<br>Mass: " + d.properties.mass + "kg(?)")
                .style("left", (d3.event.pageX + 8) + "px")
                .style("top", (d3.event.pageY - 8) + "px");
            })
        .on("mouseout", function(d) {
            div.transition()
                .duration(200)
                .style("opacity", 0);
        });

  });


});

