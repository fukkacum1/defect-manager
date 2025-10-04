import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContex';
import { useApp } from '../context/AppContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

const Dashboard = () => {
    const { currentUser, hasPermission } = useAuth();
    const navigate = useNavigate();
    const { 
        defects, 
        projects, 
        getDefectsByStatus, 
        getDefectsByPriority,
        getDefectsByUser,
        getDefectsByProject 
    } = useApp();

    const stats = useMemo(() => {
        const totalDefects = defects.length;
        const openDefects = defects.filter(d => d.status !== 'closed' && d.status !== 'canceled').length;
        const closedDefects = defects.filter(d => d.status === 'closed').length;
        const highPriorityDefects = defects.filter(d => d.priority === 'high' && d.status !== 'closed').length;
        const inProgressDefects = defects.filter(d => d.status === 'in_progress').length;
        const overdueDefects = defects.filter(d => {
            if (!d.deadline) return false;
            return new Date(d.deadline) < new Date() && d.status !== 'closed';
        }).length;
        
        const totalProjects = projects.length;
        const activeProjects = projects.filter(p => {
            const now = new Date();
            const startDate = new Date(p.startDate);
            const endDate = p.endDate ? new Date(p.endDate) : null;
            return startDate <= now && (!endDate || endDate >= now);
        }).length;
        
        // User-specific stats
        const userDefects = getDefectsByUser(currentUser.id);
        const userOpenDefects = userDefects.filter(d => d.status !== 'closed' && d.status !== 'canceled').length;

        return {
            totalDefects,
            openDefects,
            closedDefects,
            highPriorityDefects,
            inProgressDefects,
            overdueDefects,
            totalProjects,
            activeProjects,
            userDefects: userDefects.length,
            userOpenDefects
        };
    }, [defects, projects, currentUser.id, getDefectsByUser]);

    const recentDefects = useMemo(() => {
        return defects
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);
    }, [defects]);

    const recentProjects = useMemo(() => {
        return projects
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);
    }, [projects]);

    const getRoleDisplay = (role) => {
        switch (role) {
            case 'engineer': return 'Инженер';
            case 'manager': return 'Менеджер';
            case 'observer': return 'Наблюдатель';
            default: return role;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'open': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'in_progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'under_review': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
            case 'closed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'canceled': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'open': return 'Открыт';
            case 'in_progress': return 'В работе';
            case 'under_review': return 'На проверке';
            case 'closed': return 'Закрыт';
            case 'canceled': return 'Отменен';
            default: return status;
        }
    };

    const getPriorityLabel = (priority) => {
        switch (priority) {
            case 'high': return 'Высокий';
            case 'medium': return 'Средний';
            case 'low': return 'Низкий';
            default: return priority;
        }
    };

    const isOverdue = (deadline) => {
        if (!deadline) return false;
        return new Date(deadline) < new Date();
    };

    const handleStatClick = (type) => {
        switch (type) {
            case 'totalDefects':
                navigate('/defects');
                break;
            case 'openDefects':
                navigate('/defects?status=open');
                break;
            case 'highPriority':
                navigate('/defects?priority=high');
                break;
            case 'projects':
                navigate('/projects');
                break;
            case 'myDefects':
                navigate('/defects?assignee=' + currentUser.id);
                break;
            case 'inProgress':
                navigate('/defects?status=in_progress');
                break;
            case 'overdue':
                navigate('/defects?overdue=true');
                break;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        Добро пожаловать, {currentUser.name}!
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Обзор системы управления дефектами
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Total Defects */}
                    <Card 
                        className="cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0"
                        onClick={() => handleStatClick('totalDefects')}
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100 text-sm font-medium">Всего дефектов</p>
                                    <p className="text-3xl font-bold">{stats.totalDefects}</p>
                                </div>
                                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Open Defects */}
                    <Card 
                        className="cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-br from-yellow-500 to-orange-500 text-white border-0"
                        onClick={() => handleStatClick('openDefects')}
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-yellow-100 text-sm font-medium">Открытые дефекты</p>
                                    <p className="text-3xl font-bold">{stats.openDefects}</p>
                                </div>
                                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* High Priority */}
                    <Card 
                        className="cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-br from-red-500 to-pink-500 text-white border-0"
                        onClick={() => handleStatClick('highPriority')}
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-red-100 text-sm font-medium">Высокий приоритет</p>
                                    <p className="text-3xl font-bold">{stats.highPriorityDefects}</p>
                                </div>
                                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Projects */}
                    <Card 
                        className="cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-br from-green-500 to-teal-500 text-white border-0"
                        onClick={() => handleStatClick('projects')}
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-100 text-sm font-medium">Проекты</p>
                                    <p className="text-3xl font-bold">{stats.totalProjects}</p>
                                </div>
                                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Additional Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* My Defects */}
                    <Card 
                        className="cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-br from-purple-500 to-indigo-500 text-white border-0"
                        onClick={() => handleStatClick('myDefects')}
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-purple-100 text-sm font-medium">Мои дефекты</p>
                                    <p className="text-2xl font-bold">{stats.userDefects}</p>
                                </div>
                                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* In Progress */}
                    <Card 
                        className="cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-br from-cyan-500 to-blue-500 text-white border-0"
                        onClick={() => handleStatClick('inProgress')}
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-cyan-100 text-sm font-medium">В работе</p>
                                    <p className="text-2xl font-bold">{stats.inProgressDefects}</p>
                                </div>
                                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Overdue */}
                    <Card 
                        className="cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-br from-red-600 to-red-700 text-white border-0"
                        onClick={() => handleStatClick('overdue')}
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-red-100 text-sm font-medium">Просроченные</p>
                                    <p className="text-2xl font-bold">{stats.overdueDefects}</p>
                                </div>
                                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Defects */}
                    <Card className="hover:shadow-xl transition-all duration-300">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    Последние дефекты
                                </h3>
                                <Link to="/defects">
                                    <Button variant="secondary" size="sm">
                                        Все дефекты
                                    </Button>
                                </Link>
                            </div>
                            <div className="space-y-4">
                                {recentDefects.length > 0 ? (
                                    recentDefects.map((defect) => (
                                        <div 
                                            key={defect.id} 
                                            className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
                                            onClick={() => navigate(`/defects/${defect.id}`)}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                                    {defect.title}
                                                </h4>
                                                <div className="flex space-x-2">
                                                    <Badge className={getStatusColor(defect.status)}>
                                                        {getStatusLabel(defect.status)}
                                                    </Badge>
                                                    <Badge className={getPriorityColor(defect.priority)}>
                                                        {getPriorityLabel(defect.priority)}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                {defect.description}
                                            </p>
                                            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                                <span>#{defect.id}</span>
                                                <span>{new Date(defect.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                                        Нет дефектов
                                    </p>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* Recent Projects */}
                    <Card className="hover:shadow-xl transition-all duration-300">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    Последние проекты
                                </h3>
                                <Link to="/projects">
                                    <Button variant="secondary" size="sm">
                                        Все проекты
                                    </Button>
                                </Link>
                            </div>
                            <div className="space-y-4">
                                {recentProjects.length > 0 ? (
                                    recentProjects.map((project) => (
                                        <div 
                                            key={project.id} 
                                            className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
                                            onClick={() => navigate(`/projects`)}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                                    {project.name}
                                                </h4>
                                                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                    {project.status}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                {project.description}
                                            </p>
                                            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                                <span>Начало: {new Date(project.startDate).toLocaleDateString()}</span>
                                                <span>Менеджер: {project.managerId}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                                        Нет проектов
                                    </p>
                                )}
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;