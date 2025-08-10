import * as THREE from "three";
import * as CANNON from "cannon-es";
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import profpic from "../assets/profile_flower.png";
import { asyncTextureLoad } from "./async.ts";
import { MyScreen } from "./constants.ts";
import { CannonPlane, Cushion } from "./cannonObjects.ts";

const SCREEN = new MyScreen();

const SCENE = SCREEN.SCENE;
const RENDERER = SCREEN.RENDERER;
const CAM = SCREEN.CAM as THREE.OrthographicCamera;

// const CAM = (() => {
// 	const pcam = new THREE.PerspectiveCamera(60, SCREEN.ASPECT_RATIO);
// 	pcam.position.z = 3;
// 	const controls = new OrbitControls(pcam, RENDERER.domElement);
// 	controls.update();
// 	return pcam;
// })();

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
	for (
		const body of [
			ground.cannonBody,
		]
	) {
		WORLD.addBody(body);
	}
})();

(() => {
	const mousePosition = new THREE.Vector2();
	const raycaster = new THREE.Raycaster();
	let initialIntersection: undefined | THREE.Intersection = undefined;

	let selectedConstraints: CANNON.PointToPointConstraint[] = [];
	let selectedMouseBodies: CANNON.Body[] = [];
	let originalPositions: CANNON.Vec3[] = [];

	globalThis.addEventListener("mousedown", (e) => {
		mousePosition.set(
			(e.clientX / globalThis.innerWidth) * 2 - 1,
			-(e.clientY / globalThis.innerHeight) * 2 + 1,
		);
		raycaster.setFromCamera(mousePosition, CAM);
		const intersects = raycaster.intersectObject(cushion.meshObject);
		if (intersects.length > 0) {
			initialIntersection = intersects[0];
			const face = initialIntersection.face as THREE.Face;
			const vertices = [face.a, face.b, face.c];
			const selectedParticles = [];
			const Nx = cushion.segments;
			const Ny = Nx;
			for (const vertex of vertices) {
				const i = vertex % (Nx + 1);
				const j = Math.floor(vertex / (Nx + 1));
				const selectedP = cushion.particles[i][Ny - j];
				selectedParticles.push(selectedP);
			}
			const zeroVec = new CANNON.Vec3(0, 0, 0);
			const intersectPointVec = new CANNON.Vec3(
				initialIntersection.point.x,
				initialIntersection.point.y,
				initialIntersection.point.z,
			);
			for (const particle of selectedParticles) {
				const mouseBody = new CANNON.Body({ mass: 0 });
				mouseBody.position.copy(particle.position);
				WORLD.addBody(mouseBody);
				selectedMouseBodies.push(mouseBody);

				const constraint = new CANNON.PointToPointConstraint(
					particle,
					zeroVec,
					mouseBody,
					zeroVec,
				);
				WORLD.addConstraint(constraint);
				selectedConstraints.push(constraint);

				originalPositions.push(
					particle.position.vsub(intersectPointVec),
				);
			}
		}
	});
	globalThis.addEventListener("mousemove", (e) => {
		if (initialIntersection) {
			mousePosition.set(
				(e.clientX / globalThis.innerWidth) * 2 - 1,
				-(e.clientY / globalThis.innerHeight) * 2 + 1,
			);
			raycaster.setFromCamera(mousePosition, CAM);
			const plane = new THREE.Plane(
				new THREE.Vector3(0, 0, 1),
				-initialIntersection.point.z,
			);
			const newPosition = new THREE.Vector3();
			raycaster.ray.intersectPlane(plane, newPosition);
			const newMousePos = new CANNON.Vec3(
				newPosition.x,
				newPosition.y,
				newPosition.z,
			);
			for (let i = 0; i < selectedMouseBodies.length; i++) {
				const mouseBody = selectedMouseBodies[i];
				const originalOffset = originalPositions[i];

				// Add the original offset to the new mouse position.
				// This is crucial for a natural drag, so the object moves relative to
				// where you clicked, not by snapping its center to the cursor.
				newMousePos.vadd(originalOffset, mouseBody.position);
			}
		}
	});
	globalThis.addEventListener("mouseup", () => {
		initialIntersection = undefined;
		for (const constraint of selectedConstraints) {
			WORLD.removeConstraint(constraint);
		}
		for (const mouseBody of selectedMouseBodies) {
			WORLD.removeBody(mouseBody);
		}
		selectedConstraints = [];
		selectedMouseBodies = [];
		originalPositions = [];
	});
})();

function animate() {
	if ((WORLD as any)._springs) {
		for (const spring of (WORLD as any)._springs) {
			spring.applyForce();
		}
	}
	WORLD.step(SCREEN.TIME_STEP);
	cushion.updateParticles();

	// const Nx = cushion.segments;
	// const Ny = Nx;

	// for (let i = 0; i < Nx + 1; i++) {
	// 	for (let j = 0; j < Ny + 1; j++) {
	// 		const particle = cushion.particles[i][j];
	// 		particle.position.z = 0; // Or whatever your desired Z-plane is
	// 	}
	// }
	// cushion.meshObject.geometry.computeBoundingBox();
	// cushion.meshObject.geometry.computeBoundingSphere();
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
