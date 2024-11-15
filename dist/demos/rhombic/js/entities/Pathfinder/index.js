
export default class Pathfinder {
    constructor(cave, nodes) {
        this.cave = cave;
        
        this.nodes = nodes.map(
            (node, idx) => new PFNode(this, node, idx)
        );

        this.nodes.forEach(node => node.initEdges());
    }

    // algorithm adapted from pseudocode here:
    // https://briangrinstead.com/blog/astar-search-algorithm-in-javascript/
    pathfind(from, to) {
        // init start/end point as a tmp node,
        // find closest node(s) add as edges
        // N.B. for now assume @from is a node
        const start = this.getClosestNode(from);
        const end = this.getClosestNode(to);

        const openheap = new PFHeap();
        const closed = [];

        // reset this incase it was set from last time
        start.parent = null;
        openheap.add(start);

        while (openheap.size) {
            //console.log(openheap.values.map(({idx}) => idx).join(','))
            const current = openheap.extract();

            if (current === end) {
                let cursor = current;
                const retval = [cursor];

                while (cursor.parent) {
                    retval.push(cursor.parent);
                    cursor = cursor.parent;
                }

                return retval.reverse();
            }

            closed.push(current);

            current.edges.forEach(
                edge => {
                    if (!closed.includes(edge.B)) {
                        const g = current.g + edge.size;

                        if (!openheap.includes(edge.B)) {
                            openheap.add(edge.B);

                            // by not setting h we are effectively using
                            // dijkstra's rather than A*
                            // if a better heuristic can be found we might
                            // be able to go back to A*
                            //edge.B.h = edge.B.position.distanceTo(end.position);

                            edge.B.g = g;
                            edge.B.parent = current;
                        } else if (g < edge.B.g) {
                            edge.B.g = g;
                            edge.B.parent = current;
                        }
                    }
                }
            )
        }

        // failure case, couldn't find a path
        console.error('pathfinding failed:', from, '->', to);
        console.log(closed.map(({idx})=>idx));
        return [];
    }

    getClosestNode(position) {
        let closest = null;
        let minDistance = Infinity;
        for (let i = 0; i < this.nodes.length; i++) {
            const node = this.nodes[i];
            const distance = position.distanceToSquared(node.position);

            if (distance < minDistance) {
                closest = node;
                minDistance = distance;
            }
        }

        return closest;
    }
}


class PFNode {
    idx = null;

    g = 0;
    h = 0;
    get f() { return this.g + this.h; }

    parent = null;

    constructor(finder, data, idx) {
        this.finder = finder;
        this.idx = idx;

        this.position = data.posn.clone();
        this.normal = data.normal.clone();

        this._rawData = data;
        this._rawEdges = data.edges;

        this.edges = [];
    }

    initEdges() {
        this._rawEdges.forEach(
            rawEdge => {
                this.finder.nodes.forEach(
                    node => {
                        if (node._rawData === rawEdge) {
                            this.edges.push(
                                new PFEdge(
                                    this,
                                    node
                                )
                            );
                            if (!node.edges.find(({B}) => B === this)) {
                                node.edges.push(
                                    new PFEdge(
                                        node,
                                        this,
                                    )
                                );
                            }
                        }
                    }
                );
            }
        );
        delete this._rawData;
        delete this._rawEdges;
    }
}

class PFEdge {
    constructor(nodeA, nodeB) {
        this.A = nodeA;
        this.B = nodeB;

        this.size = nodeA.position.distanceTo(nodeB.position);
    }
}

// ~~stolen shamelessly~~ adapted from:
// https://www.digitalocean.com/community/tutorials/js-binary-heaps
class PFHeap {
    constructor() {
        this.values = [];
    }
    get size() {
        return this.values.length;
    }
    includes(node) {
        return this.values.includes(node);
    }
    add(newnode) {
        this.values.push(newnode);
        let idx = this.values.length - 1;
        const current = this.values[idx];

        while (idx > 0) {
            const parentIdx = Math.floor((idx - 1) / 2);
            const parent = this.values[parentIdx];

            if (parent.f <= current.f) {
                this.values[parentIdx] = current;
                this.values[idx] = parent;
                idx = parentIdx;
            } else break;
        }
    }
    extract() {
        const min = this.values[0];
        const end = this.values.pop();
        const length = this.values.length;

        if (length) {
            this.values[0] = end;

            let idx = 0;
            const current = this.values[0];

            while (true) {
                const leftIdx = 2 * idx + 1;
                const rightIdx = 2 * idx + 2;

                let left, right;
                let swap = null;

                if (leftIdx < length) {
                    left = this.values[leftIdx];
                    if (left.f < current.f) {
                        swap = leftIdx;
                    }
                }
                if (rightIdx < length) {
                    right = this.values[rightIdx];
                    if (
                        (swap === null && right.f < current.f)
                        || (swap !== null && right.f < left.f)
                    ) {
                        swap = rightIdx;
                    }
                }

                if (swap === null) break;
                this.values[idx] = this.values[swap];
                this.values[swap] = current;
                idx = swap;
            }
        }

        return min;
    }
}