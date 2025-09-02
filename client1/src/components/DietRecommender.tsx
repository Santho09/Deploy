import React, { useState } from 'react';
import axios from 'axios';
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

interface DietRecommendation {
    BMI: number;
    Daily_Caloric_Intake: number;
    Diet_Recommendation: string;
    'Weight Loss / Weight Gain Plan': string;
    'Recommended Recipes': string;
    'Total Calories': number;
    'Protein_Percentage': number;
    'Carbs_Percentage': number;
    'Fat_Percentage': number;
    'Breakfast_Calories': number;
    'Lunch_Calories': number;
    'Dinner_Calories': number;
    'Snacks_Calories': number;
}

const DietRecommender: React.FC = () => {
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('');
    const [weightKg, setWeightKg] = useState('');
    const [heightCm, setHeightCm] = useState('');
    const [physicalActivity, setPhysicalActivity] = useState('');
    const [recommendation, setRecommendation] = useState<DietRecommendation | null>(null);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setError('');

            const userData = {
                Age: Number(age),
                Gender: gender,
                Weight_kg: Number(weightKg),
                Height_cm: Number(heightCm),
                Physical_Activity_Level: physicalActivity,
            };

            // Call Express API to connect with the Flask API
            const response = await axios.post('http://localhost:5000/api/diet', userData);
            setRecommendation(response.data);
        } catch (err) {
            setError('Failed to get diet recommendation. Please try again.');
        }
    };

    return (
        <div 
            className="min-h-screen w-full"
            style={{
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Fixed Background Image */}
            <div 
                className="fixed inset-0 z-0"
                style={{
                    backgroundImage: `url('/diet1.jpg')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundAttachment: 'fixed',
                }}
            />
            
            {/* Dark overlay for better contrast */}
            <div className="fixed inset-0 bg-black/40 z-10"></div>
            
            {/* Scrollable Content Container */}
            <div className="relative z-20 h-screen overflow-y-auto">
                <div className="container mx-auto px-4 py-8">
                    {/* Header Section */}
                    <div className="bg-black/60 p-6 rounded-t-xl shadow-lg backdrop-blur-sm">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                            </svg>
                            <h2 className="text-3xl font-bold text-center text-white">Diet Recommender</h2>
                        </div>
                        <p className="text-gray-200 text-center max-w-2xl mx-auto">
                            Enter your details to get a personalized diet plan tailored to your needs.
                            Our AI will analyze your information and provide customized recommendations.
                        </p>
                    </div>

                    {/* Form and Results Section */}
                    <div className="backdrop-blur-md bg-white/20 p-8 rounded-b-xl shadow-lg">
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="age" className="block text-sm font-medium text-white">Age</label>
                                <input
                                    type="number"
                                    id="age"
                                    value={age}
                                    onChange={(e) => setAge(e.target.value)}
                                    className="mt-1 block w-full p-3 border rounded-md shadow-sm bg-white/80 text-black"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="gender" className="block text-sm font-medium text-white">Gender</label>
                                <select
                                    id="gender"
                                    value={gender}
                                    onChange={(e) => setGender(e.target.value)}
                                    className="mt-1 block w-full p-3 border rounded-md shadow-sm bg-white/80 text-black"
                                    required
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="weightKg" className="block text-sm font-medium text-white">Weight (kg)</label>
                                <input
                                    type="number"
                                    id="weightKg"
                                    value={weightKg}
                                    onChange={(e) => setWeightKg(e.target.value)}
                                    className="mt-1 block w-full p-3 border rounded-md shadow-sm bg-white/80 text-black"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="heightCm" className="block text-sm font-medium text-white">Height (cm)</label>
                                <input
                                    type="number"
                                    id="heightCm"
                                    value={heightCm}
                                    onChange={(e) => setHeightCm(e.target.value)}
                                    className="mt-1 block w-full p-3 border rounded-md shadow-sm bg-white/80 text-black"
                                    required
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label htmlFor="physicalActivity" className="block text-sm font-medium text-white">Physical Activity Level</label>
                                <select
                                    id="physicalActivity"
                                    value={physicalActivity}
                                    onChange={(e) => setPhysicalActivity(e.target.value)}
                                    className="mt-1 block w-full p-3 border rounded-md shadow-sm bg-white/80 text-black"
                                    required
                                >
                                    <option value="">Select Activity Level</option>
                                    <option value="Sedentary">Sedentary</option>
                                    <option value="Moderate">Moderate</option>
                                    <option value="Active">Active</option>
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <button type="submit" className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white p-3 rounded-md hover:from-pink-600 hover:to-purple-700 transition duration-300 shadow-lg text-lg font-semibold">
                                    Get Diet Recommendation
                                </button>
                            </div>
                        </form>

                        {error && <div className="text-red-500 text-center bg-white/80 p-3 rounded mt-6">{error}</div>}

                        {recommendation && (
                            <div className="mt-6 p-6 bg-white/80 backdrop-blur-md rounded-lg shadow-lg">
                                <h3 className="text-xl font-bold text-black mb-4">Your Personalized Diet Plan</h3>
                                
                                {/* Charts Container */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: '20px',
                                    marginBottom: '20px'
                                }}>
                                    {/* Macronutrient Distribution Doughnut Chart */}
                                    <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '15px', borderRadius: '8px' }}>
                                        <Doughnut
                                            data={{
                                                labels: ['Protein', 'Carbs', 'Fat'],
                                                datasets: [{
                                                    data: [
                                                        recommendation.Protein_Percentage || 30,
                                                        recommendation.Carbs_Percentage || 50,
                                                        recommendation.Fat_Percentage || 20
                                                    ],
                                                    backgroundColor: [
                                                        'rgba(255, 99, 132, 0.8)',
                                                        'rgba(54, 162, 235, 0.8)',
                                                        'rgba(255, 206, 86, 0.8)'
                                                    ],
                                                    borderColor: [
                                                        'rgba(255, 99, 132, 1)',
                                                        'rgba(54, 162, 235, 1)',
                                                        'rgba(255, 206, 86, 1)'
                                                    ],
                                                    borderWidth: 1
                                                }]
                                            }}
                                            options={{
                                                plugins: {
                                                    title: {
                                                        display: true,
                                                        text: 'Macronutrient Distribution',
                                                        color: 'white',
                                                        font: { size: 16 }
                                                    },
                                                    legend: {
                                                        position: 'bottom',
                                                        labels: { color: 'white' }
                                                    }
                                                }
                                            }}
                                        />
                                    </div>

                                    {/* Daily Caloric Distribution Bar Chart */}
                                    <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '15px', borderRadius: '8px' }}>
                                        <Bar
                                            data={{
                                                labels: ['Breakfast', 'Lunch', 'Dinner', 'Snacks'],
                                                datasets: [{
                                                    label: 'Calories',
                                                    data: [
                                                        recommendation.Breakfast_Calories || recommendation.Daily_Caloric_Intake * 0.25,
                                                        recommendation.Lunch_Calories || recommendation.Daily_Caloric_Intake * 0.35,
                                                        recommendation.Dinner_Calories || recommendation.Daily_Caloric_Intake * 0.30,
                                                        recommendation.Snacks_Calories || recommendation.Daily_Caloric_Intake * 0.10
                                                    ],
                                                    backgroundColor: [
                                                        'rgba(75, 192, 192, 0.8)',
                                                        'rgba(153, 102, 255, 0.8)',
                                                        'rgba(255, 159, 64, 0.8)',
                                                        'rgba(255, 99, 132, 0.8)'
                                                    ],
                                                    borderColor: [
                                                        'rgba(75, 192, 192, 1)',
                                                        'rgba(153, 102, 255, 1)',
                                                        'rgba(255, 159, 64, 1)',
                                                        'rgba(255, 99, 132, 1)'
                                                    ],
                                                    borderWidth: 1
                                                }]
                                            }}
                                            options={{
                                                responsive: true,
                                                scales: {
                                                    y: {
                                                        beginAtZero: true,
                                                        grid: {
                                                            color: 'rgba(255, 255, 255, 0.1)'
                                                        },
                                                        ticks: { 
                                                            color: 'white',
                                                            callback: (value) => `${value} cal`
                                                        }
                                                    },
                                                    x: {
                                                        grid: {
                                                            color: 'rgba(255, 255, 255, 0.1)'
                                                        },
                                                        ticks: { color: 'white' }
                                                    }
                                                },
                                                plugins: {
                                                    title: {
                                                        display: true,
                                                        text: 'Daily Caloric Distribution',
                                                        color: 'white',
                                                        font: { size: 16 }
                                                    },
                                                    legend: {
                                                        display: false
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Calorie Goal Progress Bar */}
                                <div className="mb-6 p-4 bg-black/30 rounded-lg">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-white">Daily Calorie Goal Progress</span>
                                        <span className="text-white">
                                            {recommendation['Total Calories'] || 0} / {recommendation.Daily_Caloric_Intake || 0} cal
                                        </span>
                                    </div>
                                    <div className="h-4 bg-gray-700 rounded-full">
                                        <div
                                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
                                            style={{
                                                width: `${Math.min(
                                                    ((recommendation['Total Calories'] || 0) / (recommendation.Daily_Caloric_Intake || 1)) * 100,
                                                    100
                                                )}%`
                                            }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <p className="text-black"><strong>BMI:</strong> {recommendation.BMI ? recommendation.BMI.toFixed(2) : 'N/A'}</p>
                                        <p className="text-black"><strong>Daily Caloric Intake:</strong> {recommendation.Daily_Caloric_Intake ? recommendation.Daily_Caloric_Intake.toFixed(2) : 'N/A'} kcal</p>
                                        <p className="text-black"><strong>Diet Plan:</strong> {recommendation.Diet_Recommendation || 'N/A'}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-black"><strong>Weight Plan:</strong> {recommendation['Weight Loss / Weight Gain Plan'] || 'N/A'}</p>
                                        <p className="text-black"><strong>Recommended Recipes:</strong> {recommendation['Recommended Recipes'] || 'N/A'}</p>
                                        <p className="text-black"><strong>Total Calories (Recipe):</strong> {recommendation['Total Calories'] ? recommendation['Total Calories'].toFixed(2) : 'N/A'} kcal</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DietRecommender;
