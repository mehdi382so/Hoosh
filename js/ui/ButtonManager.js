export default class ButtonManager {
    canRun(state) {
        return state.hasGraph() &&
               state.getStartNode() &&
               state.getAlgorithm() &&
               !state.isAnimating() &&
               !state.hasResult()
    }

    canReset(state) {
        return state.hasResult() && !state.isAnimating()
    }

    update({ runBtn, resetBtn, startSelect, state }) {
        runBtn.disabled = !this.canRun(state)
        resetBtn.disabled = !this.canReset(state)
        if (startSelect)
            startSelect.disabled = !state.hasGraph() || state.hasResult() || state.isAnimating()
    }
}
