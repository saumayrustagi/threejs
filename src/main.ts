import * as THREE from "three";
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import profpic from "../assets/profile_flower.png";
import { asyncTextureLoad } from "./async.ts";

const ASPECT_RATIO = globalThis.innerWidth / globalThis.innerHeight;

const SCENE = new THREE.Scene();

const RENDERER = (() => {
	const renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setPixelRatio(globalThis.devicePixelRatio);
	renderer.setSize(globalThis.innerWidth, globalThis.innerHeight);
	renderer.outputColorSpace = THREE.SRGBColorSpace;
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

const profpicTexture = await (async () => {
	const textureLoader = new THREE.TextureLoader();
	const picTexture = await asyncTextureLoad(textureLoader, profpic);
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
		ghelper.position.z = -100;
		return ghelper;
	})(),
);

((cushion) => {
	const mousePositionNDC = new THREE.Vector2(-1, 1);
	const rayCaster = new THREE.Raycaster();
	// const cushionHalfSide = (cushion.geometry.parameters.width) / 2;

	// let cushionLeftEdge = cushion.position.x - cushionHalfSide;
	// let cushionBottomEdge = cushion.position.y - cushionHalfSide;

	// let dragging = false;
	// let in_cushion = false;

	// EVENT HANDLERS
	((mousePositionNDC) => {
		globalThis.addEventListener("mousemove", (e) => {
			mousePositionNDC.x = (e.clientX / globalThis.innerWidth) * 2 - 1;
			mousePositionNDC.y = (e.clientY / globalThis.innerHeight) * -2 + 1;
		});
	})(mousePositionNDC);

	// ANIMATION
	function animate() {
		rayCaster.setFromCamera(mousePositionNDC, OCAM);
		const instersects = rayCaster.intersectObjects(SCENE.children);
		instersects.forEach((obj) => {
			if (obj.object.id === cushion.id) {
				console.log("IN SQUARE");
			}
		});

		RENDERER.render(SCENE, OCAM);
	}

	RENDERER.setAnimationLoop(animate);
})(cushion);
