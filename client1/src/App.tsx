import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Signup from './auth/Signup';
import Login from './auth/Login';
import Dashboard from './Dashboard/Dashboard';  // Import your Dashboard component
import BMIForm from './components/BMIForm';  // Import BMIForm 
import WorkoutRecommender from './components/WorkoutRecommender';
import DietRecommender from './components/DietRecommender';
import SleepRecommender from './components/SleepRecommender';
import WorkoutTracker from './components/WorkoutTracker';
import MyBadges from './components/MyBadges';  // Import MyBadges component
import FloatingChatbot from './components/FloatingChatbot';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // Check if user is logged in based on token in localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  // Handle login and set the state as logged in
  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  // Handle logout to clear token and update login state
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  return (
    <Router>
      <div>
        <Routes>
          {/* Redirect to dashboard if logged in, otherwise to login */}
          <Route path="/" element={isLoggedIn ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />

          {/* Login Route */}
          <Route path="/login" element={<Login onLogin={handleLogin} />} />

          {/* Signup Route */}
          <Route path="/signup" element={<Signup />} />

          {/* Nested routes for Dashboard, protected by isLoggedIn */}
          <Route
            path="/dashboard"
            element={isLoggedIn ? <Dashboard onLogout={handleLogout} /> : <Navigate to="/login" />}
          >
            {/* Nested routes inside Dashboard */}
            <Route path="bmr" element={<BMIForm />} />
            <Route path="workout" element={<WorkoutRecommender />} />
            <Route path="diet" element={<DietRecommender />} />
            <Route path="sleep" element={<SleepRecommender />} />
            <Route path="tracker" element={<WorkoutTracker />} />
            <Route path="badges" element={<MyBadges />} />
          </Route>
        </Routes>
        {isLoggedIn && <FloatingChatbot />}
      </div>
    </Router>
  );
}

export default App;
