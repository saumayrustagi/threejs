import * as THREE from "three";

const ASPECT_RATIO = globalThis.innerWidth / globalThis.innerHeight;

const SCENE = new THREE.Scene();

const RENDERER = (() => {
	const renderer = new THREE.WebGLRenderer();
	renderer.setSize(globalThis.innerWidth, globalThis.innerHeight);
	document.body.appendChild(renderer.domElement);
	return renderer;
})();

const OCAM = (() => {
	const oc_size = 3;
	const ocam = new THREE.OrthographicCamera(
		-oc_size * ASPECT_RATIO,
		oc_size * ASPECT_RATIO,
		oc_size,
		-oc_size,
	);
	ocam.position.z = 100;
	return ocam;
})();

((plane) => {
	SCENE.add(
		plane,
		(() => {
			const ghelper = new THREE.GridHelper(
				OCAM.right - OCAM.left,
				OCAM.right - OCAM.left,
			);
			ghelper.rotateX(Math.PI / 2);
			return ghelper;
		})(),
	);

	const planeHalfWidth = plane.geometry.parameters.width / 2;
	let dir = 1;
	const cameraRightBoundary = OCAM.right;
	const cameraLeftBoundary = OCAM.left;

	function animate() {
		const planeRightEdge = plane.position.x + planeHalfWidth;
		const planeLeftEdge = plane.position.x - planeHalfWidth;

		if (planeRightEdge >= cameraRightBoundary) {
			plane.position.x = cameraRightBoundary - planeHalfWidth;
			dir *= -1;
		} else if (planeLeftEdge <= cameraLeftBoundary) {
			plane.position.x = cameraLeftBoundary + planeHalfWidth;
			dir *= -1;
		}

		plane.position.x += dir * 0.1; // Continue moving if within boundaries
		RENDERER.render(SCENE, OCAM);
	}

	RENDERER.setAnimationLoop(animate);
})(
	new THREE.Mesh(
		new THREE.PlaneGeometry(),
		new THREE.MeshBasicMaterial({
			color: 0xff0000,
			side: THREE.DoubleSide,
		}),
	),
);
