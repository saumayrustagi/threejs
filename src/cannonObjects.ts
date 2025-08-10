import * as THREE from "three";
import * as CANNON from "cannon-es";

export class CannonPlane {
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

export class Cushion {
	meshObject: THREE.Mesh;
	segments = 15;
	side = 1;
	particleDist: number;
	particles: CANNON.Body[][] = [];
	constraints: CANNON.DistanceConstraint[] = [];
	springs: CANNON.Spring[] = [];

	constructor() {
		this.meshObject = new THREE.Mesh(
			new THREE.PlaneGeometry(
				this.side,
				this.side,
				this.segments,
				this.segments,
			),
			new THREE.MeshBasicMaterial({
				wireframe: true,
			}),
		);
		this.particleDist = this.side / this.segments;
		return this;
	}

	createParticles(WORLD: CANNON.World) {
		const particles = this.particles;

		const Nx = this.segments;
		const Ny = Nx;
		const dist = this.particleDist;

		const mass = 1;
		const shape = new CANNON.Particle();

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
				particles[i].push(particle);
				WORLD.addBody(particle);
			}
		}
	}

	connectParticles(WORLD: CANNON.World) {
		const Nx = this.segments;
		const Ny = Nx;
		const dist = this.particleDist;
		const diagDist = dist * Math.SQRT2;
		const particles = this.particles;

		const addDistConstraint = (
			p1: CANNON.Body,
			p2: CANNON.Body,
			d: number,
		) => {
			this.constraints.push(new CANNON.DistanceConstraint(p1, p2, d));
		};

		const addSpring = (p1: CANNON.Body, p2: CANNON.Body, d: number) => {
			this.springs.push(
				new CANNON.Spring(p1, p2, {
					restLength: d,
					stiffness: 1000,
					damping: 2,
				}),
			);
		};

		for (let i = 0; i < Nx + 1; i++) {
			for (let j = 0; j < Ny + 1; j++) {
				if (i < Nx) {
					addDistConstraint(
						particles[i][j],
						particles[i + 1][j],
						dist,
					);
				}
				if (j < Ny) {
					addDistConstraint(
						particles[i][j],
						particles[i][j + 1],
						dist,
					);
				}
				if (i < Nx && j < Ny) {
					addDistConstraint(
						particles[i][j],
						particles[i + 1][j + 1],
						diagDist,
					);
					addDistConstraint(
						particles[i + 1][j],
						particles[i][j + 1],
						diagDist,
					);
				}
			}
		}

		// Opposite Corners
		addSpring(particles[0][0], particles[Nx][Ny], this.side * Math.SQRT2);
		addSpring(particles[0][Ny], particles[Nx][0], this.side * Math.SQRT2);

		// Adjacent Corners
		addSpring(particles[0][0], particles[Nx][0], this.side * Math.SQRT2);
		addSpring(particles[0][0], particles[0][Ny], this.side * Math.SQRT2);
		addSpring(particles[0][Ny], particles[Nx][Ny], this.side * Math.SQRT2);
		addSpring(particles[Nx][0], particles[Nx][Ny], this.side * Math.SQRT2);

		for (const c of this.constraints) {
			WORLD.addConstraint(c);
		}
	}

	updateParticles() {
		const Nx = this.segments;
		const Ny = Nx;
		const cushion = this.meshObject;
		const particles = this.particles;
		const positionAttribute = cushion.geometry.attributes.position;

		for (let i = 0; i < Nx + 1; i++) {
			for (let j = 0; j < Ny + 1; j++) {
				const index = j * (Nx + 1) + i;

				const particlePosition = particles[i][Ny - j].position;

				positionAttribute.setXYZ(
					index,
					particlePosition.x,
					particlePosition.y,
					particlePosition.z,
				);
			}
		}
		cushion.geometry.computeBoundingSphere();
		positionAttribute.needsUpdate = true;
	}
}
