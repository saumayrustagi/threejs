import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// import profpic from "../assets/profile_flower.png";
// import { asyncTextureLoad } from "./async.ts";
import { MyScreen } from "./constants.ts";
import { planeObject } from "./object.ts";

const SCREEN = new MyScreen();

const SCENE = SCREEN.SCENE;
const RENDERER = SCREEN.RENDERER;
// const CAM = SCREEN.CAM as THREE.OrthographicCamera;

const CAM = (() => {
	const pcam = new THREE.PerspectiveCamera(60, SCREEN.ASPECT_RATIO);
	pcam.position.z = 2;
	const controls = new OrbitControls(pcam, RENDERER.domElement);
	controls.update();
	return pcam;
})();

// const profPicTexture = await asyncTextureLoad(
// 	new THREE.TextureLoader(),
// 	profpic,
// 	THREE.LinearFilter,
// 	THREE.SRGBColorSpace,
// 	RENDERER.capabilities.getMaxAnisotropy(),
// );

const cushion = new planeObject(1, 1, { wireframe: true });
SCENE.add(cushion.meshObject);

const ground = new planeObject(30, 10, {
	wireframe: true,
	transparent: true,
	opacity: 0.1,
});
ground.meshObject.rotation.x = Math.PI / 2;
ground.meshObject.position.y = -cushion.side / 2;
SCENE.add(ground.meshObject);

function animate() {
	RENDERER.render(SCENE, CAM);
}

RENDERER.setAnimationLoop(animate);
