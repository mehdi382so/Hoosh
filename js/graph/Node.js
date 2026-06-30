export default class Node {
    constructor(name, x = 0, y = 0) {
        if (typeof name !== "string") throw new TypeError("Node name must be a string.")

        name = name.trim()
        if (name.length === 0) throw new Error("Node name cannot be empty.")

        this.name = name
        this.x = Number(x)
        this.y = Number(y)
    }

    setPosition(x, y) {
        this.x = Number(x)
        this.y = Number(y)
    }
    getPosition() {
        return {
            x: this.x,
            y: this.y
        }
    }

    clone() {
        return new Node(
            this.name,
            this.x,
            this.y
        )
    }

    toJSON() {
        return {
            name: this.name,
            x: this.x,
            y: this.y
        }
    }
}
