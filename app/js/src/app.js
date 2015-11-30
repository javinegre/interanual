
var ianual = {

	$infoBlock: null,
	$infoTable: null,

	init: function () {

		this.activeMetrics = ['total'];
		this.chartMode = 'interannual';

		this.$infoTable = $('#info-table');
		this.$metricSelector = $('#metric-selector');

		this.tpls = {
			infoTableRow: _.template( $('#info-table-row-tpl').html() ),
			infoTableCompRow: _.template( $('#info-table-comp-row-tpl').html() ),
			infoTableHeader: _.template( $('#info-table-header-tpl').html() ),
			metricList: _.template( $('#metric-list-tpl').html() )
		};

		moment.locale('es', momentLocale);
		moment.locale('es');

		this.initChart();

		// Events
		$('[name="chart-mode"]').on('change', this.toggleChartMode);
		this.$metricSelector.delegate('li.toggle', 'click', this.toggleMetricSelector);
		$(document).on('keydown', this.keyboardControl);
	},

	initChart: function () {
		this.chart = new IaChart({
			onLoad: this.onChartLoad,
			cb: $.proxy(this.udpateInfo, this)
		});
	},

	prevYearId: function ( id ) {
		var ym = id.split('-'),
			y1y = parseInt(ym[0], 10) - 1;

		return ( ( y1y >= 10 ) ? y1y : ('0' + y1y) ) + '-' + ym[1];
	},

	updateView: function () {
		this.chart.update({
			onLoad: this.onChartLoad,
			keys: this.activeMetrics
		});
	},

	onChartLoad: function (data) {
		ianual.updateMetricSelector(data);
	},

	updateMetricSelector: function (data) {

		var setMetricStyle = function (m) {
			m.active = ianual.activeMetrics.indexOf(m.key) >= 0;
			m.color = _.has(data.colors, m.key) ? data.colors[m.key] : null;
		};

		_.each(generalMetrics, setMetricStyle);
		_.each(regionalMetrics, setMetricStyle);

		this.$metricSelector.find('.general-selector').html( this.tpls.metricList({ metrics: generalMetrics }) );
		this.$metricSelector.find('.regional-selector').html( this.tpls.metricList({ metrics: regionalMetrics }) );
	},

	toggleChartMode: function () {
		ianual.chartMode = $(this).val();
		if ( ianual.chartMode == 'interannual' && ianual.activeMetrics.length > 1 ) {
			ianual.activeMetrics = [ ianual.activeMetrics[0] ];
		}
		else if ( ianual.chartMode == 'comparative' && ianual.activeMetrics.length == 1 ) {
			ianual.activeMetrics.push(
				ianual.activeMetrics[0] != generalMetrics[0].key
					? generalMetrics[0].key
					: generalMetrics[1].key
			);
		}

		// Update view
		$(this).closest('.mode-selector').find('.radio-selector').removeClass('checked');
		$(this).closest('.radio-selector').addClass('checked');

		ianual.updateView();
	},

	toggleMetricSelector: function () {
		var key = $(this).data('key');

		if ( ianual.chartMode === 'interannual' ) {
			ianual.activeMetrics = [ key ];
		}
		else { // ianual.chartMode === 'comparative'
			var idx = ianual.activeMetrics.indexOf(key);
			if ( idx < 0 ) {
				ianual.activeMetrics.push(key);
			}
			else if ( ianual.activeMetrics.length > 1 ) {
				ianual.activeMetrics.splice(idx, 1);
			}
		}

		ianual.updateView();
	},

	keyboardControl: function (e) {
		if ( $('input').filter(':focus').length ) {
			return;
		}
		if ( e.keyCode === 37 || e.keyCode === 39 ) {
			ianual.chart.shiftIndex( e.keyCode === 39 ? 'up' : 'down' );
		}
	},

	udpateInfo: function (data) {
		this.updateInfoTable(data.table, moment(data.point.x).format('YYYY'), data.mode);
	},

	padInfoTable: function (table) {
		var iniYear = moment({ y: 2005 }),
			now = moment();

		if ( ! moment( _.first(table).x ).isSame(now, 'year') ) {
			table.unshift({ x: now, y: null, y1m: null, y1y: null });
		}
		if ( ! moment( _.last(table).x ).isSame(iniYear, 'year') ) {
			table.push({ x: iniYear, y: null, y1m: null, y1y: null });
		}

		return table;
	},

	updateInfoTable: function (data, activeYear, mode) {
		var mode = mode || 'interannual',
			date,
			headerData;

		if ( mode == 'interannual' ) {
			date = moment(data[0].x);

			data = this.padInfoTable( data.reverse() );

			data = data.map(function (d, i) {
				var monthlyDiff = d.y1m !== null ? d.y - d.y1m : null,
					yearlyDiff = d.y1y !== null ? d.y - d.y1y : null;

				return ianual.tpls.infoTableRow({
					isActive: (activeYear == moment(d.x).format('YYYY')) ? 'active' : '',
					isEmpty: d.y === null ? 'empty' : '',
					label: moment(d.x).format('YYYY'),
					total: d.y !== null ? _.numberFormat(d.y) : '-',
					monhtlyDiff: monthlyDiff !== null ? _.numberSigned(monthlyDiff) : '-',
					monhtlyTrend: monthlyDiff < 0 ? 'trend-pos' : ( (monthlyDiff > 0) ? 'trend-neg' : '' ),
					yearlyDiff: yearlyDiff !== null ? _.numberSigned(yearlyDiff) : '-',
					yearlyTrend: yearlyDiff < 0 ? 'trend-pos' : ( (yearlyDiff > 0) ? 'trend-neg' : '' )
				});
			})
		}
		else {
			date = moment(data[0].values.x);

			data = data.map(function (d, i) {
				var monthlyDiff = d.values.y1m !== null ? d.values.y - d.values.y1m : null,
					yearlyDiff = d.values.y1y !== null ? d.values.y - d.values.y1y : null;
				return ianual.tpls.infoTableCompRow({
					color: d.color,
					label: d.name,
					total: d.values.y !== null ? _.numberFormat(d.values.y) : '-',
					monhtlyDiff: monthlyDiff !== null ? _.numberSigned(monthlyDiff) : '-',
					monhtlyTrend: monthlyDiff < 0 ? 'trend-pos' : ( (monthlyDiff > 0) ? 'trend-neg' : '' ),
					yearlyDiff: yearlyDiff !== null ? _.numberSigned(yearlyDiff) : '-',
					yearlyTrend: yearlyDiff < 0 ? 'trend-pos' : ( (yearlyDiff > 0) ? 'trend-neg' : '' )
				});
			});
		}

		this.$infoTable.removeClass (function (index, css) {
			return (css.match (/(^|\s)mode-\S+/g) || []).join(' ');
		}).addClass('mode-' + mode);

		this.$infoTable.html( data );

		this.$infoTable.prepend(
			ianual.tpls.infoTableHeader({
				title: mode == 'interannual' ? date.format('MMMM') : date.format('MMMM YYYY'),
				active: date.format('M')
			})
		);
	}
};
