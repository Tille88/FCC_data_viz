document.addEventListener('DOMContentLoaded',function(){

  
	req=new XMLHttpRequest();
	req.open("GET",'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/cyclist-data.json',true);
	req.send();
	req.onload=function(){;
	  data=JSON.parse(req.responseText);


/*
///////////////////////////////////////////////////
Global Variable Declarations/Global Canvas/SVG
///////////////////////////////////////////////////
*/
	const yearMin = d3.min(data, (d) => d.Year);
	const yearMax = d3.max(data, (d) => d.Year);
    const w = 700;//900
    const h = 500;//650?
    const padding = 120;//160
    const svg = d3.select("body")
                  .append("svg")
                  .attr("width", w)
                  .attr("height", h);
	
	
/*
///////////////////////////////////////////////////
DataPrep
For the different graphs
///////////////////////////////////////////////////
*/
	////////////////////////////
	//For Main graph
	//Get year counter
	var yearCounts = {};

	for(var i = 0; i< data.length; i++) {
		var year = data[i].Year;
		yearCounts[year] = yearCounts[year] ? yearCounts[year]+1 : 1;
	}
	

	
	//Fill in the empty ones with 0's
	for(var i = yearMin+1; i< yearMax; i++) {
		if(yearCounts[i] === undefined) {
			yearCounts[i] = 0;
		}
		
	}

	//push into array form instead for ease to work with
	yearCountsArr = [];
	for (item in yearCounts) {
		yearCountsArr.push([item, yearCounts[item]]);
	}

	////////////////////////////
	//For Sub graphs
	//Get max overall, min (rank 39) overall:
	const maxTime = d3.max(data, (d) => d.Seconds);
	const minTime = d3.min(data, (d) => d.Seconds);
	const maxPlace = d3.max(data, (d) => d.Place);
	const minPlace = d3.min(data, (d) => d.Place);
	
	//Scales set up here since always between these two extremes (always plotted)
	const xScaleSub = d3.scaleLinear()
                     .domain([maxTime, minTime])
                     .range([padding, w - padding]);
    
	
    const yScaleSub = d3.scaleLinear()
                     .domain([maxPlace, minPlace])
                     .range([h - padding, padding]);
/*
///////////////////////////////////////////////////
Function for Sub (Year graph)
///////////////////////////////////////////////////
*/	
		
	var renderSubGraph = function(clickedYear) {

		//Set up subgraph canvas
		let subGraph = svg.append("g").attr("class", "yearGraph");

		//Define filtered data + max and min obs
		let dataFiltered = data.filter((x) => x.Year == clickedYear || x.Seconds==maxTime || x.Seconds==minTime);


		//define circles to be plotted
		let subCircles = subGraph.selectAll("circle")
			.data(dataFiltered)
			.enter()
			.append("circle")
			.attr("cx", (d) => xScaleSub(d.Seconds))
			.attr("cy",(d) => yScaleSub(d.Place))
			.attr("r", (d) => 5)
			.style("fill",(d) => {
				if(d.Seconds==minTime) {
					return "#503C59";
					} else if(d.Seconds==maxTime) {
						return "#D93250";
					}
				})
			.style("opacity",0);
		
		
		//Legend, text and axis text	
		let backButtonGroup = subGraph.append("g");

		backButtonGroup
			.append("text")
			.attr("x", padding)
			.attr("y", padding)
			.text("Displaying Year: "+clickedYear+" (click any graph element to return)")
			.style("fill", "black")
			.style("opacity",0).transition().duration(1000).style("opacity",0.8);

		backButtonGroup
			.append("circle")
			.attr("cx", padding+w*0.006)
			.attr("cy", padding+h*0.015)
			.attr("r", 5)
			.style("fill", "#D93250")
			.style("opacity",0).transition().duration(1000).style("opacity",0.6);

		backButtonGroup
			.append("text")
			.attr("x", padding+w*0.016)
			.attr("y", padding+h*0.022)
			.text("Slowest Time in full sample (2013)")
			.style("fill", "black")
			.style("opacity",0).transition().duration(1000).style("opacity",0.8)
			.style("font-size","70%");
		

		backButtonGroup
			.append("circle")
			.attr("cx", padding+w*0.006)
			.attr("cy", padding+h*0.038)
			.attr("r", 5)
			.style("fill", "#503C59")
			.style("opacity",0).transition().duration(1000).style("opacity",0.6);

		backButtonGroup
			.append("text")
			.attr("x", padding+w*0.016)
			.attr("y", padding+h*0.045)
			.text("Fastest Time in full sample (1995)")
			.style("fill", "black")
			.style("opacity",0).transition().duration(1000).style("opacity",0.8)
			.style("font-size","70%");


		let axisLabelsSub = subGraph.append("g");
		axisLabelsSub
			.append("text")
			.attr("x", w/2)
			.attr("y", h-padding*0.5)
			.text("#Seconds")
			.style("opacity",0).transition().duration(1000).style("opacity",0.7)
			.style("font-size","90%");
		
		axisLabelsSub
			.append("text")
				.attr("transform", "rotate(-90)")
				.attr("y", 75)
				.attr("x", -220)
		    .style("text-anchor", "end")
		    .text("#Fastest Time")
		    .style("opacity",0).transition().duration(1000).style("opacity",0.7);

		const xAxisSub = d3.axisBottom(xScaleSub)
			.ticks(Math.floor(yearCountsArr.length/2)+1, "f");
		const yAxisSub = d3.axisLeft(yScaleSub)
			.ticks(7, "f");
		
		subGraph.append("g").attr("class", "xAxisSub")
		   .attr("transform", "translate(0," + (h - 0.85*padding) + ")")
		   .call(xAxisSub)
		   .style("opacity",0).transition().duration(1000).style("opacity",0.9);
		
		subGraph.append("g").attr("class", "yAxisSub")
				.attr("transform", "translate("+0.85*padding+",0)")
				.call(yAxisSub)
				.style("opacity",0)
				.transition().duration(1000).style("opacity",0.9);
		

		//Make the transition opf circles a bit smoother
		subCircles.transition().delay((d,i) => (dataFiltered.length-i)*200)
														.duration(1000)
														.style("opacity", 0.6)
		
		
		//Also need TEMP functions for subPlot tooltips...
		var showTooltipSub = function(d) {
			//hover effect
			d3.select(this).transition().duration(200).style("opacity",0.8);

			//The rest in this is just setting up tooltip
			let subTooltip = subGraph.append("g")
								.attr("class", "subTooltip")
			
			subTooltip.append("text")
				.attr("x",xScaleSub(d.Seconds-w*0.005))
				.attr("y",yScaleSub(d.Place+h*0.001))
				.attr("class", "tooltipSub")
				.text(d.Name + " (" + d.Nationality +")")
				.style("font-size","70%")
				.style("opacity", 0.8)
			subTooltip.append("text")
				.attr("x",xScaleSub(d.Seconds-w*0.005))
				.attr("y",yScaleSub(d.Place+h*0.005))
				.attr("class", "tooltipSub")
				.text("Rank: "+d.Place + "/35 ("+ d.Time + " min)")
				.style("fill", "black")
				.style("font-size","70%")
				.style("opacity", 0.8)
			
		}
		
		var delTooltipSub = function(d) {
			//hover out
			d3.select(this).transition().duration(200).style("opacity",0.6);
			//delete tooltip
			subGraph.selectAll("text.tooltipSub").transition().duration(80).remove();
			
		}
		
		//add event listeners
		subCircles.on("mouseover", showTooltipSub);
		subCircles.on("mouseout", delTooltipSub);
		
		//remove temp subgraph, go back to main graph
		//and set click SVG listener to null
		svg.on("click", function() {
			subGraph.remove();
			mainGraph.transition().duration(2000).style("opacity", "1");
			svg.on('click', null);
		});
		
	}


/*
///////////////////////////////////////////////////
Setting up Main Graph
///////////////////////////////////////////////////
*/	
	
	//Count Limits
	const countMin = d3.min(yearCountsArr, (d) => d[1]);
	const countMax = d3.max(yearCountsArr, (d) => d[1]);
	
	
    //Scales
    const xScaleMain = d3.scaleLinear()
                     .domain([yearMin, yearMax])
                     .range([padding, w - padding]);
    const yScaleMain = d3.scaleLinear()
                     .domain([countMin, countMax])
                     .range([h - padding, padding]);
    	

    //Define MainGraph Canvas
	const mainGraph = svg.append("g").attr("class", "mainGraph");
	
	//Add scatter points
	const mainCircles = mainGraph.selectAll("circle")
			.data(yearCountsArr)
			.enter()
			.append("circle")
			.attr("cx", (d) => xScaleMain(d[0]))
			.attr("cy",(d) => yScaleMain(d[1]))
			.attr("r", (d) => 8)
			.style("opacity",0.6);

	//Define and render axes+labels
    const xAxisMain = d3.axisBottom(xScaleMain).ticks(Math.floor(yearCountsArr.length/2)+1, "f");
	const yAxisMain = d3.axisLeft(yScaleMain).ticks(countMax, "f");
    
    mainGraph.append("g").attr("class", "xAxisMain")
       .attr("transform", "translate(0," + (h - 0.85*padding) + ")")
       .call(xAxisMain)
       .style("opacity",0).transition().duration(1000).style("opacity",0.7);
	
	mainGraph.append("g").attr("class", "yAxisMain")
		.attr("transform", "translate("+0.85*padding+",0)")
		.call(yAxisMain)
		.style("opacity",0).transition().duration(1000).style("opacity",0.7);

	let axisLabelsMain = mainGraph.append("g");
		axisLabelsMain
			.append("text")
			.attr("x", w/2)
			.attr("y", h-padding*0.5)
			.text("Year")
			.style("opacity",0).transition().duration(1000).style("opacity",0.5)
			.style("font-size","90%");
		
		axisLabelsMain
			.append("text")
				.attr("transform", "rotate(-90)")
				.attr("y", 75)
				.attr("x", -160)
		    .style("text-anchor", "end")
		    .text("#Top 35 Times Recorded")
		    .style("opacity",0).transition().duration(1000).style("opacity",0.5);


	
	//Hide all transition ON CLICK and LOAD sub (year) graph
	var hideMain = function(d) {
		if(d[1] !== 0) {
			mainGraph.transition().duration(2000).style("opacity", "0");
			
			let clickedYear = d[0];

			setTimeout(function(){ 
				//after slight delay/timeout, load sub graph
				renderSubGraph(clickedYear);
			}, 1500);
		}
	}
	
	//On mouseover, show tooltip on mouseout, remove
	var showTooltipMain = function(d) {
		//hover
		d3.select(this).transition().duration(200).style("opacity",0.8);
		
		//tooltip
		mainGraph.append("g")
			.append("text")
			.attr("x",xScaleMain(d[0]))
			.attr("y",yScaleMain(d[1]+.3))
			.attr("class", "tooltipMain")
			.text("Top times in " + d[0] + ": " + d[1])
			.style("font-size", "80%")
			.style("opacity", 0.7)
	}
	
	var delTooltipMain = function(d) {
		//unhover
		d3.select(this).transition().duration(200).style("opacity",0.6);
		//rm tooltip
		mainGraph.selectAll("text.tooltipMain").transition().duration(80).remove();
		
	}
	
	//listeners
	mainCircles.on("mouseover", showTooltipMain);
	mainCircles.on("mouseout", delTooltipMain);
	mainCircles.on("click", hideMain); //AND load sub...
	
	};
});







/*BACKUP DATA
//MAYBE ADD ALL ATTRIBUTES AS ONCE, AS SUCH:
.attr(
{
    "class":"horizontalGrid",
    "x1" : padding,
    "x2" : w,
    "y1" : function(d){ return yScaleMain(d);},
    "y2" : function(d){ return xScaleMain(d);},
    "fill" : "none",
    "shape-rendering" : "crispEdges",
    "stroke" : "black",
    "stroke-width" : "1px"
});



[
  {
    "Time": "36:50",
    "Place": 1,
    "Seconds": 2210,
    "Name": "Marco Pantani",
    "Year": 1995,
    "Nationality": "ITA",
    "Doping": "Alleged drug use during 1995 due to high hematocrit levels",
    "URL": "https://en.wikipedia.org/wiki/Marco_Pantani#Alleged_drug_use"
  },
  {
    "Time": "36:55",
    "Place": 2,
    "Seconds": 2215,
    "Name": "Marco Pantani",
    "Year": 1997,
    "Nationality": "ITA",
    "Doping": "Alleged drug use during 1997 due to high hermatocrit levels",
    "URL": "https://en.wikipedia.org/wiki/Marco_Pantani#Alleged_drug_use"
  },
  {
    "Time": "37:15",
    "Place": 3,
    "Seconds": 2235,
    "Name": "Marco Pantani",
    "Year": 1994,
    "Nationality": "ITA",
    "Doping": "Alleged drug use during 1994 due to high hermatocrit levels",
    "URL": "https://en.wikipedia.org/wiki/Marco_Pantani#Alleged_drug_use"
  },
  {
    "Time": "37:36",
    "Place": 4,
    "Seconds": 2256,
    "Name": "Lance Armstrong",
    "Year": 2004,
    "Nationality": "USA",
    "Doping": "2004 Tour de France title stripped by UCI in 2012",
    "URL": "https://en.wikipedia.org/wiki/History_of_Lance_Armstrong_doping_allegations"
  },
  {
    "Time": "37:42",
    "Place": 5,
    "Seconds": 2262,
    "Name": "Jan Ullrich",
    "Year": 1997,
    "Nationality": "GER",
    "Doping": "Confessed later in his career to doping",
    "URL": "https://en.wikipedia.org/wiki/Jan_Ullrich#Operaci.C3.B3n_Puerto_doping_case"
  },
  {
    "Time": "38:05",
    "Place": 6,
    "Seconds": 2285,
    "Name": "Lance Armstrong",
    "Year": 2001,
    "Nationality": "USA",
    "Doping": "2001 Tour de France title stripped by UCI in 2012",
    "URL": "https://en.wikipedia.org/wiki/History_of_Lance_Armstrong_doping_allegations"
  },
  {
    "Time": "38:14",
    "Place": 7,
    "Seconds": 2294,
    "Name": "Miguel Indurain",
    "Year": 1995,
    "Nationality": "ESP",
    "Doping": "1994 Failed test for salbutemol, not a banned drug at that time",
    "URL": "http://www.independent.co.uk/sport/drugs-in-sport-indurain-allowed-to-use-banned-drug-1379584.html"
  },
  {
    "Time": "38:14",
    "Place": 8,
    "Seconds": 2294,
    "Name": "Alex Zülle",
    "Year": 1995,
    "Nationality": "SUI",
    "Doping": "Confessed in 1998 to taking EPO",
    "URL": "https://en.wikipedia.org/wiki/Alex_Z%C3%BClle#Festina_affair"
  },
  {
    "Time": "38:16",
    "Place": 9,
    "Seconds": 2296,
    "Name": "Bjarne Riis",
    "Year": 1995,
    "Nationality": "DEN",
    "Doping": "Alleged drug use during 1995 due to high hermatrocite levels",
    "URL": "https://en.wikipedia.org/wiki/Bjarne_Riis#Doping_allegations"
  },
  {
    "Time": "38:22",
    "Place": 10,
    "Seconds": 2302,
    "Name": "Richard Virenque",
    "Year": 1997,
    "Nationality": "FRA",
    "Doping": "In 2000 confessed to doping during his career",
    "URL": "https://en.wikipedia.org/wiki/Richard_Virenque#Festina_affair"
  },
  {
    "Time": "38:36",
    "Place": 11,
    "Seconds": 2316,
    "Name": "Floyd Landis",
    "Year": 2006,
    "Nationality": "USA",
    "Doping": "Stripped of 2006 Tour de France title",
    "URL": "https://en.wikipedia.org/wiki/Floyd_Landis_doping_case"
  },
  {
    "Time": "38:36",
    "Place": 12,
    "Seconds": 2316,
    "Name": "Andreas Klöden",
    "Year": 2006,
    "Nationality": "GER",
    "Doping": "Alleged use of illegal blood transfusions in 2006",
    "URL": "https://en.wikipedia.org/wiki/Andreas_Kl%C3%B6den#2009_Doping_allegations"
  },
  {
    "Time": "38:40",
    "Place": 13,
    "Seconds": 2320,
    "Name": "Jan Ullrich",
    "Year": 2004,
    "Nationality": "GER",
    "Doping": "Confessed later in his career to doping",
    "URL": "https://en.wikipedia.org/wiki/Jan_Ullrich#Operaci.C3.B3n_Puerto_doping_case"
  },
  {
    "Time": "38:44",
    "Place": 14,
    "Seconds": 2324,
    "Name": "Laurent Madouas",
    "Year": 1995,
    "Nationality": "FRA",
    "Doping": "Tested positive for Salbutemol in 1994, suspended for 1 month",
    "URL": "http://www.dopeology.org/incidents/Madouas-positive/"
  },
  {
    "Time": "38:55",
    "Place": 15,
    "Seconds": 2335,
    "Name": "Richard Virenque",
    "Year": 1994,
    "Nationality": "FRA",
    "Doping": "In 2000 confessed to doping during his career",
    "URL": "https://en.wikipedia.org/wiki/Richard_Virenque#Festina_affair"
  },
  {
    "Time": "39:01",
    "Place": 16,
    "Seconds": 2341,
    "Name": "Carlos Sastre",
    "Year": 2006,
    "Nationality": "ESP",
    "Doping": "",
    "URL": ""
  },
  {
    "Time": "39:09",
    "Place": 17,
    "Seconds": 2349,
    "Name": "Iban Mayo",
    "Year": 2003,
    "Nationality": "ESP",
    "Doping": "Failed doping test in 2007 Tour de France",
    "URL": "https://en.wikipedia.org/wiki/Iban_Mayo"
  },
  {
    "Time": "39:12",
    "Place": 18,
    "Seconds": 2352,
    "Name": "Andreas Klöden",
    "Year": 2004,
    "Nationality": "GER",
    "Doping": "Alleged doping during 2006 Tour de France",
    "URL": "https://en.wikipedia.org/wiki/Operaci%C3%B3n_Puerto_doping_case"
  },
  {
    "Time": "39:14",
    "Place": 19,
    "Seconds": 2354,
    "Name": "Jose Azevedo",
    "Year": 2004,
    "Nationality": "POR",
    "Doping": "Implicated in the Operación Puerto doping case",
    "URL": "https://en.wikipedia.org/wiki/Operaci%C3%B3n_Puerto_doping_case"
  },
  {
    "Time": "39:15",
    "Place": 20,
    "Seconds": 2355,
    "Name": "Levi Leipheimer",
    "Year": 2006,
    "Nationality": "USA",
    "Doping": "Testified in 2012 to doping during his time with US Postal Service ",
    "URL": "http://www.wsj.com/articles/SB10000872396390444799904578048352672452328"
  },
  {
    "Time": "39:22",
    "Place": 21,
    "Seconds": 2362,
    "Name": "Francesco Casagrande",
    "Year": 1997,
    "Nationality": "ITA",
    "Doping": "Positive testosterone test in 1998",
    "URL": "http://autobus.cyclingnews.com/results/1998/sep98/sep2.shtml"
  },
  {
    "Time": "39:23",
    "Place": 22,
    "Seconds": 2363,
    "Name": "Nairo Quintana",
    "Year": 2015,
    "Nationality": "COL",
    "Doping": "",
    "URL": ""
  },
  {
    "Time": "39:23",
    "Place": 23,
    "Seconds": 2363,
    "Name": "Bjarne Riis",
    "Year": 1997,
    "Nationality": "DEN",
    "Doping": "Alleged drug use during 1995 due to high hermatrocite levels",
    "URL": "https://en.wikipedia.org/wiki/Bjarne_Riis#Doping_allegations"
  },
  {
    "Time": "39:30",
    "Place": 24,
    "Seconds": 2370,
    "Name": "Miguel Indurain",
    "Year": 1994,
    "Nationality": "ESP",
    "Doping": "1994 Failed test for salbutemol, not a banned drug at that time",
    "URL": "http://www.independent.co.uk/sport/drugs-in-sport-indurain-allowed-to-use-banned-drug-1379584.html"
  },
  {
    "Time": "39:30",
    "Place": 25,
    "Seconds": 2370,
    "Name": "Luc Leblanc",
    "Year": 1994,
    "Nationality": "FRA",
    "Doping": "Admitted to using epo and amphetimines throughout 1994 ",
    "URL": "http://www.dopeology.org/people/Luc_Leblanc/"
  },
  {
    "Time": "39:32",
    "Place": 26,
    "Seconds": 2372,
    "Name": "Carlos Sastre",
    "Year": 2008,
    "Nationality": "ESP",
    "Doping": "",
    "URL": ""
  },
  {
    "Time": "39:37",
    "Place": 27,
    "Seconds": 2377,
    "Name": "Vladimir Poulnikov",
    "Year": 1994,
    "Nationality": "UKR",
    "Doping": "",
    "URL": ""
  },
  {
    "Time": "39:40",
    "Place": 28,
    "Seconds": 2380,
    "Name": "Giuseppe Guerini",
    "Year": 2004,
    "Nationality": "ITA",
    "Doping": "",
    "URL": ""
  },
  {
    "Time": "39:41",
    "Place": 29,
    "Seconds": 2381,
    "Name": "Santos Gonzalez",
    "Year": 2004,
    "Nationality": "ESP",
    "Doping": "High Hematocrit during 2005 season, removed by team management",
    "URL": "http://www.cyclingnews.com/news/santos-gonzalez-sacked-by-phonak/"
  },
  {
    "Time": "39:41",
    "Place": 30,
    "Seconds": 2381,
    "Name": "Vladimir Karpets",
    "Year": 2004,
    "Nationality": "RUS",
    "Doping": "Made payments to Ferrari, but no charges filed",
    "URL": "http://www.dopeology.org/incidents/Ferrari-investigation/"
  },
  {
    "Time": "39:45",
    "Place": 31,
    "Seconds": 2385,
    "Name": "Fernando Escartin",
    "Year": 1995,
    "Nationality": "ESP",
    "Doping": "Implicated in Giardini Margherita Raid in 1998 as a 'victim' ",
    "URL": "http://www.dopeology.org/incidents/Giardini-Margherita-raid-%5bBologna%5d/"
  },
  {
    "Time": "39:47",
    "Place": 32,
    "Seconds": 2387,
    "Name": "Denis Menchov",
    "Year": 2006,
    "Nationality": "RUS",
    "Doping": "",
    "URL": ""
  },
  {
    "Time": "39:47",
    "Place": 33,
    "Seconds": 2387,
    "Name": "Michael Rasmussen",
    "Year": 2006,
    "Nationality": "DEN",
    "Doping": "Admitted to doping with multiple substances 1998-2010",
    "URL": "http://www.dopeology.org/people/Michael_Rasmussen/"
  },
  {
    "Time": "39:47",
    "Place": 34,
    "Seconds": 2387,
    "Name": "Pietro Caucchioli",
    "Year": 2006,
    "Nationality": "ITA",
    "Doping": "Associated with Mantova investigation, charges dropped",
    "URL": "http://www.cyclingnews.com/news/italian-judge-set-to-decide-if-32-named-in-mantova-doping-investigation-should-go-on-trial/"
  },
  {
    "Time": "39:50",
    "Place": 35,
    "Seconds": 2390,
    "Name": "Nairo Quintana",
    "Year": 2013,
    "Nationality": "COL",
    "Doping": "",
    "URL": ""
  }
]
*/