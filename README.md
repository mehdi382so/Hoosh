# TSP Visualizer

A web-based visualizer for the Travelling Salesman Problem (TSP), built as part of an Artificial Intelligence course project. The app lets you define a graph of cities, choose a search/optimization algorithm, and watch the resulting path animate on a canvas.

## Project Structure (so far)

```
.
├── index.html               # Main HTML page (UI layout, loads css/style.css and js/app.js)
├── css/
│   └── style.css             # Styling for the app
└── js/
    ├── app.js                  # Entry point (orchestrator)
    ├── state/
    │   └── AppState.js          # Central app state (graph, start node, algorithm, result, animation status)
    ├── services/
    │   └── SolverService.js     # Resolves & runs the selected algorithm via a registry, times execution
    ├── renderer/
    │   ├── CanvasManager.js      # Low-level canvas setup: handles resize/DPR scaling, clearing, and exposes the 2D context
    │   ├── GraphRenderer.js      # Computes node positions and draws the graph (nodes, edges, costs), supports highlighting a solved path
    │   └── PathAnimator.js       # Step-by-step animation of the solved path, edge by edge, with status text
    ├── parser/
    │   ├── InputParser.js        # Parses raw text input ("From To Cost" per line) into edge objects
    │   └── Validator.js          # Validates parsed edges (no self-loops, positive costs, no duplicates, ≥3 cities, etc.)
    ├── graph/
    │   ├── Graph.js               # Undirected weighted graph: nodes + adjacency list, edge/distance lookups
    │   ├── GraphBuilder.js         # Builds a Graph instance from validated edge data
    │   ├── Node.js                 # Represents a city (name + x/y position)
    │   └── Edge.js                 # Represents an undirected weighted edge between two nodes
    ├── constants/
    │   └── Algorithms.js           # Frozen registry of available algorithms (id + display title) used by dropdowns & SolverService
    ├── algorithms/
    │   ├── BaseAlgorithm.js         # Abstract base class all TSP algorithms extend
    │   └── Greedy.js                # Nearest-neighbor greedy TSP solver
    ├── ui/
    │   ├── ButtonManager.js     # Enables/disables Run/Reset buttons based on state
    │   ├── DropdownManager.js   # Populates algorithm & start-node dropdowns
    │   └── PanelManager.js      # Shows info/error/result messages in the UI
    └── utils/
        ├── Distance.js          # Graph distance/cost helper methods
        └── Timer.js             # High-resolution timer for measuring algorithm execution time
```

> Structure reflects all source files shared so far.

## How It Works (Entry Point Overview)

`app.js` connects the following pieces:

- **AppState** – central state object holding the graph, positions, algorithm, start node, path/cost/execTime result, and `hasResult`/`isAnimating` flags. Exposes getters/setters plus `setResult()`, `clearResult()`, and `reset()` (full reset, used when loading a new map)
- **DropdownManager** – populates the algorithm dropdown (from `constants/Algorithms.js`) and the start-node dropdown (from the parsed graph's node names)
- **PanelManager** – manages the info/error/result panels:
  - `showError` / `showInfo` / `hideAll` toggle the message banners
  - `showResult` displays the final path, cost, and execution time
  - `clearResult` resets the result panel on Reset
- **ButtonManager** – centralizes UI enable/disable logic:
  - `canRun` → true only when a graph, start node, and algorithm are set, and no animation/result is in progress
  - `canReset` → true only when a result exists and animation has finished
  - `update` applies these rules to the Run/Reset buttons and the start-node select
- **CanvasManager** – low-level canvas wrapper:
  - `resize()` – fits the canvas to its parent container, handling device pixel ratio (DPR) for sharp rendering
  - `clear()` – clears the canvas
  - `getCtx()` / `getWidth()` / `getHeight()` – expose the 2D context and current logical dimensions
- **GraphRenderer** – draws the graph onto the canvas (built on `CanvasManager`):
  - `computePositions(graph)` – lays out nodes evenly around a circle
  - `draw(graph, startNode)` – computes positions and draws nodes, edges, and edge-cost labels (highlighting the start node)
  - `redrawWithPath(graph, startNode, path)` – redraws the base graph and overlays the highlighted solved path
  - `highlightNodes(visitedNodes, startNode)` – highlights a given set of nodes (used during step-by-step animation)
- **SolverService** – looks up the algorithm class in an internal registry (keyed by algorithm id from `constants/Algorithms.js`), instantiates it with the graph, runs `solve(startNode)`, and times execution with `Timer`. New algorithms can be added via `SolverService.register(id, algoClass)`
- **PathAnimator** – animates the solved tour edge-by-edge on the canvas (built on `CanvasManager` + `GraphRenderer`):
  - `animate(graph, positions, path, onComplete)` – steps through each edge of the tour with an 800ms delay, redrawing the base graph plus all completed edges and highlighted nodes so far, updating a status line (`Step X/Y: A → B`), and calling `onComplete` when finished
  - `stop()` – cancels any in-progress animation (clears the pending timeout)
  - `isRunning()` – whether an animation is currently in progress
  - `drawCompleted(path, positions)` – draws the full solved tour immediately, without stepping (no animation)
- **InputParser** – parses raw textarea input into edge objects. Expects one edge per line in the format `From To Cost` (whitespace-separated), e.g.:
  ```
  Tehran Mashhad 890
  Tehran Sari 250
  ```
  Throws an error on malformed lines or non-numeric costs.
- **Validator** – validates the parsed edges before building the graph:
  - rejects empty input, empty node names, self-loops, non-numeric/non-positive costs, and duplicate (undirected) edges
  - requires at least 3 unique cities (minimum for a TSP tour)
- **GraphBuilder** – builds a `Graph` instance from validated edges (`GraphBuilder.build(edges)`)

## Graph Model

- **Graph** – undirected weighted graph storing nodes (`Map<name, Node>`) and an adjacency list (`Map<name, Edge[]>`):
  - `addNode(name)` / `hasNode(name)` / `getNode(name)`
  - `addEdge(from, to, cost)` – adds edges symmetrically in both directions; throws on self-loops, no-ops on duplicates
  - `hasEdge(from, to)` / `getDistance(from, to)` / `getNeighbors(name)`
  - `getNodes()` / `getEdges()` (deduplicated, undirected) / `nodeCount()` / `edgeCount()`
  - `clear()` – removes all nodes and edges
- **Node** – represents a city: `name`, `x`, `y`. Provides `setPosition`/`getPosition`, `clone()`, and `toJSON()`
- **Edge** – represents an undirected weighted connection: `from`, `to`, `cost`. Provides `connects(nodeA, nodeB)` (order-independent), `clone()`, and `toJSON()`

## Utilities

- **Distance** – graph distance/cost helper methods:
  - `between(graph, from, to)` – distance between two nodes
  - `pathCost(graph, path)` – total cost of a sequential path
  - `tourCost(graph, path)` – total cost of a closed TSP tour (returns to start)
  - `isValidTour(graph, path)` – checks a path visits every node exactly once
- **Timer** – high-resolution timer (via `performance.now()`) used to measure algorithm execution time:
  - `start()` / `stop()` / `reset()`
  - `elapsed()` – elapsed time in ms (works while running or after stop)
  - `formatted()` – elapsed time as a formatted string (e.g. `2.345 ms`)

## Supported Algorithms

Defined in `constants/Algorithms.js` (id used internally, title shown in the dropdown):

| Id | Title |
|---|---|
| `Greedy` | Greedy Search |
| `BruteForce` | Brute Force Search |
| `HillClimbing` | Hill Climbing |
| `LocalBeam` | Local Beam Search |
| `SimulatedAnnealing` | Simulated Annealing |
| `Genetic` | Genetic Algorithm |
| `AStar` | A* Search |

> Currently only **Greedy** is registered in `SolverService`. The rest will be wired up as their implementations are added to `algorithms/`.

## Algorithms

- **BaseAlgorithm** – abstract base class every algorithm extends:
  - constructor takes the `graph` and stores it
  - `getName()` / `getGraph()` / `getNodeNames()`
  - `calculateCost(path)` – delegates to `Distance.tourCost`
  - `isValid(path)` – delegates to `Distance.isValidTour`
  - `solve()` – must be overridden by subclasses; throws if not implemented
- **Greedy** (Nearest Neighbor) – starting from `startNode`, repeatedly moves to the closest unvisited neighbor until all nodes are visited, then returns the closed tour and its cost. Throws if the graph isn't fully connected (no reachable unvisited neighbor). Returns `{ algorithm, startNode, path, cost, visitedNodes, executionTime }`

## App UI (`index.html`)

A single-page layout with a sidebar and a graph canvas:

- **Map Input** – textarea for entering edges (`From To Cost`, one per line), a **Load Map** button (or `Ctrl+Enter`), plus error/info messages
- **Start Node** – dropdown populated after loading the map
- **Algorithm** – dropdown of available algorithms, **Run** / **Reset Path** buttons, and a live animation status line
- **Results** – shows the final path, cost, and execution time
- **Graph Area** – the `<canvas id="tsp-canvas">` where the graph and animated path are drawn

## Getting Started

1. **Use the app**
   - Enter cities and distances in the **Map Input** textarea, one edge per line:
     ```
     A B 10
     A C 15
     A D 20
     B C 25
     B D 30
     C D 35
     ```
   - Click **Load Map** (or `Ctrl+Enter`) to parse, validate, and draw the graph
   - Select a **Start Node** and an **Algorithm**
   - Click **Run** to solve and watch the path animate on the canvas
   - Click **Reset Path** to clear the result and run again
