import { useState } from "react";
import axios from "axios";
import { Dumbbell, AlertTriangle, Info, Play, Pause } from "lucide-react";

// Exercise video mapping with variations and descriptions
const exerciseVideos: { [key: string]: { videoId: string; variations: string[]; description: string } } = {
    // Upper Body Exercises
    "wall push-ups": {
        videoId: "EgW2QFtmxRw",
        variations: ["wall pushups", "standing pushups", "incline push-ups"],
        description: "Stand facing wall at arm's length, place hands on wall at shoulder height. Lower chest toward wall by bending elbows, then push back."
    },
    "shoulder taps": {
        videoId: "gWHQpMUd7vw",
        variations: ["plank shoulder taps", "alternating shoulder taps"],
        description: "Start in plank position, alternately tap opposite shoulder while maintaining stable plank position."
    },
    "arm circles": {
        videoId: "140RTNMciH8",
        variations: ["arm rotations", "shoulder circles"],
        description: "Stand with arms extended to sides, make controlled circular motions, both forward and backward."
    },
    "triceps dips": {
        videoId: "6kALZikXxLc",
        variations: ["bench dips", "chair dips"],
        description: "Using a stable surface, lower body by bending elbows, then push back up to starting position."
    },
    "push-ups": {
        videoId: "IODxDxX7oi4",
        variations: ["standard push-ups", "modified push-ups", "knee push-ups"],
        description: "Start in plank position, lower chest to ground by bending elbows, then push back up while maintaining straight body."
    },

    // Lower Body Exercises
    "bodyweight squats": {
        videoId: "aclHkVaku9U",
        variations: ["air squats", "basic squats", "squats"],
        description: "Stand with feet shoulder-width apart, lower body by bending knees and hips while keeping back straight."
    },
    "lunges": {
        videoId: "QOVaHwm-Q6U",
        variations: ["forward lunges", "walking lunges", "static lunges", "reverse lunges"],
        description: "Step forward with one leg, lower body until both knees are bent at 90 degrees, then return to starting position."
    },
    "calf raises": {
        videoId: "gwLzALptbc8",
        variations: ["standing calf raises", "heel raises"],
        description: "Stand with feet hip-width apart, rise up onto balls of feet, then lower heels back down."
    },
    "step-ups": {
        videoId: "WCFCdxzFBa4",
        variations: ["box step-ups", "bench step-ups"],
        description: "Using a stable elevated surface, step up with one foot, bring other foot up, then step back down."
    },

    // Core Exercises
    "bicycle crunches": {
        videoId: "9FGilxCbdz8",
        variations: ["bike crunches", "cycling crunches"],
        description: "Lie on back, alternate bringing opposite elbow to opposite knee while extending other leg."
    },
    "russian twists": {
        videoId: "wkD8rjkodUI",
        variations: ["seated twists", "trunk rotations"],
        description: "Sit with knees bent, feet off ground, rotate torso side to side while keeping feet elevated."
    },
    "plank": {
        videoId: "ASdvN_XEl_c",
        variations: ["forearm plank", "high plank"],
        description: "Hold push-up position with body straight from head to heels, engaging core throughout."
    },

    // Cardio Exercises
    "jumping jacks": {
        videoId: "c4DAnQ6DtF8",
        variations: ["star jumps", "side straddle hops"],
        description: "Jump while spreading legs and raising arms overhead, return to starting position with arms at sides and legs together."
    },
    "high knees": {
        videoId: "oDdkytliOqE",
        variations: ["running in place", "knee drives"],
        description: "Run in place, driving knees toward chest while pumping arms."
    },
    "mountain climbers": {
        videoId: "nmwgirgXLYM",
        variations: ["climbers", "running plank"],
        description: "In plank position, alternate driving knees toward chest in running motion."
    },

    // Back & Posture Exercises
    "superman hold": {
        videoId: "cc6UVRS7PW4",
        variations: ["superman", "back extension"],
        description: "Lie face down, lift arms and legs off ground simultaneously, hold position."
    },
    "bird dog": {
        videoId: "wiFNA3sqjCA",
        variations: ["quadruped limb raises"],
        description: "On hands and knees, extend opposite arm and leg while maintaining balance."
    },
    "wall angels": {
        videoId: "ELe4fATl-Jg",
        variations: ["wall slides", "scapular wall slides"],
        description: "Stand against wall, slide arms up and down while maintaining contact with wall."
    },

    // Flexibility & Recovery
    "cat-cow": {
        videoId: "kqnua4rHVVA",
        variations: ["cat cow stretch"],
        description: "On hands and knees, alternate between arching (cow) and rounding (cat) your back."
    },
    "child's pose": {
        videoId: "2vJKSlfLX10",
        variations: ["child pose", "resting pose"],
        description: "Kneel on floor, sit back on heels, extend arms forward, rest forehead on mat."
    },
    "hip openers": {
        videoId: "NG9qbvAN3gQ",
        variations: ["hip mobility", "hip flexor stretch"],
        description: "Perform gentle movements to increase hip mobility and flexibility."
    },

    // Glute & Hip Exercises
    "glute bridges": {
        videoId: "OsUz898onTE",
        variations: ["hip raises", "bridge", "hip thrust"],
        description: "Lie on back with knees bent, lift hips toward ceiling by squeezing glutes."
    },
    "side leg raises": {
        videoId: "izV3KE2Ld0c",
        variations: ["lateral leg raises", "hip abduction"],
        description: "Lie on side, lift top leg while keeping it straight, lower back down with control."
    },
    "hamstring curls": {
        videoId: "ELOCsoDSmrg",
        variations: ["leg curls", "lying leg curls"],
        description: "Lie face down, bend knee to bring heel toward buttocks, lower back down with control."
    }
};

function WorkoutRecommender() {
    const [formData, setFormData] = useState({
        Age: "",          // Adjusted field to match new input
        "Activity Level": "",
        Gender: ""
    });
    const [workoutPlan, setWorkoutPlan] = useState<any>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [activeDay, setActiveDay] = useState<string | null>(null);
    const [showDescription, setShowDescription] = useState(false);
    const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
    const [activeExercise, setActiveExercise] = useState<string | null>(null);
    const [isGifPlaying, setIsGifPlaying] = useState(true);
    const [failedGifs, setFailedGifs] = useState<Set<string>>(new Set());

    const activityLevels = ["Beginner", "Intermediate", "Advanced"];
    const activityLevelInfo: { [key: string]: string } = {
        "Beginner": "New to exercise, little to no experience with structured workouts, or returning after a long break.",
        "Intermediate": "Regular exercise routine for 6+ months, familiar with proper form and basic exercises.",
        "Advanced": "Consistent training for 1+ years, strong foundation in various exercises, looking for challenging workouts."
    };
    const ageGroups = ["Kids", "Teens", "Adults", "Seniors"];  // Adjusted for new age input
    const genderOptions = ["Male", "Female"];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.Age || !formData["Activity Level"] || !formData.Gender) {
            setError("Please fill all required fields");
            return;
        }

        setError("");
        setWorkoutPlan(null);
        setActiveDay(null);
        setLoading(true);

        try {
            const response = await axios.post("http://localhost:5000/api/workout", formData);
            setWorkoutPlan(response.data);
            if (response.data && Object.keys(response.data).length > 0) {
                setActiveDay(Object.keys(response.data)[0]);
            }
        } catch (err) {
            setError("Error fetching workout recommendations. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Helper function to find matching exercise
    const findMatchingExercise = (exerciseName: string) => {
        // Convert exercise name to lowercase and remove extra spaces
        const normalizedName = exerciseName.toLowerCase().trim();
        
        // First try exact match
        for (const [key, value] of Object.entries(exerciseVideos)) {
            if (key.toLowerCase() === normalizedName) {
                return value;
            }
        }
        
        // Then try matching variations
        for (const [key, value] of Object.entries(exerciseVideos)) {
            if (value.variations.includes(normalizedName)) {
                return value;
            }
        }
        
        // Return null if no match found
        return null;
    };

    return (
        <div className="module-container" style={{ 
            color: 'white',
            background: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6))`,
            minHeight: '100vh',
            padding: '2rem',
            position: 'relative',
            maxWidth: '1200px',
            margin: '0 auto'
        }}>
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `url('/battle-ropes-workout.jpg')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                opacity: 0.4,
                zIndex: -1
            }} />

            <div className="module-header" style={{
                background: 'rgba(0, 0, 0, 0.7)',
                padding: '1rem',
                borderRadius: '10px',
                marginBottom: '2rem',
                maxWidth: '600px',
                margin: '0 auto 2rem auto',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                justifyContent: 'center'
            }}>
                <Dumbbell size={32} />
                <h2 style={{ margin: 0 }}>Workout Recommender</h2>
            </div>

            <div className="form-description" style={{
                background: 'rgba(0, 0, 0, 0.7)',
                padding: '1.5rem',
                borderRadius: '10px',
                marginBottom: '2rem',
                maxWidth: '600px',
                margin: '0 auto 2rem auto'
            }}>
                <p>
                    Enter your details to get a personalized workout plan tailored to your needs.
                    <button 
                        className="info-button" 
                        onClick={() => setShowDescription(!showDescription)}
                    >
                        {showDescription ? "Hide Info" : "Show Info"}
                    </button>
                </p>

                {showDescription && (
                    <div className="additional-info">
                        <p>
                            This tool provides workout recommendations based on your age, activity level, and gender.
                            The plan is designed to help you achieve optimal fitness results safely.
                        </p>
                    </div>
                )}
            </div>

            <div className="search-container" style={{
                background: 'rgba(0, 0, 0, 0.7)',
                padding: '2rem',
                borderRadius: '10px',
                maxWidth: '600px',
                margin: '0 auto'
            }}>
                <div className="form-group">
                    <label htmlFor="Age">Age</label>
                    <select
                        id="Age"
                        name="Age"
                        value={formData.Age}
                        onChange={handleChange}
                        required
                        style={{ 
                            color: 'white',
                            backgroundColor: 'transparent'
                        }}
                    >
                        <option value="" style={{ color: 'white', backgroundColor: '#333' }}>Select Age Group</option>
                        {ageGroups.map((age, index) => (
                            <option key={index} value={age} style={{ color: 'white', backgroundColor: '#333' }}>{age}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="ActivityLevel">Activity Level</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <select
                            id="ActivityLevel"
                            name="Activity Level"
                            value={formData["Activity Level"]}
                            onChange={handleChange}
                            required
                            style={{ 
                                color: 'white',
                                backgroundColor: 'transparent'
                            }}
                        >
                            <option value="" style={{ color: 'white', backgroundColor: '#333' }}>Select activity level</option>
                            {activityLevels.map((level, index) => (
                                <option key={index} value={level} style={{ color: 'white', backgroundColor: '#333' }}>{level}</option>
                            ))}
                        </select>
                        <div 
                            style={{ 
                                position: 'relative',
                                display: 'inline-flex',
                                alignItems: 'center'
                            }}
                            onMouseEnter={() => setActiveTooltip('info')}
                            onMouseLeave={() => setActiveTooltip(null)}
                        >
                            <Info 
                                size={16} 
                                style={{ 
                                    cursor: 'pointer',
                                    color: 'white',
                                    transition: 'transform 0.3s ease, opacity 0.3s ease',
                                    transform: activeTooltip === 'info' ? 'scale(1.2)' : 'scale(1)',
                                    opacity: activeTooltip === 'info' ? '1' : '0.7'
                                }}
                            />
                            {activeTooltip === 'info' && (
                                <div style={{
                                    position: 'absolute',
                                    bottom: '100%',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    color: 'white',
                                    padding: '12px 16px',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    whiteSpace: 'pre-line',
                                    zIndex: 1000,
                                    marginBottom: '5px',
                                    width: 'max-content',
                                    maxWidth: '300px',
                                    textAlign: 'left',
                                    background: 'rgba(0, 0, 0, 0.75)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    backdropFilter: 'blur(8px)',
                                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
                                    animation: 'fadeIn 0.3s ease'
                                }}>
                                    {activityLevels.map(level => (
                                        <div key={level} style={{ marginBottom: '12px' }}>
                                            <strong style={{ color: '#fff', opacity: 1 }}>{level}:</strong>
                                            <div style={{ color: '#fff', opacity: 0.9, marginTop: '4px', lineHeight: '1.4' }}>
                                                {activityLevelInfo[level]}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="Gender">Gender</label>
                    <select
                        id="Gender"
                        name="Gender"
                        value={formData.Gender}
                        onChange={handleChange}
                        required
                        style={{ 
                            color: 'white',
                            backgroundColor: 'transparent'
                        }}
                    >
                        <option value="" style={{ color: 'white', backgroundColor: '#333' }}>Select gender</option>
                        {genderOptions.map((gender, index) => (
                            <option key={index} value={gender} style={{ color: 'white', backgroundColor: '#333' }}>{gender}</option>
                        ))}
                    </select>
                </div>

                <button 
                    onClick={handleSubmit} 
                    disabled={loading}
                    className="search-button"
                    style={{
                        backgroundColor: 'black',
                        color: 'white',
                        padding: '12px 24px',
                        border: '2px solid white',
                        borderRadius: '8px',
                        fontSize: '16px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'block',
                        margin: '30px auto',
                        width: 'fit-content'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.boxShadow = '0 0 15px rgba(255, 255, 255, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = 'none';
                    }}
                >
                    {loading ? "Generating..." : "Get Workout Plan"}
                </button>
            </div>

            {error && (
                <div className="error" style={{
                    background: 'rgba(255, 0, 0, 0.2)',
                    padding: '1rem',
                    borderRadius: '10px',
                    marginTop: '1rem',
                    maxWidth: '600px',
                    margin: '1rem auto'
                }}>
                    {error}
                </div>
            )}

            {loading && (
                <div className="loading-spinner" style={{
                    background: 'rgba(0, 0, 0, 0.7)',
                    padding: '2rem',
                    borderRadius: '10px',
                    marginTop: '1rem',
                    maxWidth: '600px',
                    margin: '1rem auto'
                }}>
                    <div className="spinner"></div>
                    <p>Creating your personalized workout plan...</p>
                </div>
            )}

            {workoutPlan && (
                <div className="workout-result" style={{
                    background: 'rgba(0, 0, 0, 0.7)',
                    padding: '2rem',
                    borderRadius: '10px',
                    marginTop: '1rem',
                    maxWidth: '1000px',
                    margin: '1rem auto'
                }}>
                    <h3 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Your Workout Plan</h3>
                    
                    <div className="day-tabs" style={{
                        display: 'flex',
                        gap: '10px',
                        marginBottom: '20px',
                        flexWrap: 'wrap',
                        justifyContent: 'center'
                    }}>
                        {Object.keys(workoutPlan).map((day) => (
                            <button
                                key={day}
                                style={{
                                    padding: '8px 16px',
                                    background: activeDay === day ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.5)',
                                    border: '1px solid rgba(255, 255, 255, 0.3)',
                                    borderRadius: '5px',
                                    color: 'white',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                                onClick={() => setActiveDay(day)}
                            >
                                {day}
                            </button>
                        ))}
                    </div>

                    {activeDay && (
                        <div className="day-workout" style={{
                            background: 'rgba(0, 0, 0, 0.5)',
                            padding: '20px',
                            borderRadius: '8px'
                        }}>
                            <h4 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>{activeDay}'s Workout</h4>
                            <div className="exercise-details">
                                <div className="exercise-list" style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '15px',
                                    maxWidth: '800px',
                                    margin: '0 auto'
                                }}>
                                    {workoutPlan[activeDay]["Exercise Plan"].split(',').map((exercise: string, index: number) => {
                                        const exerciseName = exercise.trim();
                                        const matchingExercise = findMatchingExercise(exerciseName.toLowerCase());
                                        
                                        return (
                                            <div key={index} style={{
                                                background: 'rgba(255, 255, 255, 0.1)',
                                                padding: '15px',
                                                borderRadius: '8px',
                                                display: 'flex',
                                                gap: '20px',
                                                alignItems: 'center',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s ease',
                                                transform: activeExercise === exerciseName ? 'scale(1.02)' : 'scale(1)',
                                                position: 'relative'
                                            }} onClick={() => setActiveExercise(activeExercise === exerciseName ? null : exerciseName)}>
                                                <div style={{
                                                    width: '200px',
                                                    height: '150px',
                                                    borderRadius: '8px',
                                                    overflow: 'hidden',
                                                    flexShrink: 0,
                                                    border: '2px solid rgba(255, 255, 255, 0.1)'
                                                }}>
                                                    {matchingExercise && (
                                                        <iframe
                                                            width="100%"
                                                            height="100%"
                                                            src={`https://www.youtube.com/embed/${matchingExercise.videoId}?controls=0&autoplay=0`}
                                                            title={exerciseName}
                                                            frameBorder="0"
                                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                            allowFullScreen
                                                            style={{
                                                                width: '100%',
                                                                height: '100%',
                                                                objectFit: 'cover'
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                                
                                                <div style={{ flex: 1 }}>
                                                    <span style={{
                                                        fontSize: '18px',
                                                        fontWeight: 'bold',
                                                        display: 'block',
                                                        marginBottom: '8px',
                                                        color: 'rgba(255, 255, 255, 0.9)'
                                                    }}>{exerciseName}</span>
                                                    {matchingExercise && (
                                                        <span style={{
                                                            fontSize: '14px',
                                                            opacity: 0.8,
                                                            color: 'rgba(255, 255, 255, 0.7)',
                                                            display: 'block',
                                                            lineHeight: '1.4'
                                                        }}>{matchingExercise.description}</span>
                                                    )}
                                                </div>
                                                
                                                <div style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    background: 'rgba(255, 255, 255, 0.1)',
                                                    borderRadius: '50%',
                                                    flexShrink: 0
                                                }}>
                                                    <Play size={24} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="workout-footer" style={{
                        marginTop: '20px',
                        padding: '15px',
                        background: 'rgba(255, 165, 0, 0.1)',
                        borderRadius: '5px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        justifyContent: 'center'
                    }}>
                    
                    </div>
                </div>
            )}

            {/* Modal for full-screen exercise view */}
            {activeExercise && (
                <div className="exercise-modal" style={{
                    position: 'fixed',
                    top: '0',
                    left: '0',
                    right: '0',
                    bottom: '0',
                    background: 'rgba(0, 0, 0, 0.95)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '20px'
                }}>
                    <div style={{
                        maxWidth: '90vw',
                        maxHeight: '90vh',
                        width: '800px',
                        position: 'relative',
                        background: 'rgba(0, 0, 0, 0.8)',
                        borderRadius: '10px',
                        padding: '30px'
                    }}>
                        <button
                            onClick={() => setActiveExercise(null)}
                            style={{
                                position: 'absolute',
                                top: '15px',
                                right: '15px',
                                background: 'rgba(255, 255, 255, 0.1)',
                                border: 'none',
                                color: 'white',
                                width: '30px',
                                height: '30px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                fontSize: '20px'
                            }}
                        >
                            ×
                        </button>
                        
                        <h3 style={{ 
                            color: 'white', 
                            textAlign: 'center',
                            marginBottom: '25px'
                        }}>
                            {activeExercise}
                        </h3>

                        {findMatchingExercise(activeExercise.toLowerCase()) && (
                            <div style={{
                                width: '100%',
                                height: '0',
                                paddingBottom: '56.25%',
                                position: 'relative',
                                marginBottom: '20px'
                            }}>
                                <iframe
                                    style={{
                                        position: 'absolute',
                                        top: '0',
                                        left: '0',
                                        width: '100%',
                                        height: '100%'
                                    }}
                                    src={`https://www.youtube.com/embed/${findMatchingExercise(activeExercise.toLowerCase())?.videoId}?autoplay=1`}
                                    title={activeExercise}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>
                        )}

                        {findMatchingExercise(activeExercise.toLowerCase()) && (
                            <p style={{
                                color: 'white',
                                opacity: 0.8,
                                textAlign: 'center',
                                marginTop: '20px',
                                lineHeight: '1.6'
                            }}>
                                {findMatchingExercise(activeExercise.toLowerCase())?.description}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default WorkoutRecommender;
