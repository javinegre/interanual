
var generalMetrics = [
	{ key: 'total',          title: 'Total' },
	{ key: 'hombres',        title: 'Hombres' },
	{ key: 'mujeres',        title: 'Mujeres' },
	{ key: 'hombresMenor25', title: 'Hombres menores 25' },
	{ key: 'mujeresMenor25', title: 'Mujeres menores 25' },
	{ key: 'totalMenor25',   title: 'Total menores 25' },
	{ key: 'hombresMayor25', title: 'Hombres mayores 25' },
	{ key: 'mujeresMayor25', title: 'Mujeres mayores 25' },
	{ key: 'totalMayor25',   title: 'Total mayores 25' },
	{ key: 'agricultura',    title: 'Agricultura' },
	{ key: 'industria',      title: 'Industria' },
	{ key: 'construccion',   title: 'Construcción' },
	{ key: 'servicios',      title: 'Servicios' },
	{ key: 'sinEmpleo',      title: 'Sin empleo' },
];

var regionalMetrics = [
	{ key: 'andalucia',      title: 'Andalucía' },
	{ key: 'aragon',         title: 'Aragón' },
	{ key: 'asturias',       title: 'Asturias' },
	{ key: 'balears',        title: 'Illes Balears' },
	{ key: 'canarias',       title: 'Islas Canarias' },
	{ key: 'cantabria',      title: 'Cantabria' },
	{ key: 'castillaMancha', title: 'Castilla-La Mancha' },
	{ key: 'castillaLeon',   title: 'Castilla y León' },
	{ key: 'catalunya',      title: 'Catalunya' },
	{ key: 'comValenciana',  title: 'Com. Valenciana' },
	{ key: 'extremadura',    title: 'Extremadura' },
	{ key: 'galicia',        title: 'Galicia' },
	{ key: 'madrid',         title: 'Madrid' },
	{ key: 'murcia',         title: 'Murcia' },
	{ key: 'navarra',        title: 'Navarra' },
	{ key: 'paisVasco',      title: 'Euskadi' },
	{ key: 'rioja',          title: 'La Rioja' },
	{ key: 'ceuta',          title: 'Ceuta' },
	{ key: 'melilla',        title: 'Melilla' },
];

var ianual = {

	$infoBlock: null,

	init: function () {

		this.activeMetrics = ['total'];
		this.chartMode = 'interannual';

		this.$infoBlock = $('#info-block');
		this.$metricSelector = $('#metric-selector');

		this.tpls = {
			infoBox: _.template( $('#info-box-tpl').html() ),
			metricList: _.template( $('#metric-list-tpl').html() )
		};

		this.chart = new IaChart({
			onLoad: this.onChartLoad,
			cb: this.updateInfoBox
		});

		this.$metricSelector.delegate('li.toggle', 'click', function () {
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
		});

		$('[name="chart-mode"]').on('change', function () {
			ianual.chartMode = $(this).val();
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

	updateInfoBox: function (data) {

		var infoBlockData = {
				currentDate: moment(data.x).format('YYYY-MMM'),
				currentTotal: _.numberFormat(data.y),
				prevYearDate: moment(data.x).subtract(1, 'year').format('YYYY-MMM'),
				prevYear: false,
			};

		if ( data.y1y ) {
			infoBlockData.prevYear = true;
			infoBlockData.prevYearTotal = _.numberFormat(data.y1y);
			infoBlockData.interannualValue = _.numberSigned(data.y - data.y1y);
		}

		ianual.$infoBlock.find('.info-block-box-current').html(ianual.tpls.infoBox({
			title: moment(data.x).format('MMM \'YY'),
			val: _.numberFormat(data.y),
			diff: null
		}));

		ianual.$infoBlock.find('.info-block-box-prev-month').html(ianual.tpls.infoBox({
			title: moment(data.x).subtract(1, 'month').format('MMM \'YY'),
			val: _.numberFormat(data.y1m),
			diff: ( _.numberFormat(data.y1m) !== null ) ? _.numberSigned(data.y - data.y1m) : null
		}));

		ianual.$infoBlock.find('.info-block-box-prev-year').html(ianual.tpls.infoBox({
			title: moment(data.x).subtract(1, 'year').format('MMM \'YY'),
			val: _.numberFormat(data.y1y),
			diff: ( _.numberFormat(data.y1y) !== null ) ? _.numberSigned(data.y - data.y1y) : null
		}));
	}
};
