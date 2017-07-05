import React from 'react';
import D3IaChart from '../charts/charts';

export default class IaChart extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      data: []
    };

    this.chart = null;
  }

  componentDidMount() {
    this.chart = new D3IaChart({
      selector: 'chart-wrapper', // ID selector
      node: this.$svg,
      data: this.state.data,
      onLoad: this.props.onLoad.bind(this),
      cb: this.props.onDataReceived.bind(this)
    });

    d3.csv('data/interanual.csv', (csvData) => {
      this.chart.setData(csvData);
      this.forceUpdate();
    });
  }

  shouldComponentUpdate (nextProps, nextState) {
    // Avoid rendering loop after setting colors to metrics
    return !_.isEqual(this.props.metrics.concat().sort(), nextProps.metrics.concat().sort());
  }

  render () {
    this.chart && this.chart.build({ keys: this.props.metrics });

    return (
      <div id="chart-wrapper" className="chart-wrapper">
        <svg ref={el => {this.$svg = el;}}></svg>
      </div>
    );
  }
}