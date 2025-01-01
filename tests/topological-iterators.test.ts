// Credits: Thank you ChatGPT for helping me generate test cases 🙏

import { describe, test, expect } from "@jest/globals";
import SealedDAG from "../src/structures/sealed-dag";
import DirectedGraph from "../src/structures/digraph/directed-graph";

// A simple builder that returns a SealedDAG given
// an array of nodes and an array of edges (tuples of [src, dst]).
// You can adapt it to parse string-based inputs, or anything else you like.
function buildSealedDAG<T>(
  nodes: T[],
  edges: [T, T][],
  noCycles = false  // optional
): SealedDAG<T> {
  // Initialize the DirectedGraph
  const g = new DirectedGraph<T>();

  // Fill adjacency lists with all nodes
  for (const n of nodes) {
    g.addVertex(n);
  }

  // Add edges
  for (const [src, dst] of edges) {
    g.addEdge(src, dst);
  }

  // Finally, seal it into a DAG
  return SealedDAG.from<T>(g, { trust_me_bro: noCycles });
}

describe("Topological Iterators Tests", () => {
  //
  // 1) Single Node, No Edges
  //
  describe("Single Node, No Edges", () => {
    const nodes = ["A"];
    const edges: [string, string][] = [];

    test("TopologicalOrderIterator yields [A]", () => {
      const dag = buildSealedDAG(nodes, edges);
      const result = [...dag.top_order];
      expect(result).toEqual(["A"]);
    });

    test("TopologicalLevelIterator yields [[A]]", () => {
      const dag = buildSealedDAG(nodes, edges);
      const result = [...dag.top_levels].map((s) => [...s]);
      expect(result).toEqual([["A"]]);
    });
  });

  //
  // 2) Simple Chain (A → B → C)
  //
  describe("Simple Chain (A→B→C)", () => {
    const nodes = ["A", "B", "C"];
    const edges: [string, string][] = [
      ["A", "B"],
      ["B", "C"],
    ];

    test("Order should be [A, B, C]", () => {
      const dag = buildSealedDAG(nodes, edges);
      const result = [...dag.top_order];
      expect(result).toEqual(["A", "B", "C"]);
    });

    test("Levels should be [[A], [B], [C]]", () => {
      const dag = buildSealedDAG(nodes, edges);
      const levels = [...dag.top_levels].map((level) => [...level]);
      expect(levels).toEqual([["A"], ["B"], ["C"]]);
    });
  });

  //
  // 3) Diamond Graph: A → B, A → C, B → D, C → D
  //
  describe("Diamond Graph", () => {
    const nodes = ["A", "B", "C", "D"];
    const edges: [string, string][] = [
      ["A", "B"],
      ["A", "C"],
      ["B", "D"],
      ["C", "D"],
    ];

    test("TopologicalOrderIterator yields [A, B, C, D] or [A, C, B, D]", () => {
      const dag = buildSealedDAG(nodes, edges);
      const result = [...dag.top_order];
      // Just check some known constraints:
      // A before B, A before C, B before D, C before D.
      expect(result.indexOf("A")).toBeLessThan(result.indexOf("B"));
      expect(result.indexOf("A")).toBeLessThan(result.indexOf("C"));
      expect(result.indexOf("B")).toBeLessThan(result.indexOf("D"));
      expect(result.indexOf("C")).toBeLessThan(result.indexOf("D"));
    });

    test("TopologicalLevelIterator yields [[A], [B, C], [D]]", () => {
      const dag = buildSealedDAG(nodes, edges);
      const levels = [...dag.top_levels].map((l) => [...l]);
      expect(levels).toEqual([["A"], ["B", "C"], ["D"]]);
    });
  });

  //
  // 4) Multiple Independent Sources (A→C, B→C)
  //
  describe("Multiple Sources", () => {
    const nodes = ["A", "B", "C"];
    const edges: [string, string][] = [
      ["A", "C"],
      ["B", "C"],
    ];

    test("Order can be [A, B, C] or [B, A, C]", () => {
      const dag = buildSealedDAG(nodes, edges);
      const result = [...dag.top_order];
      // A or B can come first, but both must precede C
      expect(result.indexOf("C")).toBeGreaterThan(result.indexOf("A"));
      expect(result.indexOf("C")).toBeGreaterThan(result.indexOf("B"));
    });

    test("Levels => [[A, B], [C]]", () => {
      const dag = buildSealedDAG(nodes, edges);
      const levels = [...dag.top_levels].map((l) => [...l]);
      expect(levels).toEqual([["A", "B"], ["C"]]);
    });
  });

  //
  // 5) Multiple Independent Sinks (A→B, A→C)
  //
  describe("Multiple Sinks", () => {
    const nodes = ["A", "B", "C"];
    const edges: [string, string][] = [
      ["A", "B"],
      ["A", "C"],
    ];

    test("Order => A first, then B/C in any order", () => {
      const dag = buildSealedDAG(nodes, edges);
      const result = [...dag.top_order];
      // A must be before B and C
      expect(result.indexOf("A")).toBe(0);
    });

    test("Levels => [[A], [B, C]]", () => {
      const dag = buildSealedDAG(nodes, edges);
      const levels = [...dag.top_levels].map((l) => [...l]);
      expect(levels).toEqual([["A"], ["B", "C"]]);
    });
  });

  //
  // 6) Disconnected Subgraphs: A→B, C→D
  //
  describe("Disconnected Subgraphs", () => {
    const nodes = ["A", "B", "C", "D"];
    const edges: [string, string][] = [
      ["A", "B"],
      ["C", "D"],
    ];

    test("Order can weave [A,B] and [C,D] in any order, as long as A->B and C->D are preserved", () => {
      const dag = buildSealedDAG(nodes, edges);
      const result = [...dag.top_order];
      expect(result.indexOf("A")).toBeLessThan(result.indexOf("B"));
      expect(result.indexOf("C")).toBeLessThan(result.indexOf("D"));
    });

    test("Levels => [[A, C], [B, D]]", () => {
      const dag = buildSealedDAG(nodes, edges);
      const levels = [...dag.top_levels].map((l) => [...l]);
      // A/C share level 0, B/D share level 1
      expect(levels).toEqual([["A", "C"], ["B", "D"]]);
    });
  });

  //
  // 7) Reverse = true on Simple Chain
  //
  describe("Reverse iteration on A→B→C", () => {
    const nodes = ["A", "B", "C"];
    const edges: [string, string][] = [
      ["A", "B"],
      ["B", "C"],
    ];

    test("Reverse top_order => [C, B, A]", () => {
      const dag = buildSealedDAG(nodes, edges);
      const result = [...dag.reverse_top_order];
      expect(result).toEqual(["C", "B", "A"]);
    });

    test("Reverse top_levels => [[C], [B], [A]]", () => {
      const dag = buildSealedDAG(nodes, edges);
      const levels = [...dag.reverse_top_levels].map((l) => [...l]);
      expect(levels).toEqual([["C"], ["B"], ["A"]]);
    });
  });

  //
  // 8) Cycle Detection
  //
  describe("Cycle Detection: A→B, B→C, C→A", () => {
    const nodes = ["A", "B", "C"];
    const edges: [string, string][] = [
      ["A", "B"],
      ["B", "C"],
      ["C", "A"],
    ];

    test("top_order => throws error", () => {
      expect(() => buildSealedDAG(nodes, edges)).toThrowError(
        "Cannot create a DAG from a cyclic graph."
      );
    });
    test("top_levels => also throws error", () => {
      // Same test effectively
      expect(() => buildSealedDAG(nodes, edges)).toThrowError();
    });
  });

  //
  // 9) Empty Graph
  //
  describe("Empty Graph (No nodes, no edges)", () => {
    const nodes: string[] = [];
    const edges: [string, string][] = [];

    test("top_order => []", () => {
      const dag = buildSealedDAG(nodes, edges);
      const result = [...dag.top_order];
      expect(result).toEqual([]);
    });

    test("top_levels => []", () => {
      const dag = buildSealedDAG(nodes, edges);
      const levels = [...dag.top_levels];
      expect(levels).toEqual([]);
    });
  });

  //
  // 10) Isolated Node in a Larger Graph: A→B→C, plus D alone
  //
  describe("Isolated Node in Larger Graph", () => {
    const nodes = ["A", "B", "C", "D"];
    const edges: [string, string][] = [
      ["A", "B"],
      ["B", "C"],
      // D is isolated
    ];

    test("top_order => D can appear anywhere, but A->B->C must remain in order", () => {
      const dag = buildSealedDAG(nodes, edges);
      const result = [...dag.top_order];
      expect(result.indexOf("A")).toBeLessThan(result.indexOf("B"));
      expect(result.indexOf("B")).toBeLessThan(result.indexOf("C"));
      // D can appear anywhere else in the sequence
    });

    test("top_levels => Possibly [[A, D], [B], [C]]", () => {
      const dag = buildSealedDAG(nodes, edges);
      const levels = [...dag.top_levels].map((l) => [...l]);
      // Could be that D is in the first level, with A
      expect(levels[0]).toContain("A");
      expect(levels[0]).toContain("D");
    });
  });

  //
  // 11) Duplicate Edges: A→B, A→B
  //
  describe("Duplicate Edges", () => {
    const nodes = ["A", "B"];
    const edges: [string, string][] = [
      ["A", "B"],
      ["A", "B"], // same edge repeated
    ];

    test("top_order => [A, B]", () => {
      const dag = buildSealedDAG(nodes, edges);
      const result = [...dag.top_order];
      expect(result).toEqual(["A", "B"]);
    });

    test("top_levels => [[A], [B]]", () => {
      const dag = buildSealedDAG(nodes, edges);
      const levels = [...dag.top_levels].map((l) => [...l]);
      expect(levels).toEqual([["A"], ["B"]]);
    });
  });

  //
  // 12) Multi-Incoming Edges: A, B, C → D → E
  //
  describe("Multi-Incoming Edges (A,B,C->D->E)", () => {
    const nodes = ["A", "B", "C", "D", "E"];
    const edges: [string, string][] = [
      ["A", "D"],
      ["B", "D"],
      ["C", "D"],
      ["D", "E"],
    ];

    test("top_order => A,B,C can appear in any order, all before D, then E last", () => {
      const dag = buildSealedDAG(nodes, edges);
      const result = [...dag.top_order];
      // A, B, C must all come before D
      expect(result.indexOf("A")).toBeLessThan(result.indexOf("D"));
      expect(result.indexOf("B")).toBeLessThan(result.indexOf("D"));
      expect(result.indexOf("C")).toBeLessThan(result.indexOf("D"));
      expect(result.indexOf("D")).toBeLessThan(result.indexOf("E"));
    });

    test("top_levels => [[A, B, C], [D], [E]]", () => {
      const dag = buildSealedDAG(nodes, edges);
      const levels = [...dag.top_levels].map((l) => [...l]);
      expect(levels).toEqual([["A", "B", "C"], ["D"], ["E"]]);
    });
  });

  //
  // 13) Reverse Iteration w/ multiple sources & sinks
  //
  describe("Reverse = true with multiple sources/sinks", () => {
    const nodes = ["A", "B", "C", "D", "E"];
    const edges: [string, string][] = [
      ["A", "C"],
      ["B", "C"],
      ["C", "D"],
      ["C", "E"],
    ];
    // sources = A,B; sinks = D,E

    test("reverse_top_order => sinks first [D/E], then C, then A/B last", () => {
      const dag = buildSealedDAG(nodes, edges);
      const result = [...dag.reverse_top_order];
      // D, E should appear before C, and C before A,B.
      expect(result.indexOf("D")).toBeLessThan(result.indexOf("C"));
      expect(result.indexOf("E")).toBeLessThan(result.indexOf("C"));
      expect(result.indexOf("C")).toBeLessThan(result.indexOf("A"));
      expect(result.indexOf("C")).toBeLessThan(result.indexOf("B"));
    });

    test("reverse_top_levels => [[D, E], [C], [A, B]]", () => {
      const dag = buildSealedDAG(nodes, edges);
      const levels = [...dag.reverse_top_levels].map((l) => [...l]);
      expect(levels).toEqual([["D", "E"], ["C"], ["A", "B"]]);
    });
  });

  //
  // 14) Multi-Level Complex DAG (Example: A→B, A→C, B→D, B→E, ...)
  //     (We won't rewrite all edges here; see the big table for reference.)
  //
  //  ... For brevity, I'll do a smaller multi-level example here ...
  describe("Multi-Level Complex DAG", () => {
    // A small example w/ deeper layering
    const nodes = ["A", "B", "C", "D", "E", "F", "G"];
    const edges: [string, string][] = [
      ["A", "B"],
      ["A", "C"],
      ["B", "D"],
      ["B", "E"],
      ["C", "E"],
      ["C", "F"],
      ["D", "G"],
      ["E", "G"],
      ["F", "G"],
    ];

    test("top_order => respects all constraints", () => {
      const dag = buildSealedDAG(nodes, edges);
      const result = [...dag.top_order];
      // A before B, C; B,C before D,E,F; D,E,F before G
      expect(result.indexOf("A")).toBeLessThan(result.indexOf("B"));
      expect(result.indexOf("A")).toBeLessThan(result.indexOf("C"));
      expect(result.indexOf("B")).toBeLessThan(result.indexOf("D"));
      expect(result.indexOf("B")).toBeLessThan(result.indexOf("E"));
      expect(result.indexOf("C")).toBeLessThan(result.indexOf("F"));
      expect(result.indexOf("E")).toBeLessThan(result.indexOf("G"));
    });

    test("top_levels => [[A], [B, C], [D, E, F], [G]]", () => {
      const dag = buildSealedDAG(nodes, edges);
      const levels = [...dag.top_levels].map((l) => [...l]);
      expect(levels).toEqual([
        ["A"],        // level 0
        ["B", "C"],   // level 1
        ["D", "E", "F"], // level 2
        ["G"],        // level 3
      ]);
    });
  });

  //
  // 15) Hidden Cycle in a Larger Graph (A→B→C→D→E→C)
  //
  describe("Hidden Cycle (A→B→C→D→E→C)", () => {
    const nodes = ["A", "B", "C", "D", "E"];
    const edges: [string, string][] = [
      ["A", "B"],
      ["B", "C"],
      ["C", "D"],
      ["D", "E"],
      ["E", "C"], // introduces cycle
    ];

    test("Should throw an error about cycle", () => {
      expect(() => buildSealedDAG(nodes, edges)).toThrowError();
    });
  });

  //
  // 16) Self-loop (A→A)
  //
  describe("Self-loop (A→A)", () => {
    const nodes = ["A"];
    const edges: [string, string][] = [["A", "A"]];

    test("Throws cycle error", () => {
      expect(() => buildSealedDAG(nodes, edges)).toThrowError();
    });
  });

  //
  // Benchmark 1) Large Graph Benchmark (13 nodes from previous example)
  //
  describe("Large Complex Graph Benchmark #1 (13 nodes)", () => {
    const nodes = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "X"];
    const edges: [string, string][] = [
      ["A", "B"],
      ["A", "C"],
      ["B", "D"],
      ["B", "E"],
      ["C", "E"],
      ["C", "F"],
      ["D", "G"],
      ["E", "F"],
      ["E", "I"],
      ["F", "G"],
      ["F", "I"],
      ["G", "H"],
      ["G", "L"],
      ["H", "K"],
      ["I", "J"],
      ["I", "K"],
      ["K", "L"],
      ["X", "G"],
    ];

    test("top_order => e.g. [A, X, B, C, D, E, F, G, H, I, K, J, L]", () => {
      const dag = buildSealedDAG(nodes, edges);
      const result = [...dag.top_order];
      // We'll do a quick sanity check on a few must-haves:
      expect(result.indexOf("A")).toBeLessThan(result.indexOf("B"));
      expect(result.indexOf("B")).toBeLessThan(result.indexOf("D"));
      expect(result.indexOf("G")).toBeLessThan(result.indexOf("H"));
      expect(result.indexOf("I")).toBeLessThan(result.indexOf("J"));
      expect(result.indexOf("K")).toBeLessThan(result.indexOf("L"));
    });

    test("top_levels => one possible layering is [[A, X], [B, C], [D, E, F], [G, I], [H, J], [K], [L]]", () => {
      const dag = buildSealedDAG(nodes, edges);
      const levels = [...dag.top_levels].map((l) => [...l]);
      // We won’t do an exact deepEquality check, because the order of siblings might vary.
      // But let's check a few constraints:
      const levelOf = (node: string) =>
        levels.findIndex((arr) => arr.includes(node));

      expect(levelOf("A")).toBe(0);
      expect(levelOf("X")).toBe(0);
      expect(levelOf("B")).toBe(1);
      expect(levelOf("C")).toBe(1);
      // G, I might be level 3 or so, etc.
      expect(levelOf("L")).toBeGreaterThan(levelOf("K"));
    });

    test("top_order => thorough checks", () => {
      const dag = buildSealedDAG(nodes, edges);
      const order = [...dag.top_order];

      // 1) All nodes must appear exactly once
      expect(order.length).toBe(nodes.length);
      const uniqueSet = new Set(order);
      expect(uniqueSet.size).toBe(nodes.length);

      // 2) For each edge, index(from) < index(to)
      edges.forEach(([from, to]) => {
        expect(order.indexOf(from)).toBeLessThan(order.indexOf(to));
      });
    });

    test("top_levels => thorough checks", () => {
      const dag = buildSealedDAG(nodes, edges);
      const layers = [...dag.top_levels].map(l => [...l]);

      // 3) Each node in exactly one layer
      const flattened = layers.flat();
      expect(flattened.length).toBe(nodes.length);
      const uniqueSet = new Set(flattened);
      expect(uniqueSet.size).toBe(nodes.length);

      // 4) Edge constraint: levelOf(from) < levelOf(to)
      const levelOf = (node: string) =>
        layers.findIndex(level => level.includes(node));

      edges.forEach(([from, to]) => {
        expect(levelOf(from)).toBeLessThan(levelOf(to));
      });
    });
    test("levels are as compressed as possible", () => {
      const dag = buildSealedDAG(nodes, edges);
      const levels = [...dag.top_levels].map(layer => [...layer]);

      // Manually adjust levels to make the test fail
      // Move some nodes from level 1 to a new level above it
      // if (levels.length > 1) {
      //   const nodesToMove = levels[1].splice(0, 2); // Move first two nodes from level 1
      //   levels.splice(1, 0, nodesToMove); // Insert a new level above the current level 1
      // }

      // Utility to return the level index of a given node
      const levelOf = (node: string) =>
        levels.findIndex(layer => layer.includes(node));

      // Build a quick map of each node's parents
      // (i.e., all nodes that have an edge to this node)
      const parents: Record<string, string[]> = {};
      nodes.forEach(n => (parents[n] = []));
      edges.forEach(([from, to]) => parents[to]!.push(from));

      // For each node, verify that its level is exactly
      // one more than the max level of its parents
      // If it has no parents, it should be level 0
      nodes.forEach(node => {
        const nodeLevel = levelOf(node);
        const parentLevels = parents[node]!.map(p => levelOf(p));
        const expectedLevel = parentLevels.length > 0 ? Math.max(...parentLevels) + 1 : 0;
        expect(nodeLevel).toBe(expectedLevel);
      });
    });
  });

  //
  // Benchmark 2) Even Bigger Graph (20 nodes)
  //
  describe("Large Complex Graph Benchmark #2 (20 nodes)", () => {
    // 20 distinct nodes: A..U maybe. We'll do 20, but here's 21 letters (A..U).
    // We'll just exclude 1 letter if needed. Or you can do exactly 20. 
    const nodes = [
      "A", "B", "C", "D", "E", 
      "F", "G", "H", "I", "J", 
      "K", "L", "M", "N", "O", 
      "P", "Q", "R", "S", "T", 
      "U" // Actually 21 letters, but let's keep them all for the ultimate test
    ];

    // 33 edges from the example:
    const edges: [string, string][] = [
      ["A", "D"], ["A", "E"],
      ["B", "E"], ["B", "F"],
      ["C", "F"], ["C", "G"],
      ["D", "H"], ["E", "H"], ["E", "I"],
      ["F", "I"], ["F", "J"],
      ["G", "J"], ["G", "K"],
      ["H", "L"], ["I", "L"], ["I", "M"],
      ["J", "M"], ["J", "N"],
      ["K", "N"], ["K", "O"],
      ["L", "P"], ["M", "P"], ["N", "P"],
      ["N", "Q"], ["O", "Q"],
      ["O", "R"], ["P", "R"], ["P", "S"],
      ["Q", "S"], ["R", "T"], ["S", "T"], ["S", "U"]
      // T and U are sinks, A/B/C are sources
    ];

    test("top_order => verify must follow all 33 edges", () => {
      const dag = buildSealedDAG(nodes, edges);
      const order = [...dag.top_order];

      // Let's do a quick spot check of important ordering constraints:
      expect(order.indexOf("A")).toBeLessThan(order.indexOf("D"));
      expect(order.indexOf("D")).toBeLessThan(order.indexOf("H"));
      expect(order.indexOf("H")).toBeLessThan(order.indexOf("L"));
      expect(order.indexOf("L")).toBeLessThan(order.indexOf("P"));
      expect(order.indexOf("P")).toBeLessThan(order.indexOf("S"));
      expect(order.indexOf("S")).toBeLessThan(order.indexOf("U"));
      // etc. We won't check every single one, but this confirms the structure is correct.
    });

    test("top_levels => a possible arrangement is the multi-layer layout from the example", () => {
      const dag = buildSealedDAG(nodes, edges);
      const layers = [...dag.top_levels].map((level) => [...level]);

      // Similar partial checks:
      const levelOf = (node: string) =>
        layers.findIndex((arr) => arr.includes(node));

      // A, B, C are all sources => same (lowest) level
      expect(levelOf("A")).toBe(0);
      expect(levelOf("B")).toBe(0);
      expect(levelOf("C")).toBe(0);

      // T, U are sinks => should be the highest level
      // Let's just verify they're after R, S
      expect(levelOf("T")).toBeGreaterThan(levelOf("S"));
      expect(levelOf("U")).toBeGreaterThan(levelOf("S"));
    });

    test("top_order => thorough checks", () => {
      const dag = buildSealedDAG(nodes, edges);
      const order = [...dag.top_order];

      // 1) All nodes must appear exactly once
      expect(order.length).toBe(nodes.length);
      const uniqueSet = new Set(order);
      expect(uniqueSet.size).toBe(nodes.length);

      // 2) For each edge, index(from) < index(to)
      edges.forEach(([from, to]) => {
        expect(order.indexOf(from)).toBeLessThan(order.indexOf(to));
      });
    });

    test("top_levels => thorough checks", () => {
      const dag = buildSealedDAG(nodes, edges);
      const layers = [...dag.top_levels].map(l => [...l]);

      // 3) Each node in exactly one layer
      const flattened = layers.flat();
      expect(flattened.length).toBe(nodes.length);
      const uniqueSet = new Set(flattened);
      expect(uniqueSet.size).toBe(nodes.length);

      // 4) Edge constraint: levelOf(from) < levelOf(to)
      const levelOf = (node: string) =>
        layers.findIndex(level => level.includes(node));

      edges.forEach(([from, to]) => {
        expect(levelOf(from)).toBeLessThan(levelOf(to));
      });
    });
    test("levels are as compressed as possible", () => {
      const dag = buildSealedDAG(nodes, edges);
      const levels = [...dag.top_levels].map(layer => [...layer]);

      // Manually adjust levels to make the test fail
      // Move some nodes from level 1 to a new level above it
      // if (levels.length > 1) {
      //   const nodesToMove = levels[1].splice(0, 2); // Move first two nodes from level 1
      //   levels.splice(1, 0, nodesToMove); // Insert a new level above the current level 1
      // }

      // Utility to return the level index of a given node
      const levelOf = (node: string) =>
        levels.findIndex(layer => layer.includes(node));

      // Build a quick map of each node's parents
      // (i.e., all nodes that have an edge to this node)
      const parents: Record<string, string[]> = {};
      nodes.forEach(n => (parents[n] = []));
      edges.forEach(([from, to]) => parents[to]!.push(from));

      // For each node, verify that its level is exactly
      // one more than the max level of its parents
      // If it has no parents, it should be level 0
      nodes.forEach(node => {
        const nodeLevel = levelOf(node);
        const parentLevels = parents[node]!.map(p => levelOf(p));
        const expectedLevel = parentLevels.length > 0 ? Math.max(...parentLevels) + 1 : 0;
        expect(nodeLevel).toBe(expectedLevel);
      });
    });
  });
});