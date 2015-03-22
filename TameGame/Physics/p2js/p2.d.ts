/**
 * Typescript definitions for p2.js
 */

declare module p2 {
    class World {
        addBody(body: Body);
        removeBody(body: Body);
        step(dt: number, timeSinceLastCalled?: number, maxSubSteps?: number);

        bodies: Body[];
        overlapKeeper: OverlapKeeper;
    }

    class OverlapKeeper {
        overlappingShapesCurrentState: TupleDictionary<OverlapKeeperRecord>;
        overlappingShapesLastState: TupleDictionary<OverlapKeeperRecord>;
    }

    class OverlapKeeperRecord {
        shapeA: Shape;
        shapeB: Shape;
        bodyA: Body;
        bodyB: Body;
    }

    class TupleDictionary<T> {
        data: { number: T };
        keys: number[];
    }

    class Body {
        id: number;
        world: World;
        shapes: Shape[];
        shapeOffsets: number[][];
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
        aabb: AABB;
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
        getAABB(): AABB;
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

    class AABB {
        lowerBound: number[];
        upperBound: number[];

        setFromPoints(points: number[][], position?: number[], angle?: number, skinSize?: number);
        copy(aabb: AABB);
        extend(aabb: AABB);
        overlaps(aabb: AABB);
    }

    class Shape {
        type: number;
        id: number;
        boundingRadius: number;
        collisionGroup: number;
        collisionResponse: boolean;
        collisionMask: number;
        material: any;
        area: number;
        sensor: boolean;

        computeMomentOfInertia(mass: number): number;
        updateBoundingRadius(): number;
        updateArea();
        computeAABB(out: AABB, position: number, angle: number);
    }

    class Circle extends Shape {
        constructor(radius: number);
    }

    class Convex extends Shape {
        constructor(vertices: number[][], axes?: number[][])
    }
}
