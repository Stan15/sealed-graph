export default class SealedDigraph<T> {
    protected constructor(
        protected parentsAdjacencyList: Map<T, Set<T>> = new Map(),
        protected childrenAdjacencyList: Map<T, Set<T>> = new Map(),
        protected _sources: Set<T> = new Set(),
        protected _sinks: Set<T> = new Set(),
    ) {}

    public static empty<T>() {
        return new SealedDigraph<T>(new Map(), new Map(), new Set(), new Set());
    }

    public static seal<T, G extends SealedDigraph<T>>(graph: G) {
        const parents = new Map<T, Set<T>>();
        for (const [ vertex, set ] of graph.parentsAdjacencyList) {
            parents.set(vertex, new Set(set));
        }
        const children = new Map();
        for (const [ vertex, set ] of graph.childrenAdjacencyList) {
            children.set(vertex, new Set(set));
        }
        return new SealedDigraph(
            parents,
            children,
            new Set(graph._sources),
            new Set(graph._sinks)
        );
    }

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
}
