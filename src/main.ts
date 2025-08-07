import * as THREE from "three";
import * as CANNON from "cannon-es";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// import profpic from "../assets/profile_flower.png";
// import { asyncTextureLoad } from "./async.ts";
import { MyScreen } from "./constants.ts";
// import { planeObject } from "./planeObject.ts";
import { cannonPlane } from "./cannonPlane.ts";

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

const cushion = (() => {
	const cushion = new THREE.Mesh(
		new THREE.PlaneGeometry(1, 1, 15, 15),
		new THREE.MeshBasicMaterial({
			wireframe: true,
			// transparent: true,
			// opacity: 1,
		}),
	);
	return cushion;
})();

SCENE.add(cushion);

const Nx = cushion.geometry.parameters.widthSegments;
const Ny = Nx;
const dist = cushion.geometry.parameters.width / Nx;
const diagonalDistance = dist * Math.SQRT2;
const bendDistance = dist * 2;

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
				((j - Ny * 0.5) * dist) + 2,
				0,
			),
		});
		WORLD.addBody(particle);
		particles[i].push(particle);
	}
}

function add_constraint(p1: CANNON.Body, p2: CANNON.Body, dist: number) {
	WORLD.addConstraint(new CANNON.DistanceConstraint(p1, p2, dist));
}

// CONNECT PARTICLES
for (let i = 0; i < Nx + 1; i++) {
	for (let j = 0; j < Ny + 1; j++) {
		if (i < Nx) {
			add_constraint(particles[i][j], particles[i + 1][j], dist);
		}
		if (j < Ny) {
			add_constraint(particles[i][j], particles[i][j + 1], dist);
		}
		if (i < Nx && j < Ny) {
			add_constraint(
				particles[i][j],
				particles[i + 1][j + 1],
				diagonalDistance,
			);
			add_constraint(
				particles[i + 1][j],
				particles[i][j + 1],
				diagonalDistance,
			);
		}
		if (i < Nx - 1) {
			add_constraint(
				particles[i][j],
				particles[i + 2][j],
				bendDistance,
			);
		}
		if (j < Ny - 1) {
			add_constraint(
				particles[i][j],
				particles[i][j + 2],
				bendDistance,
			);
		}
	}
}
add_constraint(
	particles[0][0],
	particles[Nx][Ny],
	cushion.geometry.parameters.width * Math.SQRT2,
);

add_constraint(
	particles[0][0],
	particles[0][Ny],
	cushion.geometry.parameters.width,
);

add_constraint(
	particles[0][0],
	particles[Nx][0],
	cushion.geometry.parameters.width,
);

add_constraint(
	particles[0][Ny],
	particles[Nx][Ny],
	cushion.geometry.parameters.width,
);
add_constraint(
	particles[0][Ny],
	particles[Nx][0],
	cushion.geometry.parameters.width * Math.SQRT2,
);
add_constraint(
	particles[Nx][Ny],
	particles[Nx][0],
	cushion.geometry.parameters.width,
);

// UPDATE MESH FROM PARTICLES
function updateParticles() {
	for (let i = 0; i < Nx + 1; i++) {
		for (let j = 0; j < Ny + 1; j++) {
			const index = j * (Nx + 1) + i;

			const particlePosition = particles[i][Ny - j].position;

			const positionAttribute = cushion.geometry.attributes.position;

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

const ground = new cannonPlane(
	new CANNON.Vec3(0, -cushion.geometry.parameters.width, 0),
	new CANNON.Quaternion().setFromEuler(-Math.PI / 2, 0, 0),
);
const backWall = new cannonPlane(
	new CANNON.Vec3(0, 0, -0.01),
);
const frontWall = new cannonPlane(
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
	updateParticles();
	WORLD.step(SCREEN.TIME_STEP);
	RENDERER.render(SCENE, CAM);
}

RENDERER.setAnimationLoop(animate);
