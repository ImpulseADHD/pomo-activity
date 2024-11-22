// client/src/Timer.jsx

class Timer {
    constructor(displayElement, onComplete) {
      this.displayElement = displayElement;
      this.onComplete = onComplete;
      this.remainingTime = 0;
      this.totalTime = 0;
      this.interval = null;
      this.paused = true;
    }
  
    start(duration) {
      this.totalTime = duration;
      this.remainingTime = duration;
      this.paused = false;
      this.updateDisplay();
      this.interval = setInterval(() => this.tick(), 1000);
    }
  
    pause() {
      this.paused = true;
      clearInterval(this.interval);
    }
  
    resume() {
      this.paused = false;
      this.interval = setInterval(() => this.tick(), 1000);
    }
  
    reset() {
      clearInterval(this.interval);
      this.remainingTime = this.totalTime;
      this.updateDisplay();
      this.paused = true;
    }
  
    tick() {
      if (this.remainingTime > 0) {
        this.remainingTime--;
        this.updateDisplay();
        if (this.onTick) this.onTick(this.remainingTime, this.totalTime); // Optional onTick callback
      } else {
        this.complete();
      }
    }
  
    complete() {
      clearInterval(this.interval);
      if (this.onComplete) this.onComplete();
    }
  
    updateDisplay() {
      const minutes = Math.floor(this.remainingTime / 60);
      const seconds = this.remainingTime % 60;
      this.displayElement.innerText = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
  
    onTick(callback) {
      this.onTick = callback;
    }
  }
  
  export default Timer;
  