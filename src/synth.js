// const _randomColorGen = require('./utils');
// combine start and init, 
    // first start, also inits
    // subsequent starts, do NOT init
class EuclideanSynthesizer {

    constructor() {
        this.bpm = 200;
        this.running = false;
        this.beats = 8;
        this.steps = 16;
        this.beatSelect;
        this.stepSelect;
        this.patternArr = [];
        this.isAudioContextInitialized = false;
        this.init();
    };

    init() {
        console.log('Euclidean Synthesizer initialized!');
    };

    // Returns a Promise that resolves after "ms"DW Milliseconds
    timer = ms => new Promise(res => setTimeout(res, ms))

    async highlightKey(n, isBeat) {
        const synth = document.querySelector('.synth');
        const key = synth.querySelector(`.square-${n}`);
        
        if (key) {
            key.style.filter = 'brightness(1.5)';
            if (isBeat) {
                this.singleBeep()
            }
            await this.timer(this.bpm)
            key.style.filter = 'none';
        }
    };

    changeColorOfKey(n) {
        const synth = document.querySelector('.synth');
        const key = synth.querySelector(`.square-${n}`);
        // const { r, g, b } = _randomColorGen();
        
        if (key) {
            key.style.backgroundColor = `green`;
        }
        return;
    };

    async modulateIt() {
        let timesRan = 0;

        while (this.running == true) { // sub with timesToRun if necessary
            for (let i = 0; i <= this.patternArr.length; i++) {
                if (this.running == false) {
                    return;
                }
                const isBeat = this.patternArr[i] === 1;
                await this.highlightKey(i, isBeat);
            }
            timesRan++;
        }
    };

    bresenhamEuclidean(onsets, totalPulses) {
        let previous = null;
        let pattern = [];
      
        for (let i = 0; i < totalPulses; i++) {
            let xVal = Math.floor((onsets  / totalPulses) * i);
            pattern.push(xVal === previous ? 0 : 1);
            previous = xVal;
        }
        return pattern;
    };

    initAudioContext() {
        // create web audio api context
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();    
        // create Oscillator node
        this.oscillator = this.audioCtx.createOscillator();

        this.oscillator.type = 'sawtooth';
        const pitch = 200;
        this.oscillator.frequency.setValueAtTime(pitch, this.audioCtx.currentTime); // value in hertz
        this.oscillator.connect(this.audioCtx.destination);
        this.isAudioContextInitialized = true;
    };

    async singleBeep() {
        this.playOscillator(this.audioCtx.currentTime, this.audioCtx.currentTime + 0.2);
    };

    testFunc(testButton) {
        console.log('RAN');
        this.singleBeep();
    };

    playOscillator(startTime, endTime) {
        this.oscillator = this.audioCtx.createOscillator();
        this.oscillator.connect(this.audioCtx.destination);
        this.oscillator.start(startTime);
        this.oscillator.stop(endTime);
    };

    startOscillator() {
        // this.oscillator.start();
        this.playOscillator(this.audioCtx.currentTime, this.audioCtx.currentTime + 0.2);
        // this.playOscillator(this.audioCtx.currentTime + 1, this.audioCtx.currentTime + 1.5);
    };

    stopOscillator() {
        this.oscillator.stop();
    };

    adjustFrequency() {

    };

    drawBeatPatternInUI() {
        // reset UI
        const synth = document.querySelector('.synth');
        Array.from(synth.querySelectorAll('.key')).map(synthKey => {
            synthKey.style.backgroundColor = 'midnightblue';
        });

        this.patternArr = this.bresenhamEuclidean(this.beats, this.steps);

        // draw beats and steps
        for (let i = 0; i <= this.patternArr.length; i++) {
            if (this.patternArr[i] === 1) {
                const key = synth.querySelector(`.square-${i}`);
                key.style.background = 'green';       
            }
        }
    }

    setBeats(setBeats) {
        this.beats = parseInt(setBeats);
    };

    setSteps(setSteps) {
        const steps = parseInt(setSteps);
        const beats = parseInt(this.beats);
        this.steps = steps;
        // Disable any beats higher than current steps
        let beatSelect = document.querySelector('.beats-select');
        let allBeatSelectOptions = Array.from(beatSelect.querySelectorAll('option'));

        if (steps < beats) {
            // change beats to equal steps
            // set this.beat to steps
            // disable beats greater than steps
            beatSelect.value = steps;
            this.beats = steps;
            allBeatSelectOptions.map(opt => {
                if (parseInt(opt.value) > steps) {
                    opt.setAttribute('disabled', true);
                }
            });
        } else if (steps == 16) {
            // enable all beats
            allBeatSelectOptions.map(opt => {
                opt.removeAttribute('disabled')
            });
        } else if (steps >= beats) {
            // enable all beats <= steps
            // disable all beats > steps
            allBeatSelectOptions.map(opt => {
                if (parseInt(opt.value) <= steps) {
                    opt.removeAttribute('disabled');
                } else {
                    opt.setAttribute('disabled', true);
                }
            });
        }
     
    };

    startSynth(startButton, stopButton) {
        startButton.setAttribute('disabled', true);
        startButton.classList.add('disabled');
        stopButton.removeAttribute('disabled');
        stopButton.classList.remove('disabled');

        // * Init * ( only on first start)
        if (this.isAudioContextInitialized == false) {
            this.initAudioContext();
        }

        // * Start *
        // Check for change in steps
        const keys = document.querySelectorAll('.key');
        if (keys.length != this.steps) {
            this.drawNewSynth();
        }
        this.drawBeatPatternInUI();

        // Disable some control panel options
        document.querySelector('.beats-select').setAttribute('disabled', true);
        document.querySelector('.steps-select').setAttribute('disabled', true);
        
        this.running = true;
        this.modulateIt();
    };


    stopSynth(startButton, stopButton) {
        startButton.removeAttribute('disabled');
        startButton.classList.remove('disabled');
        stopButton.setAttribute('disabled', true);
        stopButton.classList.add('disabled');

        this.running = false;
        document.querySelector('.beats-select').removeAttribute('disabled');
        document.querySelector('.steps-select').removeAttribute('disabled');
    };

    drawNewSynth() {
        const synth = document.querySelector('.synth-grid');
        synth.innerHTML = '';
        for (let i = 0; i < this.steps; i++) {
            const key = document.createElement('div');
            key.classList.add('key');
            key.classList.add(`square-${i}`);
            key.style.height = '110px';
            key.style.width = '110px';
            synth.append(key);
        }
    };

};


document.addEventListener("DOMContentLoaded", function(event) { 
    const mainSynth = new EuclideanSynthesizer();

    // let test = document.querySelector('.test-btn');
    // test.addEventListener('click', () => {
    //     mainSynth.testFunc(test);
    // });

    const startButton = document.querySelector('.start-audio-btn');
    const stopButton = document.querySelector('.stop-audio-btn');

    startButton.addEventListener('click', () => {
        mainSynth.startSynth(startButton, stopButton);
    });

    stopButton.addEventListener('click', () => {
        mainSynth.stopSynth(startButton, stopButton);
    });


    /* Control Panel */
    this.beatSelect = document.querySelector('.beats-select');
    this.stepSelect = document.querySelector('.steps-select');
    
    this.beatSelect.addEventListener('change', (event) => {
        mainSynth.setBeats(event.target.value);
    });
    this.stepSelect.addEventListener('change', (event) => {
        mainSynth.setSteps(event.target.value);
    });

});


