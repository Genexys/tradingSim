var barCount = 60;
var initialDateStr = '01 Apr 2017 00:00 Z';

var ctx = document.getElementById('chart').getContext('2d');
ctx.canvas.width = 1000;
ctx.canvas.height = 250;


fetch(`AAPL.json`)
    .then(res => res.json())
    .then(data => {

        const dataReverse = data.reverse()

        const dataTransform = dataReverse.map(({Date: t, Close: c, Volume: volume, Open: o, High: h, Low: l}) => {

            let time = luxon.DateTime.fromISO(t.replace(/\//g, '-'));
            t = time.ts;
            c = c.slice(1, c.length - 1);
            o = o.slice(1, o.length - 1);
            h = h.slice(1, h.length - 1);
            l = l.slice(1, l.length - 1);

            return {t, o, h, l, c}
        });

        const firstDataStocks = dataTransform.filter((el, inx) => {
            if (inx < 60) {
                return el;
            }
        });

        const secondDataStocks = dataTransform.filter((el, inx) => {
            if (inx > 100) {
                return el
            }
        });

        const secondDataStocksTransform = secondDataStocks.map(({t, o, h, l, c}) => {

            // const dateArr = t.split("/");
            //
            // t = {
            //     day: parseInt(dateArr[1]),
            //     month: parseInt(dateArr[0]),
            //     year: parseInt(dateArr[2]),
            // };

            return {t, o, h, l, c}
        });

        var chart = new Chart(ctx, {
            type: 'candlestick',
            data: {
                datasets: [{
                    label: 'CHRT - Chart.js Corporation',
                    data: firstDataStocks
                }]
            }
        });

        console.log(getRandomData(initialDateStr, barCount))
        console.log(firstDataStocks)

    })
    .catch(err => console.log(err))


var getRandomInt = function(max) {
    return Math.floor(Math.random() * Math.floor(max));
};

function randomNumber(min, max) {
    return Math.random() * (max - min) + min;
}

function randomBar(date, lastClose) {
    var open = randomNumber(lastClose * 0.95, lastClose * 1.05).toFixed(2);
    var close = randomNumber(open * 0.95, open * 1.05).toFixed(2);
    var high = randomNumber(Math.max(open, close), Math.max(open, close) * 1.1).toFixed(2);
    var low = randomNumber(Math.min(open, close) * 0.9, Math.min(open, close)).toFixed(2);
    return {
        t: date.valueOf(),
        o: open,
        h: high,
        l: low,
        c: close
    };

}

function getRandomData(dateStr, count) {
    var date = luxon.DateTime.fromRFC2822(dateStr);
    var data = [randomBar(date, 30)];
    while (data.length < count) {
        date = date.plus({days: 1});
        if (date.weekday <= 5) {
            data.push(randomBar(date, data[data.length - 1].c));
        }
    }

    console.log(data)

    return data;
}

var update = function() {
    var dataset = chart.config.data.datasets[0];

    // candlestick vs ohlc
    var type = document.getElementById('type').value;
    dataset.type = type;

    // linear vs log
    var scaleType = document.getElementById('scale-type').value;
    chart.config.options.scales.y.type = scaleType;

    // color
    var colorScheme = document.getElementById('color-scheme').value;
    if (colorScheme === 'neon') {
        dataset.color = {
            up: '#01ff01',
            down: '#fe0000',
            unchanged: '#999',
        };
    } else {
        delete dataset.color;
    }

    // border
    var border = document.getElementById('border').value;
    var defaultOpts = Chart.defaults.elements[type];
    if (border === 'true') {
        dataset.borderColor = defaultOpts.borderColor;
    } else {
        dataset.borderColor = {
            up: defaultOpts.color.up,
            down: defaultOpts.color.down,
            unchanged: defaultOpts.color.up
        };
    }

    chart.update();
};

// document.getElementById('update').addEventListener('click', update);
//
// document.getElementById('randomizeData').addEventListener('click', function() {
//     chart.data.datasets.forEach(function(dataset) {
//         dataset.data = getRandomData(initialDateStr, barCount);
//     });
//     update();
// });
