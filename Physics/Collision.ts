module TameGame {
    /**
     * Interface implemented by objects that describe a collision
     */
    export interface Collision {
        /** True if a collision occurred */
        collided: boolean;
        
        /** 
         * Retrieves the minimum translation vector
         *
         */
        getMtv() : Point2D;
    }
}
