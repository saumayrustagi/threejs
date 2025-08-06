import * as THREE from "three";

export class planeObject {
	meshObject;
	side;
	segments;

	constructor(
		side: number,
		segments: number,
		parameters: THREE.MeshBasicMaterialParameters,
	) {
		this.side = side;
		this.segments = segments;
		this.meshObject = new THREE.Mesh(
			new THREE.PlaneGeometry(
				this.side,
				this.side,
				this.segments,
				this.segments,
			),
			new THREE.MeshBasicMaterial(parameters),
		);
		return this;
	}
}
