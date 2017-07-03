import React from 'react';

export default class ModeSelector extends React.Component {

  getCheckedAttr (mode) {
    return this.props.mode === mode;
  }

  render () {
    return (
      <div className="mode-selector">
        <h4>Modo</h4>
        <div className="radio-selector">
          <input
            id="chart-mode-interanual"
            type="radio"
            name="chart-mode"
            value="interannual"
            checked={this.getCheckedAttr('interannual')}
            onChange={this.props.onChange.bind(this, 'interannual')} />
          <label htmlFor="chart-mode-interanual">Interanual</label>
        </div>
        <div className="radio-selector">
          <input
            id="chart-mode-comparative"
            type="radio"
            name="chart-mode"
            value="comparative"
            checked={this.getCheckedAttr('comparative')}
            onChange={this.props.onChange.bind(this, 'comparative')} />
          <label htmlFor="chart-mode-comparative">Comparativo</label>
        </div>
      </div>
    )
  }
}