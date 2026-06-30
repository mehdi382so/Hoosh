import AppState         from "./state/AppState.js"
import DropdownManager  from "./ui/DropdownManager.js"
import PanelManager     from "./ui/PanelManager.js"
import ButtonManager    from "./ui/ButtonManager.js"
import CanvasManager    from "./renderer/CanvasManager.js"
import GraphRenderer    from "./renderer/GraphRenderer.js"
import PathAnimator     from "./renderer/PathAnimator.js"
import StepVisualizer   from "./ui/StepVisualizer.js"
import SolverService    from "./services/SolverService.js"
import InputParser      from "./parser/InputParser.js"
import Validator        from "./parser/Validator.js"
import GraphBuilder     from "./graph/GraphBuilder.js"

const state = new AppState()

const canvasMgr = new CanvasManager("tsp-canvas")
const graphRenderer = new GraphRenderer(canvasMgr)
const pathAnimator = new PathAnimator(canvasMgr, graphRenderer)
const panelMgr = new PanelManager()
const buttonMgr = new ButtonManager()
const dropdownMgr = new DropdownManager()

const stepVisualizer = new StepVisualizer(graphRenderer, panelMgr)

const cityInput = document.getElementById("city-input")
const loadBtn = document.getElementById("load-btn")
const startSelect = document.getElementById("start-select")
const algoSelect = document.getElementById("algo-select")
const runBtn = document.getElementById("run-btn")
const resetBtn = document.getElementById("reset-btn")
const placeholder = document.getElementById("placeholder")

dropdownMgr.populateAlgorithms(algoSelect)
buttonMgr.update({ runBtn, resetBtn, startSelect, state })

function loadMap() {
    
    // 1. Clear old error/info messages from UI
    // 2. Stop any running animation from previous run
    //    (must come first - prevents stale timers)
    // 3. Wipe previous graph, path, and result data
    panelMgr.hideAll()
    pathAnimator.stop()
    stepVisualizer.stop()
    stepVisualizer.reset()
    state.reset()

    try {
        const edges = InputParser.parse(cityInput.value)
        Validator.validate(edges)
        const graph = GraphBuilder.build(edges)

        state.setGraph(graph)
        const names = graph.getNodes().map(n => n.name)

        // To init Start Node Box
        dropdownMgr.populateNodes(startSelect, names)
        startSelect.value = names[0]
        startSelect.disabled = false

        state.setStartNode(names[0])

        placeholder.style.display = "none"
        const positions = graphRenderer.draw(graph, state.getStartNode())
        state.setPositions(positions)

        buttonMgr.update({ runBtn, resetBtn, startSelect, state })
        panelMgr.showInfo(`Map loaded: ${names.length} cities, ${graph.edgeCount()} connections`)
    } catch (e) {
        panelMgr.showError(e.message)
    }
}

loadBtn.addEventListener("click", loadMap)

// Ctrl + Enter to load map
cityInput.addEventListener("keydown", (e) => {
    console.log('Here');
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault()
        loadMap()
    }
})

startSelect.addEventListener("change", () => {
    state.setStartNode(startSelect.value)
    if (state.hasGraph() && !state.hasResult()) {
        graphRenderer.draw(state.getGraph(), state.getStartNode())
        state.setPositions(graphRenderer.getPositions())
    }
})

algoSelect.addEventListener("change", () => {
    state.setAlgorithm(algoSelect.value)
    buttonMgr.update({ runBtn, resetBtn, startSelect, state })
})

runBtn.addEventListener("click", () => {
    if (!buttonMgr.canRun(state)) return
    pathAnimator.stop()
    stepVisualizer.stop()
    stepVisualizer.reset()

    const result = SolverService.solve(
        state.getAlgorithm(),
        state.getGraph(),
        state.getStartNode()
    )

    state.setResult(result.path, result.cost, result.executionTime)
    state.setPositions(graphRenderer.getPositions())
    state.setAnimating(true)
    buttonMgr.update({ runBtn, resetBtn, startSelect,state })

    panelMgr.showResult(result)
    
    // Check if result has steps for step-by-step visualization
    if (result.steps && result.steps.length > 0) {
        // Load steps into visualizer (this will show the panel)
        stepVisualizer.loadSteps(result.steps, state.getStartNode())
        // Show first step
        stepVisualizer.nextStep()
        state.setAnimating(false)
        buttonMgr.update({ runBtn, resetBtn, startSelect, state })
    } else {
        // Fallback to regular animation
        pathAnimator.animate(state.getGraph(), state.getPositions(), result.path, () => {
            state.setAnimating(false)
            buttonMgr.update({ runBtn, resetBtn, startSelect, state })
        })
    }
})

resetBtn.addEventListener("click", () => {
    pathAnimator.stop()
    stepVisualizer.stop()
    stepVisualizer.reset()
    state.clearResult()
    panelMgr.clearResult()

    if (state.hasGraph()) {
        graphRenderer.draw(state.getGraph(), state.getStartNode())
        state.setPositions(graphRenderer.getPositions())
    }
    buttonMgr.update({ runBtn, resetBtn, startSelect, state })
    panelMgr.showInfo("Path cleared. You can run again.")
})

window.addEventListener("resize", () => {
    if (state.hasGraph()) {
        if (state.hasResult() && !state.isAnimating()) {
            graphRenderer.redrawWithPath(state.getGraph(), state.getStartNode(), state.getPath())
        } else {
            graphRenderer.draw(state.getGraph(), state.getStartNode())
        }
        state.setPositions(graphRenderer.getPositions())
    }
})
