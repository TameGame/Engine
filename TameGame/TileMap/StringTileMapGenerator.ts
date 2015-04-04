module TameGame {
    /**
     * Generates a tile map from an array of strings
     *
     * This makes it possible to do something like this to define a map for a game:
     *
     *     mapGenerator.createTileMap(["   ##   ",
     *                                 "  #..#  ",
     *                                 "  #..#  ",
     *                                 "   ##   "])
     */
    export class StringTileMapGenerator {
        constructor() {
            // Maps characters to tiles
            var characterMap: { [ character: string ]: number } = {};

            // Defines a new character map
            var define = (character: string, spriteId: number) => {
                characterMap[character] = spriteId;
            };

            // Generates a tile map from an array of strings
            var createTileMap = (stringMap: string[]) => {
                var result: number[][] = [];

                var height  = stringMap.length;
                var width   = Math.max.apply(null, stringMap.map(row => row.length));

                // Create an empty result
                for (var y=0; y<height; ++y) {
                    var newRow: number[] = new Array(width);

                    for (x=0; x<width; ++x) {
                        newRow[x] = 0;
                    }

                    result.push(newRow);
                }

                // Fill from the strings
                for (var y=0; y<height; ++y) {
                    var row = stringMap[y];

                    for (var x=0; x<row.length; ++x) {
                        var spriteNumber = characterMap[row[x]];
                        if (typeof spriteNumber === 'undefined') {
                            spriteNumber = 0;
                        }

                        result[y][x] = spriteNumber;
                    }
                }

                return result;
            }

            this.define         = define;
            this.createTileMap  = createTileMap;
        }

        /** 
         * Defines the ID of the sprite that should be rendered when a particular character is encountered
         *
         * Unknown characters always end up with sprite ID 0 (ie, nothing is rendered)
         */
        define: (character: string, spriteId: number) => void;

        /**
         * Creates a tile map from a string
         */
        createTileMap: (map: string[]) => number[][];
    }
}