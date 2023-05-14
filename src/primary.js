fetch("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json")
.then(res => res.json())
.then(res =>{
  let dataSet = res
  chart(dataSet)
});
let padding = 0
let padding1 = {
  left: 0,
  right: 0,
  top: 0
}
chart = (data) => {
  if(document.getElementById("master").clientWidth > 800){
    padding = 60
  } else {
    padding = 50
    padding1.left = -40
    padding1.right = -20
    padding1.top = -30
  }
  console.log(padding)
  let h = document.getElementById("master").clientHeight;
  let w = document.getElementById("master").clientWidth;
  let cellHeight = ( h - (padding * 2 + padding1.left))/12;
  let cellWidth = (w - padding * 2) / Math.floor(data.monthlyVariance.length/12)
  
  let svg = d3.select("#master").append("svg").attr("id", "svg").attr("width", w).attr("height", h);
  
 
  
  // xAxis
  let checker = [];
  let years = data.monthlyVariance.map(d => d.year);
  let minX = d3.min(years);
  let maxX = d3.max(years);
  let xScale = d3.scaleTime()
  xScale.domain([minX, maxX]).range([padding, w - padding * 3 - padding1.left*2]);
  let xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d")).tickValues(years.filter(d => {
    if(document.getElementById("master").clientWidth > 800){
               if(!checker.includes(d)){
                 checker.push(d);
                 return d % 10 == 0
               }} else {
                 if(!checker.includes(d)){
                 checker.push(d);
                 return d % 20 == 0
               }
  }})).tickFormat(d => {
    let year = new Date(0);
    year.setUTCFullYear(d);
    let format = d3.timeFormat("%Y");
    return format(year)
  })
  svg.append("g").attr("transform", "translate(" + (padding + padding1.left) + "," + (h - padding) + ")").attr("class", "x-axis").call(xAxis).attr("id", "x-axis");
  
  svg.append("text").attr("x", w/2).attr("y", h - padding/2.8).attr("id", "axis-key").text("Years");
  
  //y axis
  let months = data.monthlyVariance.map(d => d.month)
  let minY = d3.min(months);
  let maxY = d3.max(months);
  let yScale = d3.scaleTime().domain([minY, maxY]).range([padding , h - padding])
  let yAxis = d3.axisLeft(yScale).tickFormat(function (month) {
      var date = new Date(0);    
      date.setUTCMonth(month);
      var format = d3.timeFormat('%B');
      return format(date);})
                    
  svg.append("g").attr("transform", "translate(" + (padding * 2 + padding1.left) + ","+ (-cellHeight) +")").call(yAxis).attr("id", "y-axis");
  
  svg.append("text").attr("transform", "translate(" + (h/8 + padding1.left - 10) + "," + (h/2) + ")" + "rotate(-90)").attr("id", "axis-key").text("Months");
  
  //temperature scale
  let temp = data.monthlyVariance.map(d => (data.baseTemperature + d.variance).toFixed(1))
  let tScale = d3.scaleLinear();
  let minT = d3.min(temp)
  let maxT = d3.max(temp)
  console.log(temp)
  tScale.domain([minT, maxT]).range([0, 8])
  
  
  //graph
  
  let color = ["#08519c", "#3182bd", "#6baed6", "#bdd7e7", "#ffffcc", "#ffeda0", "#fed976", "#feb24c", "#fd8d3c", "#fc4e2a", "#e31a1c", "#bd0026", "#800026"];
  let barWidth = (w - 2 * padding) / data.monthlyVariance.length;
  
  let toolbox = d3.select("#master").append("div").attr("id", "tooltip").style("display", "none")
  
  let map = svg
    .selectAll("rect")
    .data(data.monthlyVariance)
    .enter()
    .append("rect")
    .attr("class", "cell")
    .attr("data-month", d => d.month)
    .attr("data-year", d => d.year)
    .attr("data-temp", d => data.baseTemperature + d.variance)
    .attr("x", (d) => padding + xScale(d.year) + padding1.left)
    .attr("y", (d) => yScale(d.month) - cellHeight)
    .attr("width", cellWidth)
    .attr("height", ((d) => cellHeight))
    .attr("fill", d => 
          color[Math.round(tScale(data.baseTemperature + d.variance))]
         )
    .on("mouseover", (d, i) => {
      let date = new Date(i.year, i.month)
      let str = d3.timeFormat("%Y - %B")(date)
      toolbox
    .style("display", "inline")
    .style("left", d.pageX + "px")
    .attr("data-year", i.year)
    .style("top", d.pageY + "px")      
    .style("transform", "translate(-50%, -110%)")
    .html(`${str} <br> ${(data.baseTemperature + i.variance).toFixed(1)}&#176C <br> ${i.variance}`)}
    )
  .on("mouseout", d => 
     toolbox.style("display", "none")
     )
  
  //legend
  //x axis
  let legendXScale = d3.scaleLinear()
  
  legendXScale
  .domain([0.5, 14.5])
  .range([0, h /1.5])
  
  let legendXAxis = d3.axisLeft(legendXScale)
  svg.append("g").attr("transform", "translate(" + (w - padding - padding1.right) + "," + h/7.56 + ")").call(legendXAxis)
  
  let legendContainer = svg.append("g").attr("id", "legend")
  
  legendContainer
  .selectAll("rect")
  .data(color)
  .enter()
  .append("rect")
  .attr("height", (h - (padding*2.3) + (padding1.top * 2.3)) / 13)
  .attr("width", 20)
  .attr("x", w - padding - padding1.right)
  .attr("y", (d, i) =>  legendXScale(i) +  h /5.6)
  .attr("fill", d => d)
  legendContainer
  .append("text")
  .attr("x", w - padding * 1.01 - padding1.right)
  .attr("y", padding * 0.6 - padding1.right)
  .attr("id", "axis-key")
  .text("\u00B0C")
}