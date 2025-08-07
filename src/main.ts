import * as THREE from "three";
import * as CANNON from "cannon-es";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// import profpic from "../assets/profile_flower.png";
// import { asyncTextureLoad } from "./async.ts";
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
WORLD.solver = (() => {
	const solver = new CANNON.GSSolver();
	solver.iterations = 60;
	return solver;
})();

// const profPicTexture = await asyncTextureLoad(
// 	new THREE.TextureLoader(),
// 	profpic,
// 	THREE.LinearFilter,
// 	THREE.SRGBColorSpace,
// 	RENDERER.capabilities.getMaxAnisotropy(),
// );

const cushion = new Cushion();

SCENE.add(cushion.meshObject);

cushion.createParticles();
for (const row of cushion.particles) {
	for (const particle of row) {
		WORLD.addBody(particle);
	}
}
cushion.connectParticles();
for (const constraint of cushion.constraints) {
	WORLD.addConstraint(constraint);
}

const ground = new CannonPlane(
	new CANNON.Vec3(
		0,
		-(cushion.meshObject.geometry as THREE.PlaneGeometry).parameters.width,
		0,
	),
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
	const body of [backWall.cannonBody, frontWall.cannonBody, ground.cannonBody]
) {
	WORLD.addBody(body);
}

// ground.meshObject.position.copy(ground.cannonBody.position);
// ground.meshObject.quaternion.copy(ground.cannonBody.quaternion);
// SCENE.add(ground.meshObject);

function animate() {
	cushion.updateParticles();
	WORLD.step(SCREEN.TIME_STEP);
	RENDERER.render(SCENE, CAM);
}

RENDERER.setAnimationLoop(animate);
