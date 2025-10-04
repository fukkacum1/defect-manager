import { createContext, useContext, useEffect, useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { initialUsers } from '../data/initialData';

const AuthContext = createContext();

// Validation functions
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  return password.length >= 6;
};

const validateName = (name) => {
  return name.trim().length >= 2;
};

export const AuthProvider = ({ children }) => {
    const [users, setUsers] = useLocalStorage('users', initialUsers);
    const [currentUser, setCurrentUser] = useLocalStorage('currentUser', null);
    const [authError, setAuthError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!localStorage.getItem('users')) {
            setUsers(initialUsers);
        }
    }, []);

    const login = async (email, password) => {
        setIsLoading(true);
        setAuthError(null);
        
        try {
            // Validation
            if (!email || !password) {
                throw new Error('Email и пароль обязательны');
            }
            
            if (!validateEmail(email)) {
                throw new Error('Неверный формат email');
            }
            
            if (!validatePassword(password)) {
                throw new Error('Пароль должен содержать минимум 6 символов');
            }
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const user = users.find(u => u.email === email && u.password === password);
            if (user) {
                setCurrentUser(user);
                return { success: true };
            } else {
                throw new Error('Неверный email или пароль');
            }
        } catch (error) {
            setAuthError(error.message);
            return { success: false, error: error.message };
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (userData) => {
        setIsLoading(true);
        setAuthError(null);
        
        try {
            const { name, email, password, role } = userData;
            
            // Validation
            if (!name || !email || !password || !role) {
                throw new Error('Все поля обязательны');
            }
            
            if (!validateName(name)) {
                throw new Error('Имя должно содержать минимум 2 символа');
            }
            
            if (!validateEmail(email)) {
                throw new Error('Неверный формат email');
            }
            
            if (!validatePassword(password)) {
                throw new Error('Пароль должен содержать минимум 6 символов');
            }
            
            if (!['engineer', 'manager', 'observer'].includes(role)) {
                throw new Error('Неверная роль пользователя');
            }
            
            // Check if user already exists
            const existingUser = users.find(u => u.email === email);
            if (existingUser) {
                throw new Error('Пользователь с таким email уже существует');
            }
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const newUser = {
                id: Date.now(),
                name: name.trim(),
                email: email.toLowerCase().trim(),
                password,
                role,
                createdAt: new Date().toISOString(),
                isActive: true,
            };
            
            setUsers([...users, newUser]);
            setCurrentUser(newUser);
            
            return { success: true };
        } catch (error) {
            setAuthError(error.message);
            return { success: false, error: error.message };
        } finally {
            setIsLoading(false);
        }
    };

    const quickLogin = (role) => {
        setAuthError(null);
        const user = users.find(u => u.role === role);
        if (user) {
            setCurrentUser(user);
            return { success: true };
        } else {
            setAuthError('Пользователь с такой ролью не найден');
            return { success: false, error: 'Пользователь с такой ролью не найден' };
        }
    };

    const logout = () => {
        setCurrentUser(null);
        setAuthError(null);
    };

    const updateProfile = async (updates) => {
        if (!currentUser) return { success: false, error: 'Пользователь не авторизован' };
        
        setIsLoading(true);
        setAuthError(null);
        
        try {
            // Validation
            if (updates.name && !validateName(updates.name)) {
                throw new Error('Имя должно содержать минимум 2 символа');
            }
            
            if (updates.email && !validateEmail(updates.email)) {
                throw new Error('Неверный формат email');
            }
            
            if (updates.password && !validatePassword(updates.password)) {
                throw new Error('Пароль должен содержать минимум 6 символов');
            }
            
            // Check if email is already taken by another user
            if (updates.email && updates.email !== currentUser.email) {
                const existingUser = users.find(u => u.email === updates.email && u.id !== currentUser.id);
                if (existingUser) {
                    throw new Error('Пользователь с таким email уже существует');
                }
            }
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const updatedUser = {
                ...currentUser,
                ...updates,
                updatedAt: new Date().toISOString(),
            };
            
            setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
            setCurrentUser(updatedUser);
            
            return { success: true };
        } catch (error) {
            setAuthError(error.message);
            return { success: false, error: error.message };
        } finally {
            setIsLoading(false);
        }
    };

    const clearError = () => setAuthError(null);

    const hasPermission = (permission) => {
        if (!currentUser) return false;
        
        const permissions = {
            engineer: ['view_defects', 'create_defects', 'update_own_defects', 'view_projects'],
            manager: ['view_defects', 'create_defects', 'update_defects', 'delete_defects', 'view_projects', 'create_projects', 'update_projects', 'delete_projects', 'view_reports', 'manage_users'],
            observer: ['view_defects', 'view_projects', 'view_reports']
        };
        
        return permissions[currentUser.role]?.includes(permission) || false;
    };

    const canEditDefect = (defect) => {
        if (!currentUser) return false;
        
        if (currentUser.role === 'manager') return true;
        if (currentUser.role === 'engineer' && defect.assigneeId === currentUser.id) return true;
        
        return false;
    };

    const canDeleteDefect = (defect) => {
        if (!currentUser) return false;
        
        return currentUser.role === 'manager';
    };

    const canEditProject = (project) => {
        if (!currentUser) return false;
        
        return currentUser.role === 'manager';
    };

    const canDeleteProject = (project) => {
        if (!currentUser) return false;
        
        return currentUser.role === 'manager';
    };

    const value = {
        currentUser,
        authError,
        isLoading,
        login,
        register,
        quickLogin,
        logout,
        updateProfile,
        clearError,
        hasPermission,
        canEditDefect,
        canDeleteDefect,
        canEditProject,
        canDeleteProject,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};