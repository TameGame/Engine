module TameGame {
    /**
     * Performs binary search on an ordered subset of an array, returning the index where the specified element was found, or the index of the first
     * element less than it if it was not found.
     *
     * If the element appears multiple times, the first element of the sequence is returned
     *
     * The start and end points are inclusive (ie, if 0 and 1 is passed in for these values, the indexes searched will be [0,1], not [0])
     */
    export function binarySearchSubset<TElement>(array: TElement[], target: TElement, start: number, end: number, compare: (a: TElement, b: TElement) => number) : number {
        var regionStart = start >> 0;
        var regionEnd   = end >> 0;

        while (regionEnd >= regionStart) {
            var midPoint    = (regionStart + regionEnd)>>1;
            var difference  = compare(target, array[midPoint]);

            if (difference <= 0) {
                // Target is less than the current array position
                regionEnd = midPoint - 1;
            } else if (difference > 0) {
                // Target is greater than the current array position
                regionStart = midPoint + 1;
            }
        }

        return regionStart;
    }

    /**
     * Performs binary search on an ordered array, returning the index where the specified element was found
     */
    export function binarySearch<TElement>(array: TElement[], target: TElement, compare: (a: TElement, b: TElement) => number) : number {
        return binarySearchSubset(array, target, 0, array.length-1, compare);
    }
}
