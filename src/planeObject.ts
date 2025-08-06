import * as THREE from "three";
import * as CANNON from "cannon-es";

export class planeObject {
	// THREE
	meshObject: THREE.Mesh;
	side: number;
	segments: number;

	// CANNON
	cannonBody: CANNON.Body;
	shape: CANNON.Shape;
	mass: number;
	isStatic: boolean;

	constructor(
		side: number,
		segments: number,
		parameters: THREE.MeshBasicMaterialParameters,
		mass: number,
		shape: CANNON.Shape,
		isStatic: boolean,
	) {
		// THREE
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

		// CANNON
		this.mass = mass;
		this.shape = shape;
		this.isStatic = isStatic;
		this.cannonBody = new CANNON.Body({
			mass: this.mass,
			shape: this.shape,
		});
		if (this.isStatic) {
			this.cannonBody.type = CANNON.Body.STATIC;
		}

		return this;
	}
}
