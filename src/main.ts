import * as THREE from "three";
import * as CANNON from "cannon-es";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// import profpic from "../assets/profile_flower.png";
// import { asyncTextureLoad } from "./async.ts";
import { MyScreen } from "./constants.ts";
import { planeObject } from "./planeObject.ts";

const SCREEN = new MyScreen();

const SCENE = SCREEN.SCENE;
const RENDERER = SCREEN.RENDERER;
// const CAM = SCREEN.CAM as THREE.OrthographicCamera;

const CAM = (() => {
	const pcam = new THREE.PerspectiveCamera(60, SCREEN.ASPECT_RATIO);
	pcam.position.z = 10;
	const controls = new OrbitControls(pcam, RENDERER.domElement);
	controls.update();
	return pcam;
})();

const WORLD = SCREEN.WORLD;

// const profPicTexture = await asyncTextureLoad(
// 	new THREE.TextureLoader(),
// 	profpic,
// 	THREE.LinearFilter,
// 	THREE.SRGBColorSpace,
// 	RENDERER.capabilities.getMaxAnisotropy(),
// );

const cushion = new planeObject(
	1,
	1,
	{ wireframe: true },
	1,
	new CANNON.Box(
		new CANNON.Vec3(0.5, 0.5, 0.1),
	),
	false,
);
cushion.cannonBody.position.set(0, 20, 0);
SCENE.add(cushion.meshObject);
WORLD.addBody(cushion.cannonBody);

const ground = new planeObject(
	30,
	10,
	{
		wireframe: true,
		transparent: true,
		opacity: 1,
	},
	1,
	new CANNON.Box(
		new CANNON.Vec3(15, 15, 0.1),
	),
	false,
);
ground.cannonBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
ground.cannonBody.position.set(0, -cushion.side, 0);
ground.cannonBody.angularVelocity.set(0, 0, 10);
ground.cannonBody.linearDamping = 1;
SCENE.add(ground.meshObject);
WORLD.addBody(ground.cannonBody);

function animate() {
	WORLD.step(SCREEN.TIME_STEP);
	cushion.meshObject.position.copy(cushion.cannonBody.position);
	ground.meshObject.position.copy(ground.cannonBody.position);
	ground.meshObject.quaternion.copy(ground.cannonBody.quaternion);
	RENDERER.render(SCENE, CAM);
}

RENDERER.setAnimationLoop(animate);
