export default class CanvasManager {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId)
        this.ctx = this.canvas.getContext("2d")
        this.w = 0
        this.h = 0
    }

    resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect()
        const dpr  = window.devicePixelRatio || 1

        this.canvas.width  = rect.width * dpr
        this.canvas.height = rect.height * dpr
        this.canvas.style.width  = rect.width + "px"
        this.canvas.style.height = rect.height + "px"
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        this.w = rect.width
        this.h = rect.height
    }

    clear() {
        this.ctx.clearRect(0, 0, this.w, this.h)
    }

    getCtx() { return this.ctx }
    getWidth() { return this.w }
    getHeight() { return this.h }
}