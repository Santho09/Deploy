import React, { useState, useEffect } from "react";
import { Info } from "lucide-react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

interface SleepData {
    sleepTime: string;
    sleepInterruption: string;
    age: string;
    gender: string;
    stressLevel: string;
    physicalActivity: string;
    screenTime: string;
}

interface Recommendation {
    Sleep_Score?: number;
    Deep_Sleep?: number;
    REM_Sleep?: number;
    Hours_of_Sleep?: number;
    Sleep_Efficiency?: number;
    Sleep_Health?: string;
    Recommendations?: string;
}

const SleepRecommender: React.FC = () => {
    const [sleepData, setSleepData] = useState<SleepData>({
        sleepTime: "",
        sleepInterruption: "",
        age: "",
        gender: "",
        stressLevel: "",
        physicalActivity: "",
        screenTime: ""
    });

    const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [showDescription, setShowDescription] = useState(false);

    // Handle Input Changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setSleepData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    // Handle Form Submit
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setRecommendation(null);

        try {
            const response = await fetch("http://localhost:5005/api/sleep", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    Age: sleepData.age,
                    Gender: sleepData.gender,
                    Sleep_Time: sleepData.sleepTime,
                    Sleep_Interruptions: sleepData.sleepInterruption,
                    Stress_Level: sleepData.stressLevel,
                    Physical_Activity: sleepData.physicalActivity,
                    Screen_Time: sleepData.screenTime
                })
            });

            if (!response.ok) {
                throw new Error("Failed to get sleep recommendations.");
            }

            const result = await response.json();
            console.log("API Response:", result); // ✅ Debugging

            // ✅ Convert API response keys to match frontend
            const formattedResult: Recommendation = {
                Sleep_Score: result["Sleep Score"],
                Deep_Sleep: result["Deep Sleep (%)"],
                REM_Sleep: result["REM Sleep (%)"],
                Hours_of_Sleep: result["Total Hours of Sleep"],
                Sleep_Efficiency: result["Sleep Efficiency (%)"],
                Sleep_Health: result["Sleep Health"],
                Recommendations: result["Recommendations"]
            };

            setRecommendation(formattedResult);
        } catch (err) {
            setError("Failed to get sleep recommendations. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        console.log("Updated recommendation:", recommendation);
    }, [recommendation]);

    return (
        <div style={{
            position: 'relative',
            width: '100%',
            minHeight: '100vh',
            margin: '0',
            padding: '20px',
            boxSizing: 'border-box',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start'
        }}>
            {/* Background Image Layer */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: 'url("/sleep.jpeg.jpg")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                opacity: 0.8,
                zIndex: -1
            }} />
            
            {/* Content Container */}
            <div style={{
                maxWidth: '600px',
                width: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                borderRadius: '10px',
                padding: '20px',
                color: 'white',
                backdropFilter: 'blur(5px)'
            }}>
                <div className="module-header">
                    <Info size={32} />
                    <h2>Sleep Recommender</h2>
                </div>

                <div className="form-description">
                    <p>
                        Enter your sleep details to get a personalized sleep recommendation.
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
                                This tool provides sleep recommendations based on your sleep details.
                            </p>
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="search-container">
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '1fr 1fr', 
                        gap: '20px',
                        marginBottom: '20px'
                    }}>
                        {/* Left Column */}
                        <div>
                            <div className="form-group">
                                <label htmlFor="sleepTime" style={{ color: 'white' }}>
                                    Sleep Time (hours):
                                </label>
                                <input 
                                    type="number" 
                                    id="sleepTime" 
                                    name="sleepTime" 
                                    value={sleepData.sleepTime} 
                                    onChange={handleChange} 
                                    required 
                                    style={{ backgroundColor: 'black', color: 'white', width: '100%' }}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="age" style={{ color: 'white' }}>
                                    Age:
                                </label>
                                <input 
                                    type="number" 
                                    id="age" 
                                    name="age" 
                                    value={sleepData.age} 
                                    onChange={handleChange} 
                                    required 
                                    style={{ backgroundColor: 'black', color: 'white', width: '100%' }}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="stressLevel" style={{ color: 'white' }}>
                                    Stress Level (1-10):
                                </label>
                                <input 
                                    type="number" 
                                    id="stressLevel" 
                                    name="stressLevel" 
                                    value={sleepData.stressLevel} 
                                    onChange={handleChange} 
                                    required 
                                    style={{ backgroundColor: 'black', color: 'white', width: '100%' }}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="screenTime" style={{ color: 'white' }}>
                                    Screen Time (min):
                                </label>
                                <input 
                                    type="number" 
                                    id="screenTime" 
                                    name="screenTime" 
                                    value={sleepData.screenTime} 
                                    onChange={handleChange} 
                                    required 
                                    style={{ backgroundColor: 'black', color: 'white', width: '100%' }}
                                />
                            </div>
                        </div>

                        {/* Right Column */}
                        <div>
                            <div className="form-group">
                                <label htmlFor="sleepInterruption" style={{ color: 'white' }}>
                                    Sleep Interruptions:
                                </label>
                                <input 
                                    type="number" 
                                    id="sleepInterruption" 
                                    name="sleepInterruption" 
                                    value={sleepData.sleepInterruption} 
                                    onChange={handleChange} 
                                    required 
                                    style={{ backgroundColor: 'black', color: 'white', width: '100%' }}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="gender" style={{ color: 'white' }}>
                                    Gender:
                                </label>
                                <select 
                                    id="gender" 
                                    name="gender" 
                                    value={sleepData.gender} 
                                    onChange={handleChange} 
                                    required 
                                    style={{ backgroundColor: 'black', color: 'white', width: '100%' }}
                                >
                                    <option value="">Select</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="physicalActivity" style={{ color: 'white' }}>
                                    Physical Activity (min):
                                </label>
                                <input 
                                    type="number" 
                                    id="physicalActivity" 
                                    name="physicalActivity" 
                                    value={sleepData.physicalActivity} 
                                    onChange={handleChange} 
                                    required 
                                    style={{ backgroundColor: 'black', color: 'white', width: '100%' }}
                                />
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                        <button 
                            type="submit" 
                            disabled={loading} 
                            className="search-button"
                            style={{
                                background: 'linear-gradient(45deg, #ff1493, #8b008b, #4b0082)',
                                color: 'white',
                                padding: '8px 16px',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                transition: 'all 0.3s ease',
                                backgroundSize: '200% 200%',
                                animation: 'gradient 3s ease infinite',
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                boxShadow: '0 4px 15px rgba(255, 20, 147, 0.2)',
                                width: 'fit-content',
                                whiteSpace: 'nowrap'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.05)';
                                e.currentTarget.style.backgroundPosition = '100% 100%';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.backgroundPosition = '0% 0%';
                            }}
                        >
                            {loading ? "Loading..." : "Get Recommendation"}
                        </button>
                    </div>
                </form>

                {error && <div className="error">{error}</div>}

                {loading && (
                    <div className="loading-spinner">
                        <div className="spinner"></div>
                        <p>Generating your personalized sleep recommendation...</p>
                    </div>
                )}

                {recommendation && (
                    <div className="workout-result" style={{ 
                        backgroundColor: 'rgba(0, 0, 0, 0.5)', 
                        padding: '20px', 
                        borderRadius: '8px',
                        marginTop: '20px'
                    }}>
                        <h3>Your Sleep Recommendation</h3>
                        
                        {/* Charts Container */}
                        <div style={{ 
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '15px',
                            marginBottom: '20px',
                            width: '100%'
                        }}>
                            {/* Sleep Composition Doughnut Chart */}
                            <div style={{ 
                                background: 'rgba(0, 0, 0, 0.3)', 
                                padding: '8px', 
                                borderRadius: '8px',
                                height: '220px',
                                width: '100%',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                <Doughnut
                                    data={{
                                        labels: ['Deep Sleep', 'REM Sleep', 'Light Sleep'],
                                        datasets: [{
                                            data: [
                                                recommendation.Deep_Sleep || 0,
                                                recommendation.REM_Sleep || 0,
                                                100 - ((recommendation.Deep_Sleep || 0) + (recommendation.REM_Sleep || 0))
                                            ],
                                            backgroundColor: [
                                                'rgba(75, 192, 192, 0.8)',
                                                'rgba(153, 102, 255, 0.8)',
                                                'rgba(255, 159, 64, 0.8)'
                                            ],
                                            borderColor: [
                                                'rgba(75, 192, 192, 1)',
                                                'rgba(153, 102, 255, 1)',
                                                'rgba(255, 159, 64, 1)'
                                            ],
                                            borderWidth: 1
                                        }]
                                    }}
                                    options={{
                                        maintainAspectRatio: false,
                                        responsive: true,
                                        layout: {
                                            padding: {
                                                bottom: 10
                                            }
                                        },
                                        plugins: {
                                            title: {
                                                display: true,
                                                text: 'Sleep Composition',
                                                color: 'white',
                                                font: { size: 12 },
                                                padding: { bottom: 5 }
                                            },
                                            legend: {
                                                position: 'bottom',
                                                labels: { 
                                                    color: 'white',
                                                    padding: 5,
                                                    boxWidth: 10,
                                                    boxHeight: 10,
                                                    font: {
                                                        size: 10
                                                    }
                                                }
                                            }
                                        }
                                    }}
                                />
                            </div>

                            {/* Sleep Metrics Bar Chart */}
                            <div style={{ 
                                background: 'rgba(0, 0, 0, 0.3)', 
                                padding: '8px', 
                                borderRadius: '8px',
                                height: '220px',
                                width: '100%',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                <Bar
                                    data={{
                                        labels: ['Sleep Score', 'Sleep Efficiency', 'Hours of Sleep'],
                                        datasets: [{
                                            label: 'Sleep Metrics',
                                            data: [
                                                recommendation.Sleep_Score || 0,
                                                recommendation.Sleep_Efficiency || 0,
                                                (recommendation.Hours_of_Sleep || 0) * 10
                                            ],
                                            backgroundColor: [
                                                'rgba(255, 99, 132, 0.8)',
                                                'rgba(54, 162, 235, 0.8)',
                                                'rgba(75, 192, 192, 0.8)'
                                            ],
                                            borderColor: [
                                                'rgba(255, 99, 132, 1)',
                                                'rgba(54, 162, 235, 1)',
                                                'rgba(75, 192, 192, 1)'
                                            ],
                                            borderWidth: 1
                                        }]
                                    }}
                                    options={{
                                        maintainAspectRatio: false,
                                        responsive: true,
                                        layout: {
                                            padding: {
                                                bottom: 5
                                            }
                                        },
                                        scales: {
                                            y: {
                                                beginAtZero: true,
                                                grid: {
                                                    color: 'rgba(255, 255, 255, 0.1)'
                                                },
                                                ticks: { 
                                                    color: 'white',
                                                    font: {
                                                        size: 10
                                                    },
                                                    padding: 0
                                                }
                                            },
                                            x: {
                                                grid: {
                                                    color: 'rgba(255, 255, 255, 0.1)'
                                                },
                                                ticks: { 
                                                    color: 'white',
                                                    font: {
                                                        size: 10
                                                    },
                                                    padding: 0
                                                }
                                            }
                                        },
                                        plugins: {
                                            title: {
                                                display: true,
                                                text: 'Sleep Metrics',
                                                color: 'white',
                                                font: { size: 12 },
                                                padding: { bottom: 5 }
                                            },
                                            legend: {
                                                display: false
                                            }
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        {/* Text Results */}
                        <div className="exercise-details">
                            <div className="detail-item"><span className="detail-label">Sleep Score:</span> {recommendation.Sleep_Score ?? "N/A"}</div>
                            <div className="detail-item"><span className="detail-label">Deep Sleep:</span> {recommendation.Deep_Sleep ?? "N/A"}%</div>
                            <div className="detail-item"><span className="detail-label">REM Sleep:</span> {recommendation.REM_Sleep ?? "N/A"}%</div>
                            <div className="detail-item"><span className="detail-label">Hours of Sleep:</span> {recommendation.Hours_of_Sleep ?? "N/A"} hrs</div>
                            <div className="detail-item"><span className="detail-label">Sleep Efficiency:</span> {recommendation.Sleep_Efficiency ?? "N/A"}%</div>
                            <div className="detail-item"><span className="detail-label">Sleep Health:</span> {recommendation.Sleep_Health ?? "N/A"}</div>
                            <div className="detail-item"><span className="detail-label">Recommendations:</span> {recommendation.Recommendations ?? "N/A"}</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SleepRecommender;
