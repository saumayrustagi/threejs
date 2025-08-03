import * as THREE from "three";

export function addObjects(scene: THREE.Scene) {
	const plane = new THREE.Mesh(
		new THREE.PlaneGeometry(),
		new THREE.MeshBasicMaterial({
			color: 0xff0000,
			side: THREE.DoubleSide,
		}),
	);
	scene.add(plane);

	const ghelper = new THREE.GridHelper(
		11,
		11,
	);
	ghelper.rotateX(Math.PI / 2);
	scene.add(ghelper);

	return plane;
}
