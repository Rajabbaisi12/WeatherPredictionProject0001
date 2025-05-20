document.addEventListener('DOMContentLoaded', () => {
    const chartElement = document.getElementById('chart');
    const rainMessageEl = document.getElementById('rain-message');
    if (!chartElement) {
        console.error('Canvas Element not found.');
        return;
    }

    const ctx = chartElement.getContext('2d');
    const gradient =ctx.createLinearGradient(0, -10, 0, 100);
    gradient.addColorStop(0, 'rgba(250, 0, 0, 1)');
    gradient.addColorStop(1, 'rgba(136, 255, 0, 1)');

    const forecastItems = document.querySelectorAll('.forecast-item');

    const temps = [];
    const times = [];
    const humidities = [];

    forecastItems.forEach(item => {
        const time = item.querySelector('.forecast-time').textContent;
        const temp = item.querySelector('.forecast-temperatureValue').textContent;
        const hum = item.querySelector('.forecast-humidityValue').textContent;

        if (time && temp && hum) {
            times.push(time);
            temps.push(temp);
            humidities.push(parseFloat(hum));
        }
    });

    //Ensure all values are valid before using them

    if (temps.length === 0 || times.length === 0) {
        console.error('Temp or time values are missing.');
        return;
    }

    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: times,
            datasets: [
                {
                    label: 'Celsius Degrees',
                    data: temps,
                    borderColor: gradient,
                    borderWidth: 2,
                    tension: 0.4,
                    pointRadius: 2,
                }
            ]
        },
        options: {
            plugins: {
                legend: {
                    display: false,
                },
            },
            scales: {
                x: {
                    display: false,
                    grid: {
                        drawOnChartArea: false,
                    },
                },
                y: {
                    display: false,
                    grid: {
                        drawOnChartArea: false,
                    },
                },
            },
            animation: {
                duration: 750,
            }
        }

    });


    // Calculate average humidity
    const avgHumidity = humidities.reduce((a, b) => a + b, 0) / humidities.length;

    // Show rain message based on average humidity
    if (avgHumidity > 70) {
        rainMessageEl.textContent = "🌧️ It looks like it will rain soon!";
    } else {
        rainMessageEl.textContent = "☀️ No rain expected.";
    }

     



    //MQTT BROKER FROM JS.

    // Connect to your broker (e.g., HiveMQ public broker or local broker via WebSocket)
    const client = mqtt.connect('wss://test.mosquitto.org:8081'); // Use your own broker URL if needed

    client.on('connect', () => {
        console.log('MQTT connected');
        client.subscribe('weather/data', err => {
            if (err) {
                console.error('Subscription error:', err);
            } else {
                console.log('Subscribed to topic: weather/data');
            }
        });
    });

    client.on('message', (topic, message) => {
        try {
            const data = JSON.parse(message.toString());
            console.log('MQTT Message received:', data);
            // Example format: { time: "12:00", temp: 23.5, hum: 55 }

            // Push new data to chart (you must keep a reference to it!)
            chart.data.labels.push(data.time);
            chart.data.datasets[0].data.push(data.temp);
            chart.update();

        } catch (err) {
            console.error('Error parsing MQTT message:', err);
        }
    });

});