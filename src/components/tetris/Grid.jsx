import {useCallback, useEffect, useState} from "react";
import {
    BOARD_HEIGHT,
    BOARD_WIDTH, calculateScore, CELL_SIZE,
    DEFAULT_BORDER,
    DEFAULT_COLOR, DEFAULT_GRID,
    DefaultTetrisPieces, GAME_STATES,
    NUMBER_OF_UPCOMING_PIECES
} from "./Constants";
import {rotateMatrix} from "./utils";
function Grid(){
    // Function to initialize the game board with objects representing each grid cell
    const initializeGameBoard = () => {
        const board = [];
        for (let row = 0; row < BOARD_HEIGHT; row++) {
            const rowArray = [];
            for (let col = 0; col < BOARD_WIDTH; col++) {
                rowArray.push({...DEFAULT_GRID});
            }
            board.push(rowArray);
        }
        return board;
    };
    const clonePiece = useCallback((piece) =>{
        piece.previousPiece = null; // clean up so we don't wait memory
        return clone(piece);
    },[]);
    const clone = (obj) => JSON.parse(JSON.stringify(obj));

    // Function to generate a random Tetris piece
    // Assuming tetrisPieces is an array of Tetris piece objects as defined earlier
    const generateRandomPiece = useCallback(() => {
        const randomIndex = Math.floor(Math.random() * DefaultTetrisPieces.length);
        const piece = clonePiece(DefaultTetrisPieces[randomIndex]);
        piece.position.column = Math.floor((BOARD_WIDTH - piece.shape[0].length) / 2);
        return piece;
    },[clonePiece]);

    // Function to generate upcoming Tetris pieces
    const generateUpcomingPieces = () => {
        // Logic to generate upcoming Tetris pieces
        return Array.from({ length: NUMBER_OF_UPCOMING_PIECES }, generateRandomPiece);
    };

    const [gameBoard, setGameBoard] = useState(initializeGameBoard());
    const [gameState, setGameState] = useState(GAME_STATES.NEW_GAME); // Initial game state
    const [currentPiece, setCurrentPiece] = useState(generateRandomPiece());
    const [upcomingPieces, setUpcomingPieces] = useState(generateUpcomingPieces()); // for future pieces
    const [score, setScore] = useState(0); // TODO is a particular state actually a ref?
    const [level, setLevel] = useState(1); // TODO logic for increasing game level which increases speed
    const [gameSpeed, setGameSpeed] = useState(500); // Initial game speed in milliseconds
    const [ghostPosition, setGhostPosition] = useState(null); // current ghost position, helps to know so we can erase ghost when needed
    // const lastFrameTimeRef = useRef(0); // Reference to store the last frame time

    // Update game speed when the level changes
    useEffect(() => {
        // Adjust game speed based on the level
        const newGameSpeed = 500 - (level - 1) * 50; // Example formula, adjust as needed
        setGameSpeed(newGameSpeed);
    }, [level]);

    const cloneBoard = useCallback((board) => {
        return board.map((row) =>
            row.map((cell) => {
                // If cell is an object, create a deep copy using spread operator
                if (typeof cell === 'object' && cell !== null) {
                    return { ...cell };
                } else if (Array.isArray(cell)) {
                    // Nested array, call cloneBoard recursively
                    return cloneBoard(cell);
                }
                // Otherwise, create a shallow copy for primitives
                return cell;
            })
        );
    }, []); // Empty dependency array for memoization
    function drawPiece(piece, board, initRow, initCol, isGhost = false, isPlaced = false, isErased = false) {
        for (let row = 0; row < piece.shape.length; row++) {
            for (let column = 0; column < piece.shape[row].length; column++) {
                try {
                    if (piece.shape[row][column] === 0 || board[row + initRow][column + initCol].isPlaced)
                        continue;
                    if(isErased && !isGhost && !board[row+initRow][column+initCol].isGhost && !board[row+initRow][column+initCol].isActive){
                        console.log('should not erase this');
                    }
                    board[row+initRow][column+initCol].color = (isGhost && !board[row+initRow][column+initCol].isActive) || isErased ? DEFAULT_COLOR : piece.tcolor;
                    board[row+initRow][column+initCol].border = !isGhost || isErased ? DEFAULT_BORDER : piece.border;
                    board[row+initRow][column+initCol].isGhost = isGhost;
                    board[row+initRow][column+initCol].isPlaced = isPlaced;
                    board[row+initRow][column+initCol].isActive = !isErased && !isGhost;
                }catch (e) { // I expect this to fail when it's game over, does it ever fail when it's not?
                    console.log(e);
                }
            }
        }
        return board;
    }
    const placeGhostPiece = useCallback((piece, board) => {
        for (let row = 0; row < BOARD_HEIGHT; row++) {
            if(checkCollision(piece, board, piece.position.row+row, piece.position.column)){
                // Render the ghost piece at the bottom position
                setGhostPosition(piece.position.row+row-1)
                return drawPiece(piece, board, piece.position.row+row-1,piece.position.column, true);
            }
        }
    }, []);

    function checkCollision(piece, board, startRow, startCol) {
        // Check collision between the piece and the board
        for (let i = 0; i < piece.shape.length; i++) {
            for (let j = 0; j < piece.shape[i].length; j++) {
                if (piece.shape[i][j] === 0) {
                    continue;
                }
                const blockRow = startRow + i;
                const blockCol = startCol + j;
                // Check if the block is out of bounds or collides with an existing block
                if (blockCol < 0 || blockCol >= BOARD_WIDTH || blockRow >= BOARD_HEIGHT || (board[blockRow] && board[blockRow][blockCol] && board[blockRow][blockCol].isPlaced)) {
                    return true;
                }
            }
        }
        return false;
    }

    const erasePiece = useCallback((piece, board) => {
        if(!piece) // this is on initialization when previous peice is null
            return board;
        const boardWithoutPiece = drawPiece(piece, board, piece.position.row, piece.position.column, false, false,true);
        return drawPiece(piece, boardWithoutPiece, ghostPosition, piece.position.column, false, false,true);
    }, [ghostPosition]);

    const drawPieceWithGhost = useCallback((board) => {// board is cloned before coming here
        const boardWithoutPiece = erasePiece(currentPiece.previousPiece, board);
        const boardWithPiece = drawPiece(currentPiece, boardWithoutPiece, currentPiece.position.row, currentPiece.position.column);
        setGameBoard(placeGhostPiece(currentPiece, boardWithPiece));
    }, [currentPiece, placeGhostPiece, erasePiece]);

    const checkForLineClears = useCallback((board) => {
        const isFullRow = (row, board) => {
            let isFullRow = true;
            for (let column = 0; column < board[row].length; column++) {
                if (!board[row][column].isPlaced) {
                    isFullRow = false;
                    break;
                }
            }
            return isFullRow;
        }
        let clearedLines = 0;
        let row = board.length;
        let moveCount = 0;
        let isFull = false;
        while (row-- > 0){
            if(isFullRow(row, board)){
                clearedLines++;
                moveCount++;
                isFull = true;
            }else
                isFull = false;
            if(!isFull && moveCount > 0){
                // move all rows above row down moveCount rows, but need to avoid active not placed pieces by removing currentPiece
                for (let i = 0; i < row; i++) {
                    board[row + moveCount - i] = clone(board[row - i]);
                }
                moveCount = 0;
                row = board.length;
            }
        }
        if(clearedLines > 0) {
            setScore(score + calculateScore(clearedLines));
            setLevel(score%10);
            setGameBoard(board);
        }
    },[score]);

    useEffect(() => {
        let clonedBoard = cloneBoard(gameBoard);
        // if i placed a piece draw it placed and then check for line clears
        if(currentPiece.previousPiece && currentPiece.previousPiece.isPlaced){
            clonedBoard = drawPiece(currentPiece.previousPiece, clonedBoard, currentPiece.previousPiece.position.row, currentPiece.previousPiece.position.column, false, true);
            currentPiece.previousPiece.isPlaced = false;
            // check for row breaks
            checkForLineClears(clonedBoard);
        }
        drawPieceWithGhost(clonedBoard);
    }, [currentPiece, checkForLineClears, cloneBoard, drawPieceWithGhost, gameBoard]);

    const moveCurrentPiece = useCallback((newRow, newColumn) => {
        const piece = clonePiece(currentPiece);
        piece.position.column=newColumn;
        piece.position.row=newRow;
        if(!checkCollision(piece, gameBoard, piece.position.row, piece.position.column)) {
            piece.previousPiece = clonePiece(currentPiece); // clone piece so that erase can erase the previous piece
            setCurrentPiece(piece);
        }
    },[clonePiece, currentPiece, gameBoard]);

    const rotateCurrentPiece = useCallback(() =>{
        const piece = clonePiece(currentPiece);
        piece.previousPiece = clonePiece(currentPiece);
        piece.shape = rotateMatrix(piece.shape);
        if(checkCollision(piece, gameBoard, piece.position.row, piece.position.column)) {
            // Check how much the piece needs to be shifted (either left or right)
            // Calculate maximum allowed shift based on piece shape
            const maxShift = Math.max(...piece.shape.map((row) => row.filter(Boolean).length)) - 1;
            let shiftAmount = 0;
            for (let i = 0; i < maxShift; i++) {
                if (checkCollision(piece, gameBoard, piece.position.row, piece.position.column + shiftAmount)) {
                    shiftAmount++; // Keep shifting right until no collision
                }
            }
            shiftAmount = 0;
            // tried moving right and didn't help, now try moving left
            if (checkCollision(piece, gameBoard, piece.position.row, piece.position.column + shiftAmount)) { // Shifted right, check if it can go left instead
                for (let i = 0; i < maxShift; i++) {
                    if (checkCollision(piece, gameBoard, piece.position.row, piece.position.column + shiftAmount)) {
                        shiftAmount--; // Keep shifting right until no collision
                    }
                }
            }
            // Apply the calculated shift
            piece.position.column += shiftAmount;
        }
        // piece.previousPiece = clonePiece(currentPiece);
        setCurrentPiece(piece);
    },[clonePiece, currentPiece, gameBoard]);

    const debounce = (func, delay = 200) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func(...args);
            }, delay);
        };
    };
    // Add event listeners for keyboard input
    const handleKeyDown = useCallback((event) => {
        event.preventDefault();
        switch (event.key) {
            case 'ArrowLeft':
                // Handle left arrow key  -  Move Tetris piece left
                moveCurrentPiece(currentPiece.position.row,currentPiece.position.column-1);
                break;
            case 'ArrowRight':
                // Handle right arrow key  -  Move Tetris piece right
                moveCurrentPiece(currentPiece.position.row,currentPiece.position.column+1);
                break;
            case 'ArrowDown':
                // Handle down arrow key -  Move Tetris piece down
                moveCurrentPiece(currentPiece.position.row+1,currentPiece.position.column);
                break;
            case ' ':
                moveCurrentPiece(ghostPosition, currentPiece.position.column);
                break;
            case 'ArrowUp':
                // Handle spacebar  -  Rotate Tetris piece
                rotateCurrentPiece();
                break;
            default:
                break;
        }
    }, [currentPiece.position.column, currentPiece.position.row, ghostPosition, moveCurrentPiece, rotateCurrentPiece]);
    const gameLoop = useCallback(() => {
        // Game logic based on the current game state
        if (gameState === GAME_STATES.NEW_GAME) {
            // Game logic for new_game state
            // initialize the game board with the new piece, it's ghost and update the upcoming pieces
            drawPieceWithGhost(cloneBoard(gameBoard));
            setGameState(GAME_STATES.PLAYING);
        } else if (gameState === GAME_STATES.PLAYING) {
            console.log('playing');
            // Game logic for playing state
            if(checkCollision(currentPiece, gameBoard, currentPiece.position.row+1, currentPiece.position.column)) { // check collision needs to look into the future
                const upcomingPiecesTmp = upcomingPieces.slice();
                const nextPiece = {...upcomingPiecesTmp.pop()};
                currentPiece.isPlaced = true;
                nextPiece.previousPiece = clonePiece(currentPiece);
                // is it game over?
                if(checkCollision(nextPiece, gameBoard, nextPiece.position.row, nextPiece.position.column)) {
                    // this clones the board, but that's fine here because it's a new game state
                    drawPiece(nextPiece, cloneBoard(gameBoard), nextPiece.position.row, nextPiece.position.column);
                    // TODO gameover animation and popup
                    return setGameState(GAME_STATES.GAME_OVER);
                }
                upcomingPiecesTmp.push(generateRandomPiece());
                setUpcomingPieces(upcomingPiecesTmp);
                setCurrentPiece(nextPiece); // this should redraw everything in useEffect
            }else {
                const piece = clonePiece(currentPiece);
                piece.position.row++;
                piece.previousPiece = clonePiece(currentPiece);
                setCurrentPiece(piece); // this should redraw everything in useEffect
            }
        } else if (gameState === GAME_STATES.PAUSED) {
            // Game logic for paused state
        } else if (gameState === GAME_STATES.GAME_OVER) {
            // Game logic for game over state
            console.log('Game Over');
        }
    }, [cloneBoard, clonePiece, currentPiece, drawPieceWithGhost, gameBoard, gameState, generateRandomPiece, upcomingPieces]);
    useEffect(() => {
        const intervalId = setInterval(gameLoop, gameSpeed);

        const debouncedHandleKeyDown = debounce(handleKeyDown);
        window.addEventListener('keydown', debouncedHandleKeyDown);

        return () => {
            window.removeEventListener('keydown', debouncedHandleKeyDown); // Clean up event listener
            clearInterval(intervalId); // Clean up the game loop on unmount
        };
    }, [gameState, gameSpeed, currentPiece, gameLoop, handleKeyDown]);

    try {
        return (
            <div
                className="grid grid-cols-10 grid-rows-20 gap-px" // gap-1
                style={{ width: `${BOARD_WIDTH * CELL_SIZE}px`, height: `${BOARD_HEIGHT * CELL_SIZE}px` }}
            >
                {gameBoard.map((row, rowIndex) =>
                    row.map((col, colIndex) => (
                        <div
                            key={`${rowIndex}-${colIndex}`}
                            className={`border rounded ${ col.border } ${ col.color }`} // rounded-sm
                        />
                    ))
                )}
            </div>
        );
    } catch (error) {
        // Handle the error here
        console.error("An error occurred:", error);
        return null; // Or return a fallback UI
    }
}

export default Grid;