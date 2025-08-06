import * as THREE from "three";
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import profpic from "../assets/profile_flower.png";
import { asyncTextureLoad } from "./async.ts";
import { MyScreen } from "./constants.ts";
import { planeObject } from "./object.ts";

const SCREEN = new MyScreen();

const SCENE = SCREEN.SCENE;
const RENDERER = SCREEN.RENDERER;
const OCAM = SCREEN.CAM as THREE.OrthographicCamera;

const profPicTexture = await asyncTextureLoad(
	new THREE.TextureLoader(),
	profpic,
	THREE.LinearFilter,
	THREE.SRGBColorSpace,
	RENDERER.capabilities.getMaxAnisotropy(),
);

const cushion = new planeObject(1, 1, { map: profPicTexture });
SCENE.add(cushion.meshObject);

function animate() {
	RENDERER.render(SCENE, OCAM);
}

RENDERER.setAnimationLoop(animate);
