import { Award } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import socket from '../utils/socket';

interface Badge {
    type: string;
    date: string;
    compliment: string;
    userId: string;
}

function MyBadges() {
    const [badges, setBadges] = useState<Badge[]>([]);
    const [newBadge, setNewBadge] = useState<Badge | null>(null);
    const [isNewBadgeArriving, setIsNewBadgeArriving] = useState(false);
    const [socketConnected, setSocketConnected] = useState(socket.connected);
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

    // Load badges from localStorage
    const loadBadges = useCallback(() => {
        if (!currentUserId) {
            console.log('No user ID found, cannot load badges');
            return;
        }

        try {
            console.log('Loading badges for user:', currentUserId);
            const badgeKey = `userBadges_${currentUserId}`;
            const savedBadges = localStorage.getItem(badgeKey);
            
            if (savedBadges) {
                const parsedBadges = JSON.parse(savedBadges);
                // Ensure all badges have the current user ID
                const userBadges = parsedBadges.map((badge: Badge) => ({
                    ...badge,
                    userId: currentUserId
                }));
                console.log('Successfully loaded user badges:', userBadges);
                setBadges(userBadges);
            } else {
                // Initialize with empty array and create storage
                console.log('No saved badges found for user, initializing empty array');
                const emptyBadges: Badge[] = [];
                localStorage.setItem(badgeKey, JSON.stringify(emptyBadges));
                setBadges(emptyBadges);
            }
        } catch (error) {
            console.error('Error loading badges:', error);
            setBadges([]); // Initialize with empty array on error
        }
    }, [currentUserId]);

    // Handle new badge reception
    const handleNewBadge = useCallback((badge: Badge) => {
        if (!currentUserId) {
            console.log('No user ID found, cannot handle new badge');
            return;
        }

        console.log('MyBadges: Received new badge:', badge);
        
        // Only process badge if it belongs to current user
        if (badge.userId && badge.userId !== currentUserId) {
            console.log('Badge belongs to different user, ignoring');
            return;
        }
        
        setBadges(prevBadges => {
            // Check for duplicates
            const isDuplicate = prevBadges.some(
                existingBadge => 
                    existingBadge.type === badge.type && 
                    existingBadge.date === badge.date &&
                    existingBadge.userId === currentUserId
            );

            if (isDuplicate) {
                console.log('Badge already exists in state, skipping...');
                return prevBadges;
            }

            console.log('Adding new badge to collection');
            const badgeWithUser = { ...badge, userId: currentUserId };
            const updatedBadges = [...prevBadges, badgeWithUser];
            
            // Update localStorage
            try {
                const badgeKey = `userBadges_${currentUserId}`;
                localStorage.setItem(badgeKey, JSON.stringify(updatedBadges));
                console.log('Successfully saved badges to localStorage for user:', currentUserId);
            } catch (error) {
                console.error('Error saving badges to localStorage:', error);
            }

            return updatedBadges;
        });

        // Show notification
        setIsNewBadgeArriving(true);
        setTimeout(() => {
            setIsNewBadgeArriving(false);
            setNewBadge(badge);
            setTimeout(() => {
                setNewBadge(null);
            }, 3000);
        }, 1000);
    }, [currentUserId]);

    // Set up socket connection and event listeners
    useEffect(() => {
        if (!currentUserId) return; // Don't set up socket if no user ID

        console.log('Setting up socket event listeners for user:', currentUserId);
        
        const onConnect = () => {
            console.log('MyBadges: Socket connected');
            setSocketConnected(true);
            loadBadges(); // Reload badges when reconnected
        };

        const onDisconnect = () => {
            console.log('MyBadges: Socket disconnected');
            setSocketConnected(false);
        };

        // Set up event listeners
        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('new_badge', handleNewBadge);

        // Initial load
        if (socket.connected) {
            setSocketConnected(true);
            loadBadges();
        }

        return () => {
            console.log('Cleaning up socket event listeners');
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('new_badge', handleNewBadge);
        };
    }, [loadBadges, handleNewBadge, currentUserId]);

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.3
            }
        }
    };

    const badgeVariants = {
        hidden: { 
            opacity: 0, 
            y: 20,
            scale: 0.8 
        },
        show: { 
            opacity: 1, 
            y: 0,
            scale: 1,
            transition: {
                type: "spring",
                stiffness: 200,
                damping: 15
            }
        }
    };

    const notificationVariants = {
        initial: {
            opacity: 0,
            y: -20,
            scale: 0.9
        },
        animate: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 20
            }
        },
        exit: {
            opacity: 0,
            y: -20,
            transition: {
                duration: 0.2
            }
        }
    };

    // Function to get badge color based on type
    const getBadgeColor = (type: string) => {
        switch (type.toLowerCase()) {
            case 'gold badge':
                return '#FFD700';
            case 'silver badge':
                return '#C0C0C0';
            case 'bronze badge':
                return '#CD7F32';
            default:
                return '#A0AEC0';
        }
    };

    return (
        <div className="module-container">
            {!socketConnected && (
                <div style={{ 
                    background: '#FED7D7', 
                    color: '#9B2C2C',
                    padding: '10px',
                    marginBottom: '10px',
                    borderRadius: '5px',
                    textAlign: 'center'
                }}>
                    Socket disconnected. Reconnecting...
                </div>
            )}
            
            <div className="module-header">
                <Award size={32} />
                <h2>My Badges</h2>
                <motion.span 
                    className="badge-count"
                    key={badges.length}
                    initial={{ scale: 1.5, color: '#48BB78' }}
                    animate={{ scale: 1, color: '#A0AEC0' }}
                    transition={{ duration: 0.5 }}
                >
                    ({badges.length})
                </motion.span>
            </div>

            {/* Badge Arrival Notification */}
            <AnimatePresence>
                {newBadge && !isNewBadgeArriving && (
                    <motion.div
                        className="badge-notification"
                        variants={notificationVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        style={{
                            position: 'fixed',
                            top: '20px',
                            right: '20px',
                            background: 'white',
                            padding: '15px',
                            borderRadius: '10px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            zIndex: 1000,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '15px',
                            minWidth: '200px'
                        }}
                    >
                        <Award 
                            size={32} 
                            style={{ color: getBadgeColor(newBadge.type) }}
                        />
                        <div>
                            <h3 style={{ margin: '0 0 5px 0' }}>{newBadge.type}</h3>
                            <p style={{ margin: 0, fontSize: '0.9em', color: '#666' }}>Added to collection!</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="badges-description">
                <p>Your earned badges and achievements will be displayed here.</p>
            </div>

            <motion.div 
                className="badges-grid"
                variants={containerVariants}
                initial="hidden"
                animate="show"
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '20px',
                    padding: '20px'
                }}
            >
                {badges.length > 0 ? (
                    badges.map((badge, index) => (
                        <motion.div
                            key={`${badge.type}-${badge.date}-${index}`}
                            className="badge-item"
                            variants={badgeVariants}
                            initial={index === badges.length - 1 ? "hidden" : false}
                            animate="show"
                            style={{
                                background: 'white',
                                padding: '20px',
                                borderRadius: '10px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                textAlign: 'center'
                            }}
                        >
                            <Award 
                                size={48} 
                                style={{ color: getBadgeColor(badge.type) }}
                            />
                            <h3 style={{ color: getBadgeColor(badge.type) }}>
                                {badge.type}
                            </h3>
                            <p className="badge-date" style={{ color: '#718096' }}>
                                {badge.date}
                            </p>
                            <p className="badge-compliment" style={{ color: '#4A5568' }}>
                                {badge.compliment}
                            </p>
                        </motion.div>
                    ))
                ) : (
                    <motion.div 
                        className="no-badges"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{
                            textAlign: 'center',
                            padding: '40px',
                            color: '#718096'
                        }}
                    >
                        <Award size={48} style={{ marginBottom: '20px', opacity: 0.5 }} />
                        <p>No badges earned yet. Start working out to earn badges!</p>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}

export default MyBadges; 