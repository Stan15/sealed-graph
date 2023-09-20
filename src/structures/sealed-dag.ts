import DirectedGraph from "./digraph/directed-graph";
import SealedDigraph from "./digraph/sealed-digraph";
import { TopologicalOrderIterator, TopologicalLevelIterator } from "../iterators/top-iterator";

export default class SealedDAG<T> extends SealedDigraph<T> {
    private constructor() { super() }
    public static from<T>(graph: DirectedGraph<T>, {trust_me_bro = false}) {
        if (!trust_me_bro && this.hasCycle(graph)) throw new Error("Cannot create a DAG from a cyclic graph.");
        return graph.sealed;
    }

    private static hasCycle<T>(graph: DirectedGraph<T>) {
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
