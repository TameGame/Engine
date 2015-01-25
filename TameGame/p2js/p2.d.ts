/**
 * Typescript definitions for p2.js
 */

declare module p2 {
    class World {
    }

    class Body {
        id: number;
        world: World;
        shapes: any;
        shapeOffsets: any;
        shapeAngles: number[];
        mass: number;
        invMass: number;
        inertia: number;
        invInertia: number;
        invMassSolve: number;
        invInertiaSolve: number;
        fixedRotation: boolean;
        position: number[];
        interpolatedPosition: number[];
        interpolatedAngle: number;
        previousPosition: number[];
        previousAngle: number;
        velocity: number[];
        vlambda: number[];
        wlambda: number;
        angle: number;
        angularVelocity: number;
        force: number[];
        angularForce: number;
        damping: number;
        angularDamping: number;
        type: number;
        boundingRadius: number;
        aabb: any;
        aabbNeedsUpdate: boolean;
        allowSleep: boolean;
        wantsToSleep: boolean;
        sleepState: any;
        sleepSpeedLimit: number;
        sleepTimeLimit: number;
        gravityScale: number;
        collisionResponse: number;
        timeLastSleepy: number;

        updateSolveMassProperties();
        setDensity(density: number);
        getArea(): number;
        getAABB(): any;
        updateAABB();
        updateBoundingRadius();
        addShape(shape: any, offset: number[], angle: number);
        removeShape(shape: any);
        updateMassProperties();
        applyForce(force: number[], worldPoint: number[]);
        toLocalFrame(out: number[], worldPoint: number[]);
        toWorldFrame(out: number[], worldPoint: number[]);
        fromPolygon(path: any, options: any);
        adjustCenterOfMass();
        setZeroForce();
        resetConstraintVelocity();
        addConstraintVelocity();
        applyDamping(dt: number);
        wakeUp();
        sleep();
        sleepTick(time: number, dontSleep: boolean, dt: number);
        overlaps(body: Body): boolean;

        STATIC: number;
        DYNAMIC: number;
        KINEMATIC: number;
        AWAKE: number;
        SLEEPY: number;
        SLEEPING: number;
    }
}
