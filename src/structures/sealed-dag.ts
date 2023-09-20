import Digraph from "./digraph/digraph";
import SealedDigraph from "./digraph/sealed-digraph";
import { TopologicalOrderIterator, TopologicalLevelIterator } from "../iterators/top-iterator";

export default class SealedDAG<T> extends SealedDigraph<T> {
    private constructor(private graph: Digraph<T>) { super() }
    public static from<T>(graph: Digraph<T>, {trust_me_bro = false}) {
        if (!trust_me_bro && this.hasCycle(graph)) throw new Error("Cannot create a DAG from a cyclic graph.");
        return graph.sealed;
    }

    private static hasCycle<T>(graph: Digraph<T>) {
        // TODO
        return true;
    }

    get top_order() { return new TopologicalOrderIterator(this) }
    get reverse_top_order() { return new TopologicalOrderIterator(this, true) }
    get top_levels() { return new TopologicalLevelIterator(this) }
    get reverse_top_levels() { return new TopologicalLevelIterator(this, true) }
}
