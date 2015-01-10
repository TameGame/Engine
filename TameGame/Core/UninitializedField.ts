module TameGame {
    /**
     * Declares a lazily-initialized field on an object
     *
     * This can be used when a field is costly to initialize (in terms of performance or storage space) and is seldom used
     * or as a way to declare a field in an object prototype with a value that depends on how the object is used
     */
    export function defineUnintializedField<TObjType, TFieldType>(obj: TObjType, fieldName: string, initialize: (obj: TObjType) => TFieldType) {
        // Relies on the standard JavaScript behaviour for 'this' (not captured by a closure, but referring to the calling object)
        function getFunction() {
            if (Object.isFrozen(this) || Object.isSealed(this)) {
                return initialize(this);
            }

            var newVal = initialize(this);
            Object.defineProperty(this, fieldName, { configurable: true, enumerable: true, writable: true, value: newVal });
            return newVal;
        }

        var setting: boolean = false;
        function setFunction(val: TFieldType) {
            Object.defineProperty(this, fieldName, { configurable: true, enumerable: true, writable: true, value: val });
        }

        Object.defineProperty(obj, fieldName, {
            configurable: true,
            enumerable: true,
            get: getFunction,
            set: setFunction
        });
    }
}
