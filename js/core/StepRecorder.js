export default class StepRecorder {
    constructor() {
        this.steps = []
        this.currentStep = -1
    }

    /**
     * Record a step in the algorithm
     * @param {string} action - Description of action
     * @param {Object} data - Additional data (current node, visited, path, etc.)
     */
    record(action, data = {}) {
        this.steps.push({
            action,
            timestamp: Date.now(),
            ...data
        })
    }

    getAllSteps() { return this.steps }
    getStep(index) { return this.steps[index] || null }
    count() { return this.steps.length }
    hasNext() { return this.currentStep < this.steps.length - 1 }
    hasPrev() { return this.currentStep > 0 }
    reset() { this.currentStep = -1 }

    clear() {
        this.steps = []
        this.currentStep = -1
    }

    next() {
        if (this.hasNext()) {
            this.currentStep++
            return this.steps[this.currentStep]
        }
        return null
    }

    prev() {
        if (this.hasPrev()) {
            this.currentStep--
            return this.steps[this.currentStep]
        }
        return null
    }

    getCurrentStep() { return this.steps[this.currentStep] || null }
}
