var width = 1100, height = 480, margin = {top: 20, right: 80, bottom: 30, left: 50};

var svg = d3.select('.diagram')
						.append('svg')
						.attr('style', 'overflow: visible;')
						.attr('width', width + margin.left + margin.right)
						.attr('height', height + margin.top + margin.bottom)
						.append("g")
						.attr('class', 'chart')
						.attr("id", "container")
						.attr("transform", "translate(" + margin.left + "," + margin.top + ")");;

var parseTime = d3.timeParse("%Y%m%d");

var x = d3.scaleTime().range([0, width]),
    y = d3.scaleLinear().range([height, 0]),
    z = d3.scaleOrdinal(d3.schemeCategory10);
				
var request = new XMLHttpRequest();
request.open('GET', './libs/temperature.tsv');

request.onload = function () {
	var dataset = request.responseText;
	render(dataset);
};

request.send();

function render (dataset) {

var data = d3.tsvParse(dataset);

data.forEach(function(d) {
	d.date = parseTime(d.date);
});

var cities = data.columns.slice(1).map(function (id) {
	return {
		'id': id,
		'values': data.map(function(value) {
			return {
				'date': value.date,
				'temperature': value[id]
			}
		})
	}
});

console.log(cities);

var line = d3.line()
    .curve(d3.curveBasis)
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.temperature); });


x.domain(d3.extent(data, function(value) { return value.date }));

y.domain([
	d3.min(cities, function(city) { return d3.min(city.values, function( value ) { return value.temperature })}),
	d3.max(cities, function(city) { return d3.max(city.values, function( value ) { return value.temperature })})
	]);

z.domain(cities.map(function(value) { return value.id }));


var city = svg.selectAll(".city")
  .data(cities)
  .enter()
  .append("g")
  .attr("class", "city");

city.append('path')
	.attr("class", "line")
	.attr('d', function(d) { return line(d.values) })
	.attr('stroke', function(d) { return z(d.id)});

city.append('text')
    .text(function(d) { return d.id; })
    .attr('transform', function(d) { 
   		var item = d.values[d.values.length - 1]; 
   		console.log(y(item.temperature))
   		return 'translate(' + x(item.date) +',' + y(item.temperature) + ')' 
 		 })
    .attr('x', 5)
		.on('mouseover', function(value, index){
				for (var i = 0; i < 3; i ++){
					if (i !== index)  {
						document.getElementsByClassName('line')[i].setAttribute("style", "opacity: 0");
					}		
				}
		})
		.on('mouseout', function(value, index){
				for (var i = 0; i < 3; i ++){
					if (i !== index)  {
						document.getElementsByClassName('line')[i].setAttribute("style", "opacity: 1");
					}		
				}
		});


svg.append('g')
	.attr("class", "axis axis--x")
	.attr("transform", "translate(0,"+ height +")")
	.call(d3.axisBottom(x));

svg.append('g')
	.attr("class", "axis axis--y")
	.attr("transform", "translate(0,0)")
	.call(d3.axisLeft(y))
  .append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", 6)
  .attr("dy", "0.71em")
  .attr("fill", "#000")
  .text("Temperature, ºF");

}

