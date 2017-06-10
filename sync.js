var fs = require('fs');
var util = require('util');
var stream = require('stream');
var es = require('event-stream');
var parseString = require('xml2js').parseString;
var Sequelize = require('sequelize');
var moment = require('moment');
var sequelize = new Sequelize('sms_parser', 'vitruviantech', 'catalyst', {
    host: '172.28.128.3'
});

var Message = sequelize.define('Message', {
    body: Sequelize.STRING,
    address: Sequelize.STRING,
    date: Sequelize.DATE,
    date_sent: Sequelize.DATE,
    service_center: Sequelize.STRING,
    readable_date: Sequelize.STRING,
    contact_name: Sequelize.STRING
}, {
    timestamps: false
});

sequelize.sync().then(function() {
    Message.destroy({ where: {}, truncate: true }).then(function() {
        console.dir('Syncing messages...');

        var stream = fs.createReadStream(process.argv[2])
            .pipe(es.split())
            .pipe(es.mapSync(function (line) {
                stream.pause();

                parseString(line, function (err, result) {
                    var message;

                    if(result) {
                        if(result.sms) {
                            message = result.sms.$;

                            Message.create(Object.assign(message, {
                                date: +new Date(moment(+message.date).subtract(4, 'hours')),
                                date_sent: +message.date_sent,
                                contact_name: !(+message.date_sent) ? 'me' : message.contact_name
                            })).then(function () {
                                stream.resume();
                            });
                        } else {
                            stream.end();
                        }
                    } else {
                        stream.resume();
                    }
                });
            })
                .on('error', function (err) {
                    console.dir(err);
                })
                .on('end', function () {
                    console.dir('Messages synced.');
                })
            );
    });
});