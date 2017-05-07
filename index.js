var express = require('express');
var app = express();

var nodeadmin = require('nodeadmin');
app.use(nodeadmin(app));

app.listen(3000, function () {
    console.log('SMS Parser app listening on port 3000...')
})