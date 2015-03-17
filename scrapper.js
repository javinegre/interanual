// scrapper

var http = require('http'),
	fs = require('fs'),
	XLS = require('xlsjs'),
	Historical = require('./db');

var getDownloadLink = function (fileId) {
	var year = fileId.split('-')[0],
		baseUrl = 'http://www.sepe.es/contenidos/que_es_el_sepe/estadisticas/datos_avance/datos/',
		fileName = fileId.replace('-', ''),
		downloadLink;

	if ( fileId >= '06-08' || fileId === '06-04' || fileId === '06-03') {
		downloadLink = baseUrl + 'datos_20' + year + '/Av_sispe_' + fileName + '.xls';
	}
	else if ( fileId === '06-07' || fileId === '06-06' || fileId === '06-05' ) {
		downloadLink = baseUrl + 'datos_20' + year + '/Av_SISPE_' + fileName + '.xls';
	}
	else if ( fileId === '06-02' || fileId === '06-01' || fileId === '05-12' || fileId === '05-10' ) {
		downloadLink = baseUrl + 'datos_20' + year + '/AV_SISPE_' + fileName + '.xls';
	}
	else if ( fileId === '05-11' ) {
		downloadLink = baseUrl + 'datos_20' + year + '/av_sispe_' + fileName + '.xls';
	}
	else if ( fileId === '05-09' ) {
		downloadLink = baseUrl + 'datos_2005/DBPRCT_nov.xls';
	}
	else if ( fileId === '05-08' ) {
		downloadLink = baseUrl + 'datos_jun_jul_ma/dbprct.xls';
	}
	else if ( fileId === '05-07' ) {
		downloadLink = baseUrl + 'datos_jun_jul_ma/Avance_2005_SISPE_JULIO.xls';
	}
	else if ( fileId === '05-06' ) {
		downloadLink = baseUrl + 'datos_jun_jul_ma/Avance_2005_SISPE_JUNIO.xls';
	}
	else if ( fileId === '05-05' ) {
		downloadLink = baseUrl + 'datos_jun_jul_ma/Avance_2005_SISPE_MAYO.xls';
	}

	return downloadLink;
};

var getFilePath = function (fileId, ext) {
	ext = ext || 'xls';
	return './files/' + ext + '/' + fileId + '.' + ext;
}

var download = function(url, dest, cb) {
	var file = fs.createWriteStream(dest);
	var request = http.get(url, function(response) {
		response.pipe(file);
		file.on('finish', function() {
			file.close(cb);  // close() is async, call cb after close completes.
		});
	}).on('error', function(err) { // Handle errors
		fs.unlink(dest); // Delete the file async. (But we don't check the result)
		if (cb) cb(err.message);
  	});
};

var getSheetMapping = function (fileId) {
	var cellMap = {}, sheetName, column, iniRow, totalsFigures, regions, regionsColumn, regionsIniRow;

	// Same in all xls
	regions = [
		'andalucia', 'aragon', 'asturias', 'balears', 'canarias', 'cantabria', 'castillaMancha',
		'castillaLeon', 'catalunya', 'comValenciana', 'extremadura', 'galicia', 'madrid', 'murcia',
		'navarra', 'paisVasco', 'rioja', 'ceuta', 'melilla'
	];

	if ( fileId >= '13-01' ) {
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
		sheetName = (fileId >= '08-01') ? 'Pag. 19' : 'Pag. 13';
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
};

var checkXlsDataIntegrity = function (data) {
	var isOk = true;

	if ( data.total !== data.hombres + data.mujeres ) {
		console.log('** failed: data.total !== data.hombres + data.mujeres');
		isOk = false;
	}
	if ( data.totalMenor25 !== data.hombresMenor25 + data.mujeresMenor25 ) {
		console.log('** failed: data.totalMenor25 !== data.hombresMenor25 + data.mujeresMenor25');
		isOk = false;
	}
	if ( data.totalMayor25 !== data.hombresMayor25 + data.mujeresMayor25 ) {
		console.log('** failed: data.totalMayor25 !== data.hombresMayor25 + data.mujeresMayor25');
		isOk = false;
	}
	if ( data.total !== data.totalMenor25 + data.totalMayor25 ) {
		console.log('** failed: data.total !== data.totalMenor25 + data.totalMayor25');
		isOk = false;
	}
	if ( data.total !== data.agricultura + data.industria + data.construccion + data.servicios + data.sinEmpleo ) {
		console.log('** failed: data.total !== data.agricultura + data.industria + data.construccion + data.servicios + data.sinEmpleo');
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
		console.log('** failed: data.total !== regionsTotal');
		isOk = false;
	}

	return isOk;
}

var readXls = function (fileId) {
	var workbook = XLS.readFile(getFilePath(fileId)),
		sheetMapping = getSheetMapping(fileId),
		sheet;

	sheet = workbook.Sheets[sheetMapping.name];

	var data = {};
	for ( var key in sheetMapping.cells ) {
		//console.log('###');
		//console.log(key);
		//console.log(sheetMapping.cells[key]);
		data[key] = sheet[ sheetMapping.cells[key] ].v;
	}

	checkXlsDataIntegrity(data);

	console.log(data);
	return data;
};

var fileId = process.argv[2];
var command = process.argv[3];

if ( typeof command !== 'undefined' && command === 'read' ) {
	readXls(fileId);
}
else if ( typeof command !== 'undefined' && command === 'read-save' ) {
	var data = readXls(fileId);
	data.periodo = fileId;
	Historical.savePeriod(data, function (result) {
		console.log('Period saved?' + result);
	});
}
else {
	download(getDownloadLink(fileId), getFilePath(fileId), function () {
		var data = readXls(fileId);
		data.periodo = fileId;
		Historical.savePeriod(data, function (result) {
			console.log('Period saved?' + result);
		});
	});
}
