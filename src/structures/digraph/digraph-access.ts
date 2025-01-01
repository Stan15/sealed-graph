export default abstract class DigraphAccess<T> {
    protected constructor(
        protected parentsAdjacencyList: Map<T, Set<T>> = new Map(),
        protected childrenAdjacencyList: Map<T, Set<T>> = new Map(),
        protected _sources: Set<T> = new Set(),
        protected _sinks: Set<T> = new Set(),
    ) {}

    public getParents(vertex: T) {
        if (this.parentsAdjacencyList.has(vertex)) {
          return new Set(this.parentsAdjacencyList.get(vertex));
        }
        return new Set<T>();
    }

    public getChildren(vertex: T) {
        if (this.childrenAdjacencyList.has(vertex)) {
          return new Set(this.childrenAdjacencyList.get(vertex));
        }
        return new Set<T>();
    }

    public get sources() {
        return new Set(this._sources);
    }

    public get sinks() {
        return new Set(this._sinks);
    }

    public hasEdge(sourceVertex: T, targetVertex: T) {
        return !!this.childrenAdjacencyList.get(sourceVertex)?.has(targetVertex);
    }

    public hasVertex(vertex: T) {
        return this.parentsAdjacencyList.has(vertex);
    }

    public vertexSet() {
        return new Set(this.parentsAdjacencyList.keys())
    }

    public parentsCount(vertex: T): number {
        if (!this.parentsAdjacencyList.has(vertex)) {
            throw new Error("Vertex does not exist in this graph");
        } else {
            return this.parentsAdjacencyList.get(vertex)!.size;
        }
    }

    public childrenCount(vertex: T): number {
        if (!this.childrenAdjacencyList.has(vertex)) {
            throw new Error("Vertex does not exist in this graph");
        } else {
            return this.childrenAdjacencyList.get(vertex)!.size;
        }
    }

    public toString() {
        let res = "";
        this.childrenAdjacencyList.forEach((children, vertex) => {
            children.forEach(child => {
                res += `${String(vertex)} -> ${String(child)}\n`;
            });
        });
        return res;
    }
}
