export default class StepVisualizer {
    constructor(graphRenderer, panelManager) {
        this.gr = graphRenderer
        this.panel = panelManager
        this.currentStep = -1
        this.steps = []
        this.isPlaying = false
        this.animationTimer = null
        this.speed = 1000
        this.callbacks = []
        this.startNode = null
        this.graph = null
        this.visitedNodes = new Set()
        
        this.stepListEl = document.getElementById('step-list')
        this.statusEl = document.getElementById('step-status')
        this.panelEl = document.getElementById('steps-panel')
        this.prevBtn = document.getElementById('step-prev')
        this.nextBtn = document.getElementById('step-next')
        this.playBtn = document.getElementById('step-play')
        this.resetBtn = document.getElementById('step-reset')
        this.speedInput = document.getElementById('step-speed')
        
        this._setupEventListeners()
    }

    _setupEventListeners() {
        if(this.prevBtn) this.prevBtn.addEventListener('click', () => this.prevStep())
        if (this.nextBtn) this.nextBtn.addEventListener('click', () => this.nextStep())
        if (this.playBtn) this.playBtn.addEventListener('click', () => this.togglePlay())
        if (this.resetBtn) this.resetBtn.addEventListener('click', () => this.reset())
        if (this.speedInput)
            this.speedInput.addEventListener('input', (e) => {
                this.setSpeed(parseInt(e.target.value))
            })
    }

    _formatStepMessage(step) {
        const { message, stepNumber } = step

        const num = stepNumber || this.currentStep + 1
        const prefix = `${num}.`
        
        return `${prefix} ${message}`
    }

    _formatStepDetail(step) {
        const { path, selectedNode, selectedCost } = step
        
        if (!path || path.length === 0) return ''
        
        // Make route display by →
        let detail = '→ ' + path.join(' → ')
        
        if (selectedNode && selectedCost) detail += ` → ${selectedNode} (${selectedCost})`
        
        // Show cost if completed
        if (step.action === 'complete' && step.cost !== undefined) detail += ` 💰 ${step.cost}`
        
        return detail;
    }

    _renderStepList() {
        if (!this.stepListEl) return        
        this.stepListEl.innerHTML = ''
        
        this.steps.forEach((step, index) => {
            const div = document.createElement('div')
            div.className = `step-item${index === this.currentStep ? ' active' : ''}${index < this.currentStep ? ' done' : ''}`
            div.dataset.index = index
            
            // Step content (with unique numbers)
            const contentSpan = document.createElement('span')
            contentSpan.className = 'step-content'
            contentSpan.textContent = this._formatStepMessage(step)
            
            // Step details (path so far)
            const detailSpan = document.createElement('span')
            detailSpan.className = 'step-detail'
            detailSpan.textContent = this._formatStepDetail(step)
            
            div.appendChild(contentSpan)
            div.appendChild(detailSpan)
            
            // Click to jump to step
            div.addEventListener('click', () => {
                this._jumpToStep(index)
            })
            
            this.stepListEl.appendChild(div)
        })
        
        // Auto-scroll to active step
        this._scrollToActive()
    }

    /**
     * Load steps for visualization
     */
    loadSteps(steps, startNode) {
        this.steps = steps
        this.currentStep = -1
        this.startNode = startNode
        this.graph = this.gr.graph
        this.visitedNodes = new Set()
        
        // Show panel
        if (this.panelEl) this.panelEl.style.display = 'block'
        
        this._renderStepList()
        
        // Update status
        if (this.statusEl) this.statusEl.textContent = `Step 0/${steps.length}`
        
        // Enable/disable buttons
        this._updateButtons()
    
        this.panel.showInfo(`Loaded ${steps.length} steps for visualization`)
    }

    _jumpToStep(index) {
        if (index < 0 || index >= this.steps.length) return
        
        this.currentStep = index
        this._applyStep(this.steps[index])
        this._updateUI()
        this._scrollToActive()
    }

    nextStep() {
        if (this.currentStep < this.steps.length - 1) {
            this.currentStep++
            this._applyStep(this.steps[this.currentStep])
            this._updateUI()
            this._scrollToActive()
            return true
        }
        return false
    }

    prevStep() {
        if (this.currentStep > 0) {
            this.currentStep--
            this._applyStep(this.steps[this.currentStep])
            this._updateUI()
            this._scrollToActive()
            return true
        }
        return false
    }

    _applyStep(step) {
        const { path, visitedNodes, message, action } = step
        
        if (!this.graph) {
            console.warn('No graph available for step visualization')
            return
        }
        
        if (visitedNodes && visitedNodes.length > 0) this.visitedNodes = new Set(visitedNodes)
        const isComplete = action === 'complete' || (path && path.length === this.graph.nodeCount())
        
        if (action === 'start' || !path || path.length <= 1) {
            this.gr.draw(this.graph, this.startNode)
            
            // Highlight if there is visitedNodes
            if (visitedNodes && visitedNodes.length > 0) this.gr.highlightNodes(visitedNodes, this.startNode)
        } 
        
        else if (path && path.length > 1) {
            // Draw graph with path - pass the parameter isComplete
            this.gr.redrawWithPath(
                this.graph,
                this.startNode || path[0],
                path,
                isComplete
            )
            
            // Highlight visited nodes
            if (visitedNodes && visitedNodes.length > path.length)
                this.gr.highlightNodes(visitedNodes, this.startNode || path[0]);
        }
        
        // Show step info in panel
        const stepNum = this.currentStep + 1
        const total = this.steps.length
        this.panel.showInfo(`Step ${stepNum}/${total}: ${message}`)
    }

    _updateUI() {
        const total = this.steps.length
        const current = this.currentStep + 1
        if (this.statusEl) this.statusEl.textContent = `Step ${current}/${total}`
        
        // Update step list items
        if (this.stepListEl) {
            const items = this.stepListEl.querySelectorAll('.step-item')
            items.forEach((item, index) => {
                item.className = 'step-item'
                if (index === this.currentStep) item.classList.add('active')
                if (index < this.currentStep) item.classList.add('done')
            })
        }
        
        this._updateButtons()
        this.callbacks.forEach(cb => cb(this.steps[this.currentStep], this.currentStep))
    }

    _updateButtons() {
        if (this.prevBtn) this.prevBtn.disabled = this.currentStep <= 0
        if (this.nextBtn) this.nextBtn.disabled = this.currentStep >= this.steps.length - 1
    }

    _scrollToActive() {
        if (!this.stepListEl) return
        const active = this.stepListEl.querySelector('.step-item.active')
        if (active) active.scrollIntoView({ block: 'center', behavior: 'smooth' })
    }

    play() {
        if (this.isPlaying) return
        if (this.steps.length === 0) return
        
        this.isPlaying = true
        if (this.playBtn) {
            this.playBtn.textContent = '⏸️ Pause'
            this.playBtn.classList.add('playing')
        }
        
        // start again if in the end
        if (this.currentStep >= this.steps.length - 1) {
            this.currentStep = -1

            if (this.steps.length > 0) {
                this._applyStep(this.steps[0])
                this._updateUI()
            }
        }
        
        this.animationTimer = setInterval(() => {
            const hasNext = this.nextStep()
            if (!hasNext) {
                this.stop()
                this.panel.showInfo('Animation complete!')
            }
        }, this.speed)
    }

    stop() {
        this.isPlaying = false
        if (this.animationTimer) {
            clearInterval(this.animationTimer)
            this.animationTimer = null
        }
        if (this.playBtn) {
            this.playBtn.textContent = '▶️ Play'
            this.playBtn.classList.remove('playing')
        }
    }

    togglePlay() {
        if (this.isPlaying) this.stop() 
        else this.play()
    }

    setSpeed(speed) {
        this.speed = speed
        if (this.isPlaying) {
            this.stop()
            this.play()
        }
    }

    onStepChange(callback) { this.callbacks.push(callback) }

    reset() {
        this.stop()
        this.currentStep = -1
        this.steps = []
        this.graph = null
        this.visitedNodes = new Set()
        
        if (this.stepListEl) this.stepListEl.innerHTML = ''
        if (this.statusEl) this.statusEl.textContent = 'Step 0/0'
        if (this.panelEl) this.panelEl.style.display = 'none'
        
        this._updateButtons()
    }

    hasSteps() { return this.steps.length > 0 }

    getCurrentStep() { return this.steps[this.currentStep] || null }

    getSteps() { return [...this.steps] }
}
