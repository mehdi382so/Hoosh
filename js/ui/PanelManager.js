export default class PanelManager {
    constructor() {
        this.errorEl  = document.getElementById("error-msg")
        this.infoEl   = document.getElementById("info-msg")
        this.pathEl   = document.getElementById("res-path")
        this.costEl   = document.getElementById("res-cost")
        this.timeEl   = document.getElementById("res-time")
        this.statusEl = document.getElementById("animation-status")
    }

    showError(msg) {
        this.errorEl.textContent = "❌ " + msg
        this.errorEl.style.display = "block"
        if (this.infoEl) this.infoEl.style.display = "none"
    }

    showInfo(msg) {
        this.infoEl.textContent = "✅ " + msg
        this.infoEl.style.display = "block"
        this.errorEl.style.display = "none"
    }

    hideAll() {
        this.errorEl.style.display = "none"
        this.infoEl.style.display = "none"
    }

    showResult(result) {
        this.pathEl.textContent = result.path.join(" → ") + " → " + result.path[0]
        this.costEl.textContent = result.cost
        this.timeEl.textContent = result.executionTime + " ms"
    }

    clearResult() {
        this.pathEl.textContent = "-"
        this.costEl.textContent = "-"
        this.timeEl.textContent = "-"
        if (this.statusEl) this.statusEl.textContent = ""
    }
}