export default class AppState {
    constructor() {
        this.graph = null
        this.positions = null
        this.algorithm = null
        this.startNode = null
        this.path = []
        this.cost = 0
        this.execTime = 0
        this._hasResult = false
        this._animating = false
    }

    setGraph(g) 
        { this.graph = g }
    getGraph() 
        { return this.graph }
    hasGraph() 
        { return !!this.graph }

    setPositions(p) 
        { this.positions = p }
    getPositions() 
        { return this.positions }

    setAlgorithm(a) 
        { this.algorithm = a }
    getAlgorithm() 
        { return this.algorithm }

    setStartNode(n) 
        { this.startNode = n }
    getStartNode() 
        { return this.startNode }

    setResult(path, cost, t) {
        this.path = [...path]
        this.cost = cost
        this.execTime = t
        this._hasResult = true
    }
    getPath() 
        { return [...this.path] }
    getCost()
        { return this.cost }
    getExecTime()
        { return this.execTime }
    hasResult()
        { return this._hasResult }

    clearResult() {
        this.path = []
        this.cost = 0
        this.execTime = 0
        this._hasResult = false
    }
    setAnimating(v)
        { this._animating = v }
    isAnimating()
        { return this._animating }

    reset() {
        this.graph = null
        this.positions = null
        this.clearResult()
        this._animating = false
    }
}