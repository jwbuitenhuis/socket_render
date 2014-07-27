var app = app || {};

(function () {
    "use strict";

    var width = 960,
        height = 650,
        socket = io(),
        trains = {};

    app.arrivals = [];

    app.projection = d3.geo.albers()
        .center([4, 52])
        .rotate([4.4, 0])
        .parallels([50, 60])
        .scale(1200 * 12)
        .translate([width / 2, height / 2]);

    var path = d3.geo.path()
        .projection(app.projection)
        .pointRadius(2);



    function addTrain (train_id, arrival) {
        var trail = trains[train_id] = trains[train_id] || [];

        trail.push(arrival);
        //console.log(trail);
    }

    app.addArrival = function(eventBody) {
        var loc_stanox = eventBody.loc_stanox,
            location = app.locations[loc_stanox],
            train_id = eventBody.train_id,
            actual_timestamp = eventBody.actual_timestamp,
            arrival;

        if (location) {
            arrival = {
                actual_timestamp: actual_timestamp,
                longitude: location.longitude,
                latitude: location.latitude,
                name: location.name,
                train_id: train_id
            };

            addTrain(train_id, arrival);

            app.arrivals.push(arrival);

            app.plotArrival(arrival);
        }
    }


    app.plotArrival = function (arrival) {
        var svg = d3.select("svg");

        var pins = svg.select('g.pins').selectAll(".pin")
            .data([arrival])
            .enter();

        pins.append("svg:image")
            .attr("xlink:href", "images/flare1.png")
            .attr("width", "70")
            .attr("height", "70")
            .attr("x", -35)
            .attr("y", -35)
            .attr("transform", function (d) {
                return "translate(" + app.projection([
                    d.longitude,
                    d.latitude
                ]) + ")";
            })
            .transition()
            .duration(1000 * 10)
            .style("opacity", 0)
            .remove();

        var labels = svg.selectAll(".train-label");

        labels
            .data([arrival])
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
            .text(function (d) { return 'Train ' + d.train_id + ' is at ' + d.name; })
            .transition().duration(1000 * 10)
            .style("opacity", 0)
            .remove();
    };


    d3.json("uk.json", function(error, uk) {
      var subunits = topojson.feature(uk, uk.objects.subunits),
          places = topojson.feature(uk, uk.objects.places);

    var svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height);

      svg.selectAll(".subunit")
          .data(subunits.features)
        .enter().append("path")
          .attr("class", function(d) { return "subunit " + d.id; })
          .attr("d", path);

      svg.append("path")
          .datum(topojson.mesh(uk, uk.objects.subunits, function(a, b) { return a !== b && a.id !== "IRL"; }))
          .attr("d", path)
          .attr("class", "subunit-boundary");

      svg.append("path")
          .datum(topojson.mesh(uk, uk.objects.subunits, function(a, b) { return a === b && a.id === "IRL"; }))
          .attr("d", path)
          .attr("class", "subunit-boundary IRL");

      svg.selectAll(".subunit-label")
          .data(subunits.features)
        .enter().append("text")
          .attr("class", function(d) { return "subunit-label " + d.id; })
          .attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
          .attr("dy", ".35em")
          .text(function(d) { return d.properties.name; });

      svg.append("path")
          .datum(places)
          .attr("d", path)
          .attr("class", "place");

      svg.selectAll(".place-label")
          .data(places.features)
        .enter().append("text")
          .attr("class", "place-label")
          .attr("transform", function(d) { return "translate(" + app.projection(d.geometry.coordinates) + ")"; })
          .attr("x", function(d) { return d.geometry.coordinates[0] > -1 ? 6 : -6; })
          .attr("dy", ".35em")
          .style("text-anchor", function(d) { return d.geometry.coordinates[0] > -1 ? "start" : "end"; })
          .text(function(d) { return d.properties.name; });

        svg.append('g').attr('class', 'pins');

        socket.on('train', function (event) {
            app.addArrival(event.body);
        });


    });
}());