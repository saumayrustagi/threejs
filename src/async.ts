import * as THREE from "three";

export function asyncTextureLoad(
	textureLoader: THREE.TextureLoader,
	url: string,
): Promise<THREE.Texture> {
	return new Promise((resolve, reject) => {
		textureLoader.load(
			url,
			(texture) => {
				resolve(texture);
			},
			undefined,
			(err) => reject(err),
		);
	});
}
