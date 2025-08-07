import * as CANNON from "cannon-es";

export class cannonPlane {
	cannonBody: CANNON.Body;

	constructor(position?: CANNON.Vec3, quaternion?: CANNON.Quaternion) {
		this.cannonBody = new CANNON.Body(
			{ shape: new CANNON.Plane(), type: CANNON.Body.STATIC },
		);
		if (position) {
			this.cannonBody.position = position;
		}
		if (quaternion) {
			this.cannonBody.quaternion = quaternion;
		}
		return this;
	}
}
