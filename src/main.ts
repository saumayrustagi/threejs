import * as THREE from "three";
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import profpic from "../assets/profile_flower.png";
import { asyncTextureLoad } from "./async.ts";
import "./three-custom.ts";

const SCENE = new THREE.Scene();

let ASPECT_RATIO = globalThis.innerWidth / globalThis.innerHeight;

const RENDERER = (() => {
	const renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setPixelRatio(globalThis.devicePixelRatio);
	renderer.setSize(globalThis.innerWidth, globalThis.innerHeight);
	renderer.outputColorSpace = THREE.SRGBColorSpace;
	document.body.appendChild(renderer.domElement);
	return renderer;
})();

const OC_SIZE = 3;
const OCAM = (() => {
	const ocam = new THREE.OrthographicCamera();
	ocam.setFrustumAndUpdate(
		-OC_SIZE * ASPECT_RATIO,
		OC_SIZE * ASPECT_RATIO,
		OC_SIZE,
		-OC_SIZE,
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

globalThis.addEventListener("resize", () => {
	ASPECT_RATIO = globalThis.innerWidth / globalThis.innerHeight;
	RENDERER.setSize(globalThis.innerWidth, globalThis.innerHeight);
	OCAM.setFrustumAndUpdate(
		-OC_SIZE * ASPECT_RATIO,
		OC_SIZE * ASPECT_RATIO,
		OC_SIZE,
		-OC_SIZE,
	);
});

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
		let maxdim = Math.ceil(Math.max(
			OCAM.right - OCAM.left,
			OCAM.top - OCAM.bottom,
		));
		if (!(maxdim & 1)) {
			maxdim += 1;
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

(() => {
	const mousePositionNDC2D = new THREE.Vector2(-1, 1);
	const objPosNDC2D = new THREE.Vector2();
	const relativeNDC2D = new THREE.Vector2();
	const newObjPosNDC2D = new THREE.Vector2();

	const rayCaster = new THREE.Raycaster();

	let dragging = false;
	let in_cushion = false;

	// EVENT HANDLERS
	(() => {
		globalThis.addEventListener("mousemove", (e) => {
			mousePositionNDC2D.set(
				(e.clientX / globalThis.innerWidth) * 2 - 1,
				-(e.clientY / globalThis.innerHeight) * 2 + 1,
			);
		});

		globalThis.addEventListener("mousedown", () => {
			if (in_cushion) {
				dragging = true;
				relativeNDC2D.subVectors(mousePositionNDC2D, objPosNDC2D);
			}
		});

		globalThis.addEventListener("mouseup", () => {
			dragging = false;
		});
	})();

	const cushionPositionClone = new THREE.Vector3();
	const projectedPosition = new THREE.Vector3();
	// ANIMATION
	function animate() {
		cushionPositionClone.copy(cushion.position).project(
			OCAM,
		);
		objPosNDC2D.set(cushionPositionClone.x, cushionPositionClone.y);

		// Set in_cushion
		rayCaster.setFromCamera(mousePositionNDC2D, OCAM);
		const instersects = rayCaster.intersectObjects(SCENE.children);
		for (const obj of instersects) {
			if (obj.object.id === cushion.id) {
				in_cushion = true;
				break;
			}
		}

		if (dragging) {
			newObjPosNDC2D.subVectors(mousePositionNDC2D, relativeNDC2D);
			projectedPosition.set(
				newObjPosNDC2D.x,
				newObjPosNDC2D.y,
				0,
			).unproject(OCAM);
			cushion.position.x = projectedPosition.x;
			cushion.position.y = projectedPosition.y;
		}

		RENDERER.render(SCENE, OCAM);
	}

	RENDERER.setAnimationLoop(animate);
})();
