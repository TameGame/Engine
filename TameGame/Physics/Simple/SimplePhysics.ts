/// <reference path="../PhysicsBehavior.ts" />

module TameGame {
    /** The simple physics behavior */
    export var SimplePhysicsBehavior: IPhysicsBehavior = { };

    /** Create the simple physics behavior */
    declareBehaviorClass("SimplePhysics", { physics: SimplePhysicsBehavior });
}
