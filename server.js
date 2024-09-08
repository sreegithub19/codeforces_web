const express = require('express');
const {spawn} = require('child_process');
const path = require('path');
const { _1A } = require('./_1A');
const app = express();
const port = 3000;

function CalculateCircleCenter(A, B, C) {
    var yDelta_a = B.y - A.y;
    var xDelta_a = B.x - A.x;
    var yDelta_b = C.y - B.y;
    var xDelta_b = C.x - B.x;

    var center = {};

    var aSlope = yDelta_a / xDelta_a;
    var bSlope = yDelta_b / xDelta_b;

    center.x = (aSlope * bSlope * (A.y - C.y) + bSlope * (A.x + B.x) - aSlope * (B.x + C.x)) / (2 * (bSlope - aSlope));
    center.y = (-1 * (center.x - (A.x + B.x) / 2)) / aSlope + (A.y + B.y) / 2;
    return center;
}

function getAngle(p1, p2, p3) {
    const r1Square = (p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2;
    const r2Square = (p2.x - p3.x) ** 2 + (p2.y - p3.y) ** 2;
    const r3Square = (p3.x - p1.x) ** 2 + (p3.y - p1.y) ** 2;

    const denom = 2 * Math.sqrt(r1Square * r2Square);
    const numer = r1Square + r2Square - r3Square;

    const cosTheta = numer / denom;

    return Math.acos(cosTheta);
}

function findDenom(dec) {
    const prec = 0.000001;
    let i = 1;
    let smallestDiff = 1;
    let bestCase = 1;
    for (; i < 101; i++) {
        let mult = i * dec;
        const diff = mult - Math.floor(mult);
        const actualDiff = diff < 0.5 ? diff : 1 - diff;
        if (actualDiff < smallestDiff) {
            smallestDiff = actualDiff;
            bestCase = i;
        }
        if (actualDiff < prec) {
            return i;
        }
    }
    return bestCase;
}

let lcm = (n1, n2) => {
    let lar = Math.max(n1, n2);
    let small = Math.min(n1, n2);

    let i = lar;
    while (i % small !== 0) {
        i += lar;
    }

    return i;
};

function computeArea(triangle) {
    const centre = CalculateCircleCenter(...triangle);

    const angle1 = getAngle(triangle[0], centre, triangle[1]) / (2 * Math.PI);
    const angle2 = getAngle(triangle[1], centre, triangle[2]) / (2 * Math.PI);
    const angle3 = getAngle(triangle[0], centre, triangle[2]) / (2 * Math.PI);

    const [denom1, denom2, denom3] = [angle1, angle2, angle3].map(a => findDenom(a));

    const lcmAngle = lcm(lcm(denom1, denom2), denom3);

    const area = 0.5 *
        ((centre.x - triangle[0].x) ** 2 +
            (centre.y - triangle[0].y) ** 2) *
        Math.sin((2 * Math.PI) / lcmAngle) *
        lcmAngle;

    return area;
}

function getFactorCount(num, factor) {
    let cnt = 0;
    while (num > 0 && num % factor === 0) {
      num /= factor;
      cnt++;
    }
    return cnt;
  }
  
  function getMinPathDP(N, arr, factor) {
    const dp = Array.from({ length: N }, () => Array(N).fill(0));
  
    dp[0][0] = getFactorCount(arr[0][0], factor);
  
    for (let i = 1; i < N; i++) {
      dp[i][0] = dp[i - 1][0] + getFactorCount(arr[i][0], factor);
      dp[0][i] = dp[0][i - 1] + getFactorCount(arr[0][i], factor);
    }
  
    for (let i = 1; i < N; i++) {
      for (let j = 1; j < N; j++) {
        dp[i][j] = Math.min(dp[i - 1][j], dp[i][j - 1]) + getFactorCount(arr[i][j], factor);
      }
    }
  
    return dp;
  }
  
  function constructPath(N, dp) {
    let path = '';
    let i = N - 1;
    let j = N - 1;
  
    while (i > 0 || j > 0) {
      if (i === 0) {
        j--;
        path = 'R' + path;
      } else if (j === 0) {
        i--;
        path = 'D' + path;
      } else if (dp[i - 1][j] < dp[i][j - 1]) {
        i--;
        path = 'D' + path;
      } else {
        j--;
        path = 'R' + path;
      }
    }
  
    return path;
  }
  
  function solve(N, arr) {
    const twoDP = getMinPathDP(N, arr, 2);
    const fiveDP = getMinPathDP(N, arr, 5);
  
    let minTwos = twoDP[N - 1][N - 1];
    let minFives = fiveDP[N - 1][N - 1];
  
    if (minTwos > 1 && minFives > 1) {
      for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
          if (arr[i][j] === 0) {
            return [1, 'D'.repeat(i) + 'R'.repeat(N - 1) + 'D'.repeat(N - 1 - i)];
          }
        }
      }
    }
  
    if (minTwos <= minFives) {
      return [minTwos, constructPath(N, twoDP)];
    } else {
      return [minFives, constructPath(N, fiveDP)];
    }
  }


app.use(express.json());

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Node.js Code Evaluator</title>
        </head>
        <body>
            <h1>Node.js Code Evaluator</h1>
            <form id="codeForm">
                <select id="endpoint">
                    <option value="1A">1A</option>
                    <option value="1B">1B</option>
                    <option value="1C">1C</option>
                    <option value="2A">2A</option>
                    <option value="2B">2B</option>
                    <option value="2B">2B</option>
                    <option value="run_python">run_python</option>
                </select>
                <textarea id="inputData" rows="4" cols="50" placeholder="Enter values separated by spaces (e.g., 6 6 4)"></textarea><br>
                <button type="submit">Submit</button>
            </form>
            <pre id="result"></pre>
            <script>
                document.getElementById('codeForm').addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const endpoint = document.getElementById('endpoint').value;
                    const inputData = document.getElementById('inputData').value;
                    const response = await fetch(\`/\${endpoint}\`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ inputData })
                    });
                    const result = await response.text();
                    document.getElementById('result').textContent = result;
                });
            </script>
        </body>
        </html>
    `);
})



app.post('/1A', (req, res) => {
    const { inputData } = req.body;

    // Check if inputData is a string
    if (typeof inputData !== 'string') {
        return res.status(400).send('Error: Input data must be a string.');
    }

    try {
        const result = _1A(inputData);
        res.send(result.toString());
    } catch (error) {
        res.status(400).send(`Error: ${error.message}`);
    }
});

app.post('/1B', (req, res) => {
    const { inputData } = req.body;
    console.log("ty:"+ inputData)
    // Check if inputData is a string
    if (typeof inputData !== 'string') {
        return res.status(400).send('Error: Input data must be a string.');
    }

    try {
        const lines = inputData.split('\n');
        let l = 0;

        let t = +lines[l++];
        let rc = /^R\d+C\d+$/;
        let output = [];

        while (t--) {
            let a = lines[l++];
            if (rc.test(a)) {
                let c = +a.split("C")[1];
                let row = a.replace("C" + c, "").substring(1);
                let col = "";
                while (c) {
                    let x = c % 26;
                    c = (c - x) / 26;
                    if (x === 0) {
                        x += 26;
                        c--;
                    }
                    col = String.fromCharCode("A".charCodeAt(0) + x - 1) + col;
                }
                output.push(col + row);
            } else {
                let col = a.replace(/[0-9]+$/, "");
                let row = a.replace(col, "");
                let c = 0;
                for (let i = 0; i < col.length; i++) {
                    let x = col[i].charCodeAt(0) - "A".charCodeAt(0) + 1;
                    c = c * 26 + x;
                }
                output.push("R" + row + "C" + c);
            }
        }

        res.send(output.join('\n'));
    } catch (error) {
        res.status(500).send('Server error');
    }
});


// POST endpoint to calculate the area of a triangle
app.post('/1C', (req, res) => {
    const { inputData } = req.body;
    console.log("ty:"+ inputData)

    if (typeof inputData !== 'string') {
        return res.status(400).json({ error: 'Input must be a string' });
    }

    // Parse the input string
    const lines = inputData.split('\n');
    if (lines.length !== 3) {
        return res.status(400).json({ error: 'Input must contain exactly three lines' });
    }

    const triangle = lines.map(line => {
        const [x, y] = line.split(' ').map(Number);
        if (isNaN(x) || isNaN(y)) {
            return res.status(400).json({ error: 'Invalid coordinates' });
        }
        return { x, y };
    });

    try {
        const area = computeArea(triangle);
        res.send(area.toString());
    } catch (error) {
        res.status(500).json({ error: 'Error computing area' });
    }
});


// Route handler for the computation logic
app.post('/2A', (req, res) => {
    let { inputData } = req.body;
  
    // Ensure inputData is an array of strings or a single string
    if (typeof inputData === 'string') {
        // Split the single string into an array of lines
        inputData = inputData.split('\n');
    } else if (!Array.isArray(inputData)) {
        return res.status(400).json({ error: 'Invalid input data' });
    }
  
    // Process inputData as an array of strings
    const B = inputData
        .flatMap(line => line.toString().split('\n')) // Split each line into an array of lines
        .map(line => line.trim()) // Trim whitespace from each line
        .filter(Boolean) // Remove empty lines
        .join('\n'); // Join back into a single string with newlines
  
    const B_lines = B.split('\n').slice(1); // Skip the first line (assumed to be a count)
    const b = [];
    const h = {};
  
    for (let line of B_lines) {
        const [name, value] = line.split(' ');
        const score = Number(value);
        h[name] = (h[name] || 0) + score;
        b.push({ name, score: h[name] });
    }
  
    const names = Object.keys(h);
    const maxScore = Math.max(...Object.values(h));
    const topNames = names.filter(name => h[name] === maxScore);
  
    if (topNames.length === 1) {
        //return res.json({ winner: topNames[0] });
        return res.send(topNames[0]);
    } else {
        const firstRoundIndexes = topNames.map(name => {
            const index = b.findIndex(entry => entry.name === name && entry.score >= maxScore);
            return { name, firstRound: index };
        });
  
        const winner = firstRoundIndexes.reduce((min, current) => {
            return current.firstRound < min.firstRound ? current : min;
        }, { name: '', firstRound: Infinity });
  
        return res.send(winner.name.toString());
    }
});

app.post('/2B', (req, res) => {
      // Read the raw text input
    let {inputData} = req.body;
    
    // Split the input into lines
    inputData = inputData.split('\n'); // Handle both \n and \r\n

    // Extract the matrix size (N)
    let [N] = inputData.shift().split(' ').map(Number);

    // Extract the matrix (arr)
    let arr = inputData.map(line => line.split(' ').map(Number));
  
    if (!Array.isArray(arr) || arr.length !== N || arr.some(row => row.length !== N)) {
      return res.status(400).json({ error: 'Invalid input format' });
    }
  
    let [num, path] = solve(N, arr);
    return res.send(num + "\n" + path);
  });


app.post('/run_python', (req, res) => {
    // Assuming 'my_script.py' is in the same directory as this file
    const pythonProcess = spawn('python', ['-c',`import sys
import json

def main():
    data = json.loads(sys.argv[1])
    # Perform some operation with data
    print(f"Received data: {data}")

main()
`, JSON.stringify(req.body)]);

    let result = '';
    pythonProcess.stdout.on('data', (data) => {
        result += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        if (code === 0) {
            return res.json({ output: result });
        } else {
            return res.status(500).json({ error: `Python process exited with code ${code}` });
        }
    });
});




app.listen(process.env.PORT || port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
