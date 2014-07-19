module TameGame {
    /**
     * Interface implemented by objects that describe a collision
     */
    export interface Collision {
        /** True if a collision occurred */
        collided: boolean;
        
        /** 
         * If collided is true, then this will retrieve the minimum translation vector
         *
         * This is the shortest distance that moves the shapes so that they are just touching
         */
        getMtv() : Point2D;
    }
}
