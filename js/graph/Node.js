/**
 * Graph Node
 *
 * Represents a city in the graph.
 */
export default class Node {
    /**
     * Create a graph node.
     *
     * @param {string} name
     * @param {number} x
     * @param {number} y
     */
    constructor(name, x = 0, y = 0) {
        if (typeof name !== "string")
            throw new TypeError("Node name must be a string.")

        name = name.trim()
        if (name.length === 0)
            throw new Error("Node name cannot be empty.")

        this.name = name
        this.x = Number(x)
        this.y = Number(y)
    }

    /**
     * Update node position.
     *
     * @param {number} x
     * @param {number} y
     */
    setPosition(x, y) {
        this.x = Number(x)
        this.y = Number(y)
    }

    /**
     * Get node position.
     *
     * @returns {{x:number,y:number}}
     */
    getPosition() {
        return {
            x: this.x,
            y: this.y
        }
    }

    /**
     * Create a copy of this node.
     *
     * @returns {Node}
     */
    clone() {
        return new Node(
            this.name,
            this.x,
            this.y
        )
    }

    /**
     * Convert node to JSON object.
     *
     * @returns {Object}
     */
    toJSON() {
        return {
            name: this.name,
            x: this.x,
            y: this.y
        }
    }
}