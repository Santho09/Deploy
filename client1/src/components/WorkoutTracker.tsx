import { useEffect, useState } from "react";
import { Dumbbell, RefreshCw, XCircle, Award, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import socket from '../utils/socket';
import './MyBadges.css';

interface Badge {
    type: string;
    date: string;
    compliment: string;
    userId: string;
}

function WorkoutTracker() {
    const [exercise, setExercise] = useState("");
    const [reps, setReps] = useState<number>(0);
    const [image, setImage] = useState<string | null>(null);
    const [isTracking, setIsTracking] = useState(false);
    const [error, setError] = useState("");
    const [badge, setBadge] = useState<string | null>(null);
    const [compliment, setCompliment] = useState<string | null>(null);
    const [motivationalQuote, setMotivationalQuote] = useState<string | null>(null);
    const [animatingBadge, setAnimatingBadge] = useState<Badge | null>(null);
    const [badgePosition, setBadgePosition] = useState({ x: 0, y: 0 });
    const [lastEarnedBadge, setLastEarnedBadge] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    // Load user ID from token
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                // Decode the JWT token to get user ID
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                const payload = JSON.parse(jsonPayload);
                setCurrentUserId(payload.id);
            } catch (error) {
                console.error('Error decoding token:', error);
            }
        }
    }, []);

    useEffect(() => {
        console.log('WorkoutTracker: Setting up event listeners');
        
        const handleRepUpdate = (data: { reps: number }) => {
            console.log('Received rep update:', data);
            setReps(data.reps);
        };

        const handleVideoFeed = (data: { image: number[] }) => {
            setImage(`data:image/jpeg;base64,${btoa(
                new Uint8Array(data.image).reduce((data, byte) => data + String.fromCharCode(byte), "")
            )}`);
        };

        const handleWorkoutStopped = () => {
            console.log('Workout stopped');
            setIsTracking(false);
            setLastEarnedBadge(null);
        };
        
        socket.on("rep_update", handleRepUpdate);
        socket.on("video_feed", handleVideoFeed);
        socket.on("workout_stopped", handleWorkoutStopped);

        return () => {
            console.log('WorkoutTracker: Cleaning up event listeners');
            socket.off("rep_update", handleRepUpdate);
            socket.off("video_feed", handleVideoFeed);
            socket.off("workout_stopped", handleWorkoutStopped);
        };
    }, []);

    useEffect(() => {
        if (!currentUserId) return; // Don't process badges if no user ID

        // Badge and compliment reward logic
        let newBadge: string | null = null;
        let newCompliment: string | null = null;
        let newMotivationalQuote: string | null = null;

        if (reps >= 50) {
            newBadge = "Gold Badge";
            newCompliment = "Amazing! You're a workout superstar! Keep shining.";
            newMotivationalQuote = "Excellence is not an act, but a habit. You've proven your dedication!";
        } else if (reps >= 20) {
            newBadge = "Silver Badge";
            newCompliment = "Fantastic work! You're on fire! Keep going.";
            newMotivationalQuote = "Every rep brings you closer to your goals. Keep pushing your limits!";
        } else if (reps >= 10) {
            newBadge = "Bronze Badge";
            newCompliment = "Great start! You're doing amazing! Keep pushing.";
            newMotivationalQuote = "The journey of a thousand miles begins with a single step. You're on your way!";
        }

        // Only add new badge if one was earned and hasn't been earned in this session
        if (newBadge && newBadge !== lastEarnedBadge) {
            console.log('Creating new badge for user:', currentUserId);
            const currentDate = new Date().toLocaleDateString();
            const newBadgeObj: Badge = {
                type: newBadge,
                date: currentDate,
                compliment: newCompliment || "",
                userId: currentUserId
            };
            
            setBadge(newBadge);
            setCompliment(newCompliment);
            setMotivationalQuote(newMotivationalQuote);
            setLastEarnedBadge(newBadge);
            
            // Emit badge with user ID
            // Emit badge immediately to MyBadges
            console.log('WorkoutTracker: Emitting new badge:', newBadgeObj);
            socket.emit("new_badge", newBadgeObj);
            
            // Update localStorage directly
            try {
                const badgeKey = `userBadges_${currentUserId}`;
                const savedBadges = localStorage.getItem(badgeKey);
                const currentBadges = savedBadges ? JSON.parse(savedBadges) : [];
                
                // Check if this badge type was already earned today
                const today = new Date().toLocaleDateString();
                const isDuplicate = currentBadges.some(
                    (existingBadge: Badge) => 
                        existingBadge.type === newBadge &&
                        existingBadge.date === today &&
                        existingBadge.userId === currentUserId
                );

                if (!isDuplicate) {
                    const updatedBadges = [...currentBadges, newBadgeObj];
                    localStorage.setItem(badgeKey, JSON.stringify(updatedBadges));
                    console.log('Updated localStorage with new badge for user:', currentUserId);
                } else {
                    console.log('Badge already earned today, skipping save');
                    return;
                }
            } catch (error) {
                console.error('Error updating localStorage:', error);
            }
            
            // Start animation sequence
            setTimeout(() => {
                setAnimatingBadge(newBadgeObj);
                
                // Clear badge display after animation
                setTimeout(() => {
                    setAnimatingBadge(null);
                    setBadge(null);
                    setCompliment(null);
                    setMotivationalQuote(null);
                }, 1000);
            }, 3000);
        }
    }, [reps, lastEarnedBadge]); // Changed from [reps, badge] to [reps, lastEarnedBadge]

    const handleStartTracking = () => {
        if (!exercise) {
            setError("Please select an exercise.");
            return;
        }
        console.log('Starting workout tracking:', exercise);
        setError("");
        setReps(0);
        setBadge(null);
        setCompliment(null);
        setMotivationalQuote(null);
        setAnimatingBadge(null);
        setLastEarnedBadge(null); // Reset last earned badge when starting new workout
        setIsTracking(true);
        socket.emit("start_workout", { exercise });
    };

    const handleStopTracking = () => {
        console.log('Stopping workout tracking');
        socket.emit("stop_workout");
        setIsTracking(false);
    };

    const handleReset = () => {
        setReps(0);
        setError("");
        setBadge(null);
        setCompliment(null);
        setMotivationalQuote(null);
        setAnimatingBadge(null);
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'url("/workout_tracker.jpg")',
            backgroundSize: '100% 100%',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed',
            overflowY: 'auto',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '600px',
                margin: '20px',
                padding: '30px',
                position: 'relative',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                borderRadius: '15px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
            }}>
                <div className="module-header" style={{ 
                    textAlign: 'center',
                    marginBottom: '10px'
                }}>
                    <Dumbbell size={32} style={{ color: 'white', marginBottom: '10px' }} />
                    <h2 style={{ color: 'white', margin: 0, fontSize: '2rem' }}>Workout Tracker</h2>
                </div>

                <div className="form-description" style={{ 
                    textAlign: 'center',
                    color: 'white',
                    marginBottom: '20px'
                }}>
                    <p style={{ margin: '0', fontSize: '1rem', opacity: 0.9 }}>Select an exercise and track your reps dynamically using your webcam.</p>
                </div>

                {error && <div className="error" style={{ 
                    background: 'rgba(255, 0, 0, 0.6)',
                    padding: '8px 15px',
                    borderRadius: '5px',
                    color: 'white',
                    textAlign: 'center'
                }}>{error}</div>}

                <div style={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px'
                }}>
                    <div className="form-group" style={{ 
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                    }}>
                        <label htmlFor="exercise" style={{ color: "white", fontSize: '1rem' }}>Exercise</label>
                        <select
                            id="exercise"
                            value={exercise}
                            onChange={(e) => setExercise(e.target.value)}
                            style={{ 
                                color: "black", 
                                backgroundColor: "white",
                                padding: '12px',
                                borderRadius: '5px',
                                width: '100%',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                fontSize: '1rem',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="" style={{ color: 'black', backgroundColor: 'white' }}>Select an Exercise</option>
                            <option value="bicep curl" style={{ color: 'black', backgroundColor: 'white' }}>Bicep Curl</option>
                            <option value="squats" style={{ color: 'black', backgroundColor: 'white' }}>Squats</option>
                            <option value="push-up" style={{ color: 'black', backgroundColor: 'white' }}>Push-Up</option>
                            <option value="shoulder press" style={{ color: 'black', backgroundColor: 'white' }}>Shoulder Press</option>
                        </select>
                    </div>

                    <div className="form-actions" style={{ 
                        display: 'flex',
                        gap: '10px',
                        justifyContent: 'center'
                    }}>
                        <button 
                            onClick={handleStartTracking} 
                            disabled={isTracking} 
                            className="primary-button" 
                            style={{ 
                                padding: '12px 24px',
                                fontSize: '1rem',
                                background: 'linear-gradient(to right, #e11d48, #7e22ce)',
                                border: 'none',
                                borderRadius: '5px',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                cursor: 'pointer',
                                opacity: isTracking ? 0.7 : 1
                            }}
                        >
                            <Play size={20} /> {isTracking ? "Tracking..." : "Start Tracking"}
                        </button>
                        {isTracking && (
                            <button 
                                onClick={handleStopTracking} 
                                className="primary-button"
                                style={{ 
                                    padding: '12px 24px',
                                    fontSize: '1rem',
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    borderRadius: '5px',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    cursor: 'pointer'
                                }}
                            >
                                <XCircle size={20} /> Stop
                            </button>
                        )}
                    </div>
                </div>

                {image && <div className="video-container" style={{ 
                    padding: '10px',
                    borderRadius: '10px',
                    maxWidth: '100%',
                    aspectRatio: '16/9',
                    overflow: 'hidden'
                }}>
                    <img src={image} alt="Live Workout" style={{ 
                        width: '100%', 
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '5px' 
                    }} />
                </div>}

                {reps > 0 && (
                    <div className="result-card" style={{
                        textAlign: 'center',
                        padding: '15px',
                        borderRadius: '8px'
                    }}>
                        <h3 style={{ color: 'white', marginBottom: '5px', fontSize: '1.1rem' }}>Reps Completed</h3>
                        <div className="result-value">
                            <span className="value" style={{ 
                                color: 'white', 
                                fontSize: '2.5rem', 
                                fontWeight: 'bold'
                            }}>{reps}</span>
                        </div>
                    </div>
                )}

                <AnimatePresence>
                    {badge && !animatingBadge && (
                        <motion.div 
                            className="badge-card"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            style={{
                                background: 'rgba(255, 255, 255, 0.9)',
                                padding: '20px',
                                borderRadius: '10px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                textAlign: 'center',
                                position: 'relative',
                                zIndex: 100,
                                maxWidth: '300px',
                                margin: '0 auto'
                            }}
                        >
                            <motion.div 
                                className="badge-icon-container"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1 }}
                            >
                                <Award size={64} className={`badge-icon ${badge.toLowerCase()}`} />
                            </motion.div>
                            <motion.h3 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                style={{ 
                                    fontSize: '1.5em',
                                    margin: '15px 0',
                                    color: '#2d3748'
                                }}
                            >
                                {badge}
                            </motion.h3>
                            {compliment && (
                                <motion.p 
                                    className="compliment"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    style={{
                                        fontSize: '1.1em',
                                        color: '#4a5568',
                                        marginBottom: '10px'
                                    }}
                                >
                                    {compliment}
                                </motion.p>
                            )}
                            {motivationalQuote && (
                                <motion.p 
                                    className="motivational-quote"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.7 }}
                                    style={{
                                        fontSize: '1em',
                                        color: '#718096',
                                        fontStyle: 'italic',
                                        marginBottom: '15px'
                                    }}
                                >
                                    "{motivationalQuote}"
                                </motion.p>
                            )}
                            <motion.div 
                                className="badge-timer"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.7 }}
                                style={{
                                    fontSize: '0.9em',
                                    color: '#718096',
                                    marginTop: '15px',
                                    padding: '10px',
                                    borderTop: '1px solid #e2e8f0'
                                }}
                            >
                                Moving to My Badges in 3 seconds...
                            </motion.div>
                        </motion.div>
                    )}

                    {animatingBadge && (
                        <motion.div 
                            className="flying-badge"
                            initial={{ 
                                scale: 1,
                                x: 0,
                                y: 0,
                                opacity: 1
                            }}
                            animate={{ 
                                scale: 0.5,
                                x: window.innerWidth - 100,
                                y: -window.innerHeight + 50,
                                opacity: 1
                            }}
                            transition={{
                                duration: 1,
                                ease: "easeInOut"
                            }}
                            style={{
                                position: 'fixed',
                                zIndex: 1000,
                                background: 'white',
                                padding: '15px',
                                borderRadius: '50%',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                pointerEvents: 'none'
                            }}
                        >
                            <Award size={48} className={`badge-icon ${animatingBadge.type.toLowerCase()}`} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default WorkoutTracker;
