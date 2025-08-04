import * as THREE from "three";

export function ocamSetFrustumAndUpdate(
	ocam: THREE.OrthographicCamera,
	left: number,
	right: number,
	top: number,
	bottom: number,
) {
	ocam.left = left;
	ocam.right = right;
	ocam.top = top;
	ocam.bottom = bottom;
	ocam.updateProjectionMatrix();
}
