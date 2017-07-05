import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';

import IaChart from './components/ia-chart';
import DataTable from './components/data-table';
import ModeSelector from './components/mode-selector';
import MetricSelector from './components/metric-selector';

import metricList from './data/metrics';

import '../styles/style.scss';

class Interanual extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      metrics: ['total'],
      mode: 'interannual',
      tableData: null,
      metricColors: {}
    };
  }

  updateMode (mode) {
    this.updateMetrics(null, mode);
  }

  updateMetrics (metric, mode) {
    const newMetric = metric || _.head(this.state.metrics);
    const newMode = mode || this.state.mode;

    let newMetrics;

    if (newMode === 'interannual') {
      newMetrics = [newMetric];
    } else {
      newMetrics = _.xor(this.state.metrics, [newMetric]);

      if (newMetrics.length === 0) {
        newMetrics = [_.nth(metricList, 0).key, _.nth(metricList, 1).key];
      }
      else if (newMetrics.length === 1 && _.head(newMetrics) == _.nth(metricList, 0).key) {
        newMetrics.push(_.nth(metricList, 1).key);
      }
      else if (newMetrics.length === 1) {
        newMetrics.push(_.nth(metricList, 0).key);
      }
    }

    this.setState({
      mode: newMode,
      metrics: newMetrics
    });
  }

  onChartLoad (data) {
    // Wait for all components to render
    window.setTimeout(() => { this.setState({ metricColors: data.colors }); }, 5);
  }

  onDataReceived (data) {
    // Wait for all components to render
    window.setTimeout(() => { this.setState({ tableData: data }); }, 10);
  }

  render () {
    return (
      <div>
        <div className="block full-width clearfix">

          <DataTable
            metrics={this.state.metrics}
            data={this.state.tableData} />

          <IaChart
            metrics={this.state.metrics}
            onLoad={this.onChartLoad.bind(this)}
            onDataReceived={this.onDataReceived.bind(this)} />

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
