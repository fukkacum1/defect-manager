import { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContex';
import { useApp } from '../context/AppContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import Badge from '../components/ui/Badge';

const Reports = () => {
    const { hasPermission } = useAuth();
    const { defects, projects, users } = useApp();
    const [selectedPeriod, setSelectedPeriod] = useState('all');
    const [selectedProject, setSelectedProject] = useState('all');

    const periodOptions = [
        { value: 'all', label: 'За все время' },
        { value: 'week', label: 'За неделю' },
        { value: 'month', label: 'За месяц' },
        { value: 'quarter', label: 'За квартал' },
        { value: 'year', label: 'За год' }
    ];

    const projectOptions = [
        { value: 'all', label: 'Все проекты' },
        ...projects.map(project => ({
            value: project.id,
            label: project.name
        }))
    ];

    const filteredDefects = useMemo(() => {
        let filtered = defects;

        // Filter by project
        if (selectedProject !== 'all') {
            filtered = filtered.filter(defect => defect.projectId === selectedProject);
        }

        // Filter by period
        if (selectedPeriod !== 'all') {
            const now = new Date();
            let startDate;

            switch (selectedPeriod) {
                case 'week':
                    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case 'month':
                    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                    break;
                case 'quarter':
                    const quarter = Math.floor(now.getMonth() / 3);
                    startDate = new Date(now.getFullYear(), quarter * 3, 1);
                    break;
                case 'year':
                    startDate = new Date(now.getFullYear(), 0, 1);
                    break;
                default:
                    startDate = new Date(0);
            }

            filtered = filtered.filter(defect => new Date(defect.createdAt) >= startDate);
        }

        return filtered;
    }, [defects, selectedPeriod, selectedProject]);

    const stats = useMemo(() => {
        const totalDefects = filteredDefects.length;
        const openDefects = filteredDefects.filter(d => d.status !== 'closed' && d.status !== 'canceled').length;
        const closedDefects = filteredDefects.filter(d => d.status === 'closed').length;
        const highPriorityDefects = filteredDefects.filter(d => d.priority === 'high').length;
        const mediumPriorityDefects = filteredDefects.filter(d => d.priority === 'medium').length;
        const lowPriorityDefects = filteredDefects.filter(d => d.priority === 'low').length;
        
        const inProgressDefects = filteredDefects.filter(d => d.status === 'in_progress').length;
        const underReviewDefects = filteredDefects.filter(d => d.status === 'under_review').length;
        const canceledDefects = filteredDefects.filter(d => d.status === 'canceled').length;

        const overdueDefects = filteredDefects.filter(d => {
            if (!d.deadline) return false;
            return new Date(d.deadline) < new Date() && d.status !== 'closed';
        }).length;

        // Defects by user
        const defectsByUser = users.map(user => ({
            user: user.name,
            total: filteredDefects.filter(d => d.assigneeId === user.id).length,
            open: filteredDefects.filter(d => d.assigneeId === user.id && d.status !== 'closed' && d.status !== 'canceled').length,
            closed: filteredDefects.filter(d => d.assigneeId === user.id && d.status === 'closed').length
        }));

        // Defects by project
        const defectsByProject = projects.map(project => ({
            project: project.name,
            total: filteredDefects.filter(d => d.projectId === project.id).length,
            open: filteredDefects.filter(d => d.projectId === project.id && d.status !== 'closed' && d.status !== 'canceled').length,
            closed: filteredDefects.filter(d => d.projectId === project.id && d.status === 'closed').length
        }));

        // Average resolution time
        const closedDefectsWithTimes = filteredDefects.filter(d => d.status === 'closed' && d.createdAt && d.updatedAt);
        const avgResolutionTime = closedDefectsWithTimes.length > 0 
            ? closedDefectsWithTimes.reduce((sum, defect) => {
                const created = new Date(defect.createdAt);
                const closed = new Date(defect.updatedAt);
                return sum + (closed - created);
            }, 0) / closedDefectsWithTimes.length / (1000 * 60 * 60 * 24) // Convert to days
            : 0;

        return {
            totalDefects,
            openDefects,
            closedDefects,
            highPriorityDefects,
            mediumPriorityDefects,
            lowPriorityDefects,
            inProgressDefects,
            underReviewDefects,
            canceledDefects,
            overdueDefects,
            defectsByUser,
            defectsByProject,
            avgResolutionTime: Math.round(avgResolutionTime * 10) / 10
        };
    }, [filteredDefects, users, projects]);

    const exportToCSV = () => {
        const csvData = filteredDefects.map(defect => ({
            'ID': defect.id,
            'Заголовок': defect.title,
            'Описание': defect.description,
            'Статус': getStatusLabel(defect.status),
            'Приоритет': getPriorityLabel(defect.priority),
            'Проект': projects.find(p => p.id === defect.projectId)?.name || 'Не указан',
            'Исполнитель': defect.assigneeId ? users.find(u => u.id === defect.assigneeId)?.name || 'Неизвестный' : 'Не назначен',
            'Создатель': users.find(u => u.id === defect.reporterId)?.name || 'Неизвестный',
            'Дата создания': new Date(defect.createdAt).toLocaleDateString('ru-RU'),
            'Срок выполнения': defect.deadline ? new Date(defect.deadline).toLocaleDateString('ru-RU') : 'Не указан',
            'Обновлено': new Date(defect.updatedAt).toLocaleDateString('ru-RU')
        }));

        const headers = Object.keys(csvData[0] || {});
        const csvContent = [
            headers.join(','),
            ...csvData.map(row => headers.map(header => `"${row[header]}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `defects_report_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getStatusLabel = (status) => {
        const labels = {
            new: 'Новая',
            in_progress: 'В работе',
            under_review: 'На проверке',
            closed: 'Закрыта',
            canceled: 'Отменена'
        };
        return labels[status] || status;
    };

    const getPriorityLabel = (priority) => {
        const labels = {
            high: 'Высокий',
            medium: 'Средний',
            low: 'Низкий'
        };
        return labels[priority] || priority;
    };

    if (!hasPermission('view_reports')) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        Доступ запрещен
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        У вас нет прав для просмотра отчетов
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                            Отчеты и аналитика
                        </h1>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            Детальная аналитика по дефектам и проектам
                        </p>
                    </div>
                    <Button
                        onClick={exportToCSV}
                        className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Экспорт в CSV
                    </Button>
                </div>

                {/* Filters */}
                <Card className="mb-8 shadow-lg">
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                            Фильтры отчета
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Select
                                label="Период"
                                value={selectedPeriod}
                                onChange={(e) => setSelectedPeriod(e.target.value)}
                                options={periodOptions}
                            />
                            <Select
                                label="Проект"
                                value={selectedProject}
                                onChange={(e) => setSelectedProject(e.target.value)}
                                options={projectOptions}
                            />
                        </div>
                    </div>
                </Card>

                {/* Overview Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
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

                    <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
                        <div className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-100 text-sm font-medium">Закрыто</p>
                                    <p className="text-3xl font-bold">{stats.closedDefects}</p>
                                </div>
                                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white border-0 shadow-lg">
                        <div className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-yellow-100 text-sm font-medium">В работе</p>
                                    <p className="text-3xl font-bold">{stats.inProgressDefects}</p>
                                </div>
                                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-gradient-to-br from-red-500 to-pink-500 text-white border-0 shadow-lg">
                        <div className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-red-100 text-sm font-medium">Просрочено</p>
                                    <p className="text-3xl font-bold">{stats.overdueDefects}</p>
                                </div>
                                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Detailed Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Status Distribution */}
                    <Card className="shadow-lg">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
                                Распределение по статусам
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-4 h-4 bg-blue-500 rounded"></div>
                                        <span className="text-gray-700 dark:text-gray-300">Новые</span>
                                    </div>
                                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                                        {stats.openDefects - stats.inProgressDefects - stats.underReviewDefects}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                                        <span className="text-gray-700 dark:text-gray-300">В работе</span>
                                    </div>
                                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                                        {stats.inProgressDefects}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-4 h-4 bg-purple-500 rounded"></div>
                                        <span className="text-gray-700 dark:text-gray-300">На проверке</span>
                                    </div>
                                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                                        {stats.underReviewDefects}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-4 h-4 bg-green-500 rounded"></div>
                                        <span className="text-gray-700 dark:text-gray-300">Закрыты</span>
                                    </div>
                                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                                        {stats.closedDefects}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-4 h-4 bg-gray-500 rounded"></div>
                                        <span className="text-gray-700 dark:text-gray-300">Отменены</span>
                                    </div>
                                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                                        {stats.canceledDefects}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Priority Distribution */}
                    <Card className="shadow-lg">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
                                Распределение по приоритетам
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-4 h-4 bg-red-500 rounded"></div>
                                        <span className="text-gray-700 dark:text-gray-300">Высокий</span>
                                    </div>
                                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                                        {stats.highPriorityDefects}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                                        <span className="text-gray-700 dark:text-gray-300">Средний</span>
                                    </div>
                                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                                        {stats.mediumPriorityDefects}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-4 h-4 bg-green-500 rounded"></div>
                                        <span className="text-gray-700 dark:text-gray-300">Низкий</span>
                                    </div>
                                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                                        {stats.lowPriorityDefects}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Defects by User */}
                    <Card className="shadow-lg">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
                                Дефекты по исполнителям
                            </h3>
                            <div className="space-y-4">
                                {stats.defectsByUser
                                    .filter(item => item.total > 0)
                                    .sort((a, b) => b.total - a.total)
                                    .slice(0, 5)
                                    .map((item, index) => (
                                        <div key={index} className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                                    {item.user}
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {item.open} открыто, {item.closed} закрыто
                                                </p>
                                            </div>
                                            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                {item.total}
                                            </Badge>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </Card>

                    {/* Defects by Project */}
                    <Card className="shadow-lg">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
                                Дефекты по проектам
                            </h3>
                            <div className="space-y-4">
                                {stats.defectsByProject
                                    .filter(item => item.total > 0)
                                    .sort((a, b) => b.total - a.total)
                                    .slice(0, 5)
                                    .map((item, index) => (
                                        <div key={index} className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                                    {item.project}
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {item.open} открыто, {item.closed} закрыто
                                                </p>
                                            </div>
                                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                {item.total}
                                            </Badge>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Performance Summary */}
                <Card className="shadow-lg">
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
                            Показатели эффективности
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                                    {stats.totalDefects > 0 ? Math.round((stats.closedDefects / stats.totalDefects) * 100) : 0}%
                                </div>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Процент закрытых дефектов
                                </p>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                                    {stats.avgResolutionTime}
                                </div>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Среднее время решения (дни)
                                </p>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">
                                    {stats.totalDefects > 0 ? Math.round((stats.overdueDefects / stats.totalDefects) * 100) : 0}%
                                </div>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Процент просроченных дефектов
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Reports;