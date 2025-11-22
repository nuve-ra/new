import React, { useContext, useState, useRef } from "react";
import { assets } from "./assets/frontend-assets/assets"
import { PlayerContext } from "./PlayerContext";

const Player = () => {
    const { 
        seekBg, 
        seekBar, 
        playStatus, 
        play, 
        pause, 
        track, 
        previous, 
        next, 
        seekSong, 
        time, 
        volume, 
        isMuted, 
        handleVolumeChange, 
        toggleMute 
    } = useContext(PlayerContext);
    
    const [showVolumeSlider, setShowVolumeSlider] = useState(false);
    const volumeRef = useRef(null);

    if (!track) return null;

    return track ? (
        <div className='h-20 fixed bottom-0 left-0 right-0 bg-black flex items-center justify-between text-white px-4 border-t border-gray-800'>
            <div className="flex items-center gap-4 w-1/4">
                <img className="w-12 h-12 object-cover" src={track.image} alt="" />
                <div>
                    <p className="text-sm font-medium">{track.name}</p>
                    <p className="text-xs text-gray-400">{track.desc ? track.desc.slice(0, 30) : ''}</p>
                </div>
            </div>
            
            <div className="flex flex-col items-center gap-2 w-2/4">
                <div className="flex gap-6 items-center">
                    <img className="w-4 h-4 cursor-pointer opacity-70 hover:opacity-100" src={assets.shuffle_icon} alt="" />
                    <img onClick={previous} className="w-4 h-4 cursor-pointer opacity-70 hover:opacity-100" src={assets.prev_icon} alt="" />
                    {
                        playStatus ? 
                            <img onClick={pause} className="w-8 h-8 cursor-pointer" src={assets.pause_icon} alt="" />
                            : <img onClick={play} className="w-8 h-8 cursor-pointer" src={assets.play_icon} alt="" />
                    }
                    <img onClick={next} className="w-4 h-4 cursor-pointer opacity-70 hover:opacity-100" src={assets.next_icon} alt="" />
                    <img className="w-4 h-4 cursor-pointer opacity-70 hover:opacity-100" src={assets.loop_icon} alt="" />
                </div>
                <div className="flex items-center gap-2 w-full max-w-[600px]">
                    <p className="text-xs w-10 text-right">{time.currentTime.minute}:{time.currentTime.second}</p>
                    <div ref={seekBg} onClick={seekSong} className="flex-1 h-1 bg-gray-600 rounded-full cursor-pointer">
                        <hr ref={seekBar} className="h-1 border-none w-0 bg-green-500 rounded-full" />
                    </div>
                    <p className="text-xs w-10">{time.totalTime.minute}:{time.totalTime.second}</p>
                </div>
            </div>

            <div className='hidden lg:flex items-center gap-3 w-1/4 justify-end relative'>
                <img className="w-4 h-4 cursor-pointer opacity-70 hover:opacity-100" src={assets.plays_icon} alt="" />
                <img className="w-4 h-4 cursor-pointer opacity-70 hover:opacity-100" src={assets.mic_icon} alt="" />
                <img className="w-4 h-4 cursor-pointer opacity-70 hover:opacity-100" src={assets.queue_icon} alt="" />
                <div className="flex items-center gap-2" ref={volumeRef}>
                    <button 
                        onClick={toggleMute}
                        className="text-white hover:opacity-100 opacity-70 transition-opacity"
                        aria-label={isMuted ? 'Unmute' : 'Mute'}
                    >
                        {isMuted ? (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0 9 9 0 010 12.728 1 1 0 01-1.414-1.414 7 7 0 000-9.9 1 1 0 010-1.414z" clipRule="evenodd" />
        <path fillRule="evenodd" d="M11.707 5.293a1 1 0 011.414 0 5 5 0 010 7.072 1 1 0 01-1.414-1.414 3 3 0 000-4.244 1 1 0 010-1.414z" clipRule="evenodd" />
        {/* Cross line for mute state */}
        <line x1="3" y1="3" x2="17" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
) : volume > 0.5 ? (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0 9 9 0 010 12.728 1 1 0 01-1.414-1.414 7 7 0 000-9.9 1 1 0 010-1.414z" clipRule="evenodd" />
        <path fillRule="evenodd" d="M11.707 5.293a1 1 0 011.414 0 5 5 0 010 7.072 1 1 0 01-1.414-1.414 3 3 0 000-4.244 1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
) : (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217z" clipRule="evenodd" />
    </svg>
)}
                    </button>
                    <div 
                        className="relative group"
                        onMouseEnter={() => setShowVolumeSlider(true)}
                        onMouseLeave={() => setShowVolumeSlider(false)}
                    >
                        <div className="w-24 h-1 bg-gray-600 rounded-full cursor-pointer relative">
                            <div 
                                className="h-1 bg-white rounded-full absolute left-0 top-0 bottom-0"
                                style={{ width: `${isMuted ? 0 : volume * 100}%` }}
                            ></div>
                        </div>
                        {showVolumeSlider && (
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 mb-2 w-32 bg-gray-800 p-2 rounded shadow-lg">
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={isMuted ? 0 : volume}
                                    onChange={handleVolumeChange}
                                    className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                                    style={{
                                        background: `linear-gradient(to right, #fff 0%, #fff ${(isMuted ? 0 : volume) * 100}%, #4B5563 ${(isMuted ? 0 : volume) * 100}%, #4B5563 100%)`
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    ) : null;
}
export default Player;