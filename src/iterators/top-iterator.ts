import SealedDAG from "../structures/sealed-dag";

export class TopologicalOrderIterator<T> {
    constructor(private graph: SealedDAG<T>, private reverse=false) {}
    *[Symbol.iterator]() {
        let unvisited_predecessors_count_tracker: Map<T, number> = new Map();
        let visited: Set<T> = new Set();

        let current_level = this.reverse ? this.graph.sinks : this.graph.sources;
        let next_level = new Set<T>();
        while (current_level.size>0) {
            for (let vertex of current_level) {
                yield vertex;
                if (visited.has(vertex)) {
                    throw new Error("Cycle detected in acyclic graph");
                }
                visited.add(vertex);

                let successors = this.reverse ? this.graph.getParents(vertex) : this.graph.getChildren(vertex);
                let predecessor_count_for_successor;
                for (let successor of successors) {
                    let unvisited_predecessors_count: number;
                    if (unvisited_predecessors_count_tracker.has(successor)) {
                        unvisited_predecessors_count = unvisited_predecessors_count_tracker.get(successor)! - 1;
                    } else {
                        predecessor_count_for_successor = this.reverse ? this.graph.childrenCount(successor) : this.graph.parentsCount(successor);
                        unvisited_predecessors_count = predecessor_count_for_successor - 1;
                    }

                    unvisited_predecessors_count_tracker.set(successor, unvisited_predecessors_count);
                    if (unvisited_predecessors_count===0) {
                        next_level.add(successor);
                    }
                }
            }
            current_level = next_level;
            next_level = new Set<T>();
        }
    }
}

export class TopologicalLevelIterator<T> {
    constructor(private graph: SealedDAG<T>, private reverse=false) {}
    *[Symbol.iterator]() {
        let unvisited_predecessors_count_tracker: Map<T, number> = new Map();
        let visited: Set<T> = new Set();

        let current_level = this.reverse ? this.graph.sinks : this.graph.sources;
        let next_level = new Set<T>();
        while (current_level.size>0) {
            for (let vertex of current_level) {
                if (visited.has(vertex)) {
                    throw new Error("Cycle detected in acyclic graph");
                }
                visited.add(vertex);

                let successors = this.reverse ? this.graph.getParents(vertex) : this.graph.getChildren(vertex);
                let predecessor_count_for_successor;
                for (let successor of successors) {
                    let unvisited_predecessors_count: number;
                    if (unvisited_predecessors_count_tracker.has(successor)) {
                        unvisited_predecessors_count = unvisited_predecessors_count_tracker.get(successor)! - 1;
                    } else {
                        predecessor_count_for_successor = this.reverse ? this.graph.childrenCount(successor) : this.graph.parentsCount(successor);
                        unvisited_predecessors_count = predecessor_count_for_successor - 1;
                    }

                    unvisited_predecessors_count_tracker.set(successor, unvisited_predecessors_count);
                    if (unvisited_predecessors_count===0) {
                        next_level.add(successor);
                    }
                }
            }
            yield current_level;
            current_level = next_level;
            next_level = new Set<T>();
        }
    }
}
