function changeColorOfKey(n) {
    const container = document.querySelector('.container');
    const key = container.querySelector(`.square-${n}`);
    const { r, g, b } = randomColorGen();
    
    if (key) {
        key.style.backgroundColor = `green`;
    }
    return;
    if (key) {
        key.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
    }
}

const bpm = 200;
let running = false;

async function highlightKey(n, isBeat) {
    const container = document.querySelector('.container');
    const key = container.querySelector(`.square-${n}`);
    
    if (key) {
        key.style.filter = 'brightness(1.5)';
        if (isBeat) {
            audioTeture()
        }
        await timer(bpm)
        key.style.filter = 'none';
    }
}

// Returns a Promise that resolves after "ms"DW Milliseconds
const timer = ms => new Promise(res => setTimeout(res, ms))

async function modulateIt() {
    let interval = 3;
    let steps = 7;

    let timesToRun = 10;
    let timesRan = 0;

    let patternArr = bresenhamEuclidean(interval, steps);
    console.log('should run? ', running)
    while (running == true) { // sub with timesToRun if necessary

        for (let i = 0; i <= patternArr.length; i++) {
            if (patternArr[i] === 1) {
                const container = document.querySelector('.container');
                const key = container.querySelector(`.square-${i}`);
                key.style.background = 'green'        
            }
        }

        for (let i = 0; i <= patternArr.length; i++) {
            let isBeat = patternArr[i] === 1;
            await highlightKey(i, isBeat);
        }

        timesRan++;
    }

}

function bresenhamEuclidean(onsets, totalPulses) {
    let previous = null;
    let pattern = [];
  
    for (let i = 0; i < totalPulses; i++) {
        let xVal = Math.floor((onsets  / totalPulses) * i);
        pattern.push(xVal === previous ? 0 : 1);
        previous = xVal;
    }

    return pattern;
}


function randomColorGen() {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);

    return { r, g, b}
}

async function audioTeture() {
    // create web audio api context
    const audioCtx = new AudioContext();

    // create Oscillator node
    const oscillator = audioCtx.createOscillator();

    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(200, audioCtx.currentTime); // value in hertz
    oscillator.connect(audioCtx.destination);
    oscillator.start();
    await timer(100)
    oscillator.stop();

}

function handleModulator(btn) {
    let input = document.querySelector('input[type="hidden"]');
    let value = input.getAttribute('value');
    console.log('value', value)
    if(value === 'stopped') {
        // indicate modulation is happening
        input.setAttribute('value', 'running');
        btn.innerText = 'Stop';
        running = true;
        modulateIt();
    } else {
        input.setAttribute('value', 'stopped');
        running = false;
        btn.innerText = 'Start';
        return;
    }
}

document.addEventListener("DOMContentLoaded", function(event) { 
    // modulateIt()
    let button = document.querySelector('.audio-btn');
    button.addEventListener('click', () => handleModulator(button))
});


