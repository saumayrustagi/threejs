import * as THREE from "three";

export class MyScreen {
	SCENE: THREE.Scene;
	RENDERER: THREE.WebGLRenderer;
	CAM: THREE.PerspectiveCamera | THREE.OrthographicCamera;
	OC_SIZE: number;
	ASPECT_RATIO: undefined | number;

	constructor() {
		this.SCENE = (() => {
			const scene = new THREE.Scene();
			scene.background = new THREE.Color(0xbbbbbb);
			return scene;
		})();
		this.RENDERER = (() => {
			const renderer = new THREE.WebGLRenderer({ antialias: true });
			renderer.setPixelRatio(globalThis.devicePixelRatio);
			renderer.outputColorSpace = THREE.SRGBColorSpace;
			document.body.appendChild(renderer.domElement);
			return renderer;
		})();
		this.OC_SIZE = 3;
		this.CAM = (() => {
			const ocam = new THREE.OrthographicCamera();
			ocam.position.z = 100;
			return ocam;
		})();
		(() => {
			this.onWindowResize = this.onWindowResize.bind(this);
			globalThis.addEventListener("resize", this.onWindowResize);
			this.onWindowResize();
		})();
		return this;
	}

	onWindowResize() {
		this.ASPECT_RATIO = globalThis.innerWidth / globalThis.innerHeight;
		this.RENDERER.setSize(globalThis.innerWidth, globalThis.innerHeight);
		if (this.CAM instanceof THREE.OrthographicCamera) {
			ocamSetFrustumAndUpdate(
				this.CAM,
				-this.OC_SIZE * this.ASPECT_RATIO,
				this.OC_SIZE * this.ASPECT_RATIO,
				this.OC_SIZE,
				-this.OC_SIZE,
			);
		}
	}
}

function ocamSetFrustumAndUpdate(
	ocam: THREE.OrthographicCamera,
	left: number,
	right: number,
	top: number,
	bottom: number,
): void {
	ocam.left = left;
	ocam.right = right;
	ocam.top = top;
	ocam.bottom = bottom;
	ocam.updateProjectionMatrix();
}
