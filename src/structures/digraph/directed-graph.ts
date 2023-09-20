import SealedDigraph from "./sealed-digraph";

export default class DirectedGraph<T> extends SealedDigraph<T> {
    constructor() { super() }

    public get sealed() {
        return SealedDigraph.seal(this);
    }

    /**
    * Adds an edge from sourceVertex to targetVertex to the graph.
    * If the source or target vertices are not yet in the graph, they are added to the graph.
    * @param sourceVertex 
    * @param targetVertex 
    */
    public addEdge(sourceVertex: T, targetVertex: T) {
        this.addVertex(sourceVertex);
        this.addVertex(targetVertex);
        this.parentsAdjacencyList.get(targetVertex)?.add(sourceVertex);
        this.childrenAdjacencyList.get(sourceVertex)?.add(targetVertex);

        this.sources.delete(targetVertex);
        this.sinks.delete(sourceVertex);
    }

    public removeEdge(sourceVertex: T, targetVertex: T) {
        const targetAncestorList = this.parentsAdjacencyList.get(targetVertex);
        targetAncestorList?.delete(sourceVertex);
        const sourceDescendantList = this.childrenAdjacencyList.get(sourceVertex);
        sourceDescendantList?.delete(targetVertex);


        if (this.parentsAdjacencyList.get(sourceVertex)?.size==0) this.sources.add(sourceVertex);
        if (this.parentsAdjacencyList.get(targetVertex)?.size==0) this.sources.add(targetVertex);

        if (this.childrenAdjacencyList.get(sourceVertex)?.size==0) this.sinks.add(sourceVertex);
        if (this.childrenAdjacencyList.get(targetVertex)?.size==0) this.sinks.add(targetVertex);
    }

    /**
    * Adds provided vertex to the graph.
    * If vertex is already in the graph, it does nothing.
    * @param vertex 
    */
    public addVertex(vertex: T) {
        if (this.hasVertex(vertex)) return;
        this.parentsAdjacencyList.set(vertex, new Set());
        this.childrenAdjacencyList.set(vertex, new Set());

        this.sources.add(vertex);
        this.sinks.add(vertex);
    }

    /**
    * Removes the provided vertex, as well as all of its connecting edges, from the graph.
    * @param vertex 
    */
    public removeVertex(vertex: T) {
        this.parentsAdjacencyList.delete(vertex);
        this.childrenAdjacencyList.delete(vertex);

        this.sources.delete(vertex);
        this.sinks.delete(vertex);
    }
}
