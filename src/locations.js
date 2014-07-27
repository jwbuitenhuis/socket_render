/*global d3*/

var app = app || {};

(function () {
    'use strict';

    d3.csv('location_data.csv', function (data) {
        app.locations = {};

        data.map(function (location) {

            if (location.stanox && location.longitude && location.latitude && location.location) {
                app.locations["" + location.stanox] = {
                    longitude: location.longitude,
                    latitude: location.latitude,
                    name: location.location
                };
            }
        });

        d3.csv('arrivals.json', function (rows) {
            setInterval(function () {
                app.addArrival(rows.shift());
            }, 1000);
//            rows.map();
        });

    });

}());
