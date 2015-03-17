var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	PeriodModel;

mongoose.connect('mongodb://localhost/interanual');

var PeriodSchema = new Schema ({
	periodo:		String,
	//
	// Totals
	total:			Number,
	hombres:		Number,
	mujeres:		Number,
	hombresMenor25:	Number,
	mujeresMenor25:	Number,
	totalMenor25:	Number,
	hombresMayor25:	Number,
	mujeresMayor25:	Number,
	totalMayor25:	Number,
	agricultura:	Number,
	industria:		Number,
	construccion:	Number,
	servicios:		Number,
	sinEmpleo:		Number,
	//
	// Regions
	andalucia:		Number,
	aragon:			Number,
	asturias:		Number,
	balears:		Number,
	canarias:		Number,
	cantabria:		Number,
	castillaMancha:	Number,
	castillaLeon:	Number,
	catalunya:		Number,
	comValenciana:	Number,
	extremadura:	Number,
	galicia:		Number,
	madrid:			Number,
	murcia:			Number,
	navarra:		Number,
	paisVasco:		Number,
	rioja:			Number,
	ceuta:			Number,
	melilla:		Number,
	//
	ts:				Number
});

PeriodModel = mongoose.model('Period', PeriodSchema, 'historical');

PeriodModel.savePeriod = function (periodData, cb) {

	var yearMonth = periodData.periodo.split('-'),
		d = new Date('20' + yearMonth[0], (+yearMonth[1]) - 1, 1);

	periodData.ts = +d - (d.getTimezoneOffset() * 60 * 1000);

	this.update(
		{ periodo: periodData.periodo },
		periodData,
		{ upsert: true },
		function (err, data) {
			if (err) {
				console.log(err);
				cb(false);
			}
			else {
				cb(true);
			}
		});
}

module.exports = PeriodModel;