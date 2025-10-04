import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Defects from './pages/Defects';
import DefectDetail from './pages/DefectDetail';
import Reports from './pages/Reports';
import Navbar from './components/Navbar';
import { AuthProvider, useAuth } from './context/AuthContex';
import { AppProvider } from './context/AppContext';

function ProtectedRoute({ children, requiredPermission }) {
  const { currentUser, hasPermission } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Доступ запрещен
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            У вас нет прав для доступа к этой странице
          </p>
        </div>
      </div>
    );
  }
  
  return children;
}

function App() {
  return (
        <AuthProvider>
            <AppProvider>
                <Router>
                    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans transition-colors duration-200">
                        <Navbar />
                        <main className="min-h-screen">
                            <Routes>
                                <Route path="/login" element={<Login />} />
                                <Route
                                    path="/"
                                    element={
                                        <ProtectedRoute>
                                            <Dashboard />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/projects"
                                    element={
                                        <ProtectedRoute requiredPermission="view_projects">
                                            <Projects />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/defects"
                                    element={
                                        <ProtectedRoute requiredPermission="view_defects">
                                            <Defects />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/defects/:id"
                                    element={
                                        <ProtectedRoute requiredPermission="view_defects">
                                            <DefectDetail />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/reports"
                                    element={
                                        <ProtectedRoute requiredPermission="view_reports">
                                            <Reports />
                                        </ProtectedRoute>
                                    }
                                />
                            </Routes>
                        </main>
                    </div>
                </Router>
            </AppProvider>
        </AuthProvider>
  );
}

export default App;