import * as THREE from "three";

THREE.OrthographicCamera.prototype.setFrustumAndUpdate = function (
	left: number,
	right: number,
	top: number,
	bottom: number,
) {
	this.left = left;
	this.right = right;
	this.top = top;
	this.bottom = bottom;
	this.updateProjectionMatrix;
};
