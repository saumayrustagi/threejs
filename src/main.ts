import * as THREE from "three";
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import profpic from "../assets/profile_flower.png";
import { asyncTextureLoad } from "./async.ts";
import { MyScreen } from "./constants.ts";

const SCREEN = new MyScreen();

const SCENE = SCREEN.SCENE;
const RENDERER = SCREEN.RENDERER;
const OCAM = SCREEN.CAM as THREE.OrthographicCamera;

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

SCENE.add(
	cushion,
);

function animate() {
	RENDERER.render(SCENE, OCAM);
}

RENDERER.setAnimationLoop(animate);
