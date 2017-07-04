import React from 'react';

import DataTableInterannual from './data-table-interannual';
import DataTableComparative from './data-table-comparative';

export default class DataTable extends React.Component {
  constructor (props) {
    super(props);
  }

  getEmptyTable () {
    return
      <ul id="info-table" className="info-table">
        <li>No data</li>
      </ul>;
  }

  getTableContent () {
    let content;

    if (!this.props.data) {
      content = this.getEmptyTable();
    }
    else {
      content = this.props.data.mode === 'interannual'
        ? <DataTableInterannual metrics={this.props.metrics} data={this.props.data} />
        : <DataTableComparative metrics={this.props.metrics} data={this.props.data} />;
    }

    return content;
  }

  render () {

    return (
      <div className="info-col">
        {this.getTableContent()}
      </div>
    )
  }
}
