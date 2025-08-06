import * as THREE from "three";

export class planeObject {
	meshObject;

	constructor(
		side: number,
		segments: number,
		parameters: THREE.MeshBasicMaterialParameters,
	) {
		this.meshObject = new THREE.Mesh(
			new THREE.PlaneGeometry(side, side, segments, segments),
			new THREE.MeshBasicMaterial(parameters),
		);
		return this;
	}
}
