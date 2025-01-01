import DigraphAccess from "./digraph-access";

export default class DirectedGraph<T> extends DigraphAccess<T> {
    constructor() { super() }

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

        this._sources.delete(targetVertex);
        this._sinks.delete(sourceVertex);
    }

    public removeEdge(sourceVertex: T, targetVertex: T) {
        const targetAncestorList = this.parentsAdjacencyList.get(targetVertex);
        targetAncestorList?.delete(sourceVertex);
        const sourceDescendantList = this.childrenAdjacencyList.get(sourceVertex);
        sourceDescendantList?.delete(targetVertex);


        if (this.parentsAdjacencyList.get(sourceVertex)?.size==0) this._sources.add(sourceVertex);
        if (this.parentsAdjacencyList.get(targetVertex)?.size==0) this._sources.add(targetVertex);

        if (this.childrenAdjacencyList.get(sourceVertex)?.size==0) this._sinks.add(sourceVertex);
        if (this.childrenAdjacencyList.get(targetVertex)?.size==0) this._sinks.add(targetVertex);
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

        this._sources.add(vertex);
        this._sinks.add(vertex);
    }

    /**
    * Removes the provided vertex, as well as all of its connecting edges, from the graph.
    * @param vertex 
    */
    public removeVertex(vertex: T) {
        this.parentsAdjacencyList.delete(vertex);
        this.childrenAdjacencyList.delete(vertex);

        this._sources.delete(vertex);
        this._sinks.delete(vertex);
    }
}
