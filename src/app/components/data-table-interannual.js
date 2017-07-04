import React from 'react';
import moment from 'moment';

import {numberFormat, numberSigned} from '../helpers/string';

import metricList from '../data/metrics';

export default class DataTableInterannual extends React.Component {
  constructor (props) {
    super(props);
  }

  getDate () {
    return moment(this.props.data.table[0].x);
  }

  padInfoTable (table) {
    var iniYear = moment({ y: 2005 }),
      now = moment();

    if ( ! moment( _.first(table).x ).isSame(now, 'year') ) {
      table.unshift({ x: now, y: null, y1m: null, y1y: null });
    }
    if ( ! moment( _.last(table).x ).isSame(iniYear, 'year') ) {
      table.push({ x: iniYear, y: null, y1m: null, y1y: null });
    }

    return table;
  }

  getContent () {
    const date = this.getDate();
    const activeYear = moment(this.props.data.point.x).format('YYYY')

    const keyTitle = metricList.find( item => item.key === _.first(this.props.metrics) ).title;
    const title = `${keyTitle} — ${date.format('MMMM')}`;

    // Make a copy of the array to avoid race conditions reversing it.
    let rowsData = this.props.data.table.concat();
    rowsData = this.padInfoTable( rowsData.reverse() );

    const rows = rowsData.map((d, i) => {
      const monthlyDiff = d.y1m !== null ? d.y - d.y1m : null;
      const yearlyDiff = d.y1y !== null ? d.y - d.y1y : null;

      return this.getRow({
        idx: i+1,
        isActive: (activeYear == moment(d.x).format('YYYY')) ? 'active' : '',
        isEmpty: d.y === null ? 'empty' : '',
        label: moment(d.x).format('YYYY'),
        total: d.y !== null ? numberFormat(d.y) : '-',
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

    return <li className="info-table-header" key="0">
      <span>{title}</span>
      <div className="info-table-header-border">
        <span className={borderClass}></span>
      </div>
    </li>;
  }

  getRow (data) {
    const liClass = `info-table-row ${data.isActive} ${data.isEmpty}`;
    const yDiffClass = `info-table-cell info-table-yearly-diff ${data.yearlyTrend} font-ms`;
    const mDiffClass = `info-table-cell info-table-monhtly-diff ${data.monhtlyTrend} font-ms`;

    return <li className={liClass} key={data.idx}>
      <span className="info-table-cell info-table-label">{data.label}</span>
      <span className="info-table-cell info-table-total font-ms">{data.total}</span>
      <span className={yDiffClass}>{data.yearlyDiff}</span>
      <span className={mDiffClass}>{data.monhtlyDiff}</span>
    </li>;
  }

  render () {
    return <ul id="info-table" className="info-table mode-interannual">
      {this.getContent()}
    </ul>
  }
}