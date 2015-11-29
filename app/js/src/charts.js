
var IaChart = function ( options ) {
	this.margin = {top: 20, right: 20, bottom: 30, left: 20};
	this.oWidth = document.getElementById('chart-wrapper').offsetWidth;
	this.oHeight = 400;
	this.width = null;
	this.height = null;

	this.csvData = null;

	this.defaults = {
		keys: ['total'],
		onLoad: function () {}
	};
	this.options = options;

	this.x = null;
	this.y = null;
	this.line = null;
	this.color = null;

	this.keys = null;
	this.keysLen = null;
	this.series = null;
	this.series1y = null;
	this.numPoints = null;
	this.pointWidth = null;

	this.svg = null;
	this.guideLine = null;
	this.diffLines = null;
	this.serie = null;
	this.serie1y = null;
	this.diffDot = null;
	this.hoverable = null;
	this.activeIdx = null;

	this.init(options);
}

IaChart.prototype = {

	init: function () {
		var _this = this;

		this.options = this.extend(this.defaults, this.options);

		d3.csv('data/interanual.csv', function (csvData) {
			_this.csvData = csvData.reverse();
			_this.build();
		});
	},

	build: function () {
		var _this = this;
		this.width = this.oWidth - this.margin.left - this.margin.right;
		this.height = this.oHeight - this.margin.top - this.margin.bottom;

		this.x = d3.time.scale()
			.range([0, this.width]);

		this.y = d3.scale.linear()
			.range([this.height, 0]);

		this.line = d3.svg.line()
			.interpolate('monotone')
			.defined(function (d) {
				return d.y !== null;
			})
			.x(function (d) {
				return _this.x(d.x);
			})
			.y(function (d) {
				return _this.y(d.y);
			});

		this.svg = d3.select('#chart-wrapper').append('svg')
			.attr('width', this.oWidth)
			.attr('height', this.oHeight)
			.attr('class', 'ianual-chart')
			.append('g')
			.attr('transform', this.translateStr(this.margin.left, this.margin.top));

		this.color = d3.scale.category10();

		this.calculate();

		this.buildSvg();
	},

	calculate: function ()  {
		var _this = this;

		this.keys = this.options.keys;
		this.keysLen = this.keys.length;

		var dataByPeriod = {},
			dataLen = this.csvData.length,
			prevYear;
		this.series1y = null;

		this.color.domain(this.keys);

		this.series = this.keys.map(function (d) {
			return {
				name: d,
				values: []
			}
		});

		for (var i = 0; i < dataLen; i++) {
			dataByPeriod[this.csvData[i].periodo] = this.csvData[i];
		}

		this.csvData.forEach(function (d, i) {
			_this.keys.forEach(function (keyName, j) {
				prevYear = ianual.prevYearId(d.periodo);
				_this.series[j].values.push({
					x: +d.ts,
					y: +d[keyName],
					y1m: _this.csvData[i-1] ? +_this.csvData[i-1][keyName] : null,
					y1y: dataByPeriod[prevYear] ? +dataByPeriod[prevYear][keyName] : null
				});
			});
		});

		if (this.keysLen == 1) {
			this.series1y = {
				name: this.keys[0] + '-1y',
				values: []
			};

			this.csvData.forEach(function (d) {
				prevYear = ianual.prevYearId(d.periodo);
				_this.series1y.values.push({
					x: +d.ts,
					y: dataByPeriod[prevYear] ? +dataByPeriod[prevYear][_this.keys[0]] : null
				});
			});
		}

		this.numPoints = this.series[0].values.length;
		this.pointWidth = this.width / (this.numPoints - 1);

		this.activeIdx = this.activeIdx || (this.numPoints - 1);

		this.x.domain(d3.extent(this.series[0].values, function (d) {
			return d.x;
		}));
		this.y.domain([0, d3.max(this.series, function (d) {
			return d3.max(d.values, function (dd) {
				return dd.y
			});
		})]);
	},

	buildSvg: function () {
		var _this = this;

		this.axisLines = this.svg.append('g')
			.attr('class', 'axis-lines');

		this.axisLines.selectAll('.axis-lines')
			.data([ 1e6, 2e6, 3e6, 4e6, 5e6 ])
			.enter().append('line')
			.attr('x1', 0)
			.attr('y1', function (d) { return _this.y(d); })
			.attr('x2', _this.x.range()[1])
			.attr('y2', function (d) { return _this.y(d); })
			.attr('stroke', '#f8f8f8')
			.attr('stroke-width', '1px');
		this.axisLines.append('line')
			.attr('x1', 0)
			.attr('y1', _this.y.range()[0])
			.attr('x2', _this.x.range()[1])
			.attr('y2', _this.y.range()[0])
			.attr('stroke', '#e8e8e8')
			.attr('stroke-width', '3px');
		this.axisLines.selectAll('.axis-text')
			.data([ 1e6, 2e6, 3e6, 4e6, 5e6 ])
			.enter().append('text')
			.attr('x', 0)
			.attr('y', function (d) { return _this.y(d) - 10; })
			.text(function (d) { return (d / 1e6) + 'M'; });

		this.axisLines.selectAll('.axis-text')
			.data([ 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015 ])
			.enter().append('text')
			.attr('x', function (d) { return _this.x(moment([d, 6, 1]).unix() * 1000); })
			.attr('y', _this.y.range()[0] + 16)
			.attr('text-anchor', 'middle')
			.text(function (d) { return d });

		this.guideLine = this.svg.append('g')
			.attr('class', 'guide-line')
			.attr('opacity', 0);

		this.guideLine.append('line')
			.attr('x1', 0)
			.attr('y1', this.y.range()[0])
			.attr('x2', 0)
			.attr('y2', this.y.range()[1])
			.attr('stroke', '#d0d0d0')
			.attr('stroke-width', '1px')
			.attr('stroke-dasharray', '2,2');

		if ( this.series1y !== null ) {
			this.serie1y = this.svg.append('g')
				.attr('class', 'serie-1y');

			this.serie1y.selectAll('.path')
				.data([ this.series1y ])
				.enter().append('path')
				.attr('class', 'line-1y')
				.attr('d', function (d) { return _this.line(d.values); })
				.attr('stroke', '#e0e0e0')
				.attr('stroke-width', '2px')
				.attr('fill', 'none');

			this.diffLines = this.svg.append('g')
				.attr('class', 'diff-lines');

			this.diffLines.selectAll('.diff-line')
				.data(this.series[0].values)
				.enter().append('line')
				.attr('class', 'diff-line')
				.attr('x1', function (d) { return _this.x(d.x); })
				.attr('y1', function (d) { return _this.y(d.y); })
				.attr('x2', function (d) { return _this.x(d.x); })
				.attr('y2', function (d) { return _this.y(d.y1y); })
				.attr('stroke', function (d) { return _this.getDiffColor(d.y, d.y1y); })
				.attr('stroke-width', '2px')
				.attr('opacity', function (d) { return ( d.y1y === null ) ? 0 : .2; })
				.attr('fill', 'none');
		}

		this.serie = this.svg.selectAll('.serie')
			.data(this.series)
			.enter().append('g')
			.attr('class', 'serie');

		this.serie.append('path')
			.attr('class', 'line')
			.attr('d', function (d) { return _this.line(d.values); })
			.attr('stroke', this.keysLen === 1 ? '#808080' : function (d) { return _this.color(d.name); })
			.attr('stroke-width', '3px')
			.attr('fill', 'none');

		if ( this.keysLen === 1 ) {

			this.serie.append('path')
				.attr('class', 'serie-arrow')
				.attr('stroke', '#808080')
				.attr('fill', '#ffffff')
				.attr('opacity', 0)
				.attr('stroke-width', '3px')
				.attr('stroke-linejoin', 'round')
				.attr('d', 'M-4,2 L0,-5 L4,2 L-4,2 Z');

			this.diffDot = this.svg.append('g')
				.attr('class', 'diff-dot');

			this.diffDot.append('circle')
				.attr('cx', 0)
				.attr('cy', 0)
				.attr('r', '5px')
				.attr('opacity', 0)
				.attr('fill', '#ffffff');
		}
		else {
			this.serie.append('circle')
				.attr('class', 'serie-dot')
				.attr('cx', 0)
				.attr('cy', 0)
				.attr('r', '4px')
				.attr('opacity', 0)
				.attr('fill', '#ffffff')
				.attr('stroke', function (d) { return _this.color(d.name); })
				.attr('stroke-width', '3px');
		}

		this.hoverable = this.svg.append('rect')
			.attr('x', 0)
			.attr('y', 0)
			.attr('width', this.width)
			.attr('height', this.height + 20)
			.attr('fill', '#ffffff')
			.attr('opacity', 0)
			.attr('transform', this.translateStr(0, -10))
			.on('mousemove', function () { _this.chartMouseMove.call( _this, d3.mouse(this) ); });

		var serieColors = {};
		this.keys.forEach(function (d) { serieColors[d] = _this.keysLen === 1 ? '#808080' : _this.color(d); });

		this.highlightPoint(this.activeIdx);
		this.options.onLoad({ colors: serieColors });
	},

	chartMouseMove: function (m) {
		var mIdx = Math.floor((m[0] + this.pointWidth / 2) / this.pointWidth);

		if ( this.activeIdx !== mIdx ) {
			this.activeIdx = mIdx;
			this.highlightPoint(mIdx);
		}
	},

	highlightPoint: function (mIdx) {
		var _this = this,
			point = this.series[0].values[mIdx],
			pointColor = this.getDiffColor(point.y, point.y1y),
			pointY = point.y1y === null ? this.y(point.y) : this.y(point.y1y),
			seriesLen = this.series.length,
			tableData = [],
			tableMode;

		if ( seriesLen > 1 ) {
			tableMode = 'comparative';
			for ( var i = 0 ; i < seriesLen ; i++ ) {
				tableData.push({
					color: _this.color(this.series[i].name),
					name: this.series[i].name,
					values: this.series[i].values[mIdx]
				});
			}
		}
		else {
			tableMode = 'interannual';
			for ( var i = mIdx % 12 ; i < this.numPoints ; i += 12 ) {
				tableData.push( this.series[0].values[i] );
			}

		}

		this.options.cb({
			mode: tableMode,
			point: point,
			table: tableData
		});

		this.serie.selectAll('.serie-dot')
			.attr('opacity', 1)
			.attr('transform', function (d) { return _this.translateStr(_this.x(point.x), _this.y(d.values[mIdx].y)); });

		this.serie.selectAll('.serie-arrow')
			.attr('opacity', point.y1y === null ? 0 : 1 )
			.attr('stroke', pointColor)
			.attr('transform', function (d) {
				return _this.translateStr(_this.x(point.x), _this.y(d.values[mIdx].y)) +
					' rotate(' + ( point.y > point.y1y ? '0' : '180' ) + ')';
			});

		this.guideLine
			.attr('opacity', 1)
			.attr('transform', this.translateStr(this.x(point.x), 0));

		if (this.diffDot !== null) {
			this.diffDot.select('circle')
				.attr('fill', pointColor)
				.attr('opacity', 1)
				.attr('transform', this.translateStr(this.x(point.x), pointY));
		}

		if (this.diffLines && point.y1y !== null) {
			var allLines = this.diffLines.selectAll('line').classed('active', false);
			d3.select(allLines[0][mIdx]).classed('active', true);
		}
	},

	emptyChart: function () {
		// Remove all children of this.container
		var children = this.svg.node().childNodes;
		var count = children.length;
		for (var i = count - 1 ; i >= 0 ; i--) {
			// removing children[i] crashes in iPad, selecting the node with d3 and removing it works!!
			d3.select(children[i]).remove();
		}
	},

	update: function (options) {
		this.options = this.extend(this.options, options);
		this.emptyChart();
		this.calculate();
		this.buildSvg();
	},

	shiftIndex: function (dir) {
		var nIdx = this.activeIdx;
		if ( dir === 'up' ) {
			nIdx = ( this.activeIdx < this.numPoints - 1 ) ? nIdx + 1 : this.numPoints - 1;
		}
		else { // dir === 'down'
			nIdx = ( this.activeIdx > 0 ) ? nIdx - 1 : 0;
		}

		this.activeIdx = nIdx;

		this.highlightPoint(nIdx);
	},

	getDiffColor: function (y, y1) {
		return y === y1 || y1 === null
			? '#808080'
			: y > y1 ? '#d1527c' : '#78a179';
	},

	translateStr: function (x, y) {
		return 'translate(' + [x, y].join(',') + ')';
	},

	extend: function(out) {
		// http://youmightnotneedjquery.com/#extend
		out = out || {};

		for (var i = 1; i < arguments.length; i++) {
			if (!arguments[i])
				continue;

			for (var key in arguments[i]) {
				if (arguments[i].hasOwnProperty(key))
					out[key] = arguments[i][key];
			}
		}

		return out;
	}

};
