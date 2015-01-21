module TameGame {
    "use strict";

    /**
     * Defines a contextual field on an object
     *
     * These are used for tricks such as myObject.setup.foo(), where 'foo()' is defined in the prototype for setup
     * but needs to know about myObject.
     *
     * Whenever this field is accessed (myObject.setup), this function will create a new object and assign a _context
     * field to it referring to myObject. Functions in setup thus know which object they 'belong' to and can act
     * accordingly.
     *
     * Fields defined this way aren't super-fast to access, so this is best used for things like setup where access is
     * irregular (in particular, this isn't usually suitable for behaviors). They're also a bit odd in that the object
     * is created every time.
     */
    export function defineContextualField<TObjType, TFieldType>(obj: TObjType, fieldName: string, fieldValue: TFieldType) {
        function getValue() {
            var result = Object.create(fieldValue);
            result['_context'] = this;
            return result;
        }

        function setValue(value: TFieldType) {
            fieldValue = value;
        }

        Object.defineProperty(obj, fieldName, {
            enumerable: true,
            configurable: true,
            get: getValue,
            set: setValue
        });
    }
}
