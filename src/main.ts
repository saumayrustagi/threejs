import * as THREE from "three";
import { addObjects } from "./addObjects.ts";

const aspectRatio = globalThis.innerWidth / globalThis.innerHeight;

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
renderer.setSize(globalThis.innerWidth, globalThis.innerHeight);
document.body.appendChild(renderer.domElement);

const oc_size = 3;

const ocam = new THREE.OrthographicCamera(
	-oc_size * aspectRatio,
	oc_size * aspectRatio,
	oc_size,
	-oc_size,
);
ocam.position.z = 100;

const plane = addObjects(scene);

const planeHalfWidth = plane.geometry.parameters.width / 2;
// const ocamHalfWorldWidth = (ocam.right - ocam.left) / 2;

let dir = 1;

function animate() {
	const planeRightEdge = plane.position.x + planeHalfWidth;
	const planeLeftEdge = plane.position.x - planeHalfWidth;

	const cameraRightBoundary = 3.5;
	const cameraLeftBoundary = -3.5;

	if (planeRightEdge >= cameraRightBoundary) {
		plane.position.x = cameraRightBoundary - planeHalfWidth; // Snap to the edge
		dir *= -1;
	} else if (planeLeftEdge <= cameraLeftBoundary) {
		plane.position.x = cameraLeftBoundary + planeHalfWidth; // Snap to the edge
		dir *= -1;
	}

	plane.position.x += dir * 0.1; // Continue moving if within boundaries
	renderer.render(scene, ocam);
}

renderer.setAnimationLoop(animate);
