import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContex';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const { login, quickLogin, authError, isLoading, clearError } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        clearError();
    }, [clearError]);

    const validateForm = () => {
        const newErrors = {};
        
        if (!email) {
            newErrors.email = 'Email обязателен';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'Неверный формат email';
        }
        
        if (!password) {
            newErrors.password = 'Пароль обязателен';
        } else if (password.length < 6) {
            newErrors.password = 'Пароль должен содержать минимум 6 символов';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        const result = await login(email, password);
        if (result.success) {
            navigate('/');
        }
    };

    const handleQuickLogin = async (role) => {
        const result = await quickLogin(role);
        if (result.success) {
            navigate('/');
        }
    };

    return (
        <div className="min-h-screen  bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4 overflow-hidden">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-indigo-600/20"></div>
            
            <div className="relative z-10 w-full max-w-md">
                <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
                    <div className="p-8">
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h1 className="text-4xl font-bold text-white mb-2">
                                Defect Manager
                            </h1>
                            <p className="text-white/80 text-lg">
                                Система управления дефектами
                            </p>
                        </div>

                        {authError && (
                            <div className="mb-6 p-4 bg-red-500/20 border border-red-400/30 rounded-xl backdrop-blur-sm">
                                <div className="flex items-center">
                                    <svg className="h-5 w-5 text-red-300 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    <p className="text-red-100 text-sm">
                                        {authError}
                                    </p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <Input
                                label="Email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                error={errors.email}
                                placeholder="Введите ваш email"
                                className="bg-white/10 border-white/20 text-white placeholder-white/60 focus:ring-blue-400 focus:border-blue-400"
                                leftIcon={
                                    <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                    </svg>
                                }
                            />

                            <Input
                                label="Пароль"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                error={errors.password}
                                placeholder="Введите пароль"
                                className="bg-white/10 border-white/20 text-white placeholder-white/60 focus:ring-blue-400 focus:border-blue-400"
                                leftIcon={
                                    <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                }
                            />

                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                                loading={isLoading}
                                disabled={isLoading}
                            >
                                Войти в систему
                            </Button>
                        </form>

                        <div className="mt-8">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-white/20" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-transparent text-white/60">
                                        Быстрый вход
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6 grid grid-cols-1 gap-3">
                                <Button
                                    variant="secondary"
                                    onClick={() => handleQuickLogin('engineer')}
                                    className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm transition-all duration-300"
                                    disabled={isLoading}
                                >
                                    <span className="mr-2">👷</span>
                                    Войти как Инженер
                                </Button>
                                <Button
                                    variant="secondary"
                                    onClick={() => handleQuickLogin('manager')}
                                    className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm transition-all duration-300"
                                    disabled={isLoading}
                                >
                                    <span className="mr-2">👔</span>
                                    Войти как Менеджер
                                </Button>
                                <Button
                                    variant="secondary"
                                    onClick={() => handleQuickLogin('observer')}
                                    className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm transition-all duration-300"
                                    disabled={isLoading}
                                >
                                    <span className="mr-2">👁️</span>
                                    Войти как Наблюдатель
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>

                <div className="text-center mt-6">
                    <p className="text-white/60 text-sm">
                        Демо-версия системы управления дефектами
                    </p>
                    <p className="text-white/40 text-xs mt-1">
                        Используйте быстрый вход для тестирования разных ролей
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;