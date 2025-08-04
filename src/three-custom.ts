import * as THREE from "three";

export function ocamSetFrustumAndUpdate(
	ocam: THREE.OrthographicCamera,
	left: number,
	right: number,
	top: number,
	bottom: number,
): void {
	ocam.left = left;
	ocam.right = right;
	ocam.top = top;
	ocam.bottom = bottom;
	ocam.updateProjectionMatrix();
}

export function createGHelper(
	OCAM: THREE.OrthographicCamera,
): THREE.GridHelper {
	let maxdim = Math.ceil(Math.max(
		OCAM.right - OCAM.left,
		OCAM.top - OCAM.bottom,
	));
	if (!(maxdim & 1)) {
		maxdim += 1;
	}
	const ghelper = new THREE.GridHelper(maxdim, maxdim);
	ghelper.rotateX(Math.PI / 2);
	ghelper.position.z = -100;
	return ghelper;
}
