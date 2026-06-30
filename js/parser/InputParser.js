/**
 * Converts user input into structured edge objects.
 */
export default class InputParser {
    /**
     * Parse raw text input.
     *
     * Input format:
     *
     * Tehran Mashhad 890
     * Tehran Sari 250
     *
     * @param {string} text
     * @returns {Array<Object>}
     */
    static parse(text) {
        if (typeof text !== "string")
            throw new TypeError("Input must be a string.")

        const edges = []

        // Split text into lines
        const lines = text
            .split("\n")
            .map(line => line.trim())
            .filter(line => line.length > 0)

        for (const line of lines) {
            const parts = line.split(/\s+/)

            if (parts.length !== 3)
                throw new Error(`Invalid input line: "${line}"`)

            const [from, to, cost] = parts
            const distance = Number(cost)

            if (Number.isNaN(distance))
                throw new Error(`Invalid distance in line: "${line}"`)

            edges.push({
                from,
                to,
                cost: distance
            })
        }

        return edges
    }
}
