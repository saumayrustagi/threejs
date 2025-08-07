import * as THREE from "three";
import * as CANNON from "cannon-es";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import profpic from "../assets/profile_flower.png";
import { asyncTextureLoad } from "./async.ts";
import { MyScreen } from "./constants.ts";
import { CannonPlane, Cushion } from "./cannonObjects.ts";

const SCREEN = new MyScreen();

const SCENE = SCREEN.SCENE;
const RENDERER = SCREEN.RENDERER;
// const CAM = SCREEN.CAM as THREE.OrthographicCamera;

const CAM = (() => {
	const pcam = new THREE.PerspectiveCamera(60, SCREEN.ASPECT_RATIO);
	pcam.position.z = 3;
	const controls = new OrbitControls(pcam, RENDERER.domElement);
	controls.update();
	return pcam;
})();

const WORLD = SCREEN.WORLD;

const cushion = (() => {
	const cushion = new Cushion();
	cushion.createParticles(WORLD);
	cushion.connectParticles(WORLD);
	return cushion;
})();

SCENE.add(cushion.meshObject);

(() => {
	const ground = new CannonPlane(
		new CANNON.Vec3(0, -cushion.side, 0),
		new CANNON.Quaternion().setFromEuler(-Math.PI / 2, 0, 0),
	);
	const backWall = new CannonPlane(
		new CANNON.Vec3(0, 0, -0.01),
	);
	const frontWall = new CannonPlane(
		new CANNON.Vec3(0, 0, 0.01),
		new CANNON.Quaternion().setFromEuler(Math.PI, 0, 0),
	);

	for (
		const body of [
			backWall.cannonBody,
			frontWall.cannonBody,
			ground.cannonBody,
		]
	) {
		WORLD.addBody(body);
	}
})();

function animate() {
	cushion.updateParticles();
	WORLD.step(SCREEN.TIME_STEP);
	RENDERER.render(SCENE, CAM);
}

RENDERER.setAnimationLoop(animate);

await (async () => {
	const cushionMaterial = cushion.meshObject
		.material as THREE.MeshBasicMaterial;
	const profPicTexture = await asyncTextureLoad(
		new THREE.TextureLoader(),
		profpic,
		THREE.LinearFilter,
		THREE.SRGBColorSpace,
		RENDERER.capabilities.getMaxAnisotropy(),
	);
	cushionMaterial.map = profPicTexture;
	cushionMaterial.wireframe = false;
	cushionMaterial.needsUpdate = true;
})();
