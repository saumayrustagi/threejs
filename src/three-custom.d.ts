import "three";

declare module "three" {
	interface OrthographicCamera {
		setFrustumAndUpdate(
			left: number,
			right: number,
			top: number,
			bottom: number,
		): void;
	}
}
