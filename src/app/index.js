import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';

import IaChart from './components/ia-chart';
import ModeSelector from './components/mode-selector';
import MetricSelector from './components/metric-selector';

import '../styles/style.scss';

class Interanual extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      metrics: ['total'],
      mode: 'interannual',
      metricColors: {}
    };
  }

  updateMode (mode) {
    this.setState({ mode });
    this.updateMetrics(null);
  }

  updateMetrics (metric) {
    const newMetric = metric || _.head(this.state.metrics);
    const newMetrics = this.state.mode === 'interannual'
      ? [newMetric]
      : _.xor(this.state.metrics, [newMetric]);

    this.setState({ metrics: newMetrics });
  }

  onChartLoad (data) {
    // Wait for all components to render
     window.setTimeout(() => { this.setState({ metricColors: data.colors }); }, 10);
  }

  render () {
    return (
      <div>
        <div className="block full-width clearfix">
          <div className="info-col">
            <ul id="info-table" className="info-table"></ul>
          </div>

          <IaChart metrics={this.state.metrics}
            onLoad={this.onChartLoad.bind(this)} />
        </div>

        <div className="chart-options block clearfix">

          <ModeSelector
            mode={this.state.mode}
            onChange={this.updateMode.bind(this)} />

          <MetricSelector
            metrics={this.state.metrics}
            metricColors={this.state.metricColors}
            onChange={this.updateMetrics.bind(this)} />

        </div>
      </div>
    )
  }
}

ReactDOM.render(<Interanual />, document.getElementById('chart'));
