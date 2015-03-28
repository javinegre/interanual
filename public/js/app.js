
var ianual = {

	$infoBox: null,

	init: function () {

		this.$infoBox = $('#info-box');

		this.tpls = {
			infoBox: _.template( $('#info-box-tpl').html() )
		};

		this.chart = new IaChart({
			cb: this.updateInfoBox
		});

		$('#metric-selector').find('li.toggle').on('click', function () {
			ianual.chart.update({
				keys: [ $(this).data('key') ]
			});
		});
	},

	prevYearId: function ( id ) {
		var ym = id.split('-'),
			y1y = parseInt(ym[0], 10) - 1;

		return ( ( y1y >= 10 ) ? y1y : ('0' + y1y) ) + '-' + ym[1];
	},

	updateInfoBox: function (data) {

		var infoBoxData = {
				currentDate: moment(data.x).format('YYYY-MMM'),
				currentTotal: _.numberFormat(data.y),
				prevYearDate: moment(data.x).subtract(1, 'year').format('YYYY-MMM'),
				prevYear: false,
				interannualDiff: false
			},
			interannualDiff;


		if ( data.y1y ) {
			infoBoxData.prevYear = true;
			infoBoxData.prevYearTotal = _.numberFormat(data.y1y);
			interannualDiff = data.y - data.y1y;
			infoBoxData.interannualValue = _.numberSign(interannualDiff) + _.numberFormat(interannualDiff);
		}

		if ( data.y1y1m ) {
			infoBoxData.interannualDiff = true;
			infoBoxData.interannualDiffValue = _.numberFormat(data.y1y - data.y1y1m);
		}

		ianual.$infoBox.html(ianual.tpls.infoBox(infoBoxData));
	}
};
