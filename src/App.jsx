import React, { useContext } from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/sidebar.jsx";
import Player from "./components/player.jsx";
import Display from "./components/display.jsx";
import { PlayerContext } from "./components/PlayerContext.jsx";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/scrollbar.css';

const App = () => {
    const { audioRef, track, songsData } = useContext(PlayerContext)
    return (
        <div className="h-screen bg-black">
            <ToastContainer position="top-right" autoClose={3000} />
            <div className="h-full pb-20 flex">
                <Sidebar />
                <Routes>
                    <Route path="/*" element={<Display />} />
                </Routes>
            </div>
            {songsData.length > 0 && <Player />}
// In App.jsx, update the audio element:
{track && (
    <audio
        ref={audioRef}
        src={track.file}
        preload="auto"
        onError={(e) => {
            console.error('Audio error details:', {
                error: e,
                src: e.target.src,
                errorMessage: e.target.error?.message || 'Unknown error',
                readyState: e.target.readyState
            });
            toast.error('Failed to load audio: ' + (e.target.error?.message || 'Unknown error'));
        }}
        onCanPlay={() => console.log('Audio can play:', track.file)}
        onPlay={() => console.log('Audio started playing')}
    />
)}       </div>
    )
}
export default App;