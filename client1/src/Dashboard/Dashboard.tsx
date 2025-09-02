import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Pill as Pills,
  Dumbbell,
  Utensils,
  Moon,
  Calendar,
  Award,
  Heart,
  ChevronRight,
  TrendingUp,
  Scale,
  Ruler,
  Droplet,
  Clock,
  Bell,
  User,
} from 'lucide-react';

// Declare global type for window object
declare global {
  interface Window {
    updateDashboardRecommendations?: (
      moduleType: 'diet' | 'sleep' | 'workout',
      newData: Partial<UserData>
    ) => void;
  }
}

interface DashboardProps {
  onLogout: () => void;
}

// Module navigation definitions
const modules = [
  {
    id: 'bmr',
    icon: Activity,
    label: 'BMR & Calorie',
    path: '/dashboard/bmr',
  },
  {
    id: 'workout',
    icon: Dumbbell,
    label: 'Workout',
    path: '/dashboard/workout',
  },
  {
    id: 'diet',
    icon: Utensils,
    label: 'Diet Plan',
    path: '/dashboard/diet',
  },
  {
    id: 'sleep',
    icon: Moon,
    label: 'Sleep',
    path: '/dashboard/sleep',
  },
  {
    id: 'tracker',
    icon: Calendar,
    label: 'Workout Tracker',
    path: '/dashboard/tracker',
  },
  {
    id: 'badges',
    icon: Award,
    label: 'My Badges',
    path: '/dashboard/badges',
  },
];

interface UserData {
  // BMI and basic metrics
  bmi: number;
  weight: number;
  height: number;
  
  // Diet recommendations
  dailyCalories: number;
  caloriesBurned: number;
  dietRecommendation: string;
  weightPlan: string;
  recommendedRecipes: string;
  ingredients: string;
  cookingInstructions: string;
  totalCalories: number;
  
  // Sleep metrics
  sleepHours: number;
  sleepEfficiency: number;
  deepSleepPercentage: number;
  remSleepPercentage: number;
  sleepScore: number;
  sleepHealth: string;
  sleepRecommendations: string;
  
  // Workout tracking
  workoutStreak: number;
  pointsEarned: number;
  rank: string;
  nextGoal: number;
  workoutRecommendations: string;
}

interface BadgeCounts {
  gold: number;
  silver: number;
  bronze: number;
  total: number;
}

// Function to get initial data from localStorage or default values
const getInitialUserData = (): UserData => {
  const savedData = localStorage.getItem('dashboardData');
  if (savedData) {
    return JSON.parse(savedData);
  }
  return {
    bmi: 0,
    weight: 0,
    height: 0,
    dailyCalories: 0,
    caloriesBurned: 0,
    dietRecommendation: '',
    weightPlan: '',
    recommendedRecipes: '',
    ingredients: '',
    cookingInstructions: '',
    totalCalories: 0,
    sleepHours: 0,
    sleepEfficiency: 0,
    deepSleepPercentage: 0,
    remSleepPercentage: 0,
    sleepScore: 0,
    sleepHealth: '',
    sleepRecommendations: '',
    workoutStreak: 0,
    pointsEarned: 0,
    rank: 'Beginner',
    nextGoal: 500,
    workoutRecommendations: '',
  };
};

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userData, setUserData] = useState<UserData>(getInitialUserData());
  const [userHealth, setUserHealth] = useState<any>(null);
  const [badgeCount, setBadgeCount] = useState<number>(0);
  const [badgeCounts, setBadgeCounts] = useState<BadgeCounts>({
    gold: 0,
    silver: 0,
    bronze: 0,
    total: 0
  });
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

  // Add useEffect to load badge count for current user
  useEffect(() => {
    const loadBadgeCount = () => {
      if (!currentUserId) {
        console.log('No user ID found, cannot load badge count');
        return;
      }

      try {
        console.log('Loading badge count for user:', currentUserId);
        const badgeKey = `userBadges_${currentUserId}`;
        const savedBadges = localStorage.getItem(badgeKey);
        if (savedBadges) {
          const badges = JSON.parse(savedBadges);
          // Count badges by type
          const counts = badges.reduce((acc: BadgeCounts, badge: any) => {
            if (badge.type.toLowerCase() === 'gold badge') acc.gold++;
            else if (badge.type.toLowerCase() === 'silver badge') acc.silver++;
            else if (badge.type.toLowerCase() === 'bronze badge') acc.bronze++;
            acc.total++;
            return acc;
          }, { gold: 0, silver: 0, bronze: 0, total: 0 });
          
          setBadgeCounts(counts);
          setBadgeCount(counts.total);
          console.log('Updated badge counts:', counts);
        } else {
          console.log('No badges found for user');
          setBadgeCounts({ gold: 0, silver: 0, bronze: 0, total: 0 });
          setBadgeCount(0);
        }
      } catch (error) {
        console.error('Error loading badge count:', error);
        setBadgeCounts({ gold: 0, silver: 0, bronze: 0, total: 0 });
        setBadgeCount(0);
      }
    };

    loadBadgeCount();
    
    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `userBadges_${currentUserId}`) {
        loadBadgeCount();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [currentUserId]);

  // Function to update recommendations from other modules
  const updateRecommendations = (moduleType: 'diet' | 'sleep' | 'workout', newData: Partial<UserData>) => {
    setUserData(prevData => {
      let updatedData = { ...prevData };

      // Handle diet updates
      if (moduleType === 'diet') {
        updatedData = {
          ...updatedData,
          dailyCalories: newData.dailyCalories || updatedData.dailyCalories,
          dietRecommendation: newData.dietRecommendation || updatedData.dietRecommendation,
          weightPlan: newData.weightPlan || updatedData.weightPlan,
          recommendedRecipes: newData.recommendedRecipes || updatedData.recommendedRecipes,
          ingredients: newData.ingredients || updatedData.ingredients,
          cookingInstructions: newData.cookingInstructions || updatedData.cookingInstructions,
          totalCalories: newData.totalCalories || updatedData.totalCalories,
        };
      }

      // Handle sleep updates
      if (moduleType === 'sleep') {
        updatedData = {
          ...updatedData,
          sleepHours: newData.sleepHours || updatedData.sleepHours,
          sleepEfficiency: newData.sleepEfficiency || updatedData.sleepEfficiency,
          deepSleepPercentage: newData.deepSleepPercentage || updatedData.deepSleepPercentage,
          remSleepPercentage: newData.remSleepPercentage || updatedData.remSleepPercentage,
          sleepScore: newData.sleepScore || updatedData.sleepScore,
          sleepHealth: newData.sleepHealth || updatedData.sleepHealth,
          sleepRecommendations: newData.sleepRecommendations || updatedData.sleepRecommendations,
        };
      }

      // Handle workout updates
      if (moduleType === 'workout') {
        updatedData = {
          ...updatedData,
          workoutRecommendations: newData.workoutRecommendations || updatedData.workoutRecommendations,
          workoutStreak: newData.workoutStreak || updatedData.workoutStreak,
          pointsEarned: newData.pointsEarned || updatedData.pointsEarned,
          rank: newData.rank || updatedData.rank,
          nextGoal: newData.nextGoal || updatedData.nextGoal,
        };
      }

      // Save to localStorage
      localStorage.setItem('dashboardData', JSON.stringify(updatedData));
      return updatedData;
    });
  };

  // Make updateRecommendations available globally
  useEffect(() => {
    window.updateDashboardRecommendations = updateRecommendations;
    return () => {
      delete window.updateDashboardRecommendations;
    };
  }, []);

  // Helper function to transform API response to UserData format
  const transformDietData = (apiData: any): Partial<UserData> => {
    return {
      dailyCalories: apiData.Daily_Caloric_Intake || apiData.daily_caloric_intake || 0,
      dietRecommendation: apiData.Diet_Recommendation || apiData.diet_recommendation || '',
      weightPlan: apiData['Weight Loss / Weight Gain Plan'] || apiData.weight_plan || '',
      recommendedRecipes: apiData.Recommended_Recipes || apiData.recommended_recipes || '',
      ingredients: apiData.Ingredients || apiData.ingredients || '',
      cookingInstructions: apiData.Cooking_Instructions || apiData.cooking_instructions || '',
      totalCalories: apiData.Total_Calories || apiData.total_calories || 0,
    };
  };

  const transformSleepData = (apiData: any): Partial<UserData> => {
    return {
      sleepHours: apiData['Total Hours of Sleep'] || apiData.total_hours_of_sleep || 0,
      sleepEfficiency: apiData['Sleep Efficiency (%)'] || apiData.sleep_efficiency || 0,
      deepSleepPercentage: apiData['Deep Sleep (%)'] || apiData.deep_sleep_percentage || 0,
      remSleepPercentage: apiData['REM Sleep (%)'] || apiData.rem_sleep_percentage || 0,
      sleepScore: apiData['Sleep Score'] || apiData.sleep_score || 0,
      sleepHealth: apiData['Sleep Health'] || apiData.sleep_health || '',
      sleepRecommendations: apiData['Recommendations'] || apiData.recommendations || '',
    };
  };

  // Fetch initial data from backend APIs
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get user profile from localStorage
        const healthData = localStorage.getItem('userHealth');
        const userProfile = healthData ? JSON.parse(healthData) : null;

        if (!userProfile) {
          console.error('No user health data found');
          return;
        }

        // Calculate BMI
        const heightInMeters = userProfile.height / 100;
        const bmi = userProfile.weight / (heightInMeters * heightInMeters);

        let newData: Partial<UserData> = {
          bmi: bmi,
          weight: userProfile.weight,
          height: userProfile.height,
        };

        try {
          // Fetch diet recommendations with user profile
          const dietResponse = await fetch('http://localhost:5002/api/diet', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              Age: userProfile.age,
              Gender: userProfile.gender,
              Weight_kg: userProfile.weight,
              Height_cm: userProfile.height,
              Physical_Activity_Level: userProfile.physicalActivityLevel || 'Moderate',
              Dietary_Restrictions: userProfile.dietaryRestrictions || 'None'
            }),
          });
          
          if (!dietResponse.ok) {
            throw new Error(`Diet API error: ${dietResponse.status}`);
          }
          
          const dietData = await dietResponse.json();
          console.log('Diet API Response:', dietData);

          if (dietData.error) {
            throw new Error(`Diet API error: ${dietData.error}`);
          }

          // Update diet data with recipe details
          newData = {
            ...newData,
            recommendedRecipes: dietData['Recommended Recipes'],
            ingredients: dietData.Ingredients || '',
            cookingInstructions: dietData['Cooking Instructions'] || '',
            totalCalories: dietData['Total Calories'] || 0
          };

          console.log('Processed Recipe Data:', newData);
        } catch (dietError) {
          console.error('Diet API Error:', dietError);
          // Provide fallback recipe based on BMI
          const fallbackRecipe = {
            name: userData.bmi >= 25 ? 'Grilled Chicken Salad' : 'Balanced Meal Bowl',
            ingredients: userData.bmi >= 25 
              ? 'Chicken Breast, Mixed Greens, Cherry Tomatoes, Cucumber, Olive Oil, Lemon Juice, Herbs'
              : 'Quinoa, Grilled Chicken, Avocado, Mixed Vegetables, Olive Oil, Seeds',
            instructions: userData.bmi >= 25
              ? 'Season chicken, grill until cooked, chop vegetables, mix with dressing'
              : 'Cook quinoa, grill chicken, prepare vegetables, assemble bowl',
            calories: userData.bmi >= 25 ? 350 : 450
          };

          newData = {
            ...newData,
            recommendedRecipes: fallbackRecipe.name,
            ingredients: fallbackRecipe.ingredients,
            cookingInstructions: fallbackRecipe.instructions,
            totalCalories: fallbackRecipe.calories
          };
        }

        try {
          // Fetch sleep recommendations with user profile
          const sleepResponse = await fetch('http://localhost:5000/api/sleep', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              Age: userProfile.age,
              Gender: userProfile.gender,
              Sleep_Time: userProfile.sleepTime || 7,
              Sleep_Interruptions: userProfile.sleepInterruptions || 0,
              Stress_Level: userProfile.stressLevel || 5,
              Physical_Activity: userProfile.physicalActivity || 30,
              Screen_Time: userProfile.screenTime || 60
            }),
          });
          
          if (!sleepResponse.ok) {
            throw new Error(`Sleep API error: ${sleepResponse.status}`);
          }
          
          const sleepData = await sleepResponse.json();
          console.log('Sleep API Response:', sleepData);

          // Update sleep data with recommendations only
          newData = {
            ...newData,
            sleepRecommendations: sleepData['Recommendations'] || 
              'Get 7-9 hours of sleep daily. Maintain a consistent sleep schedule. Limit screen time before bed. Create a relaxing bedtime routine.'
          };

          console.log('Processed Sleep Recommendations:', newData.sleepRecommendations);
        } catch (sleepError) {
          console.error('Sleep API Error:', sleepError);
          // Provide fallback sleep recommendations based on age and activity level
          const getAgeBasedRecommendations = (age: number, activity: string) => {
            if (age >= 60) {
              return activity === 'Active' 
                ? 'Aim for 7-8 hours of sleep. Take short rest periods during the day if needed. Keep a regular sleep schedule. Create a quiet, comfortable sleep environment.'
                : 'Aim for 7-8 hours of sleep. Maintain consistent bedtime and wake times. Limit fluids before bedtime. Consider gentle evening stretches for better sleep.';
            } else if (age >= 18) {
              return activity === 'Active'
                ? 'Target 7-9 hours of sleep. Focus on post-exercise recovery sleep. Maintain consistent sleep schedule. Consider sleep-supporting nutrients in your diet.'
                : 'Target 7-9 hours of sleep. Increase daily physical activity. Reduce screen time before bed. Create a calming bedtime routine.';
            } else {
              return activity === 'Active'
                ? 'Get 8-10 hours of sleep. Ensure proper rest between training sessions. Maintain regular sleep schedule. Focus on pre-sleep nutrition.'
                : 'Get 8-10 hours of sleep. Include more physical activity in your daily routine. Limit electronic devices before sleep. Create a consistent bedtime routine.';
            }
          };

          newData = {
            ...newData,
            sleepRecommendations: getAgeBasedRecommendations(
              userProfile.age, 
              userProfile.physicalActivityLevel || 'Moderate'
            )
          };
        }

        try {
          // Fetch workout recommendations with user profile
          const workoutResponse = await fetch('http://localhost:5000/api/workout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              age: userProfile.age,
              gender: userProfile.gender,
              weight: userProfile.weight,
              height: userProfile.height,
              medicalConditions: userProfile.medicalConditions,
              bmi: bmi
            }),
          });
          
          if (!workoutResponse.ok) {
            throw new Error(`Workout API error: ${workoutResponse.status}`);
          }
          
          const workoutData = await workoutResponse.json();
          console.log('Workout Data:', workoutData);

          // Update workout data
          newData = {
            ...newData,
            workoutRecommendations: workoutData.recommendations || 'Loading workout recommendations...',
            workoutStreak: workoutData.streak || 0,
            pointsEarned: workoutData.points || 0,
            rank: workoutData.rank || 'Beginner',
            nextGoal: workoutData.nextGoal || 500,
          };
        } catch (workoutError) {
          console.error('Workout API Error:', workoutError);
          newData = {
            ...newData,
            workoutRecommendations: 'Error loading workout recommendations. Please try again later.',
          };
        }

        // Update state with all fetched data
        setUserData(prevData => {
          const updatedData = { ...prevData, ...newData };
          localStorage.setItem('dashboardData', JSON.stringify(updatedData));
          return updatedData;
        });

      } catch (error: any) {
        console.error('Error in fetchUserData:', error.message);
        // Try to load from localStorage as fallback
        const savedData = localStorage.getItem('dashboardData');
        if (savedData) {
          console.log('Loading data from localStorage as fallback');
          setUserData(JSON.parse(savedData));
        }
      }
    };

    fetchUserData();
    // Fetch new data every 5 minutes
    const interval = setInterval(fetchUserData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Load user health data from localStorage
    const healthData = localStorage.getItem('userHealth');
    if (healthData) {
      setUserHealth(JSON.parse(healthData));
    }
  }, []);

  const getBmiCategory = (bmi: number) => {
    if (bmi < 18.5) return { label: "Underweight", color: "text-blue-400" };
    if (bmi < 25) return { label: "Normal", color: "text-green-400" };
    if (bmi < 30) return { label: "Overweight", color: "text-yellow-400" };
    return { label: "Obese", color: "text-red-400" };
  };

  const bmiCategory = getBmiCategory(userData.bmi);
  const isDashboardPage = location.pathname === '/dashboard';

  return (
    <div className="min-h-screen bg-black">
      {/* Enhanced Background with Particles Effect */}
      <div className="fixed inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=2070"
          alt="Background"
          className="w-full h-full object-cover"
          style={{ opacity: 0.15 }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black via-purple-900/10 to-black"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black"></div>
      </div>

      {/* Navigation and content */}
      <div className="relative z-10">
        {/* Enhanced Navigation Bar */}
        <nav className="fixed top-0 left-0 right-0 bg-black/80 backdrop-blur-xl border-b border-purple-500/20 z-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-4 cursor-pointer group"
                onClick={() => navigate('/')}
              >
                <Heart className="w-8 h-8 text-purple-400 group-hover:text-purple-300 transition-colors duration-300" />
                <div>
                  <h2 className="text-white font-bold group-hover:text-purple-300 transition-colors duration-300">MEDFIT</h2>
                  <p className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent text-sm font-medium">
                    Your Health Companion
                  </p>
                </div>
              </motion.div>

              {/* Enhanced Module Navigation */}
              <div className="flex items-center space-x-6">
                {modules.map((module) => (
                  <div key={module.id} className="relative group">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex flex-col items-center text-white/70 hover:text-purple-400 transition-all duration-300 p-2 relative ${
                        location.pathname === module.path ? 'text-purple-400' : ''
                      }`}
                      onClick={() => navigate(module.path)}
                    >
                      <module.icon className="w-5 h-5 mb-1 transition-transform group-hover:scale-110" />
                      <span className="text-xs font-medium">{module.label}</span>
                      {module.id === 'badges' && badgeCount > 0 && (
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-3 -right-3 flex flex-col items-center"
                        >
                          <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mb-1 shadow-lg shadow-purple-500/20">
                            {badgeCount}
                          </span>
                          <div className="absolute top-6 right-0 bg-black/95 rounded-lg p-3 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 pointer-events-none shadow-xl shadow-purple-500/10 border border-purple-500/20">
                            <div className="text-yellow-400 font-semibold flex items-center justify-between gap-4">
                              <span>Gold</span>
                              <span>{badgeCounts.gold}</span>
                            </div>
                            <div className="text-gray-300 font-semibold flex items-center justify-between gap-4 mt-2">
                              <span>Silver</span>
                              <span>{badgeCounts.silver}</span>
                            </div>
                            <div className="text-amber-600 font-semibold flex items-center justify-between gap-4 mt-2">
                              <span>Bronze</span>
                              <span>{badgeCounts.bronze}</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                      {location.pathname === module.path && (
                        <motion.div
                          layoutId="nav-indicator"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500"
                          initial={false}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                    </motion.button>
                  </div>
                ))}
              </div>

              <button 
                className="text-white/70 hover:text-red-400 transition-all duration-300 px-4 py-2 rounded-full hover:bg-red-400/10"
                onClick={onLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </nav>

        {/* Enhanced Main Content */}
        <div className="container mx-auto px-4 pt-24 pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {isDashboardPage ? (
                <>
                  {/* Enhanced Welcome section */}
                  <motion.div 
                    className="mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h1 className="text-white text-3xl font-bold mb-2 bg-gradient-to-r from-white to-purple-400 bg-clip-text text-transparent">
                      Welcome Back!
                    </h1>
                    <p className="text-white/70 text-lg">
                      Here's your personalized health insights based on your profile.
                    </p>
                  </motion.div>

                  {/* Enhanced User Health Profile Card */}
                  {userHealth && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      whileHover={{ scale: 1.01 }}
                      className="bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent p-6 rounded-2xl shadow-lg backdrop-blur-sm mb-8 border border-purple-500/20 relative overflow-hidden group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="flex justify-between items-start mb-6 relative">
                        <div>
                          <h3 className="text-white text-xl font-semibold">Your Health Profile</h3>
                          <p className="text-white/50 text-sm">Personal Health Information</p>
                        </div>
                        <User className="w-6 h-6 text-purple-400 group-hover:text-purple-300 transition-colors duration-300" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 }}
                        >
                          <p className="text-purple-400 text-sm font-medium mb-4">Physical Metrics</p>
                          <div className="space-y-4">
                            <div className="bg-purple-500/10 rounded-lg p-4 transform transition-transform hover:scale-105">
                              <div className="flex justify-between items-center">
                                <span className="text-white/70">Height</span>
                                <span className="text-white font-semibold">{userHealth.height} cm</span>
                              </div>
                            </div>
                            <div className="bg-purple-500/10 rounded-lg p-4 transform transition-transform hover:scale-105">
                              <div className="flex justify-between items-center">
                                <span className="text-white/70">Weight</span>
                                <span className="text-white font-semibold">{userHealth.weight} kg</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                        >
                          <p className="text-purple-400 text-sm font-medium mb-4">Personal Details</p>
                          <div className="space-y-4">
                            <div className="bg-purple-500/10 rounded-lg p-4 transform transition-transform hover:scale-105">
                              <div className="flex justify-between items-center">
                                <span className="text-white/70">Age</span>
                                <span className="text-white font-semibold">{userHealth.age} years</span>
                              </div>
                            </div>
                            <div className="bg-purple-500/10 rounded-lg p-4 transform transition-transform hover:scale-105">
                              <div className="flex justify-between items-center">
                                <span className="text-white/70">Gender</span>
                                <span className="text-white font-semibold capitalize">{userHealth.gender}</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 }}
                        >
                          <p className="text-purple-400 text-sm font-medium mb-4">Medical History</p>
                          <div className="bg-purple-500/10 rounded-lg p-4 h-[calc(100%-2rem)] transform transition-transform hover:scale-105">
                            <div className="text-white">
                              {userHealth.medicalConditions && userHealth.medicalConditions.length > 0 ? (
                                <ul className="space-y-2">
                                  {userHealth.medicalConditions.map((condition: string, index: number) => (
                                    <li key={index} className="flex items-center text-sm">
                                      <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-2"></div>
                                      {condition}
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-sm text-white/70">No medical conditions reported</p>
                              )}
                            </div>
                      </div>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}

                  {/* Enhanced Health Insights Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 auto-rows-auto">
                    {/* Enhanced BMI Card */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                      whileHover={{ scale: 1.02 }}
                      className="bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent p-6 rounded-2xl shadow-lg backdrop-blur-sm relative overflow-hidden group border border-purple-500/20"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="flex justify-between items-start mb-6 relative">
                        <div>
                          <h3 className="text-white text-xl font-semibold">BMI Status</h3>
                          <p className="text-white/50 text-sm">Body Mass Index</p>
                        </div>
                        <Scale className="w-6 h-6 text-purple-400 group-hover:text-purple-300 transition-colors duration-300" />
                      </div>
                      <div className="relative">
                        <div className="flex items-end mb-4">
                          <span className="text-white text-4xl font-bold bg-gradient-to-r from-white to-purple-400 bg-clip-text text-transparent">
                            {userData.bmi.toFixed(1)}
                          </span>
                          <span className={`ml-3 ${bmiCategory.color} text-lg font-medium`}>
                            {bmiCategory.label}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-6">
                          <div className="bg-purple-500/10 rounded-lg p-4 transform transition-transform hover:scale-105">
                            <span className="text-white/50 text-sm">Weight</span>
                            <p className="text-white font-semibold mt-1">{userData.weight} kg</p>
                          </div>
                          <div className="bg-purple-500/10 rounded-lg p-4 transform transition-transform hover:scale-105">
                            <span className="text-white/50 text-sm">Height</span>
                            <p className="text-white font-semibold mt-1">{userData.height} cm</p>
                        </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Enhanced Recipe Card */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                      whileHover={{ scale: 1.02 }}
                      className="bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent p-6 rounded-2xl shadow-lg backdrop-blur-sm relative overflow-hidden group border border-purple-500/20"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="flex justify-between items-start mb-6 relative">
                        <div>
                          <h3 className="text-white text-xl font-semibold">Today's Recipe</h3>
                          <p className="text-white/50 text-sm">Personalized Nutrition</p>
                        </div>
                        <Utensils className="w-6 h-6 text-purple-400 group-hover:text-purple-300 transition-colors duration-300" />
                      </div>
                      <div className="relative space-y-6">
                        <div className="bg-purple-500/10 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="text-white font-medium text-lg flex-1 pr-4">
                              {userData.recommendedRecipes || 'Loading recipe...'}
                            </h4>
                            <span className="text-purple-400 font-semibold whitespace-nowrap">
                              {userData.totalCalories} kcal
                            </span>
                          </div>
                          
                          {userData.ingredients && (
                            <div className="mt-6">
                              <p className="text-purple-400 text-sm font-medium mb-3">Ingredients</p>
                              <div className="grid grid-cols-2 gap-3">
                                {userData.ingredients.split(',').map((ingredient, index) => (
                                  <div key={index} className="flex items-center bg-purple-500/5 rounded-lg p-2 transform transition-transform hover:scale-105">
                                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-2 flex-shrink-0"></div>
                                    <span className="text-white/90 text-sm line-clamp-1">{ingredient.trim()}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>

                    {/* Enhanced Sleep Card */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9 }}
                      whileHover={{ scale: 1.02 }}
                      className="bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent p-6 rounded-2xl shadow-lg backdrop-blur-sm relative overflow-hidden group border border-purple-500/20"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="flex justify-between items-start mb-6 relative">
                        <div>
                          <h3 className="text-white text-xl font-semibold">Sleep Insights</h3>
                          <p className="text-white/50 text-sm">Rest & Recovery</p>
                        </div>
                        <Moon className="w-6 h-6 text-purple-400 group-hover:text-purple-300 transition-colors duration-300" />
                      </div>
                      <div className="relative">
                        <div className="space-y-4">
                          {userData.sleepRecommendations.split('.').filter(Boolean).map((recommendation, index) => (
                            <div 
                              key={index}
                              className="bg-purple-500/10 rounded-lg p-4 transform transition-transform hover:scale-105"
                            >
                              <div className="flex items-start">
                                <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                <p className="text-white/90 text-sm">{recommendation.trim()}.</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>

                    {/* Enhanced Badge Summary Card */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.0 }}
                      whileHover={{ scale: 1.02 }}
                      className="bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent p-6 rounded-2xl shadow-lg backdrop-blur-sm relative overflow-hidden group border border-purple-500/20"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="flex justify-between items-start mb-6 relative">
                        <div>
                          <h3 className="text-white text-xl font-semibold">Achievements</h3>
                          <p className="text-white/50 text-sm">Your Progress</p>
                  </div>
                        <Award className="w-6 h-6 text-purple-400 group-hover:text-purple-300 transition-colors duration-300" />
                      </div>
                      <div className="relative space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="bg-purple-500/10 rounded-lg p-4 text-center transform transition-transform hover:scale-105">
                            <span className="text-yellow-400 text-2xl font-bold block mb-2">{badgeCounts.gold}</span>
                            <span className="text-white/70 text-sm">Gold</span>
                    </div>
                          <div className="bg-purple-500/10 rounded-lg p-4 text-center transform transition-transform hover:scale-105">
                            <span className="text-gray-300 text-2xl font-bold block mb-2">{badgeCounts.silver}</span>
                            <span className="text-white/70 text-sm">Silver</span>
                        </div>
                          <div className="bg-purple-500/10 rounded-lg p-4 text-center transform transition-transform hover:scale-105">
                            <span className="text-amber-600 text-2xl font-bold block mb-2">{badgeCounts.bronze}</span>
                            <span className="text-white/70 text-sm">Bronze</span>
                        </div>
                        </div>
                        <div className="bg-purple-500/10 rounded-lg p-4 mt-4 transform transition-transform hover:scale-105">
                          <div className="flex items-center justify-between">
                            <span className="text-white font-medium">Total Achievements</span>
                            <span className="text-purple-400 text-2xl font-bold">{badgeCount}</span>
                      </div>
                        </div>
                      </div>
                    </motion.div>
                    </div>
                </>
              ) : (
                <Outlet />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
