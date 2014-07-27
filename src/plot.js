/*global d3, setInterval,console*/
var app = app || {};

(function () {
    'use strict';

    app.plotTrainLocations = function () {
        var svg = d3.select("svg");

        var pins = svg.select('g.pins').selectAll(".pin")
            .data(app.arrivals)
            .enter();

        // pins.append("circle", ".pin")
        //     .attr("r", 2)
        //     .attr("transform", function (d) {
        //         return "translate(" + app.projection([
        //             d.longitude,
        //             d.latitude
        //         ]) + ")";
        //     });

        pins.append("svg:image")
            .attr("xlink:href", "images/flare1.png")
            .attr("width", "20")
            .attr("height", "20")
            .attr("transform", function (d) {
                return "translate(" + app.projection([
                    d.longitude,
                    d.latitude
                ]) + ")";
            })
            .transition().duration(1000).style("opacity", 0)
            .remove();


        // var imgs = svg.selectAll("image").data(app.arrivals);

        // imgs.enter()

        svg.selectAll(".train-label")
            .data(app.arrivals)
            .enter().append("text")
            .attr("class", "train-label")
            .attr("transform", function (d) {
                return "translate(" + app.projection([
                    d.longitude,
                    d.latitude
                ]) + ")"
            })
            .attr("dx", "10px")
            .attr('fill', 'white')
            .text(function (d) { return 'Train ' + d.train_id + ' is at ' + d.name; });


        // d3.select('.arrivals')
        //     .selectAll('.arrival')
        //     .data(app.arrivals)
        //     .enter()
        //     .append('div')
        //     .attr('class', 'arrival')
        //     .text(function (d) { return 'Train ' + d.train_id + ' is at ' + d.name; });
    };

    // setInterval(function () {
    //     if (app.arrivals.length) {
    //         app.plotTrainLocations();
    //     }
    // }, 250);

}());
