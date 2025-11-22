import { createContext, useRef, useState, useEffect } from "react";
import axios from "axios";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { endpoints } from '../config/api';

export const PlayerContext = createContext();

const PlayerContextProvider = (props) => {
    const audioRef = useRef();
    const seekBg = useRef();
    const seekBar = useRef();
    
    const [songsData, setSongsData] = useState([]);
    const [albumsData, setAlbumsData] = useState([]);
    const [track, setTrack] = useState(null);
    const [playStatus, setPlayStatus] = useState(false);
    const [loading, setLoading] = useState(true);
    const [lastFetchAttempt, setLastFetchAttempt] = useState(0);
    const [time, setTime] = useState({
        currentTime: {
            minute: 0,
            second: 0
        },
        totalTime: {
            minute: 0,
            second: 0
        }
    });
    const [lastClickedId, setLastClickedId] = useState(null);
    const [lastClickTime, setLastClickTime] = useState(0);
    const [volume, setVolume] = useState(0.7); // Default volume 70%
    const [isMuted, setIsMuted] = useState(false);
    const previousVolume = useRef(0.7); // Store volume before mute

    const play = async () => {
        if (track) {
            await audioRef.current.play();
            setPlayStatus(true);
        }
    }

    const pause = () => {
        audioRef.current.pause();
        setPlayStatus(false)
    }

    const playWithId = async (id) => {
        const now = Date.now();
        
        if (id === lastClickedId && now - lastClickTime < 500) {
            // Double click detected
            toast.info("Song is already selected! ", {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            return;
        }

        const songToPlay = songsData.find(item => item._id === id);
        if (songToPlay) {
            if (track && track._id === id) {
                // Same song clicked
                if (playStatus) {
                    pause();
                    toast.info("Song paused ", {
                        position: "top-right",
                        autoClose: 2000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                    });
                } else {
                    await play();
                    toast.success("Song resumed ", {
                        position: "top-right",
                        autoClose: 2000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                    });
                }
            } else {
                // New song selected
                // Pause current track if playing
                if (playStatus && audioRef.current) {
                    audioRef.current.pause();
                }
                
                setTrack(songToPlay);
                // Small timeout to ensure state updates before playing
                setTimeout(async () => {
                    try {
                        await audioRef.current.play();
                        setPlayStatus(true);
                        toast.success(`Now playing: ${songToPlay.name} `, {
                            position: "top-right",
                            autoClose: 2000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                        });
                    } catch (error) {
                        console.error('Error playing song:', error);
                        setPlayStatus(false);
                    }
                }, 50);
            }
        }

        setLastClickedId(id);
        setLastClickTime(now);
    }

    const previous = async () => {
        const currentIndex = songsData.findIndex(item => track?._id === item._id);
        if (currentIndex > 0) {
            setTrack(songsData[currentIndex - 1]);
            await audioRef.current.play();
            setPlayStatus(true);
        }
    }

    const next = async () => {
        const currentIndex = songsData.findIndex(item => track?._id === item._id);
        if (currentIndex < songsData.length - 1) {
            setTrack(songsData[currentIndex + 1]);
            await audioRef.current.play();
            setPlayStatus(true);
        }
    }

    const seekSong = (e) => {
        audioRef.current.currentTime = (e.nativeEvent.offsetX / seekBg.current.offsetWidth) * audioRef.current.duration;
    }

    const getSongsData = async () => {
        try {
            const now = Date.now();
            if (now - lastFetchAttempt < 5000) {
                return;
            }
            setLastFetchAttempt(now);
            
            setLoading(true);
            console.log('Fetching songs from:', endpoints.songsList);
            const response = await axios.get(endpoints.songsList);
            console.log('Full songs response:', JSON.stringify(response.data, null, 2)); // Log the full response
            
            if (response.data?.success && Array.isArray(response.data.songs)) {
                response.data.songs.forEach(song => {
                    console.log('Song data:', {
                        name: song.name,
                        file: song.file,
                        album: song.album,
                        id: song._id
                    });
                });
                setSongsData(response.data.songs);
                if (response.data.songs.length > 0 && !track) {
                    setTrack(response.data.songs[0]);
                }
            } else {
                console.error('Invalid response format:', response.data);
                toast.error("Invalid response format from server");
            }
        } catch (error) {
            console.error("Error fetching songs:", error);
            toast.error(error.response?.data?.message || "Error loading songs");
        } finally {
            setLoading(false);
        }
    };

    const getAlbumsData = async () => {
        try {
            // Prevent multiple rapid requests
            const now = Date.now();
            if (now - lastFetchAttempt < 5000) { // 5 seconds cooldown
                return;
            }
            setLastFetchAttempt(now);
            
            setLoading(true);
            console.log('Fetching albums from:', endpoints.albumsList);
            const response = await axios.get(endpoints.albumsList);
            console.log('Albums response:', response.data);
            
            if (response.data?.success && Array.isArray(response.data.albums)) {
                // Log each album's ID to help with debugging
                response.data.albums.forEach(album => {
                    console.log(`Album: ${album.name}, ID: ${album._id}`);
                });
                setAlbumsData(response.data.albums);
            } else {
                console.error('Invalid album response format:', response.data);
                toast.error("Invalid album response format from server");
            }
        } catch (error) {
            console.error("Error fetching albums:", error);
            if (error.code === 'ECONNRESET') {
                toast.error("Connection lost. Retrying...");
                // Retry after 5 seconds
                setTimeout(getAlbumsData, 5000);
            } else {
                toast.error(error.response?.data?.message || "Error loading albums");
            }
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (audioRef.current) {
            // Handle metadata loading (duration and other track info)
            audioRef.current.onloadedmetadata = () => {
                const totalMinute = Math.floor(audioRef.current.duration / 60);
                const totalSecond = Math.floor(audioRef.current.duration % 60);
                setTime(prev => ({
                    ...prev,
                    totalTime: {
                        minute: totalMinute,
                        second: totalSecond < 10 ? `0${totalSecond}` : totalSecond
                    }
                }));
            };

            // Handle time updates during playback
            audioRef.current.ontimeupdate = () => {
                if (!isNaN(audioRef.current.duration)) {
                    const currentMinute = Math.floor(audioRef.current.currentTime / 60);
                    const currentSecond = Math.floor(audioRef.current.currentTime % 60);
                    const totalMinute = Math.floor(audioRef.current.duration / 60);
                    const totalSecond = Math.floor(audioRef.current.duration % 60);

                    setTime({
                        currentTime: {
                            minute: currentMinute,
                            second: currentSecond < 10 ? `0${currentSecond}` : currentSecond
                        },
                        totalTime: {
                            minute: totalMinute,
                            second: totalSecond < 10 ? `0${totalSecond}` : totalSecond
                        }
                    });

                    if (seekBar.current) {
                        const progressWidth = (audioRef.current.currentTime / audioRef.current.duration) * 100;
                        seekBar.current.style.width = `${progressWidth}%`;
                    }
                }
            };

            // Handle seeking
            if (seekBg.current) {
                seekBg.current.onclick = (e) => {
                    if (!isNaN(audioRef.current.duration)) {
                        const seekPosition = (e.nativeEvent.offsetX / seekBg.current.offsetWidth);
                        audioRef.current.currentTime = seekPosition * audioRef.current.duration;
                    }
                };
            }
        }
    }, [track]); // Re-run when track changes

    // Handle volume change
    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (audioRef.current) {
            audioRef.current.volume = newVolume;
        }
        // If volume is set to 0, consider it as mute
        if (newVolume === 0) {
            setIsMuted(true);
        } else if (isMuted) {
            setIsMuted(false);
        }
    };

    // Toggle mute/unmute
    const toggleMute = () => {
        if (isMuted) {
            // Unmute and restore previous volume
            if (audioRef.current) {
                audioRef.current.volume = previousVolume.current || 0.7;
                setVolume(previousVolume.current || 0.7);
            }
            setIsMuted(false);
        } else {
            // Mute and store current volume
            if (audioRef.current) {
                previousVolume.current = audioRef.current.volume;
                audioRef.current.volume = 0;
                setVolume(0);
            }
            setIsMuted(true);
        }
    };

    // Set initial volume when component mounts or audioRef changes
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [audioRef]);

    // Fetch initial data
    useEffect(() => {
        getSongsData();
        getAlbumsData();
    }, []);

    // Refresh data periodically (every 2 minutes instead of 30 seconds)
    useEffect(() => {
        const refreshInterval = setInterval(() => {
            getSongsData();
            getAlbumsData();
        }, 120000); // Refresh every 2 minutes

        return () => clearInterval(refreshInterval);
    }, []);

    return (
        <PlayerContext.Provider value={{
            audioRef,
            seekBg,
            seekBar,
            songsData,
            albumsData,
            track,
            playStatus,
            time,
            loading,
            volume,
            isMuted,
            handleVolumeChange,
            toggleMute,
            play,
            pause,
            playWithId,
            previous,
            next,
            seekSong,
            getSongsData,
            getAlbumsData
        }}>
            {props.children}
        </PlayerContext.Provider>
    );
};

export default PlayerContextProvider;