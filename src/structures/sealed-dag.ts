import DirectedGraph from "./digraph/directed-graph";
import DigraphAccess from "./digraph/digraph-access";
import { TopologicalOrderIterator, TopologicalLevelIterator } from "../iterators/top-iterator";

export default class SealedDAG<T> extends DigraphAccess<T> {
    public static from<T>(graph: DigraphAccess<T>, {trust_me_bro = false}) {
        if (!trust_me_bro && this.hasCycle(graph)) throw new Error("Cannot create a DAG from a cyclic graph.");

        const parents = new Map<T, Set<T>>();
        const children = new Map<T, Set<T>>();
        for (const vertex of graph.vertexSet()) {
            parents.set(vertex, graph.getParents(vertex));
            children.set(vertex, graph.getChildren(vertex));
        }
        return new SealedDAG(parents, children, new Set(graph.sources), new Set(graph.sinks));
    }

    private static hasCycle<T>(graph: DigraphAccess<T>) {
        const visiting = new Set<T>();
        const visited = new Set<T>();

        const stack = [...graph.sources];
        while (stack.length>0) {
            const vertex = stack[stack.length-1]!;
            if (!visiting.has(vertex)) {
                visiting.add(vertex);
                for (const child of graph.getChildren(vertex)) {
                    if (visiting.has(child)) {
                        return true; // cycle detected
                    } else if (!visited.has(child)) {
                        stack.push(child);
                    }
                }
            } else {
                visiting.delete(vertex);
                visited.add(vertex);
                stack.pop();
            }
        }
        return true;
    }

    get top_order() { return new TopologicalOrderIterator(this) }
    get reverse_top_order() { return new TopologicalOrderIterator(this, true) }
    get top_levels() { return new TopologicalLevelIterator(this) }
    get reverse_top_levels() { return new TopologicalLevelIterator(this, true) }
}
