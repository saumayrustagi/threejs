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

const planeObjects: planeObject[] = [];

const cushion = (() => {
	const cushion = new planeObject(
		1,
		1,
		{ wireframe: true },
		1,
		new CANNON.Box(
			new CANNON.Vec3(0.5, 0.5, 1),
		),
		false,
	);
	cushion.cannonBody.position.set(0, 10, 0);
	return cushion;
})();
planeObjects.push(cushion);

const ground = (() => {
	const ground = new planeObject(
		30,
		10,
		{
			wireframe: true,
			transparent: true,
			opacity: 1,
		},
		0,
		new CANNON.Box(
			new CANNON.Vec3(15, 15, 0.01),
		),
		true,
	);
	ground.cannonBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
	ground.cannonBody.position.set(0, -cushion.side, 0);
	ground.cannonBody.linearDamping = 1;
	return ground;
})();
planeObjects.push(ground);

for (const object of planeObjects) {
	SCENE.add(object.meshObject);
	WORLD.addBody(object.cannonBody);
}

function copyMeshFromBody(planeObjects: planeObject[]) {
	for (const object of planeObjects) {
		object.meshObject.position.copy(object.cannonBody.position);
		object.meshObject.quaternion.copy(object.cannonBody.quaternion);
	}
}

function animate() {
	WORLD.step(SCREEN.TIME_STEP);
	copyMeshFromBody(planeObjects);
	RENDERER.render(SCENE, CAM);
}

RENDERER.setAnimationLoop(animate);
