import Grid from "./tetris/Grid";
import GameBoard from "./tetris/GameBoard";
import background from "../resources/background.jpeg"
function Tetris(){
    return (
        <div style={{backgroundImage: `url(${background})`}}>
            <GameBoard />
        </div>
    );
}

export default Tetris;