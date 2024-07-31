
export const BOARD_HEIGHT = 20;
export const BOARD_WIDTH = 10;
export const CELL_SIZE = 30;
export const NUMBER_OF_UPCOMING_PIECES = 3;
export const INITIAL_GAME_SPEED = 500; //game spaeed, higher values is slower game
export const calculateScore = (linesCleared) => {
    switch (linesCleared) {
        case 1:
            return 100;
        case 2:
            return 300;
        case 3:
            return 500;
        case 4:
            return 800;
        default:
            return 0;
    }
}

export const tetrisPieceCommon = {
    position: { column: 0, row: 0 },
    previousPiece: null,
    isPlaced: false,
    // must explicitly list tw properties or tw won't compile them correctly
    generateTcolor(color) {
        // Define a color palette for Tetris pieces
        const colorPalette = {
            'red': 'bg-red-500',      // Red
            'green': 'bg-green-500',  // Green
            'blue': 'bg-blue-500',    // Blue
            'yellow': 'bg-yellow-500',// Yellow
            'purple': 'bg-purple-500',// Purple
            'cyan': 'bg-cyan-500',    // Cyan
            'orange': 'bg-orange-500' // Orange
        };
        // Return Tailwind CSS class based on the provided color
        return colorPalette[color] || 'bg-gray-500'; // Default to gray if color is not found
    },
    generateBorder(color) {
        // Define a border color palette for Tetris pieces
        const borderColorPalette = {
            'red': 'border-red-500',      // Red
            'green': 'border-green-500',  // Green
            'blue': 'border-blue-500',    // Blue
            'yellow': 'border-yellow-500',// Yellow
            'purple': 'border-purple-500',// Purple
            'cyan': 'border-cyan-500',    // Cyan
            'orange': 'border-orange-500' // Orange
        };
        // Return border Tailwind CSS class based on the provided color
        return borderColorPalette[color] || 'border-gray-500'; // Default to gray if color is not found
    }
};
// Tetris pieces array
const tetrisPieces = [
    {
        type: 'I',
        color: 'red', // Red
        ...tetrisPieceCommon,
        shape: [
            [1, 1, 1, 1]
        ],
    },
    {
        type: 'T',
        color: 'green', // Green
        ...tetrisPieceCommon,
        shape: [
            [0, 1, 0],
            [1, 1, 1]
        ],
    },
    {
        type: 'O',
        color: 'blue', // Blue
        ...tetrisPieceCommon,
        shape: [
            [1, 1],
            [1, 1]
        ],
    },
    {
        type: 'S',
        color: 'yellow', // Yellow
        ...tetrisPieceCommon,
        shape: [
            [0, 1, 1],
            [1, 1, 0]
        ],
    },
    {
        type: 'Z',
        color: 'purple', // Purple
        ...tetrisPieceCommon,
        shape: [
            [1, 1, 0],
            [0, 1, 1]
        ],
    },
    {
        type: 'L',
        color: 'cyan', // Cyan
        ...tetrisPieceCommon,
        shape: [
            [1, 0],
            [1, 0],
            [1, 1]
        ],
    },
    {
        type: 'J',
        color: 'orange', // Orange
        ...tetrisPieceCommon,
        shape: [
            [0, 1],
            [0, 1],
            [1, 1]
        ],
    },
];

// Generate tcolor and border for each Tetris piece
tetrisPieces.forEach(piece => {
    piece.tcolor = piece.generateTcolor(piece.color);
    piece.border = piece.generateBorder(piece.color);
});

export const DefaultTetrisPieces = tetrisPieces;

export const DEFAULT_COLOR = 'bg-black';
export const DEFAULT_BORDER = 'border-black';
// Define constants for game states
export const GAME_STATES = {
    NEW_GAME: 'new_game',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'game_over',
};

export const DEFAULT_GRID = {
    color: DEFAULT_COLOR,
    border: DEFAULT_BORDER,
    isPlaced: false,
    isGhost: false,
    isActive: false,
}