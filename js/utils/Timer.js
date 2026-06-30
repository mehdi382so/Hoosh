/**
 * High Resolution Timer
 *
 * Used to measure algorithm execution time.
 */
export default class Timer {
    constructor() {
        /**
         * Start timestamp.
         * @type {number}
         */
        this.startTime = 0

        /**
         * End timestamp.
         * @type {number}
         */
        this.endTime = 0

        /**
         * Is timer running?
         * @type {boolean}
         */
        this.running = false
    }

    /**
     * Start timer.
     */
    start() {
        this.startTime = performance.now()
        this.running = true
    }

    /**
     * Stop timer.
     *
     * @returns {number}
     */
    stop() {
        if (!this.running)
            throw new Error("Timer is not running.")

        this.endTime = performance.now()
        this.running = false

        return this.elapsed()
    }

    /**
     * Reset timer.
     */
    reset() {
        this.startTime = 0
        this.endTime = 0
        this.running = false
    }

    /**
     * Get elapsed milliseconds.
     *
     * @returns {number}
     */
    elapsed() {
        if (this.running)
            return performance.now() - this.startTime

        return this.endTime - this.startTime
    }

    /**
     * Get formatted elapsed time.
     *
     * Example:
     * 2.345 ms
     *
     * @returns {string}
     */
    formatted() {
        return `${this.elapsed()} ms`
    }
}
