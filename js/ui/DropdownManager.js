import Algorithms from "../constants/Algorithms.js"
import SolverService from "../services/SolverService.js"

export default class DropdownManager {
    populateAlgorithms(selectEl) {
        for (const algo of Object.values(Algorithms)) {
            const opt = document.createElement("option")
            opt.value = algo.id
            opt.textContent = algo.title
            selectEl.appendChild(opt)
        }
    }

    populateNodes(selectEl, nodeNames) {
        selectEl.innerHTML = '<option value="">-- Select start node --</option>'
        nodeNames.forEach(n => {
            const opt = document.createElement("option")
            opt.value = n
            opt.textContent = n
            selectEl.appendChild(opt)
        })
    }
}
