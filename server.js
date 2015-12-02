var express = require('express');
var app = express();

app.use(express.static(__dirname + '/app/public'));

app.listen(process.env.PORT || 1337, function () {
	console.log('👂 Listening at localhost:1337');
});