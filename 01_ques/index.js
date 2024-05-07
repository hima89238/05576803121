const express = require('express');
const app = express();
const port = 9876;
const axios = require('axios');

const WINDOW_SIZE = 10;
const TEST_SERVER = 'http://20.244.56.144/test/';

let windowNumbers = [];
let oldestIndex = 0;

const calAg = (numbers) => {
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    return sum / numbers.length;
};

const fetchNumbers = async (req, res, next) => {
    const { numberId } = req.params;
    let url = '';

    switch (numberId) {
        case 'primes':
            url = TEST_SERVER + 'primes';
            break;
        case 'fibonaaci':
            url = TEST_SERVER + 'fibo';
            break;
        case 'even':
            url = TEST_SERVER + 'even';
            break;
        case 'random':
            url = TEST_SERVER + 'rand';
            break;
        default:
            res.status(200).json({ error: 'Invalid number ID' });
            return;
    }
    try {
        const response = await axios.get(url);
        const newNumbers = response.data.numbers;

        newNumbers.forEach((num) => {
            if (!windowNumbers.includes(num)) {
                windowNumbers.push(num);

                if (windowNumbers.length > WINDOW_SIZE) {
                    windowNumbers.splice(oldestIndex, 1);
                } else {
                    oldestIndex++;
                }

                oldestIndex %= WINDOW_SIZE;
            }
        });

        const average = calAg(windowNumbers);

        res.json({
            numbers: windowNumbers,
            previousState: windowNumbers.slice(0, -newNumbers.length),
            currentState: windowNumbers,
            average: average.toFixed(2),
        });
    } catch (error) {
        res.status(200).json({ error: 'error' });
    }
};

app.get('/numbers/:numberId', fetchNumbers);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/numbers/e`);
});

