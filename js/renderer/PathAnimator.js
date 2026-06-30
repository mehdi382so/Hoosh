export default class PathAnimator {
    constructor(canvasMgr, graphRenderer) {
        this.cm = canvasMgr
        this.gr = graphRenderer
        this.timerId = null
        this.running = false
    }

    stop() {
        if (this.timerId) clearTimeout(this.timerId)

        this.timerId = null
        this.running = false
    }

    isRunning() { return this.running }

    animate(graph, positions, path, onComplete) {
        this.stop()
        this.running = true

        const edges = []
        for (let i = 0; i < path.length; i++) {
            edges.push({ from: path[i], to: path[(i + 1) % path.length] })
        }

        const visited = new Set()
        let step = 0
        const total = edges.length
        const statusEl = document.getElementById("animation-status")
        const ctx = this.cm.getCtx()
        const startNode = path[0]

        const drawStep = () => {
            if (step >= total) {
                if (statusEl) statusEl.textContent = "✅ Animation complete"
                this.running = false
                if (onComplete) onComplete()
                return
            }

            const { from, to } = edges[step]
            visited.add(from)
            visited.add(to)

            // Redraw base graph
            this.gr._drawBase(graph, startNode)

            // Draw all past + current edges
            for (let i = 0; i <= step; i++) {
                const e = edges[i]
                const a = positions[e.from]
                const b = positions[e.to]

                ctx.shadowColor = "rgba(0,230,118,0.5)"
                ctx.shadowBlur = 10
                ctx.strokeStyle = "#00e676"
                ctx.lineWidth = i === step ? 4 : 3
                ctx.beginPath()
                ctx.moveTo(a.x, a.y)
                ctx.lineTo(b.x, b.y)
                ctx.stroke()

                ctx.shadowBlur = 0
                ctx.strokeStyle = "#ffffff"
                ctx.lineWidth = 1
                ctx.beginPath()
                ctx.moveTo(a.x, a.y)
                ctx.lineTo(b.x, b.y)
                ctx.stroke()
            }

            // Highlight visited nodes
            this.gr._highlightPathNodes([...visited], startNode)

            if (statusEl) statusEl.textContent = `🔶 Step ${step + 1}/${total}: ${from} → ${to}`
            step++
            this.timerId = setTimeout(drawStep, 800)
        }

        drawStep()
    }

    drawCompleted(path, positions) {
        const ctx = this.cm.getCtx()
        for (let i = 0; i < path.length; i++) {
            const a = positions[path[i]]
            const b = positions[path[(i + 1) % path.length]]
            if (!a || !b) continue

            ctx.shadowColor = "rgba(0,230,118,0.5)"
            ctx.shadowBlur = 10
            ctx.strokeStyle = "#00e676"
            ctx.lineWidth = 3
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()

            ctx.shadowBlur = 0
            ctx.strokeStyle = "#ffffff"
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
        }
    }
}
