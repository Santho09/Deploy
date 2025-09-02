import { useState } from "react";
import axios from "axios";
import { Scale, Activity } from "lucide-react";
import "../App.css"
import { useNavigate } from "react-router-dom";

function HealthCalculator() {
    const [formData, setFormData] = useState({ weight: "", height: "", age: "", gender: "male", activityLevel: "sedentary" });
    const [bmiResult, setBmiResult] = useState<any>(null);
    const [bmrResult, setBmrResult] = useState<any>(null);
    const [caloriesResult, setCaloriesResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // BMI API call
            const bmiResponse = await axios.post("http://localhost:5000/api/health/bmi", {
                weight: parseFloat(formData.weight),
                height: parseFloat(formData.height),
            });
            setBmiResult(bmiResponse.data);

            // BMR API call
            const bmrResponse = await axios.post("http://localhost:5000/api/health/bmr", {
                weight: parseFloat(formData.weight),
                height: parseFloat(formData.height),
                age: parseInt(formData.age),
                gender: formData.gender,
            });
            setBmrResult(bmrResponse.data);

            // Calories API call
            const caloriesResponse = await axios.post("http://localhost:5000/api/health/calories", {
                weight: parseFloat(formData.weight),
                height: parseFloat(formData.height),
                age: parseInt(formData.age),
                gender: formData.gender,
                activityLevel: formData.activityLevel,
            });
            setCaloriesResult(caloriesResponse.data);
        } catch (error) {
            console.error("Error:", error);
            setError("An error occurred while calculating. Please check your inputs.");
        } finally {
            setLoading(false);
        }
    };

    const getBMICategory = (bmi: number) => {
        if (!bmi) return {};
        if (bmi < 18.5) return { label: "Underweight", color: "#3498db" };
        if (bmi < 25) return { label: "Normal", color: "#2ecc71" };
        if (bmi < 30) return { label: "Overweight", color: "#f39c12" };
        return { label: "Obese", color: "#e74c3c" };
    };

    const category = bmiResult ? getBMICategory(bmiResult.bmi) : null;

    return (
        <div style={{
            position: 'relative',
            minHeight: '100vh',
            width: '100%',
            color: 'white'
        }}>
            {/* Full screen background image */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundImage: 'url("/bmr.jpg")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                zIndex: -1,
                filter: 'brightness(0.9)'
            }} />
            
            <div className="module-container" style={{ 
                color: 'white',
                position: 'relative',
                zIndex: 1,
                padding: '40px 20px',
                maxWidth: '900px',
                margin: '0 auto'
            }}>
                <div className="module-header" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '30px'
                }}>
                    <Scale size={32} color="#9c27b0" />
                    <h2 style={{ 
                        margin: 0, 
                        fontSize: '32px', 
                        fontWeight: 600,
                        color: '#fff',
                        textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                    }}>BMR & Calorie Calculator</h2>
                </div>
                
                <div className="form-description" style={{
                    marginBottom: '25px',
                    fontSize: '18px',
                    textAlign: 'center'
                }}>
                    <p>Calculate your metabolic rate and daily calorie intake by entering your details below.</p>
                </div>

                {error && <div className="error" style={{
                    color: '#ff5252',
                    backgroundColor: 'rgba(255,82,82,0.1)',
                    padding: '10px 15px',
                    borderRadius: '6px',
                    marginBottom: '20px'
                }}>{error}</div>}

                <form onSubmit={handleSubmit} className="form-grid" style={{ 
                    backgroundColor: 'transparent', 
                    padding: '30px', 
                    borderRadius: '16px',
                    backdropFilter: 'blur(4px)',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '25px',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                    <div className="form-group">
                        <label htmlFor="weight" style={{ color: 'white', fontWeight: 500 }}>Weight (kg)</label>
                        <input 
                            type="number" 
                            id="weight"
                            name="weight" 
                            value={formData.weight}
                            placeholder="Enter your weight" 
                            onChange={handleChange} 
                            required 
                            style={{ 
                                color: 'white', 
                                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '6px',
                                padding: '10px',
                                width: '100%'
                            }}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="height" style={{ color: 'white', fontWeight: 500 }}>Height (cm)</label>
                        <input 
                            type="number" 
                            id="height"
                            name="height" 
                            value={formData.height}
                            placeholder="Enter your height" 
                            onChange={handleChange} 
                            required 
                            style={{ 
                                color: 'white', 
                                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '6px',
                                padding: '10px',
                                width: '100%'
                            }}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="age" style={{ color: 'white', fontWeight: 500 }}>Age</label>
                        <input 
                            type="number" 
                            id="age"
                            name="age" 
                            value={formData.age}
                            placeholder="Enter your age" 
                            onChange={handleChange} 
                            required 
                            style={{ 
                                color: 'white', 
                                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '6px',
                                padding: '10px',
                                width: '100%'
                            }}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="gender" style={{ color: 'white', fontWeight: 500 }}>Gender</label>
                        <select 
                            id="gender"
                            name="gender" 
                            value={formData.gender}
                            onChange={handleChange}
                            style={{ 
                                color: 'white', 
                                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '6px',
                                padding: '10px',
                                width: '100%',
                                appearance: 'auto'
                            }}
                        >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="activityLevel" style={{ color: 'white', fontWeight: 500 }}>Activity Level</label>
                        <select
                            id="activityLevel"
                            name="activityLevel"
                            value={formData.activityLevel}
                            onChange={handleChange}
                            style={{ 
                                color: 'white', 
                                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '6px',
                                padding: '10px',
                                width: '100%',
                                appearance: 'auto'
                            }}
                        >
                            <option value="sedentary">Sedentary</option>
                            <option value="light">Light</option>
                            <option value="moderate">Moderate</option>
                            <option value="active">Active</option>
                            <option value="very active">Very Active</option>
                        </select>
                    </div>

                    <div className="form-actions" style={{ gridColumn: 'span 2', textAlign: 'center' }}>
                        <button 
                            type="submit" 
                            disabled={loading} 
                            className="primary-button"
                            style={{
                                backgroundColor: 'transparent',
                                color: 'white',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                borderRadius: '6px',
                                padding: '12px 36px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                transition: 'all 0.3s ease',
                                backdropFilter: 'blur(4px)'
                            }}
                        >
                            {loading ? "Calculating..." : "Calculate"}
                        </button>
                    </div>
                </form>

                {(bmiResult || bmrResult || caloriesResult) && (
                    <div className="results-container" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '25px',
                        marginTop: '40px'
                    }}>
                        
                        {(bmiResult && typeof bmiResult.bmi === 'number') && (
                            <div className="result-card" style={{ 
                                backgroundColor: 'transparent',
                                borderRadius: '16px',
                                padding: '25px',
                                backdropFilter: 'blur(4px)',
                                border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}>
                                <h3 style={{ 
                                    marginTop: 0, 
                                    fontSize: '22px',
                                    color: '#fff',
                                    marginBottom: '20px'
                                }}>Body Composition Results</h3>
                                <div className="result-value" style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    marginBottom: '15px'
                                }}>
                                    <span className="value" style={{ 
                                        color: 'white',
                                        fontSize: '38px',
                                        fontWeight: 'bold'
                                    }}>{bmiResult.bmi.toFixed(1)}</span>
                                    <span className="category" style={{ 
                                        backgroundColor: category?.color,
                                        padding: '6px 12px',
                                        borderRadius: '20px',
                                        marginLeft: '15px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                    }}>
                                        {category?.label}
                                    </span>
                                </div>
                                <p className="result-description" style={{ 
                                    color: 'rgba(255, 255, 255, 0.9)',
                                    fontSize: '16px',
                                    lineHeight: '1.5'
                                }}>
                                    This is a measure of body fat based on height and weight.
                                </p>
                            </div>
                        )}

                        {bmrResult && (
                            <div className="result-card" style={{ 
                                backgroundColor: 'transparent',
                                borderRadius: '16px',
                                padding: '25px',
                                backdropFilter: 'blur(4px)',
                                border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}>
                                <h3 style={{ 
                                    marginTop: 0, 
                                    fontSize: '22px',
                                    color: '#fff',
                                    marginBottom: '20px'
                                }}>Metabolic Rate Results</h3>
                                <div className="result-value" style={{
                                    display: 'flex',
                                    alignItems: 'baseline',
                                    marginBottom: '15px'
                                }}>
                                    <span className="value" style={{ 
                                        color: 'white',
                                        fontSize: '38px',
                                        fontWeight: 'bold'
                                    }}>{Math.round(bmrResult.bmr)}</span>
                                    <span className="unit" style={{ 
                                        color: 'white',
                                        marginLeft: '8px',
                                        fontSize: '16px'
                                    }}>calories/day</span>
                                </div>
                                <p className="result-description" style={{ 
                                    color: 'rgba(255, 255, 255, 0.9)',
                                    fontSize: '16px',
                                    lineHeight: '1.5'
                                }}>
                                    This is the number of calories your body needs while resting.
                                </p>
                            </div>
                        )}

                        {caloriesResult && (
                            <div className="result-card" style={{ 
                                backgroundColor: 'transparent',
                                borderRadius: '16px',
                                padding: '25px',
                                backdropFilter: 'blur(4px)',
                                border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}>
                                <h3 style={{ 
                                    marginTop: 0, 
                                    fontSize: '22px',
                                    color: '#fff',
                                    marginBottom: '20px'
                                }}>Daily Calorie Requirement</h3>
                                <div className="result-value" style={{
                                    display: 'flex',
                                    alignItems: 'baseline',
                                    marginBottom: '15px'
                                }}>
                                    <span className="value" style={{ 
                                        color: 'white',
                                        fontSize: '38px',
                                        fontWeight: 'bold'
                                    }}>{caloriesResult.calories}</span>
                                    <span className="unit" style={{ 
                                        color: 'white',
                                        marginLeft: '8px',
                                        fontSize: '16px'
                                    }}>calories/day</span>
                                </div>
                                <p className="result-description" style={{ 
                                    color: 'rgba(255, 255, 255, 0.9)',
                                    fontSize: '16px',
                                    lineHeight: '1.5'
                                }}>
                                    This is the estimated number of calories you need to maintain your current weight based on your activity level.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default HealthCalculator;
