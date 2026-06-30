/**
 * High Resolution Timer
 * Used to measure algorithm execution time.
 */
export default class Timer {
    constructor() {
        this.startTime = 0
        this.endTime = 0
        this.running = false
    }

    start() {
        this.startTime = performance.now()
        this.running = true
    }

    stop() {
        if (!this.running) throw new Error("Timer is not running.")

        this.endTime = performance.now()
        this.running = false

        return this.elapsed()
    }

    reset() {
        this.startTime = 0
        this.endTime = 0
        this.running = false
    }

    elapsed() {
        if (this.running)
            return performance.now() - this.startTime
        return this.endTime - this.startTime
    }

    formatted() { return `${this.elapsed()} ms` }
}
