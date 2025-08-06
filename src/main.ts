import * as THREE from "three";
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import profpic from "../assets/profile_flower.png";
import { asyncTextureLoad } from "./async.ts";
import { createGHelper, ocamSetFrustumAndUpdate } from "./three-custom.ts";

const SCENE = new THREE.Scene();

let ASPECT_RATIO = 0;

const RENDERER = (() => {
	const renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setPixelRatio(globalThis.devicePixelRatio);
	renderer.outputColorSpace = THREE.SRGBColorSpace;
	document.body.appendChild(renderer.domElement);
	return renderer;
})();

const OC_SIZE = 3;
const OCAM = (() => {
	const ocam = new THREE.OrthographicCamera();
	ocam.position.z = 100;
	return ocam;
})();

let contraintHalfWidth = 0;

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
	picTexture.minFilter = THREE.LinearFilter;
	picTexture.colorSpace = THREE.SRGBColorSpace;
	picTexture.anisotropy = RENDERER.capabilities.getMaxAnisotropy();
	return picTexture;
})();

const cushion = new THREE.Mesh(
	new THREE.PlaneGeometry(0.99, 0.99),
	new THREE.MeshBasicMaterial({
		map: profpicTexture,
	}),
);
const cushionHalfSide = cushion.geometry.parameters.width / 2;

// We want that "drop" effect
// const maxY = OC_SIZE - cushionHalfSide;

let ghelper = createGHelper(OCAM);

SCENE.add(
	cushion,
	ghelper,
);

handleResize();

let minX = -contraintHalfWidth + cushionHalfSide;
let maxX = contraintHalfWidth - cushionHalfSide;
let minY = -OC_SIZE + cushionHalfSide;

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
		in_cushion = false;
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

			cushion.position.x = Math.min(
				Math.max(projectedPosition.x, minX),
				maxX,
			);

			cushion.position.y = Math.max(projectedPosition.y, minY);
		}

		RENDERER.render(SCENE, OCAM);
	}

	RENDERER.setAnimationLoop(animate);
})();

globalThis.addEventListener("resize", handleResize);

function handleResize() {
	ASPECT_RATIO = globalThis.innerWidth / globalThis.innerHeight;

	RENDERER.setSize(globalThis.innerWidth, globalThis.innerHeight);

	ocamSetFrustumAndUpdate(
		OCAM,
		-OC_SIZE * ASPECT_RATIO,
		OC_SIZE * ASPECT_RATIO,
		OC_SIZE,
		-OC_SIZE,
	);

	contraintHalfWidth = OC_SIZE * (ASPECT_RATIO / 2);
	minX = -contraintHalfWidth + cushionHalfSide;
	maxX = contraintHalfWidth - cushionHalfSide;
	minY = -OC_SIZE + cushionHalfSide;

	SCENE.remove(ghelper);
	ghelper.dispose();
	ghelper = createGHelper(OCAM);
	SCENE.add(ghelper);
}
