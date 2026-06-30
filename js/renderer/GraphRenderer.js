export default class GraphRenderer {
    constructor(canvasMgr) {
        this.cm = canvasMgr
        this.positions = {}
        this.graph = null
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
        this.graph = graph
        this.positions = this.computePositions(graph)
        this._drawBase(graph, startNode)
        return this.positions
    }

    redrawWithPath(graph, startNode, path, isComplete = false) {
        this.graph = graph
        this.positions = this.computePositions(graph)
        this._drawBase(graph, startNode)
        if (path && path.length > 1) {
            // اگر تور کامل شده، از _drawFullTourEdges استفاده کن
            if (isComplete) {
                this._drawFullTourEdges(path)
            } else {
                this._drawStepEdges(path)
            }
            this._highlightPathNodes(path, startNode)
        }
        return this.positions
    }

    /**
     * رسم یال‌های مرحله‌ای (بدون بستن مسیر به اول)
     * فقط یال‌های بین گره‌های متوالی در مسیر رو رسم میکنه
     */
    _drawStepEdges(path) {
        const ctx = this.cm.getCtx()
        const pos = this.positions

        // فقط تا path.length - 1 برو (آخرین گره به اول وصل نشه)
        for (let i = 0; i < path.length - 1; i++) {
            const from = path[i]
            const to = path[i + 1]
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

    /**
     * رسم یال‌های کامل تور (برای نمایش نتیجه نهایی)
     * این متد برای زمانی که تور کامل شده استفاده میشه
     */
    _drawFullTourEdges(path) {
        const ctx = this.cm.getCtx()
        const pos = this.positions

        // حلقه کامل (آخرین به اول هم وصل میشه)
        for (let i = 0; i < path.length; i++) {
            const from = path[i]
            const to = path[(i + 1) % path.length]
            const a = pos[from]
            const b = pos[to]
            if (!a || !b) continue

            ctx.shadowColor = "rgba(0,230,118,0.5)"
            ctx.shadowBlur = 12
            ctx.strokeStyle = this.colors.edgeHighlight
            ctx.lineWidth = 3.5
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

    // متد قبلی _drawPathEdges رو برای سازگاری با کدهای قدیمی نگه میداریم
    _drawPathEdges(path) {
        // برای مرحله‌بندی از _drawStepEdges استفاده کن
        this._drawStepEdges(path)
    }

    _drawBase(graph, startNode) {
        const ctx = this.cm.getCtx()
        this.cm.clear()
        const pos = this.positions
        const nodes = graph.getNodes()
        const drawn = new Set()

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

                ctx.strokeStyle = this.colors.edgeDefault
                ctx.lineWidth = 2
                ctx.shadowBlur = 0
                ctx.beginPath()
                ctx.moveTo(a.x, a.y)
                ctx.lineTo(b.x, b.y)
                ctx.stroke()

                const mx = (a.x + b.x) / 2
                const my = (a.y + b.y) / 2
                const angle = Math.atan2(b.y - a.y, b.x - a.x)
                const ox = Math.sin(angle) * 20
                const oy = -Math.cos(angle) * 20

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

            ctx.beginPath()
            ctx.arc(p.x, p.y, this.nodeRadius + 4, 0, 2 * Math.PI)
            ctx.fillStyle = isStart ? "rgba(243,156,18,0.15)" : "rgba(233,69,96,0.1)"
            ctx.fill()

            ctx.beginPath()
            ctx.arc(p.x, p.y, this.nodeRadius, 0, 2 * Math.PI)
            ctx.fillStyle = this.colors.nodeFill
            ctx.fill()

            ctx.shadowBlur = 0
            ctx.strokeStyle = isStart ? this.colors.nodeStrokeStart : this.colors.nodeStrokeDefault
            ctx.lineWidth = isStart ? 4 : 3
            ctx.stroke()

            ctx.beginPath()
            ctx.arc(p.x, p.y, this.nodeRadius - 3, 0, 2 * Math.PI)
            ctx.strokeStyle = "rgba(255,255,255,0.05)"
            ctx.lineWidth = 1
            ctx.stroke()

            if (isStart) {
                const badgeY = p.y - this.nodeRadius - 16
                ctx.shadowBlur = 0
                ctx.fillStyle = this.colors.startBadge
                ctx.font = "bold 10px 'Segoe UI', sans-serif"
                ctx.textAlign = "center"
                ctx.textBaseline = "bottom"
                ctx.fillText("START", p.x, badgeY)

                ctx.beginPath()
                ctx.moveTo(p.x - 12, badgeY + 4)
                ctx.lineTo(p.x + 12, badgeY + 4)
                ctx.strokeStyle = this.colors.startBadge
                ctx.lineWidth = 1.5
                ctx.stroke()
            }

            ctx.shadowBlur = 0
            ctx.fillStyle = this.colors.textPrimary
            ctx.font = "bold 14px 'Segoe UI', sans-serif"
            ctx.textAlign = "center"
            ctx.textBaseline = "middle"
            ctx.fillText(node.name, p.x, p.y)
        }
    }

    _highlightPathNodes(path, startNode) {
        const ctx = this.cm.getCtx()
        const pos = this.positions

        for (const name of path) {
            const p = pos[name]
            if (!p) continue
            const isStart = name === startNode

            ctx.shadowColor = "rgba(0,230,118,0.4)"
            ctx.shadowBlur = 15
            ctx.beginPath()
            ctx.arc(p.x, p.y, this.nodeRadius + 4, 0, 2 * Math.PI)
            ctx.fillStyle = "rgba(0,230,118,0.1)"
            ctx.fill()

            ctx.shadowBlur = 8
            ctx.beginPath()
            ctx.arc(p.x, p.y, this.nodeRadius, 0, 2 * Math.PI)
            ctx.fillStyle = this.colors.nodeFillHighlight
            ctx.fill()

            ctx.shadowBlur = 0
            ctx.strokeStyle = isStart ? this.colors.nodeStrokeStart : this.colors.nodeStrokeHighlight
            ctx.lineWidth = isStart ? 4 : 3
            ctx.stroke()

            ctx.beginPath()
            ctx.arc(p.x, p.y, this.nodeRadius - 3, 0, 2 * Math.PI)
            ctx.strokeStyle = "rgba(255,255,255,0.05)"
            ctx.lineWidth = 1
            ctx.stroke()

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
                ctx.textBaseline = "bottom"
                ctx.fillText("START", p.x, badgeY)
            }
        }
    }

    highlightNodes(visitedNodes, startNode) {
        if (!this.graph) return;
        
        if (!visitedNodes || visitedNodes.length === 0) {
            this._drawBase(this.graph, startNode);
            return;
        }
        
        this._drawBase(this.graph, startNode);
        
        const ctx = this.cm.getCtx();
        const pos = this.positions;
        
        for (const name of visitedNodes) {
            const p = pos[name];
            if (!p) continue;
            
            const isStart = name === startNode;
            
            ctx.shadowColor = "rgba(0,230,118,0.3)";
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.arc(p.x, p.y, this.nodeRadius + 4, 0, 2 * Math.PI);
            ctx.fillStyle = "rgba(0,230,118,0.08)";
            ctx.fill();
            
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(p.x, p.y, this.nodeRadius, 0, 2 * Math.PI);
            ctx.fillStyle = isStart ? "#0f3460" : this.colors.nodeFillHighlight;
            ctx.fill();
            
            ctx.shadowBlur = 0;
            ctx.strokeStyle = isStart ? this.colors.nodeStrokeStart : this.colors.nodeStrokeHighlight;
            ctx.lineWidth = isStart ? 4 : 3;
            ctx.stroke();
            
            ctx.beginPath();
            ctx.arc(p.x, p.y, this.nodeRadius - 3, 0, 2 * Math.PI);
            ctx.strokeStyle = "rgba(255,255,255,0.05)";
            ctx.lineWidth = 1;
            ctx.stroke();
            
            if (isStart) {
                const badgeY = p.y - this.nodeRadius - 16;
                ctx.shadowBlur = 0;
                ctx.fillStyle = this.colors.startBadge;
                ctx.font = "bold 10px 'Segoe UI', sans-serif";
                ctx.textAlign = "center";
                ctx.textBaseline = "bottom";
                ctx.fillText("START", p.x, badgeY);
            }
            
            ctx.shadowBlur = 0;
            ctx.fillStyle = this.colors.textPrimary;
            ctx.font = "bold 14px 'Segoe UI', sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(name, p.x, p.y);
        }
    }
}