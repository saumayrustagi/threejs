import * as THREE from "three";
import profpic from "../assets/profile_flower.png";
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const ASPECT_RATIO = globalThis.innerWidth / globalThis.innerHeight;

const SCENE = new THREE.Scene();

const RENDERER = (() => {
	const renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setPixelRatio(globalThis.devicePixelRatio);
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

// const PCAM = (() => {
// 	const pcam = new THREE.PerspectiveCamera(60, ASPECT_RATIO);
// 	pcam.position.z = 5;
// 	const controls = new OrbitControls(pcam, RENDERER.domElement);
// 	controls.update();
// 	return pcam;
// })();

const profpicTexture = (() => {
	const textureLoader = new THREE.TextureLoader();
	const picTexture = textureLoader.load(profpic);
	picTexture.colorSpace = THREE.SRGBColorSpace;
	picTexture.anisotropy = RENDERER.capabilities.getMaxAnisotropy();
	return picTexture;
})();

const cushion = new THREE.Mesh(
	new THREE.PlaneGeometry(),
	new THREE.MeshBasicMaterial({
		map: profpicTexture,
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
