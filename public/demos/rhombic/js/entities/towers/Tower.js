import * as THREE from 'three';



export default class Tower {
    constructor(cavecell) {
        this.cavecell = cavecell;

        this.placeInCell();

        this.#getMesh();
    }

    tick(dt) {

    }

    #getMesh() {
        this.mesh = new THREE.Object3D();
    }

    placeInCell() {
        const { centre, normal } = this.cavecell;

        this.position = new THREE.Vector3().copy(centre);
        this.normal = new THREE.Vector3().copy(normal);
    }

    getPathToTower(othertower) {
        const cellpoints = this.cavecell.getPathTo(othertower.cavecell).reverse();

        const points = this.pointsOutbound(cellpoints[0]);

        points.push(...cellpoints);

        points.push(
            ...othertower.pointsInbound(cellpoints[cellpoints.length - 1])
        );

        return points;
    }

    pointsOutbound(entrance) {
        return [
            this.position.clone(),
            this.normal.clone().multiplyScalar(3).add(this.position)
        ];
    }

    pointsInbound(entrance) {
        return [
            this.normal.clone().multiplyScalar(3).add(this.position),
            this.position.clone()
        ];
    }
}