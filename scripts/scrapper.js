// scrapper

var http = require('http'),
	fs = require('fs'),
	XLS = require('xlsjs'),
	colors = require('colors/safe'),
	Historical = require('./db');

var Scrapper = {

	fileId: null,
	options: {
		check: false,    // checks for file in server
		download: false, // forces download
		verbose: false
	},

	init: function (fileId, cliOptions) {
		var options = {};

		this.fileId = fileId || this.getDefaultFileId();

		if ( cliOptions ) {
			options = this.options;
			cliOptions.split(',').forEach(function (cliOpt) {
				if ( options.hasOwnProperty(cliOpt) ) {
					options[cliOpt] = true;
				}
			});
		}

		( options.check )
			? this.check()
			: this.process();
	},

	getDefaultFileId: function () {
		var d = new Date(),
			y = d.getFullYear() - 2000, // 20XX
			m = d.getMonth();  // [0,11]

		return m === 0 ? (y - 1) + '-12' : y + '-' + ( m >= 10 ? m : '0' + m );
	},

	getFilePath: function (ext) {
		ext = ext || 'xls';
		return './files/' + ext + '/' + this.fileId + '.' + ext;
	},

	getDownloadHostname: function () {
		return 'www.sepe.es';
	},

	getDownloadPath: function () {
		var year = this.fileId.split('-')[0],
			basePath = '/contenidos/que_es_el_sepe/estadisticas/datos_avance/datos/',
			fileName = this.fileId.replace('-', ''),
			downloadPath;

		if ( this.fileId >= '06-08' || this.fileId === '06-04' || this.fileId === '06-03') {
			downloadPath = basePath + 'datos_20' + year + '/Av_sispe_' + fileName + '.xls';
		}
		else if ( this.fileId === '06-07' || this.fileId === '06-06' || this.fileId === '06-05' ) {
			downloadPath = basePath + 'datos_20' + year + '/Av_SISPE_' + fileName + '.xls';
		}
		else if ( this.fileId === '06-02' || this.fileId === '06-01' || this.fileId === '05-12' || this.fileId === '05-10' ) {
			downloadPath = basePath + 'datos_20' + year + '/AV_SISPE_' + fileName + '.xls';
		}
		else if ( this.fileId === '05-11' ) {
			downloadPath = basePath + 'datos_20' + year + '/av_sispe_' + fileName + '.xls';
		}
		else if ( this.fileId === '05-09' ) {
			downloadPath = basePath + 'datos_2005/DBPRCT_nov.xls';
		}
		else if ( this.fileId === '05-08' ) {
			downloadPath = basePath + 'datos_jun_jul_ma/dbprct.xls';
		}
		else if ( this.fileId === '05-07' ) {
			downloadPath = basePath + 'datos_jun_jul_ma/Avance_2005_SISPE_JULIO.xls';
		}
		else if ( this.fileId === '05-06' ) {
			downloadPath = basePath + 'datos_jun_jul_ma/Avance_2005_SISPE_JUNIO.xls';
		}
		else if ( this.fileId === '05-05' ) {
			downloadPath = basePath + 'datos_jun_jul_ma/Avance_2005_SISPE_MAYO.xls';
		}

		return downloadPath;
	},

	getDownloadLink: function () {
		return 'http://' + this.getDownloadHostname() + this.getDownloadPath();
	},

	getSheetMapping: function () {
		var cellMap = {}, sheetName, column, iniRow, totalsFigures, regions, regionsColumn, regionsIniRow;

		// Same in all xls
		regions = [
			'andalucia', 'aragon', 'asturias', 'balears', 'canarias', 'cantabria', 'castillaMancha',
			'castillaLeon', 'catalunya', 'comValenciana', 'extremadura', 'galicia', 'madrid', 'murcia',
			'navarra', 'paisVasco', 'rioja', 'ceuta', 'melilla'
		];

		if ( this.fileId >= '13-01' ) {
			sheetName = 'PAG 19';
			column = 'P';
			iniRow = 8;
			totalsFigures = [
				'total', ,'hombres', 'mujeres', , ,
				'hombresMenor25', 'mujeresMenor25', 'totalMenor25', , , 'hombresMayor25', 'mujeresMayor25', 'totalMayor25', , , ,
				'agricultura', 'industria', 'construccion', 'servicios', 'sinEmpleo'
			];
			regionsColumn = 'O';
			regionsIniRow = 36;
		}
		else {
			sheetName = (this.fileId >= '08-01') ? 'Pag. 19' : 'Pag. 13';
			column = 'M';
			iniRow = 9;
			totalsFigures = [
				'total', , ,'hombres', 'mujeres', , ,
				'hombresMenor25', 'mujeresMenor25', 'totalMenor25', , , 'hombresMayor25', 'mujeresMayor25', 'totalMayor25', , ,
				'agricultura', 'industria', 'construccion', 'servicios', 'sinEmpleo'
			];
			regionsColumn = 'M';
			regionsIniRow = 38;
		}

		totalsFigures.forEach(function (item, idx) {
			cellMap[item] = column + (iniRow + idx).toString();
		});

		regions.forEach(function (item, idx) {
			cellMap[item] = regionsColumn + (regionsIniRow + idx).toString();
		});

		return {
			name: sheetName,
			cells: cellMap
		};
	},

	checkXlsDataIntegrity: function (data) {
		var isOk = true;

		if ( data.total !== data.hombres + data.mujeres ) {
			this.log('Failed: data.total !== data.hombres + data.mujeres', 'error');
			isOk = false;
		}
		if ( data.totalMenor25 !== data.hombresMenor25 + data.mujeresMenor25 ) {
			this.log('Failed: data.totalMenor25 !== data.hombresMenor25 + data.mujeresMenor25', 'error');
			isOk = false;
		}
		if ( data.totalMayor25 !== data.hombresMayor25 + data.mujeresMayor25 ) {
			this.log('Failed: data.totalMayor25 !== data.hombresMayor25 + data.mujeresMayor25', 'error');
			isOk = false;
		}
		if ( data.total !== data.totalMenor25 + data.totalMayor25 ) {
			this.log('Failed: data.total !== data.totalMenor25 + data.totalMayor25', 'error');
			isOk = false;
		}
		if ( data.total !== data.agricultura + data.industria + data.construccion + data.servicios + data.sinEmpleo ) {
			this.log('Failed: data.total !== data.agricultura + data.industria + data.construccion + data.servicios + data.sinEmpleo', 'error');
			isOk = false;
		}

		var regions = [
				'andalucia', 'aragon', 'asturias', 'balears', 'canarias', 'cantabria', 'castillaMancha',
				'castillaLeon', 'catalunya', 'comValenciana', 'extremadura', 'galicia', 'madrid', 'murcia',
				'navarra', 'paisVasco', 'rioja', 'ceuta', 'melilla'
			],
			regionsTotal = 0;

		regions.forEach(function (d) {
			regionsTotal += data[d];
		});

		if ( data.total !== regionsTotal ) {
			this.log('Failed: data.total !== regionsTotal', 'error');
			isOk = false;
		}

		return isOk;
	},

	readXls: function () {
		var workbook = XLS.readFile(this.getFilePath()),
			sheetMapping = this.getSheetMapping(this.fileId),
			sheet;

		sheet = workbook.Sheets[sheetMapping.name];

		if ( this.options.verbose ) {
			this.log('Mapping');
		}
		var data = {};
		for ( var key in sheetMapping.cells ) {
			if ( this.options.verbose ) {
				console.log(sheetMapping.cells[key] + ':\t' + key);
			}
			data[key] = sheet[ sheetMapping.cells[key] ].v;
		}

		if ( this.options.verbose ) {
			this.log('File data:');
			console.log(data);
		}
		return data;
	},

	isXlsFile: function (contentType) {
		return contentType === 'application/vnd.ms-excel' || contentType === 'application/vnd.ms-office';
	},

	log: function (message, type) {
		var badge;
		switch (type) {
			case 'error':
				badge = [' * ', 'white', 'bgRed'];
				break;
			case 'success':
				badge = [' i ', 'grey', 'bgGreen'];
				break;
			// case 'info':
			default:
				badge = [' i ', 'grey', 'bgBlue'];
				break;
		}
		console.log(colors[badge[1]][badge[2]](badge[0]) + ' ' + message);
	},

	downloadFile: function(url, dest, cb) {
		var scrapper = this;

		this.log('Downloading file: ' + url);

		var file = fs.createWriteStream(dest);
		var request = http.get(url, function(response) {
			var contentType = response.headers['content-type'];
			if ( scrapper.isXlsFile(contentType) ) {
				response.pipe(file);
				file.on('finish', function() {
					scrapper.log('File saved: ' + dest, 'success');
					file.close(cb);  // close() is async, call cb after close completes.
				});
			}
			else {
				this.emit('error', new Error('Invalid content-type (' + contentType + ')'));
			}
		}).on('error', function(err) { // Handle errors
			scrapper.log('Error downloading file: ' + err.message +'.', 'error');
			fs.unlink(dest); // Delete the file async. (But we don't check the result)
			process.exit(1);
		});
	},

	scrapAndSave: function () {
		var scrapper = this,
			data;

		this.log('Scrapping data: ' + this.getFilePath());

		data = this.readXls();

		if ( ! this.checkXlsDataIntegrity(data) ) {
			this.log('Failed checking data integrity, exiting', 'error');
			process.exit(2);
		}

		data.periodo = this.fileId;
		Historical.savePeriod(data, function (result) {
			result
				? scrapper.log('Saved into DB', 'success')
				: scrapper.log('DB problem, could not upsert', 'error');

			process.exit(0);
		});
	},

	process: function () {
		var scrapper = this;
		if ( !fs.existsSync(this.getFilePath()) || this.options.download ) {
			this.downloadFile(this.getDownloadLink(), this.getFilePath(), function () {
				scrapper.scrapAndSave();
			});
		}
		else {
			this.scrapAndSave();
		}
	},

	check: function () {
		var scrapper = this,
			logPrepend = (new Date()).toLocaleString() + ' [ ' + this.fileId + ' ]: ',
			options = {
				method: 'HEAD',
				host: this.getDownloadHostname(),
				path: this.getDownloadPath(),
				port: 80
			};

		if ( fs.existsSync(this.getFilePath()) ) {
			scrapper.log(logPrepend + 'File already downloaded.');
			process.exit(0);
		}

		var req = http.request(options, function(res) {
			if ( scrapper.isXlsFile(res.headers['content-type']) ) {
				scrapper.log(logPrepend + 'File found!', 'success');
				scrapper.process();
			}
			else {
				scrapper.log(logPrepend + 'File not available in the server.');
				process.exit(0);
			}
		});
		req.end();
	}

};

Scrapper.init(process.argv[2], process.argv[3]);
