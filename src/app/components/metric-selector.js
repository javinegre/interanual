import React from 'react';
import _ from 'lodash';

import metrics from '../data/metrics';

export default class MetricSelector extends React.Component {
  getMetricClass (key) {
    return this.props.metrics.indexOf(key) >= 0
      ? 'toggle active'
      : 'toggle'
  }

  getMetricColor (key) {
    return _.has(this.props.metricColors, key)
      ? { borderBottomColor: this.props.metricColors[key] }
      : {};
  }

  getButtons (metrics) {
    return metrics.map(item => {
      return <li
        className={this.getMetricClass(item.key)}
        style={this.getMetricColor(item.key)}
        onClick={this.props.onChange.bind(this, item.key)}
        key={item.key}>
        {item.title}
      </li>
    });
  }

  render () {
    return (
      <div className="metric-selector clearfix">
        <div className="metric-selector-block clearfix">
          <h4>General</h4>
          <ul className="general-selector">
            {this.getButtons(metrics.filter( item => item.type === 'general' ))}
          </ul>
        </div>
        <div className="metric-selector-block clearfix">
          <h4>Autonomias</h4>
          <ul className="regional-selector">
            {this.getButtons(metrics.filter( item => item.type === 'regional' ))}
          </ul>
        </div>
      </div>
    )
  }
}