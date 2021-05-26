import React, { Component } from "react";
import * as d3 from "d3";
import { jStat } from "jstat";
import "./App.css";

const width = 500;
const height = 300;
const margin = { top: 20, right: 5, bottom: 25, left: 35 };

const Random_normal_Dist = (mean, sd) => {
  const data = [];
  for (let i = mean - 4 * sd; i < mean + 4 * sd; i += 1) {
    const q = i;
    const p = jStat.normal.pdf(i, mean, sd);
    const arr = {
      q: q,
      p: p,
    };
    data.push(arr);
  }
  return data;
};

const parsingColor = (dx) => {
  console.log(dx);
  if (dx >= 0 && dx < 10) {
    return "yellow";
  } else if (dx >= 10 && dx < 20) {
    return "green";
  } else if (dx >= 20 && dx < 30) {
    return "blue";
  } else if (dx >= 30 && dx < 40) {
    return "purple";
  } else {
    return "#42734F";
  }
};

//fill: parseInt(d.x0) >= 25 ? "orange" : "#124abc",

class App extends Component {
  state = {
    data: [],
    text: [],
    bins: [],
    scaleX: null,
    scaleY: null,
    bars: [],
  };

  xAxis = React.createRef();
  yAxis = React.createRef();
  filename = "";

  handleCSV = (e) => {
    this.filename = e.target.files[0].name;
    d3.csv(URL.createObjectURL(e.target.files[0])).then((d) => {
      console.log("start parsing");
      const value = d.map((i) => i.value);
      console.log(value);

      this.drawSvg(value);
    });
  };

  drawSvg = (rawData) => {
    const scaleX = d3
      .scaleLinear()
      .domain([0, 55])
      .range([margin.left, width - margin.left]);

    const histogram = d3
      .histogram()
      .value((d) => d)
      .domain(scaleX.domain())
      .thresholds(scaleX.ticks(10));

    const bins = histogram(rawData);

    const scaleY = d3.scaleLinear().range([height - margin.bottom, margin.top]);
    scaleY.domain([0, d3.max(bins, (d) => d.length + 10)]);
    console.log(bins);

    const bars = bins.map((d) => {
      return {
        x: scaleX(d.x0),
        y: scaleY(d.length),
        height: height - scaleY(d.length) - margin.bottom,
        width: 40,
        // fill: parseInt(d.x0) >= 25 ? "orange" : "#124abc",
        fill: parsingColor(parseInt(d.x0)),
      };
    });

    //   const textLabels = updateData.map(d => ({
    //     x: xScale(d.unit) + 7 - barPadding,
    //     y: yScaleRight(d.total),
    //     text: d.total,
    // }))

    const text = bins.map((d) => {
      return {
        x: scaleX(d.x0 + 2),
        y: scaleY(d.length + 2),
        text: d.length,
      };
    });

    this.setState({ bars, scaleX, scaleY, text });
  };

  componentDidUpdate() {
    console.log("component udpated");
    this.createAxis();
  }

  createAxis = () => {
    const { scaleX, scaleY } = this.state;
    let xAxisD3 = d3.axisBottom().tickFormat((d) => `${d}%`);
    let yAxisD3 = d3.axisLeft().tickFormat((d) => d);

    xAxisD3.scale(scaleX);

    if (this.xAxis.current) {
      console.log("draw x");
      d3.select(this.xAxis.current).call(xAxisD3);
    }

    yAxisD3.scale(scaleY);

    if (this.yAxis.current) {
      console.log("draw y");
      d3.select(this.yAxis.current).call(yAxisD3);
    }
  };

  render() {
    const { bars, text } = this.state;
    return (
      <div className="App">
        <header className="App-header">
          <div>
            <input type="file" onChange={this.handleCSV} />
          </div>
          <svg width={width} height={height}>
            {bars.length
              ? bars.map((d, i) => (
                  <rect
                    key={i}
                    x={d.x}
                    y={d.y}
                    width={d.width}
                    height={d.height}
                    fill={d.fill}
                    stroke="#000"
                  />
                ))
              : null}
            {text.length
              ? text.map((d, i) => (
                  <text
                    key={i}
                    x={d.x}
                    y={d.y}
                    stroke="#333"
                    fontSize="12px"
                    fontFamily="sans-serif"
                  >
                    {d.text}
                  </text>
                ))
              : null}

            <g
              ref={this.xAxis}
              transform={`translate(0, ${height - margin.bottom})`}
            />
            <g ref={this.yAxis} transform={`translate(${margin.left}, 0)`} />
          </svg>
        </header>
      </div>
    );
  }
}

export default App;
