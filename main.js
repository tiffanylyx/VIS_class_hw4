

// using d3 for convenience
let main = d3.select("main");
let scrolly = main.select("#scrolly");
let svg = scrolly.select("svg");
let article = scrolly.select("article");
let step = article.selectAll(".step");
// 1. update height of step elements
let stepH = Math.floor(window.innerHeight * 0.75);
step.style("height", stepH + "px");
let svgHeight = window.innerHeight;
let svgWidth =  window.innerWidth
let svgMarginTop = (window.innerHeight - svgHeight) / 2;
/* ------------------- initialize your charts and groups here ------------------ */
svg
    .attr("height", svgHeight + "px")
    .attr('width', svgWidth)
    .style("top", svgMarginTop + "px");

// initialize the scrollama
let scroller = scrollama();
const csvFile1 = 'tweets_update.csv';
const csvFile2 = 'frequency.csv';
// Load both files concurrently
Promise.all([
  d3.csv(csvFile1),
  d3.csv(csvFile2)
]).then(function([data, frequency]) {


// generic window resize listener event
function handleResize() {


    scroller.resize();
}

// scrollama event handlers
function handleStepEnter(response) {
    console.log(response);
    // response = { element, direction, index }
    // add color to current step only
    step.classed("is-active", function (d, i) {
        return i === response.index;
    });
    // update graphic based on step
    switch (response.index) {
        case 0:
            show_wordle()
            break;
        case 1:
            createBars()
            break;
        case 2:
            updateColor()
            break;
        case 3:
            highlight_ai()
            break;
        case 4:
            highlight_crypto()
            break;
        case 5:
            highlight_highest()
            break;
        case 6:
            add_tooltip()
            break;
        case 7:
            createLines()
            break;
        case 8:
            select_word_frequency()
            break;
        case 9:
            select_word_frequency_2()
            break;
        case 10:
            add_tooltip_line()
            break;
        case 11:
            show_wordle_2()
            break;
        default:
            break;
    }
}
function init() {
    // 1. force a resize on load to ensure proper dimensions are sent to scrollama
    handleResize();
    // 2. setup the scroller passing options
    // 		this will also initialize trigger observations
    // 3. bind scrollama event handlers (this can be chained like below)
    scroller
        .setup({
            step: "#scrolly article .step",
            offset: 0.33,
            // debug: true
        })
        .onStepEnter(handleStepEnter);
    // setup resize event
    window.addEventListener('resize', handleResize);
}
// kick things off
init();
let line_height = svgHeight*0.7
let line_width = svgWidth*0.8
let bar_group = svg.append("g").style("opacity",0)
let line_group = svg.append("g").style("opacity",0)
let wordle_group = svg.append("g")
bar_group.attr("transform", "translate("+svgWidth*0.1 + ","+svgHeight*0.15 + ")")
line_group.attr("transform", "translate("+svgWidth*0.1 + ","+svgHeight*0.15 + ")")
wordle_group.attr("transform", "translate("+svgWidth*0.1 + ","+svgHeight*0.15 + ")")

let bars = bar_group.selectAll("rect")
// Step 1: Parse the dates and sort them
const parseDate = d3.timeParse("%Y-%m-%d %H:%M:%S%Z");
data.forEach(function(d) {
    // Extract only the date part and ignore the time for aggregation purposes
    d.date_new = parseDate(d.date.split('T')[0]);
});
// Find the minimum date in your dataset
let minDate = d3.min(data, d => d.date_new);

// If there's no valid minDate found (e.g., all undefined), exit the function or handle the error
if (!minDate) {
    console.log("No valid minimum date found.");
    return;
}

// Define the cutoff date as April 10th of the minDate's year
let cutoffDate = new Date(minDate.getFullYear(), 3, 11); // Note: Month is 0-indexed, so 3 represents April

// Filter the data to only include dates within the specified range
data = data.filter(d => d.date_new >= minDate && d.date_new <= cutoffDate);

let x;
let y;
create_wordle()
frequency = frequency.slice(0,100)
function create_wordle(){

  wordle_group.style("display", "block").style("opacity",1)
  bar_group.selectAll("*").remove()
  bar_group.style("display", "none");
  var layout = d3.layout.cloud()
    .size([line_width, line_height])  // Width and height of the word cloud
    .words(frequency.map(function(d) { return {text: d.hashtag, size:d.frequency}; }))
    .padding(5)  // Space between words
    .rotate(function() { return ~~(Math.random() * 2) * 90; })
    .font("Arial")
    .fontSize(function(d) {
      if(d.size>1000){
        return d.size/30
      }
      else if(d.size>100){
        return d.size/8; }
      else {return d.size/2};
      })
    .on("end", draw);

layout.start();
function draw(words) {
    const svg1 = wordle_group
        .append("g")
        .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")");

    svg1.selectAll("text")
        .data(words)
        .enter().append("text")
        .style("font-size", function(d) {
          return d.size + "px"; })
        .style("font-family", "Arial")
        .attr("text-anchor", "middle")
        .attr("transform", function(d) {
            return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
        })
        .text(function(d) { return d.text; })
        .attr("fill",'#1c5abd')
        .attr("opacity",0.3)
}
}
function show_wordle(){
  wordle_group
  .style("display", "block")  // Hide the element to prevent interaction
  .style("opacity",1)


  bar_group.style("display", "none")
}
function createBars(){
  wordle_group.transition()             // Start a transition
      .duration(1000)                 // Set duration of the transition (1000ms = 1 second)
      .style("opacity", 0)            // Target opacity (fades out)
      .on("end", function() {         // Once the transition completes
          d3.select(this).style("display", "none");  // Hide the element to prevent interaction
      });

  // Fade in wordle_group
  bar_group.style("display", "block").transition()      // Make sure the group is display:block
  .duration(1000)                 // Set duration of the transition (1000ms = 1 second)
  .style("opacity", 1)
  frequency = frequency.slice(0, 30)

  const x = d3.scaleBand()
    .range([ 0, line_width ])
    .domain(frequency.map(d => d.hashtag))
    .padding(0.2);

  bar_group.append("g")
    .attr("transform", `translate(0, ${line_height})`)
    .call(d3.axisBottom(x))
    .attr("class", "axis")
    .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");

  // Add Y axis
  const y = d3.scaleLinear()
    .domain([0, 5000])
    .range([ line_height, 0]);

  bar_group.append("g")
    .call(d3.axisLeft(y))
    .attr("class", "axis")

  // Bars
  bars = bars.data(frequency)
      .join("rect")
        .attr("x", d => x(d.hashtag))
        .attr("y", d => y(d.frequency))
        .attr("width", x.bandwidth())
        .attr("height", d => line_height - y(d.frequency));
  // X-axis label
  bar_group.append("text")
    .attr("text-anchor", "left")
    .attr("x", line_width+0) // 'width' and 'margin' need to be defined based on your SVG dimensions
    .attr("y", line_height + 40) // Adjust '40' to position the label below the X-axis
    .text("Hashtag")
    .style("font-size","20px")

    bar_group.append("text")
      .attr("text-anchor", "end")
      .attr("x", 0) // 'width' and 'margin' need to be defined based on your SVG dimensions
      .attr("y", -12) // Adjust '40' to position the label below the X-axis
      .text("Frequency")
    .style("font-size","20px")

 bars.attr("opacity",1)

bars.attr("fill", "#69b3a2")
}
function updateColor(){
  bars.attr("opacity",1)
  for(i in frequency){
    word = frequency[i].hashtag
    // Filter rows where the specified column has the desired value
    let filteredData = data.filter(function(d) {
        return d[word] === 'True';
    });
    // Extract values of the specified column
    let columnValues = filteredData.map(function(d) {
        return parseFloat(d['sentiment_score']);

    });

    // Compute the sum of the column values
    let sum = columnValues.reduce(function(total, currentValue) {
        return total + currentValue;
    }, 0);

    // Compute the average
    let average = sum / columnValues.length;
    frequency[i].sentiment = average
  }
  let colorScale = d3.scaleSequential()
      .domain([-1,1])
      .interpolator(d3.interpolatePlasma); // Or any other color interpolator

  bars.transition().duration(1000).attr("fill", function(d) {
      return colorScale(d.sentiment);
  });

  // Create a defs element to contain the gradient definition
  var defs = bar_group.append('defs');

  // Define the gradient
  var gradient = defs.append('linearGradient')
      .attr('id', 'gradient')
      .attr('x1', '0%') // gradient starts on the left
      .attr('y1', '0%')
      .attr('x2', '100%') // and to the right
      .attr('y2', '0%');

  // Define the color stops based on the interpolator
  gradient.selectAll('stop')
      .data(colorScale.ticks().map((t, i, n) => ({ offset: `${100*i/n.length}%`, color: colorScale(t) })))
      .enter().append('stop')
      .attr('offset', d => d.offset)
      .attr('stop-color', d => d.color);

  // Draw the rectangle and fill it with the gradient
  bar_group.append('rect')
      .attr('x', line_width-200)
      .attr('y', 0)
      .attr('width',  200) // Width of the legend
      .attr('height', 20) // Height of the legend
      .style('fill', 'url(#gradient)');

  // Create a scale and axis for the legend
  var legendScale = d3.scaleLinear()
      .domain(colorScale.domain())
      .range([0, 200]);

  var legendAxis = d3.axisBottom(legendScale)
      .ticks(5); // Adjust number of ticks to match your scale
  move = line_width-200

  // Add the legend axis
  bar_group.append('g')
      .attr('class', 'legend axis')
      .attr('transform', 'translate('+move+', 20)') // Position the axis right below the legend rectangle
      .call(legendAxis);
}
function highlight_highest(){
  let maxWord = frequency.reduce(function(prev, current) {
    return (prev.sentiment > current.sentiment) ? prev : current;
});
  select_word = [maxWord.hashtag]
  res = highlight_word(select_word)
  var paragraph = document.getElementById("p-highest-positive");
  paragraph.textContent = "The most positive posting: \" "+res[0]+"\"";
  var paragraph2 = document.getElementById("p-highest-negative");
  paragraph2.textContent = "The most negative posting: \" "+res[1]+"\"";
}
function highlight_crypto(){
  bars.attr("opacity",1)
  let maxWord = frequency.reduce(function(prev, current) {
    return (prev.sentiment > current.sentiment) ? prev : current;
});
  select_word = ['hodl','crypto', 'airdrop','nft','web3','ath']
  res = highlight_word(select_word)
  bars.on("mouseover",null)
  var paragraph = document.getElementById("p-cry-positive");
  paragraph.textContent = "The most positive posting: \" "+res[0]+"\"";
  var paragraph2 = document.getElementById("p-cry-negative");
  paragraph2.textContent = "The most negative posting: \" "+res[1]+"\"";
}
function highlight_ai(){
  select_word = ['ai']
  res = highlight_word(select_word)
  bars.on("mouseover",null)
  var paragraph = document.getElementById("p-AI-positive");
  paragraph.textContent = "The most positive posting: \" "+res[0]+"\"";
  var paragraph2 = document.getElementById("p-AI-negative");
  paragraph2.textContent = "The most negative posting: \" "+res[1]+"\"";
}
function add_tooltip(){
  bar_group.style("display", "block").style("opacity",1)
  line_group.style("display", "none");
  var tooltip = d3.select("#tooltip");
  bars.attr("opacity",1)
  bars.on("mouseover", function(event, d) {
      bars.attr("opacity", 0.3);
      d3.select(this).attr("opacity", 1);

      tooltip.style("opacity", 1);
      tooltip.html(`Hashtag: ${d.hashtag}<br>Frequency: ${d.frequency}<br>Sentiment: ${d.sentiment.toFixed(2)}`)
        .style("left", (event.pageX + 10) + "px") // Position the tooltip
        .style("top", (event.pageY - 100) + "px");
    })
    .on("mouseout", function() {
      bars.attr("opacity", 0.3);
      tooltip.style("opacity", 0);
    });
}
let legend
let dataSeries1
let dataSeries2
let dataSeries3
let line_1 = line_group.append("path")
let line_2 = line_group.append("path")
let line_3 = line_group.append("path")

y = d3.scaleLinear()
    .range([line_height, 0])
    .domain([0, 4500]);
x = d3.scaleTime()
    .range([0, line_width])


function select_word_frequency(){
  line_2.selectAll("*").remove()
  line_2 = line_group.append("path")


  select_word = 'ai'
  let filteredData = data.filter(function(d) {
      return d[select_word] === 'True';
  });
  // Step 2: Aggregate data by date using d3.group and d3.rollup
  let groupedData = Array.from(d3.group(filteredData, d => d3.timeDay(d.date_new)), ([key, value]) => ({ key, value }));
  let dataAggregatedByDate = groupedData.map(function(group) {
      return { date: group.key, count: group.value.length };
  });
  dataAggregatedByDate = full_date(dataAggregatedByDate)


  // Ensure the aggregated data is sorted by date
  dataAggregatedByDate.sort((a, b) => a.date - b.date);
  x.domain(d3.extent(dataAggregatedByDate, function(d) { return d.date; }))

  const line = d3.line()
      .x(function(d) { return x(d.date); })
      .y(function(d) { return y(d.count); });

  line_1 = line_group.append("path")
    .datum(dataAggregatedByDate)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .attr("d", line)

  // Step 5: Add the X Axis
  line_group.append("g")
      .attr("transform", "translate(0," + line_height + ")")
      .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%b %d"))

);

  // Step 6: Add the Y Axis
  line_group.append("g")
      .call(d3.axisLeft(y))
      .attr("class", "axis")

  // Create color rectangle
  legend.append("rect")
    .attr("width", 30)
    .attr("height", 15)
    .attr("y",30)
    .style("fill", "steelblue");

  // Add label text
  legend.append("text")
    .attr("x", 45)
    .attr("y", 40)
    .text("#AI")
    .style("font-size", "16px")
    .attr("alignment-baseline", "middle");
  dataSeries1 = dataAggregatedByDate
}

function select_word_frequency_2() {
  select_word = 'chatgpt'

  let filteredData = data.filter(function(d) {
      return d[select_word] === 'True';
  });
  // Step 2: Aggregate data by date using d3.group and d3.rollup
  let groupedData = Array.from(d3.group(filteredData, d => d3.timeDay(d.date_new)), ([key, value]) => ({ key, value }));
  let dataAggregatedByDate = groupedData.map(function(group) {
      return { date: group.key, count: group.value.length };
  });
  dataAggregatedByDate = full_date(dataAggregatedByDate)

  // Ensure the aggregated data is sorted by date
  dataAggregatedByDate.sort((a, b) => a.date - b.date);
  console.log(dataAggregatedByDate)

  const line = d3.line()
      .x(function(d) { return x(d.date); })
      .y(function(d) { return y(d.count); });
 line_2.datum(dataAggregatedByDate)
    .attr("fill", "none")
    .attr("stroke", "red")
    .attr("stroke-width", 1.5)
    .attr("d", line)

    // Create color rectangle
    legend.append("rect")
      .attr("width", 30)
      .attr("height", 15)
      .attr("y",60)
      .style("fill", "red");

    // Add label text
    legend.append("text")
      .attr("x", 45)
      .attr("y", 70)
      .text("#ChatGPT")
      .style("font-size", "16px")
      .attr("alignment-baseline", "middle");
    dataSeries2 = dataAggregatedByDate
    line_group.selectAll("rect").on("mousemove", null)

}
function full_date(dataAggregatedByDate){
  const dateExtent = d3.extent(dataAggregatedByDate, d => d.date);

// 2. Generate a list of all dates in the range
const timeScale = d3.scaleTime()
    .domain(dateExtent)
    .range([dateExtent[0], dateExtent[1]]);

// Using d3.utcDay.every(1) to generate every day between the start and end date
const allDates = d3.utcDay.range(timeScale.domain()[0], d3.utcDay.offset(timeScale.domain()[1], 1));

// 3. Fill in missing dates with count of 0
let completeData = allDates.map(d => {
  // Check if the date exists in the aggregated data
  const existing = dataAggregatedByDate.find(p =>
  p.date.getFullYear() === d.getFullYear() &&
  p.date.getMonth() === d.getMonth() &&
  p.date.getDate() === d.getDate())
  return existing || { date: d, count: 0 };
});
return completeData
}
function highlight_word(select_words){
  bars.transition().duration(1000).attr("opacity", function(d) {
    if(select_words.includes(d.hashtag)){
      return 1
    }
  else{
    return 0.2
  }
  });
  let filteredData = data.filter(function(d) {
      // Return true if any of the select_words columns has a value of 'True'
      return select_words.some(function(column) {
          return d[column] === 'True';
      });
  });
  // Assuming 'column' is the name of the column for which you want the highest value
  let maxRow = filteredData.reduce(function(prev, current) {
      return (prev['sentiment_score'] > current['sentiment_score']) ? prev : current;
  }, filteredData[0]); // Start comparing from the first item
  max_text = maxRow.text,maxRow.sentiment_score
  let minRow = filteredData.reduce(function(prev, current) {
      return (prev['sentiment_score'] < current['sentiment_score']) ? prev : current;
  }, filteredData[0]); // Start comparing from the first item
  min_text = minRow.text,minRow.sentiment_score
  return [max_text,min_text]


}
function createLines() {
  bar_group.transition()             // Start a transition
      .duration(1000)                 // Set duration of the transition (1000ms = 1 second)
      .style("opacity", 0)            // Target opacity (fades out)
      .on("end", function() {         // Once the transition completes
          d3.select(this).style("display", "none");  // Hide the element to prevent interaction
      });
  line_group.selectAll("*").remove()
  // Fade in wordle_group
  line_group.style("display", "block").transition()      // Make sure the group is display:block
  .duration(1000)                 // Set duration of the transition (1000ms = 1 second)
  .style("opacity", 1)



  let columns = [...new Set(frequency.map(item => item.hashtag))];


  let groupedData = Array.from(d3.group(data, d => d3.timeDay(new Date(d.date_new))), ([key, value]) => ({ key, value }));

  let dataAggregatedByDate = groupedData.map(function(group) {
    let countByColumn = {};

    group.value.forEach(d => {
      // Assuming 'columns' is an array of your specific column names to check
      columns.forEach(column => {
        if (d[column] === 'True') {
          if (!countByColumn[column]) {
            countByColumn[column] = 0;
          }
          countByColumn[column]++;
        }
      });
    });

    // Find the column with the most 'True' values
    let maxColumn = Object.keys(countByColumn).reduce((a, b) => countByColumn[a] > countByColumn[b] ? a : b, null);

    return {
      date: group.key,
      count: group.value.length,
      mostTrueColumn: maxColumn,
      mostTrueCount: maxColumn ? countByColumn[maxColumn] : 0
    };
  });

  dataAggregatedByDate = full_date(dataAggregatedByDate)

  // Ensure the aggregated data is sorted by date
  dataAggregatedByDate.sort((a, b) => a.date - b.date);
  x.domain(d3.extent(dataAggregatedByDate, function(d) { return d.date; }))

  const line = d3.line()
      .x(function(d) { return x(d.date); })
      .y(function(d) { return y(d.count); });
  // Set up your scales (x, y) and the svg element just like before, then you can create your line chart
  // ...
  // Make sure to use the correct variable for your line path data binding:
  // Add the line
  line_3 = line_group.append("path")
    .datum(dataAggregatedByDate)
    .attr("fill", "none")
    .attr("stroke", "orange")
    .attr("stroke-width", 1.5)
    .attr("d", line)

  // Step 5: Add the X Axis
  line_group.append("g")
      .attr("transform", "translate(0," + line_height + ")")
      .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%b %d"))
);

  // Step 6: Add the Y Axis
  line_group.append("g")
      .call(d3.axisLeft(y))
      .attr("class", "axis")
  dataSeries3 = dataAggregatedByDate
  // Remove any existing legend
  line_group.selectAll(".legend").remove();

  legend = line_group.append("g")

  // Create legend group
  legend
    .attr("class", "legend")
    .attr("transform", `translate(${line_width-150}, ${10})`);

  // Create color rectangle
  legend.append("rect")
    .attr("width", 30)
    .attr("height", 15)
    .style("fill", "orange");

  // Add label text
  legend.append("text")
    .attr("x", 45)
    .attr("y", 10)
    .text("All post")
    .style("font-size", "16px")
    .attr("alignment-baseline", "middle");
  // X-axis label
  line_group.append("text")
    .attr("text-anchor", "left")
    .attr("x", line_width+0) // 'width' and 'margin' need to be defined based on your SVG dimensions
    .attr("y", line_height + 40) // Adjust '40' to position the label below the X-axis
    .text("Date")
    .style("font-size","20px")

    line_group.append("text")
      .attr("text-anchor", "end")
      .attr("x", 0) // 'width' and 'margin' need to be defined based on your SVG dimensions
      .attr("y", -12) // Adjust '40' to position the label below the X-axis
      .text("Frequency")
    .style("font-size","20px")
}
function add_tooltip_line(){
  wordle_group.transition()             // Start a transition
      .duration(1000)                 // Set duration of the transition (1000ms = 1 second)
      .style("opacity", 0)            // Target opacity (fades out)
      .on("end", function() {         // Once the transition completes
          d3.select(this).style("display", "none");  // Hide the element to prevent interaction
      });

  // Fade in wordle_group
  line_group.style("display", "block").transition()      // Make sure the group is display:block
  .duration(1000)                 // Set duration of the transition (1000ms = 1 second)
  .style("opacity", 1)            // Target opacity (fades out)

  var focusLine = line_group.append("line")
    .attr("class", "focus-line")
    .style("stroke", "#333") // Set the color of the line
    .style("stroke-width", 1.5) // Set the width of the line
    .style("stroke-dasharray", "3,3") // Optional: Make it a dashed line
    .style("opacity", 0) // Initially hidden
    .attr("y1", 0)
    .attr("y2", line_height);

  line_group.append("rect")
    .attr("class", "overlay")
    .attr("width", line_width)
    .attr("height", line_height)
    .style("fill", "none")
    .style("pointer-events", "all")
    .on("mousemove", mousemove)
    .on("mouseout", () => d3.select("#tooltip").style("opacity", 0)); // Hide tooltip on mouse out

  function mousemove(event) {
    var x0 = x.invert(d3.pointer(event, this)[0]); // x0 is the date corresponding to mouse position

    // Find closest points for each series
    var i_all = d3.bisector(d => d.date).left(dataSeries3, x0, 1);
    var i_chatgpt = d3.bisector(d => d.date).left(dataSeries2, x0, 1);
    var i_ai = d3.bisector(d => d.date).left(dataSeries1, x0, 1);

    var d_all = dataSeries3[i_all - 1]; // Closest point in orange series
    var d_ai = dataSeries1[i_ai - 1];     // Closest point in blue series
    var d_chatgpt = dataSeries2[i_chatgpt - 1];       // Closest point in red series

    // Show the tooltip next to the mouse cursor
    d3.select("#tooltip")
      .style("opacity", 1)
      .html("Date: " + x0.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + "<br/>" +
          "Most popular hashtag: "+ (d_all ? d_all.mostTrueColumn : 'N/A') + "<br/>" +
          "All post Count: " + (d_all ? d_all.count : 'N/A') + "<br/>" +
          "#AI Count: " + (d_ai ? d_ai.count : 'N/A') + "<br/>" +
          "#ChatGPT Count: " + (d_chatgpt ? d_chatgpt.count : 'N/A'))
      .style("left", (event.pageX + 10) + "px")
      .style("top", (event.pageY - 20) + "px");

    // Move the focus line
    focusLine.attr("x1", x(x0))
             .attr("x2", x(x0))
             .attr("y1", y(d_all.count))
             .style("opacity", 1); // Make the line visible
  }

  // Hide focus line and tooltip when the mouse leaves the chart
  line_group.select(".overlay").on("mouseout", function() {
    d3.select("#tooltip").style("opacity", 0);
    focusLine.style("opacity", 0);
  });
  wordle_group.style("opacity", 0)
}
function show_wordle_2(){
  line_group.transition()             // Start a transition
      .duration(1000)                 // Set duration of the transition (1000ms = 1 second)
      .style("opacity", 0)            // Target opacity (fades out)
      .on("end", function() {         // Once the transition completes
          d3.select(this).style("display", "none");  // Hide the element to prevent interaction
      });

  // Fade in wordle_group
  wordle_group.style("display", "block").transition()      // Make sure the group is display:block
  .duration(1000)                 // Set duration of the transition (1000ms = 1 second)
  .style("opacity", 1)            // Target opacity (fades out)
}
})
