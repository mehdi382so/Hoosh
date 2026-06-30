import Distance from "../utils/Distance.js"
import StepRecorder from "../core/StepRecorder.js";

export default class BaseAlgorithm {
    constructor(graph) {
        if (!graph) throw new Error("Graph is required.")

        this.graph = graph
        this.name = "Base Algorithm"
        this.useStepRecording = false
        this.stepRecorder = null
    }

    getName() { return this.name }
    getGraph() { return this.graph }
    calculateCost(path) { return Distance.tourCost(this.graph, path) }
    isValid(path) { return Distance.isValidTour(this.graph, path) }
    solve() { throw new Error(`${this.getName()} must implement solve().`) }

    getNodeNames() {
        return this.graph
            .getNodes()
            .map(node => node.name)
    }

    enableStepRecording() {
        this.useStepRecording = true
        this.stepRecorder = new StepRecorder()
        return this.stepRecorder
    }

    _recordStep(action, data = {}) {
        if (this.useStepRecording && this.stepRecorder)
            this.stepRecorder.record(action, data)
    }

    solveWithSteps(startNode) {
        this.enableStepRecording()
        const result = this.solve(startNode)
        return {
            ...result,
            steps: this.stepRecorder.getAllSteps()
        }
    }
}
