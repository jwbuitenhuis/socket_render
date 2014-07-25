/*global $, d3, console, io, setInterval*/
$(function () {
    "use strict";

    var socket = io(),
        dataHistory = [],
        vis = d3.select("#visualisation"),
        WIDTH = 1000,
        HEIGHT = 500,
        MARGINS = {
            top: 20,
            right: 20,
            bottom: 20,
            left: 50
        },
        xAxis,
        yAxis,
        lineFunc,
        lastRenderTime = 0,
        msPerFrame = 10,
        renderingTimes = [],
        lastRenderedData;


    function updateAxis(lineData) {

        var xRange = d3.time.scale().range([
                MARGINS.left, WIDTH - MARGINS.right
            ]).domain([
                d3.min(lineData, function (d) {
                    return d.x;
                }),
                d3.max(lineData, function (d) {
                    return d.x;
                })
            ]),
            yRange = d3.scale.linear().range([
                HEIGHT - MARGINS.top,
                MARGINS.bottom
            ]).domain([0, 100]);

        xAxis = d3.svg.axis()
            .scale(xRange)
            .orient('bottom')
            .ticks(d3.time.seconds, 1)
            .tickFormat(d3.time.format('%a %d'))
            .tickSize(5)
            .tickPadding(8);

        yAxis = d3.svg.axis()
            .scale(yRange)
            .tickSize(5)
            .orient("left")
            .tickSubdivide(true);

        lineFunc = d3.svg.line()
            .x(function (d) {
                return xRange(d.x);
            })
            .y(function (d) {
                return yRange(d.y);
            })
            .interpolate('basis');
    }

    function drawChart(lineData) {

        vis.append("svg:g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + (HEIGHT - MARGINS.bottom) + ")")
            .call(xAxis);

        vis.append("svg:g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + (MARGINS.left) + ",0)")
            .call(yAxis);

        vis.append("svg:path")
            .attr("class", "main-chart")
            .attr("d", lineFunc(lineData))
            .attr("stroke", "blue")
            .attr("stroke-width", 2)
            .attr("fill", "none");

        return vis;
    }


    function updateChart(vis, lineData) {
        vis.selectAll("path.main-chart")
            .data(lineData)
            .attr("d", lineFunc(lineData))
            .transition()
            .ease("linear")
            .duration(250);
    }


    // This is the data gathering process. It will immediately
    // get rid of information that's not needed anymore, limiting
    // memory usage.
    socket.on('data', function (data) {

        dataHistory.push(data);

        // initialize
        if (dataHistory.length >= 5000) {
            dataHistory.shift();
        } else if (dataHistory.length === 1) {
            updateAxis(dataHistory);
            vis = drawChart(dataHistory);
        }

        $('#datasize').val(dataHistory.length);
    });

    function average(array) {
        var i,
            sum = 0;

        for (i = 0; i < array.length; i += 1) {
            sum += array[i];
        }

        return Math.floor(sum * 1000 / array.length);
    }


    // this is the rendering process, it's not bothered
    // by the data import
    // since it runs on a different turn it will not block
    setInterval(function () {
        function getTime() {
            return (new Date()).getTime();
        }

        var lastData,
            startTime,
            renderingTime;

        if (dataHistory.length) {
            lastData = dataHistory[dataHistory.length - 1].x;
            if (lastData !== lastRenderedData && lastData - lastRenderTime > msPerFrame) {
                lastRenderedData = lastData;
                startTime = getTime();
                updateAxis(dataHistory);
                updateChart(vis, dataHistory);

                renderingTime = getTime() - startTime;

                if (renderingTimes.length >= 100) {
                    renderingTimes = renderingTimes.splice(0, 100);
                }

                renderingTimes.push(renderingTime);

                $('#averageRenderingTime').val(average(renderingTimes));
            }

        }
    }, msPerFrame);

    $('#start').click(function () {
        socket.emit('start');
    });

    $('#stop').click(function () {
        socket.emit('stop');
    });

});
