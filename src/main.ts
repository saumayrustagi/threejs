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

const cushion = new THREE.Mesh(
	new THREE.PlaneGeometry(),
	new THREE.MeshBasicMaterial({
		color: 0xff0000,
		side: THREE.DoubleSide,
	}),
);

SCENE.add(
	cushion,
	(() => {
		let maxdim = Math.max(
			OCAM.right - OCAM.left,
			OCAM.top - OCAM.bottom,
		);
		if (!(maxdim & 1)) {
			maxdim = Math.ceil(maxdim);
		}

		const ghelper = new THREE.GridHelper(
			maxdim,
			maxdim,
		);
		ghelper.rotateX(Math.PI / 2);
		return ghelper;
	})(),
);

// ANIMATION
(() => {
	const planeHalfWidth = (cushion.geometry.parameters.width) / 2;
	let dir = 1;

	function animate() {
		const planeRightEdge = cushion.position.x + planeHalfWidth;
		const planeLeftEdge = cushion.position.x - planeHalfWidth;

		if (planeRightEdge >= OCAM.right) {
			cushion.position.x = OCAM.right - planeHalfWidth;
			dir *= -1;
		} else if (planeLeftEdge <= OCAM.left) {
			cushion.position.x = OCAM.left + planeHalfWidth;
			dir *= -1;
		}

		cushion.position.x += dir * 0.1;
		RENDERER.render(SCENE, OCAM);
	}

	RENDERER.setAnimationLoop(animate);
})();
