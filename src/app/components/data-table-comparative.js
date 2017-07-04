import React from 'react';
import moment from 'moment';

import {numberFormat, numberSigned} from '../helpers/string';

import metricList from '../data/metrics';

export default class DataTableComparative extends React.Component {
  constructor (props) {
    super(props);
  }

  getDate () {
    return moment(this.props.data.table[0].values.x);
  }

  getContent () {
    const date = this.getDate();

    const title = date.format('MMMM YYYY');

    const rows = this.props.data.table.map((d, i) => {
      const monthlyDiff = d.values.y1m !== null ? d.values.y - d.values.y1m : null;
      const yearlyDiff = d.values.y1y !== null ? d.values.y - d.values.y1y : null;

      return this.getRow({
        idx: i+1,
        color: d.color,
        label: metricList.find( item => item.key === d.name ).title,
        total: d.values.y !== null ? numberFormat(d.values.y) : '-',
        monhtlyDiff: monthlyDiff !== null ? numberSigned(monthlyDiff) : '-',
        monhtlyTrend: monthlyDiff < 0 ? 'trend-pos' : ( (monthlyDiff > 0) ? 'trend-neg' : '' ),
        yearlyDiff: yearlyDiff !== null ? numberSigned(yearlyDiff) : '-',
        yearlyTrend: yearlyDiff < 0 ? 'trend-pos' : ( (yearlyDiff > 0) ? 'trend-neg' : '' )
      });
    });

    return [this.getHeader(title, date)].concat(rows);
  }

  getHeader (title, date) {
    const borderClass = `info-table-header-border-active active-${date.format('M')}`;

    return (
      <li className="info-table-header" key="0">
        <span>{title}</span>
        <div className="info-table-header-border">
          <span className={borderClass}></span>
        </div>
      </li>
    );
  }

  getRow (data) {
    const bulletStyle = { color: data.color };
    const yDiffClass = `info-table-cell info-table-yearly-diff ${data.yearlyTrend} font-ms`;
    const mDiffClass = `info-table-cell info-table-monhtly-diff ${data.monhtlyTrend} font-ms`;

    return <li className="info-table-row" key={data.idx}>
      <span className="info-table-cell info-table-label">
          <span className="label-bullet" style={bulletStyle}>◼</span> {data.label}
      </span>
      <span className={yDiffClass}>{data.yearlyDiff}</span>
      <span className="info-table-cell info-table-total font-ms">{data.total}</span>
      <span className={mDiffClass}>{data.monhtlyDiff}</span>
    </li>
  }

  render () {
    return <ul id="info-table" className="info-table mode-comparative">
      {this.getContent()}
    </ul>
  }
}