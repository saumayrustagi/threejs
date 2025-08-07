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
	pcam.position.z = 5;
	pcam.position.y = 0;
	// pcam.lookAt(0, 1, 1);
	const controls = new OrbitControls(pcam, RENDERER.domElement);
	// controls.target = new THREE.Vector3(0, 10, 0);
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
		8,
		{ wireframe: true },
		1,
		new CANNON.Box(
			new CANNON.Vec3(0.5, 0.5, 0.1),
		),
		false,
	);
	cushion.cannonBody.position.set(0, 5, 0);
	return cushion;
})();

const Nx = cushion.segments;
const Ny = Nx;
const dist = cushion.side / Nx;

const mass = 1;
const shape = new CANNON.Particle();

const particles: CANNON.Body[][] = [];

// CREATE PARTICLE BODIES
for (let i = 0; i < Nx + 1; i++) {
	particles.push([]);
	for (let j = 0; j < Ny + 1; j++) {
		const particle = new CANNON.Body({
			mass: mass,
			shape: shape,
			position: new CANNON.Vec3(
				(i - Nx * 0.5) * dist,
				(j - Ny * 0.5) * dist,
				0,
			),
		});
		WORLD.addBody(particle);
		particles[i].push(particle);
	}
}

function add_constraint(p1: CANNON.Body, p2: CANNON.Body) {
	WORLD.addConstraint(new CANNON.DistanceConstraint(p1, p2, dist));
}

// CONNECT PARTICLES
for (let i = 0; i < Nx + 1; i++) {
	for (let j = 0; j < Ny + 1; j++) {
		if (i < Nx) {
			add_constraint(particles[i][j], particles[i + 1][j]);
		}
		if (j < Ny) {
			add_constraint(particles[i][j], particles[i][j + 1]);
		}
	}
}

// UPDATE MESH FROM PARTICLES
function updateParticles() {
	for (let i = 0; i < Nx + 1; i++) {
		for (let j = 0; j < Ny + 1; j++) {
			const index = j * (Nx + 1) + i;

			const particlePosition = particles[i][Ny - j].position;

			const positionAttribute =
				(cushion.meshObject.geometry as THREE.PlaneGeometry).attributes
					.position;

			positionAttribute.setXYZ(
				index,
				particlePosition.x,
				particlePosition.y,
				particlePosition.z,
			);

			positionAttribute.needsUpdate = true;
		}
	}
}

// const arr = (cushion.meshObject.geometry as THREE.PlaneGeometry).attributes
// 	.position.array;
// for (
// 	let i = 0;
// 	i <
// 		(cushion.meshObject.geometry as THREE.PlaneGeometry).attributes
// 			.position.count;
// 	i += 3
// ) {
// 	console.log(arr[i], arr[i + 1], arr[i + 2]);
// }

// for (let i = 0; i < Nx + 1; i++) {
// 	for (let j = 0; j < Ny + 1; j++) {
// 		WORLD.addBody(particles[i][j]);
// 	}
// }

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

planeObjects.push(cushion, ground);
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

copyMeshFromBody(planeObjects);

function animate() {
	WORLD.step(SCREEN.TIME_STEP / 4);
	copyMeshFromBody(planeObjects);
	updateParticles();
	RENDERER.render(SCENE, CAM);
}

RENDERER.setAnimationLoop(animate);
