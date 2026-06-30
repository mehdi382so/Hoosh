import Algorithms from "../constants/Algorithms.js"
import Greedy from "../algorithms/Greedy.js"
import Timer from "../utils/Timer.js"

const registry = { [Algorithms.GREEDY.id]: Greedy }

export default class SolverService {
    static solve(algorithmId, graph, startNode) {
        const AlgoClass = registry[algorithmId]
        if (!AlgoClass) throw new Error(`Unknown algorithm: ${algorithmId}`)

        const solver = new AlgoClass(graph)
        const timer  = new Timer()
        timer.start()
        
        // Use solveWithSteps to get steps
        const result = solver.solveWithSteps(startNode)
        
        result.executionTime = timer.stop()
        return result
    }

    static register(id, algoClass) { registry[id] = algoClass }
}
