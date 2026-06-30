// js/ui/StepVisualizer.js

export default class StepVisualizer {
    constructor(graphRenderer, panelManager) {
        this.gr = graphRenderer;
        this.panel = panelManager;
        this.currentStep = -1;
        this.steps = [];
        this.isPlaying = false;
        this.animationTimer = null;
        this.speed = 1000;
        this.callbacks = [];
        this.startNode = null;
        this.graph = null;
        this.visitedNodes = new Set(); // ذخیره گره‌های بازدید شده
        
        // DOM refs
        this.stepListEl = document.getElementById('step-list');
        this.statusEl = document.getElementById('step-status');
        this.panelEl = document.getElementById('steps-panel');
        this.prevBtn = document.getElementById('step-prev');
        this.nextBtn = document.getElementById('step-next');
        this.playBtn = document.getElementById('step-play');
        this.resetBtn = document.getElementById('step-reset');
        this.speedInput = document.getElementById('step-speed');
        
        // Setup event listeners
        this._setupEventListeners();
    }

    _setupEventListeners() {
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.prevStep());
        }
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.nextStep());
        }
        if (this.playBtn) {
            this.playBtn.addEventListener('click', () => this.togglePlay());
        }
        if (this.resetBtn) {
            this.resetBtn.addEventListener('click', () => this.reset());
        }
        if (this.speedInput) {
            this.speedInput.addEventListener('input', (e) => {
                this.setSpeed(parseInt(e.target.value));
            });
        }
    }

    // js/ui/StepVisualizer.js - فقط قسمت‌های اصلاح شده

    /**
     * Format step message
     */
    _formatStepMessage(step) {
        const { action, message, stepNumber } = step;
        
        // فرمت شماره مرحله
        const num = stepNumber || this.currentStep + 1;
        const prefix = `${num}.`;
        
        if (action === 'start') return `${prefix} ${message}`;
        if (action === 'considering') return `${prefix} ${message}`;
        if (action === 'choose') return `${prefix} ${message}`;
        if (action === 'move') return `${prefix} ${message}`;
        if (action === 'complete') return `${prefix} ${message}`;
        if (action === 'error') return `${prefix} ❌ ${message}`;
        
        return `${prefix} ${message || action}`;
    }

    /**
     * Format step detail (path so far with costs)
     */
    _formatStepDetail(step) {
        const { path, selectedNode, selectedCost } = step;
        
        if (!path || path.length === 0) return '';
        
        // ساخت نمایش مسیر با فلش
        let detail = '→ ' + path.join(' → ');
        
        // اگر مرحله انتخاب هست، فلش و گره انتخاب شده رو نشون بده
        if (selectedNode && selectedCost) {
            detail += ` → ${selectedNode} (${selectedCost})`;
        }
        
        // اگر مرحله کامل هست، هزینه رو نشون بده
        if (step.action === 'complete' && step.cost !== undefined) {
            detail += `  💰 ${step.cost}`;
        }
        
        return detail;
    }

    /**
     * Render all steps in the list
     */
    _renderStepList() {
        if (!this.stepListEl) return;
        
        this.stepListEl.innerHTML = '';
        
        this.steps.forEach((step, index) => {
            const div = document.createElement('div');
            div.className = `step-item${index === this.currentStep ? ' active' : ''}${index < this.currentStep ? ' done' : ''}`;
            div.dataset.index = index;
            
            // Step content (بدون شماره تکراری)
            const contentSpan = document.createElement('span');
            contentSpan.className = 'step-content';
            contentSpan.textContent = this._formatStepMessage(step);
            
            // Step details (path so far)
            const detailSpan = document.createElement('span');
            detailSpan.className = 'step-detail';
            detailSpan.textContent = this._formatStepDetail(step);
            
            div.appendChild(contentSpan);
            div.appendChild(detailSpan);
            
            // Click to jump to step
            div.addEventListener('click', () => {
                this._jumpToStep(index);
            });
            
            this.stepListEl.appendChild(div);
        });
        
        // Auto-scroll to active step
        this._scrollToActive();
    }

    /**
     * Load steps for visualization
     */
    loadSteps(steps, startNode) {
        this.steps = steps;
        this.currentStep = -1;
        this.startNode = startNode;
        this.graph = this.gr.graph;
        this.visitedNodes = new Set();
        
        // Show panel
        if (this.panelEl) this.panelEl.style.display = 'block';
        
        // Render all steps in the list
        this._renderStepList();
        
        // Update status
        if (this.statusEl) {
            this.statusEl.textContent = `Step 0/${steps.length}`;
        }
        
        // Enable/disable buttons
        this._updateButtons();
        
        this.panel.showInfo(`Loaded ${steps.length} steps for visualization`);
    }

    /**
     * Jump to a specific step
     */
    _jumpToStep(index) {
        if (index < 0 || index >= this.steps.length) return;
        
        this.currentStep = index;
        this._applyStep(this.steps[index]);
        this._updateUI();
        this._scrollToActive();
    }

    /**
     * Go to next step
     */
    nextStep() {
        if (this.currentStep < this.steps.length - 1) {
            this.currentStep++;
            this._applyStep(this.steps[this.currentStep]);
            this._updateUI();
            this._scrollToActive();
            return true;
        }
        return false;
    }

    /**
     * Go to previous step
     */
    prevStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this._applyStep(this.steps[this.currentStep]);
            this._updateUI();
            this._scrollToActive();
            return true;
        }
        return false;
    }

    // js/ui/StepVisualizer.js - فقط قسمت _applyStep اصلاح شده

    _applyStep(step) {
        const { path, visitedNodes, message, action } = step;
        
        // اگر گراف وجود نداره، هیچ کاری نکن
        if (!this.graph) {
            console.warn('No graph available for step visualization');
            return;
        }
        
        // ذخیره گره‌های بازدید شده
        if (visitedNodes && visitedNodes.length > 0) {
            this.visitedNodes = new Set(visitedNodes);
        }
        
        // تشخیص اینکه آیا تور کامل شده یا نه
        const isComplete = action === 'complete' || 
                          (path && path.length === this.graph.nodeCount());
        
        // اگر action == 'start' یا path خالی یا فقط یک گره داره
        if (action === 'start' || !path || path.length <= 1) {
            // فقط گراف پایه رو رسم کن با startNode
            this.gr.draw(this.graph, this.startNode);
            
            // اگر visitedNodes وجود داره، هایلایت کن
            if (visitedNodes && visitedNodes.length > 0) {
                this.gr.highlightNodes(visitedNodes, this.startNode);
            }
        } else if (path && path.length > 1) {
            // رسم گراف با مسیر - پارامتر isComplete رو پاس بده
            this.gr.redrawWithPath(
                this.graph,
                this.startNode || path[0],
                path,
                isComplete  // <-- این پارامتر جدید
            );
            
            // هایلایت گره‌های بازدید شده (اگر بیشتر از گره‌های مسیر هستن)
            if (visitedNodes && visitedNodes.length > path.length) {
                this.gr.highlightNodes(visitedNodes, this.startNode || path[0]);
            }
        }
        
        // Show step info in panel
        const stepNum = this.currentStep + 1;
        const total = this.steps.length;
        this.panel.showInfo(`Step ${stepNum}/${total}: ${message || action}`);
    }

    /**
     * Update UI elements
     */
    _updateUI() {
        // Update status
        const total = this.steps.length;
        const current = this.currentStep + 1;
        if (this.statusEl) {
            this.statusEl.textContent = `Step ${current}/${total}`;
        }
        
        // Update step list items
        if (this.stepListEl) {
            const items = this.stepListEl.querySelectorAll('.step-item');
            items.forEach((item, index) => {
                item.className = 'step-item';
                if (index === this.currentStep) item.classList.add('active');
                if (index < this.currentStep) item.classList.add('done');
            });
        }
        
        // Update buttons
        this._updateButtons();
        
        // Trigger callbacks
        this.callbacks.forEach(cb => cb(this.steps[this.currentStep], this.currentStep));
    }

    /**
     * Update button states
     */
    _updateButtons() {
        if (this.prevBtn) this.prevBtn.disabled = this.currentStep <= 0;
        if (this.nextBtn) this.nextBtn.disabled = this.currentStep >= this.steps.length - 1;
    }

    /**
     * Scroll to active step
     */
    _scrollToActive() {
        if (!this.stepListEl) return;
        const active = this.stepListEl.querySelector('.step-item.active');
        if (active) {
            active.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
    }

    /**
     * Auto-play steps
     */
    play() {
        if (this.isPlaying) return;
        
        // اگر استپی وجود نداره یا در انتها هستیم
        if (this.steps.length === 0) return;
        
        this.isPlaying = true;
        if (this.playBtn) {
            this.playBtn.textContent = '⏸️ Pause';
            this.playBtn.classList.add('playing');
        }
        
        // اگر در انتها هستیم، از اول شروع کن
        if (this.currentStep >= this.steps.length - 1) {
            this.currentStep = -1;
            // گام اول رو نشون بده
            if (this.steps.length > 0) {
                this._applyStep(this.steps[0]);
                this._updateUI();
            }
        }
        
        this.animationTimer = setInterval(() => {
            const hasNext = this.nextStep();
            if (!hasNext) {
                this.stop();
                this.panel.showInfo('✅ Animation complete!');
            }
        }, this.speed);
    }

    /**
     * Stop auto-play
     */
    stop() {
        this.isPlaying = false;
        if (this.animationTimer) {
            clearInterval(this.animationTimer);
            this.animationTimer = null;
        }
        if (this.playBtn) {
            this.playBtn.textContent = '▶️ Play';
            this.playBtn.classList.remove('playing');
        }
    }

    /**
     * Toggle play/pause
     */
    togglePlay() {
        if (this.isPlaying) {
            this.stop();
        } else {
            this.play();
        }
    }

    /**
     * Set animation speed
     */
    setSpeed(speed) {
        this.speed = speed;
        if (this.isPlaying) {
            this.stop();
            this.play();
        }
    }

    /**
     * Register callback for step changes
     */
    onStepChange(callback) {
        this.callbacks.push(callback);
    }

    /**
     * Reset to beginning
     */
    reset() {
        this.stop();
        this.currentStep = -1;
        this.steps = [];
        this.graph = null;
        this.visitedNodes = new Set();
        
        // Clear step list
        if (this.stepListEl) this.stepListEl.innerHTML = '';
        
        // Update status
        if (this.statusEl) this.statusEl.textContent = 'Step 0/0';
        
        // Hide panel
        if (this.panelEl) this.panelEl.style.display = 'none';
        
        this._updateButtons();
    }

    /**
     * Check if has steps
     */
    hasSteps() {
        return this.steps.length > 0;
    }

    /**
     * Get current step data
     */
    getCurrentStep() {
        return this.steps[this.currentStep] || null;
    }

    /**
     * Get all steps
     */
    getSteps() {
        return [...this.steps];
    }
}