// js/core/StepRecorder.js

export default class StepRecorder {
    constructor() {
        this.steps = [];
        this.currentStep = -1;
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
        });
    }

    /**
     * Get all recorded steps
     */
    getAllSteps() {
        return this.steps;
    }

    /**
     * Get step by index
     */
    getStep(index) {
        return this.steps[index] || null;
    }

    /**
     * Clear all steps
     */
    clear() {
        this.steps = [];
        this.currentStep = -1;
    }

    /**
     * Get number of steps
     */
    count() {
        return this.steps.length;
    }

    /**
     * Check if has next step
     */
    hasNext() {
        return this.currentStep < this.steps.length - 1;
    }

    /**
     * Check if has previous step
     */
    hasPrev() {
        return this.currentStep > 0;
    }

    /**
     * Move to next step
     */
    next() {
        if (this.hasNext()) {
            this.currentStep++;
            return this.steps[this.currentStep];
        }
        return null;
    }

    /**
     * Move to previous step
     */
    prev() {
        if (this.hasPrev()) {
            this.currentStep--;
            return this.steps[this.currentStep];
        }
        return null;
    }

    /**
     * Get current step
     */
    getCurrentStep() {
        return this.steps[this.currentStep] || null;
    }

    /**
     * Reset to beginning
     */
    reset() {
        this.currentStep = -1;
    }
}