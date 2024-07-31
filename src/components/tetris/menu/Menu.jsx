import testris_image from '../../../resources/tetris-logo.png'
import './menu.css'
export default function Menu(){
    return (
        // this will be the tetris logo
        // play button
        // level button that changes level in incriments of 5
        // high score grid showing high scores
        // gear button, question button, more games button
        <div className="flex flex-col bg-opacity-90 bg-black">
            <img className="pl-10 pr-10" alt="" src={testris_image}/>
            <div className="pl-10 pr-10 flex flex-col mt-4 gap-4">
                <button className="pl-10 pr-10 bg-green-500">Play</button>
                <button className="bg-gray-500 font-bold">LEVEL: 20</button>
                <div className="bg-black">
                    <h2 className="text-xl font-bold text-white">HIGH SCORES</h2>
                    <ul className="space-y-2">
                        <li className="text-white rounded-md bg-gray-700">34,502</li>
                        <li className="text-white rounded-md bg-gray-700">5,000</li>
                        <li className="text-white rounded-md bg-gray-700">4,000</li>
                        <li className="text-white rounded-md bg-gray-700">3,000</li>
                        <li className="text-white rounded-md bg-gray-700">2,000</li>
                        <li className="text-white rounded-md bg-gray-700">?</li>
                    </ul>
                </div>
            </div>
            <div className="flex">
                <button className="grow bg-gray-500 mt-4 hover:text-blue-500">
                    <svg xmlns="http://www.w3.org/2000/svg" enableBackground="new 0 0 24 24" height="24px"
                         viewBox="0 0 24 24" width="24px" fill="#FFFFFF">
                        <g>
                            <path d="M0,0h24v24H0V0z" fill="none"/>
                            <path
                                d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
                        </g>
                    </svg>
                </button>
                <button className="grow bg-gray-500 mt-4 hover:text-blue-500">?</button>
                <button className="grow bg-green-500 mt-4 hover:text-blue-500 break-all">MORE GAMES</button>
            </div>
        </div>
    )
}