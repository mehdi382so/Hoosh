export default class GraphRenderer {
    constructor(canvasMgr) {
        this.cm = canvasMgr
        this.positions = {}
        this.nodeRadius = 26
        this.colors = {
            bg: "#16213e",
            edgeDefault: "#2a2a4a",
            edgeHighlight: "#00e676",
            nodeFill: "#0f3460",
            nodeFillHighlight: "#0a3d2e",
            nodeStrokeDefault: "#e94560",
            nodeStrokeStart: "#f39c12",
            nodeStrokeHighlight: "#00e676",
            textPrimary: "#ffffff",
            textSecondary: "#aaaaaa",
            textCost: "#7f8c8d",
            textCostHighlight: "#00e676",
            startBadge: "#f39c12",
        }
    }

    getPositions() { return { ...this.positions } }

    computePositions(graph) {
        this.cm.resize()
        const nodes = graph.getNodes()
        const w = this.cm.getWidth()
        const h = this.cm.getHeight()
        const cx = w / 2
        const cy = h / 2
        const r = Math.min(w, h) * 0.35

        const pos = {}
        nodes.forEach((node, i) => {
            const angle = (2 * Math.PI * i) / nodes.length - Math.PI / 2
            pos[node.name] = {
                x: cx + r * Math.cos(angle),
                y: cy + r * Math.sin(angle)
            }
        })
        return pos
    }

    draw(graph, startNode) {
        this.positions = this.computePositions(graph)
        this._drawBase(graph, startNode)
        return this.positions
    }

    redrawWithPath(graph, startNode, path) {
        this.positions = this.computePositions(graph)
        this._drawBase(graph, startNode)
        if (path && path.length > 1) {
            this._drawPathEdges(path)
            this._highlightPathNodes(path, startNode)
        }
    }

    _drawBase(graph, startNode) {
        const ctx = this.cm.getCtx()
        this.cm.clear()
        const pos = this.positions
        const nodes = graph.getNodes()
        const drawn = new Set()

        // ── Shadows ──────────────────────────
        ctx.shadowColor = "rgba(0,0,0,0.4)"
        ctx.shadowBlur = 15

        // ── Edges ────────────────────────────
        for (const node of nodes) {
            for (const edge of graph.getNeighbors(node.name)) {
                const key = [edge.from, edge.to].sort().join("|")
                if (drawn.has(key)) continue
                drawn.add(key)

                const a = pos[edge.from]
                const b = pos[edge.to]

                // خط اصلی
                ctx.strokeStyle = this.colors.edgeDefault
                ctx.lineWidth = 2
                ctx.shadowBlur = 0
                ctx.beginPath()
                ctx.moveTo(a.x, a.y)
                ctx.lineTo(b.x, b.y)
                ctx.stroke()

                // برچسب هزینه
                const mx = (a.x + b.x) / 2
                const my = (a.y + b.y) / 2
                const angle = Math.atan2(b.y - a.y, b.x - a.x)
                const ox = Math.sin(angle) * 20
                const oy = -Math.cos(angle) * 20

                // پس‌زمینه برچسب
                ctx.fillStyle = this.colors.bg
                ctx.fillRect(mx + ox - 16, my + oy - 9, 32, 18)

                ctx.fillStyle = this.colors.textCost
                ctx.font = "bold 12px 'Segoe UI', sans-serif"
                ctx.textAlign = "center"
                ctx.textBaseline = "middle"
                ctx.fillText(edge.cost, mx + ox, my + oy)
            }
        }

        // ── Nodes ────────────────────────────
        for (const node of nodes) {
            const p = pos[node.name]
            const isStart = node.name === startNode

            ctx.shadowBlur = 15

            // دایره بیرونی (glow)
            ctx.beginPath()
            ctx.arc(p.x, p.y, this.nodeRadius + 4, 0, 2 * Math.PI)
            ctx.fillStyle = isStart ? "rgba(243,156,18,0.15)" : "rgba(233,69,96,0.1)"
            ctx.fill()

            // دایره اصلی
            ctx.beginPath()
            ctx.arc(p.x, p.y, this.nodeRadius, 0, 2 * Math.PI)
            ctx.fillStyle = this.colors.nodeFill
            ctx.fill()

            // حاشیه
            ctx.shadowBlur = 0
            ctx.strokeStyle = isStart ? this.colors.nodeStrokeStart : this.colors.nodeStrokeDefault
            ctx.lineWidth = isStart ? 4 : 3
            ctx.stroke()

            // حاشیه داخلی
            ctx.beginPath()
            ctx.arc(p.x, p.y, this.nodeRadius - 3, 0, 2 * Math.PI)
            ctx.strokeStyle = "rgba(255,255,255,0.05)"
            ctx.lineWidth = 1
            ctx.stroke()

            // برچسب START
            if (isStart) {
                const badgeY = p.y - this.nodeRadius - 16
                ctx.fillStyle = this.colors.startBadge
                ctx.font = "bold 10px 'Segoe UI', sans-serif"
                ctx.textAlign = "center"
                ctx.fillText("START", p.x, badgeY)

                // خط ریز زیر START
                ctx.beginPath()
                ctx.moveTo(p.x - 12, badgeY + 4)
                ctx.lineTo(p.x + 12, badgeY + 4)
                ctx.strokeStyle = this.colors.startBadge
                ctx.lineWidth = 1.5
                ctx.stroke()
            }

            // نام گره
            ctx.fillStyle = this.colors.textPrimary
            ctx.font = "bold 14px 'Segoe UI', sans-serif"
            ctx.textAlign = "center"
            ctx.textBaseline = "middle"
            ctx.fillText(node.name, p.x, p.y)
        }
    }

    _drawPathEdges(path) {
        const ctx = this.cm.getCtx()
        const pos = this.positions

        for (let i = 0; i < path.length; i++) {
            const from = path[i]
            const to = path[(i + 1) % path.length]
            const a = pos[from]
            const b = pos[to]
            if (!a || !b) continue

            // Glow
            ctx.shadowColor = "rgba(0,230,118,0.5)"
            ctx.shadowBlur = 12
            ctx.strokeStyle = this.colors.edgeHighlight
            ctx.lineWidth = 3.5
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()

            // Inner line
            ctx.shadowBlur = 0
            ctx.strokeStyle = "#ffffff"
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
        }
    }

    _highlightPathNodes(path, startNode) {
        const ctx = this.cm.getCtx()
        const pos = this.positions

        for (const name of path) {
            const p = pos[name]
            if (!p) continue
            const isStart = name === startNode

            // Glow
            ctx.shadowColor = "rgba(0,230,118,0.4)"
            ctx.shadowBlur = 15
            ctx.beginPath()
            ctx.arc(p.x, p.y, this.nodeRadius + 4, 0, 2 * Math.PI)
            ctx.fillStyle = "rgba(0,230,118,0.1)"
            ctx.fill()

            // دایره اصلی
            ctx.beginPath()
            ctx.arc(p.x, p.y, this.nodeRadius, 0, 2 * Math.PI)
            ctx.fillStyle = this.colors.nodeFillHighlight
            ctx.fill()

            // حاشیه
            ctx.shadowBlur = 8
            ctx.strokeStyle = isStart ? this.colors.nodeStrokeStart : this.colors.nodeStrokeHighlight
            ctx.lineWidth = isStart ? 4 : 3
            ctx.stroke()

            // نام
            ctx.shadowBlur = 0
            ctx.fillStyle = this.colors.textPrimary
            ctx.font = "bold 14px 'Segoe UI', sans-serif"
            ctx.textAlign = "center"
            ctx.textBaseline = "middle"
            ctx.fillText(name, p.x, p.y)

            if (isStart) {
                const badgeY = p.y - this.nodeRadius - 16
                ctx.fillStyle = this.colors.startBadge
                ctx.font = "bold 10px 'Segoe UI', sans-serif"
                ctx.textAlign = "center"
                ctx.fillText("START", p.x, badgeY)
            }
        }
    }

    highlightNodes(visitedNodes, startNode) {
        this._highlightPathNodes(visitedNodes, startNode)
    }
}