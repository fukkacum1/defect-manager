import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContex';
import Button from './ui/Button';
import Badge from './ui/Badge';

const Navbar = () => {
    const { currentUser, logout, hasPermission } = useAuth();
    const location = useLocation();
    
    if (!currentUser) return null;

    const role = currentUser.role;
    
    const getRoleDisplay = (role) => {
        switch (role) {
            case 'engineer': return 'Инженер';
            case 'manager': return 'Менеджер';
            case 'observer': return 'Наблюдатель';
            default: return role;
        }
    };

    const isActive = (path) => {
        return location.pathname === path;
    };

    const navItems = [
        { path: '/', label: 'Дашборд', icon: '📊' },
        { path: '/projects', label: 'Проекты', icon: '📁', permission: 'view_projects' },
        { path: '/defects', label: 'Дефекты', icon: '🐛', permission: 'view_defects' },
        { path: '/reports', label: 'Отчёты', icon: '📈', permission: 'view_reports' },
    ];

    return (
        <nav className="bg-white dark:bg-gray-800 shadow-soft border-b border-gray-200 dark:border-gray-700">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">D</span>
                        </div>
                        <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                            DefectManager
                        </span>
                    </Link>

                    {/* Navigation */}
                    <div className="hidden md:flex items-center space-x-1">
                        {navItems.map((item) => {
                            if (item.permission && !hasPermission(item.permission)) {
                                return null;
                            }
                            
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`
                                        flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                                        ${isActive(item.path)
                                            ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
                                        }
                                    `}
                                >
                                    <span>{item.icon}</span>
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* User Menu */}
                    <div className="flex items-center space-x-4">
                        <div className="hidden sm:flex items-center space-x-2">
                            <Badge variant="primary" size="sm">
                                {getRoleDisplay(role)}
                            </Badge>
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                                {currentUser.name}
                            </span>
                        </div>
                        
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={logout}
                            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Выход
                        </Button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                <div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-2">
                    <div className="flex flex-wrap gap-1">
                        {navItems.map((item) => {
                            if (item.permission && !hasPermission(item.permission)) {
                                return null;
                            }
                            
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`
                                        flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                                        ${isActive(item.path)
                                            ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }
                                    `}
                                >
                                    <span>{item.icon}</span>
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;