import 'babel-polyfill'

//Pseudo code
//Step 1: Define chart properties.
//Step 2: Create the chart with defined properties and bind it to the DOM element.
//Step 3: Add the CandleStick Series.
//Step 4: Set the data and render.
//Step5 : Plug the socket to the chart


//Code
const log = console.log;

const chartProperties = {
    width: 1500,
    height: 600,
    timeScale: {
        timeVisible: true,
        secondsVisible: false,
    }
}

const domElement = document.getElementById('tvchart');
const chart = LightweightCharts.createChart(domElement, chartProperties);
const candleSeries = chart.addCandlestickSeries();


    const getData = async () => {
        const res = await fetch(`./AAPL.json`);
        const data = await res.json();

        // Делаю реверс массива, что бы старые записи были сначала
        const dataReverse = data.reverse()

        // Переделывают данные массива под нужные
        const dataTransform = dataReverse.map(({Date: time, Close: close, Volume: volume, Open: open, High: high, Low: low}) => {

            close = parseFloat(close.slice(1, close.length - 1));
            open = parseFloat(open.slice(1, open.length - 1));
            high = parseFloat(high.slice(1, high.length - 1));
            low = parseFloat(low.slice(1, low.length - 1));

            return {open, high, low, close, time}
        });

        // Беру первые 100 значений
        const firstDataStocks = dataTransform.filter((el, inx) => {
            if (inx < 100) {
                return el;
            }
        });

        // Беру оставшиеся
        const secondDataStocks = dataTransform.filter((el, inx) => {
            if (inx > 100) {
                return el
            }
        });

        // Переделываю дату под нужный формат
        const secondDataStocksTransform = secondDataStocks.map(({time, close, open, high, low}) => {

            const dateArr = time.split("/");

            time = {
                day: parseInt(dateArr[1]),
                month: parseInt(dateArr[0]),
                year: parseInt(dateArr[2]),
            };

            return {open, high, low, close, time}
        })

        candleSeries.setData(firstDataStocks);


        const nextBtn = document.getElementById('next');
        const playBtn = document.getElementById('play');
        const incBtn = document.getElementById('speed_inc');
        const decBtn = document.getElementById('speed_dec');
        const stopBtn = document.getElementById('stop');
        const buyBtn = document.getElementById('buy-btn');
        const sellBtn = document.getElementById('buy-sell');
        const buyTable = document.getElementById('buy-table');
        const buyOpen = document.getElementById('buy-open');
        const buyHigh = document.getElementById('buy-high');
        const buyLow = document.getElementById('buy-low');
        const buyItemList = document.getElementById('buy');
        const sellItemList = document.getElementById('sell');
        const diff = document.getElementById('diff');
        const diffNum = document.getElementById('diff-num');
        const buyClose = document.getElementById('buy-close');
        const sellClose = document.getElementById('sell-close');

        let count = 1;
        let timeDrawInit = 200;
        let timeDrawCount = 200;
        let timerDraw;
        let buySum;
        let sellSum;
        var markers = [];

        sellBtn.setAttribute('disabled', true)

        const updateChart = () => {
            candleSeries.update(secondDataStocksTransform[count - 1]);
            count++
        }

        const getTimer = (timeDraw)=> {

            // setTimeout(function timerCb(timeDraw) {
            //     console.log(timeDrawInit)
            //     updateChart()
            //     setTimeout(timerCb, timeDrawInit)
            // }, timeDrawInit)

            timeDrawInit = timeDraw;
            clearTimeout(timerDraw)
            timerDraw = setInterval(() => {
                updateChart()

                // console.log(timeDrawInit)

            }, timeDrawInit)
        }

        const playDrawChart = (timeDrawInit) => {

            if (timeDrawInit >= timeDrawCount) {
                getTimer(timeDrawInit)
            } else {
                return false
            }

        }

        const incTime = () => {
            playDrawChart(timeDrawInit-= timeDrawCount)
        }

        const decTime = () => {
            playDrawChart(timeDrawInit+= timeDrawCount)
        }


        nextBtn.addEventListener('click', () => {
            updateChart()
        });

        playBtn.addEventListener('click', () => {
            playDrawChart(timeDrawInit)

            // markers = []
            candleSeries.setMarkers(markers);
        });

        incBtn.addEventListener('click', () => {
            incTime()
        });

        decBtn.addEventListener('click', () => {
            decTime()
        });

        stopBtn.addEventListener('click', () => {
            timeDrawInit = 200;
            clearTimeout(timerDraw)
        });

        buyBtn.addEventListener('click', function() {
            timeDrawInit = 200;
            clearTimeout(timerDraw)

            console.log(firstDataStocks)

            buySum = secondDataStocksTransform[count - 1];

            buyItemList.classList.add('active');

            // buyOpen.textContent = buySum.open;
            // buyHigh.textContent = buySum.high;
            // buyLow.textContent = buySum.low;
            buyClose.textContent = buySum.close;

            // console.log(dataTransform[dataTransform.length - 1])

            markers.push({ time: buySum.time, position: 'aboveBar', color: '#f68410', shape: 'circle', text: 'Buy' });
            candleSeries.setMarkers(markers);

            // console.log(con)

            this.setAttribute('disabled', 'true')
            sellBtn.removeAttribute('disabled')
        });

        sellBtn.addEventListener('click', () => {
            timeDrawInit = 200;
            clearTimeout(timerDraw)

            console.log(firstDataStocks)

            sellSum = secondDataStocksTransform[count - 1];

            sellItemList.classList.add('active');
            diff.classList.add('active');

            // buyOpen.textContent = buySum.open;
            // buyHigh.textContent = buySum.high;
            // buyLow.textContent = buySum.low;
            sellClose.textContent = sellSum.close;

            diffNum.textContent = (( ( sellSum.close - buySum.close) / buySum.close ) * 100).toFixed(2);

            console.log(( ( sellSum.close - buySum.close) / buySum.close ) * 100)

            markers.push({ time: sellSum.time, position: 'aboveBar', color: '#009387', shape: 'circle', text: 'Sell' });
            candleSeries.setMarkers(markers);

            this.setAttribute('disabled', 'true')

            // console.log(buySum)
        });

        chart.subscribeClick(param => {
            console.log(param.seriesPrices.values());

            for (let amount of param.seriesPrices.values()) {
                console.log(amount);
            }
        });

        // var lastClose = firstDataStocks[firstDataStocks.length - 1].close;
        // var lastIndex = firstDataStocks.length - 1;
        //
        // var targetIndex = lastIndex + 105 + Math.round(Math.random() + 30);
        // var targetPrice = getRandomPrice();
        //
        // var currentIndex = lastIndex + 1;
        // var currentBusinessDay = firstDataStocks[firstDataStocks.length - 1].time;
        // var ticksInCurrentBar = 0;
        // var currentBar = {
        //     open: null,
        //     high: null,
        //     low: null,
        //     close: null,
        //     time: currentBusinessDay,
        // };
        //
        // function mergeTickToBar(price) {
        //     if (currentBar.open === null) {
        //         currentBar.open = price;
        //         currentBar.high = price;
        //         currentBar.low = price;
        //         currentBar.close = price;
        //     } else {
        //         currentBar.close = price;
        //         currentBar.high = Math.max(currentBar.high, price);
        //         currentBar.low = Math.min(currentBar.low, price);
        //
        //         console.log(currentBar)
        //
        //     }
        //     candleSeries.update(currentBar);
        // }
        //
        // function reset() {
        //     candleSeries.setData(firstDataStocks);
        //     lastClose = data[data.length - 1].close;
        //     lastIndex = data.length - 1;
        //
        //     targetIndex = lastIndex + 5 + Math.round(Math.random() + 30);
        //     targetPrice = getRandomPrice();
        //
        //     currentIndex = lastIndex + 1;
        //     currentBusinessDay = firstDataStocks[firstDataStocks.length - 1].time;
        //     ticksInCurrentBar = 0;
        // }
        //
        // function getRandomPrice() {
        //     return 10 + Math.round(Math.random() * 10000) / 100;
        // }
        //
        // function nextBusinessDay(time) {
        //     var d = new Date();
        //     d.setUTCFullYear(time.year);
        //     d.setUTCMonth(time.month - 1);
        //     d.setUTCDate(time.day + 1);
        //     d.setUTCHours(0, 0, 0, 0);
        //     return {
        //         year: d.getUTCFullYear(),
        //         month: d.getUTCMonth() + 1,
        //         day: d.getUTCDate(),
        //     };
        // }
        //
        // setInterval(function() {
        //     var deltaY = targetPrice - lastClose;
        //     var deltaX = targetIndex - lastIndex;
        //     var angle = deltaY / deltaX;
        //     var basePrice = lastClose + (currentIndex - lastIndex) * angle;
        //     var noise = (0.1 - Math.random() * 0.2) + 1.0;
        //     var noisedPrice = basePrice * noise;
        //     mergeTickToBar(noisedPrice);
        //     if (++ticksInCurrentBar === 5) {
        //         // move to next bar
        //         currentIndex++;
        //         currentBusinessDay = nextBusinessDay(currentBusinessDay);
        //         currentBar = {
        //             open: null,
        //             high: null,
        //             low: null,
        //             close: null,
        //             time: currentBusinessDay,
        //         };
        //         ticksInCurrentBar = 0;
        //         if (currentIndex === 5000) {
        //             reset();
        //             return;
        //         }
        //         if (currentIndex === targetIndex) {
        //             // change trend
        //             lastClose = noisedPrice;
        //             lastIndex = currentIndex;
        //             targetIndex = lastIndex + 5 + Math.round(Math.random() + 30);
        //             targetPrice = getRandomPrice();
        //         }
        //     }
        // }, 200);
    }

const isPrime = (num) => {
    let i;
    if (num <= 1) return false;
    for (let count = 2; num % count !== 0; count++) {

        console.log(num / 2, '<', count)
        console.log('--------')

        if (num / 2 < count) {
            i = 1;
        }

        if (i === 1) {
            return true;
        }
    }
    return false;
};

    // console.log(isPrime(1))
    // console.log(-3, isPrime(-3))
    // console.log(4, isPrime(4))
    console.log(7, isPrime(7))
    // // console.log(isPrime(10))
    // console.log(21, isPrime(21))
    // console.log(2, isPrime(2))
    // console.log(3, isPrime(3))

    // isPrime(1);     // false
    // isPrime(7);     // true
    // isPrime(10);    // false
    // isPrime(21);    // true

    getData().catch(err => log(err))




