import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContex';
import { useApp } from '../context/AppContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Select from '../components/ui/Select';

const Projects = () => {
    const { currentUser, hasPermission, canEditProject, canDeleteProject } = useAuth();
    const { 
        projects, 
        users, 
        defects,
        addProject, 
        updateProject, 
        deleteProject, 
        searchProjects,
        getDefectsByProject 
    } = useApp();
    const navigate = useNavigate();

    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        stages: '',
        managerId: ''
    });

    const [formErrors, setFormErrors] = useState({});

    const statusOptions = [
        { value: '', label: 'Все статусы' },
        { value: 'active', label: 'Активный' },
        { value: 'completed', label: 'Завершен' },
        { value: 'on_hold', label: 'Приостановлен' },
        { value: 'cancelled', label: 'Отменен' }
    ];

    const sortOptions = [
        { value: 'createdAt', label: 'Дата создания' },
        { value: 'name', label: 'Название' },
        { value: 'startDate', label: 'Дата начала' },
        { value: 'endDate', label: 'Дата окончания' }
    ];

    const managerOptions = [
        { value: '', label: 'Все менеджеры' },
        ...users.filter(user => user.role === 'manager' || user.role === 'admin').map(user => ({
            value: user.id,
            label: user.name
        }))
    ];

    const filteredProjects = useMemo(() => {
        let filtered = projects;

        // Apply search filter
        if (search) {
            filtered = searchProjects(search);
        }

        // Apply status filter
        if (filterStatus) {
            filtered = filtered.filter(project => project.status === filterStatus);
        }

        // Apply sorting
        filtered.sort((a, b) => {
            let aValue = a[sortBy];
            let bValue = b[sortBy];

            if (sortBy === 'createdAt' || sortBy === 'startDate' || sortBy === 'endDate') {
                aValue = new Date(aValue);
                bValue = new Date(bValue);
            }

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        return filtered;
    }, [projects, search, filterStatus, sortBy, sortOrder, searchProjects]);

    const getProjectStatus = (project) => {
        const now = new Date();
        const startDate = new Date(project.startDate);
        const endDate = project.endDate ? new Date(project.endDate) : null;

        if (project.status === 'completed') return 'completed';
        if (project.status === 'cancelled') return 'cancelled';
        if (project.status === 'on_hold') return 'on_hold';
        if (startDate > now) return 'upcoming';
        if (endDate && endDate < now) return 'overdue';
        return 'active';
    };

    const getProjectProgress = (projectId) => {
        const projectDefects = getDefectsByProject(projectId);
        if (projectDefects.length === 0) return 0;
        
        const closedDefects = projectDefects.filter(d => d.status === 'closed').length;
        return Math.round((closedDefects / projectDefects.length) * 100);
    };

    const getDaysRemaining = (endDate) => {
        if (!endDate) return null;
        const now = new Date();
        const end = new Date(endDate);
        const diffTime = end - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.name.trim()) {
            errors.name = 'Название проекта обязательно';
        }

        if (!formData.description.trim()) {
            errors.description = 'Описание проекта обязательно';
        }

        if (!formData.startDate) {
            errors.startDate = 'Дата начала обязательна';
        }

        if (!formData.managerId) {
            errors.managerId = 'Менеджер проекта обязателен';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleCreateProject = () => {
        if (!validateForm()) return;

        const newProject = {
            ...formData,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: 'active'
        };

        addProject(newProject);
        resetForm();
        setShowCreateModal(false);
    };

    const handleUpdateProject = () => {
        if (!validateForm()) return;

        const updatedProject = {
            ...editingProject,
            ...formData,
            updatedAt: new Date().toISOString()
        };

        updateProject(updatedProject);
        resetForm();
        setEditingProject(null);
    };

    const handleDeleteProject = () => {
        if (showDeleteModal) {
            deleteProject(showDeleteModal);
            setShowDeleteModal(null);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            startDate: '',
            endDate: '',
            stages: '',
            managerId: ''
        });
        setFormErrors({});
    };

    const openEditModal = (project) => {
        setFormData({
            name: project.name,
            description: project.description,
            startDate: project.startDate ? project.startDate.split('T')[0] : '',
            endDate: project.endDate ? project.endDate.split('T')[0] : '',
            stages: project.stages || '',
            managerId: project.managerId || ''
        });
        setEditingProject(project);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('ru-RU');
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'on_hold': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case 'upcoming': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
            case 'overdue': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
        }
    };

    const getStatusLabel = (status) => {
        const labels = {
            active: 'Активный',
            completed: 'Завершен',
            on_hold: 'Приостановлен',
            cancelled: 'Отменен',
            upcoming: 'Предстоящий',
            overdue: 'Просрочен'
        };
        return labels[status] || status;
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                            Проекты
                        </h1>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            Управление проектами и их отслеживание
                        </p>
                    </div>
                    {hasPermission('create_projects') && (
                        <Button
                            onClick={() => setShowCreateModal(true)}
                            className="mt-4 sm:mt-0 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Создать проект
                        </Button>
                    )}
                </div>

                {/* Filters */}
                <Card className="mb-8 shadow-lg">
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                            Поиск и фильтрация
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="lg:col-span-2">
                                <Input
                                    placeholder="Поиск по названию или описанию..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    leftIcon={
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    }
                                />
                            </div>
                            
                            <Select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                options={statusOptions}
                            />
                            
                            <Select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                options={sortOptions}
                            />
                        </div>
                        
                        <div className="mt-4 flex flex-wrap gap-4">
                            <Button
                                variant="secondary"
                                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                            >
                                {sortOrder === 'asc' ? '↑ По возрастанию' : '↓ По убыванию'}
                            </Button>
                            
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    setSearch('');
                                    setFilterStatus('');
                                }}
                                className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                            >
                                Очистить фильтры
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Projects Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.length > 0 ? (
                        filteredProjects.map((project) => {
                            const status = getProjectStatus(project);
                            const progress = getProjectProgress(project.id);
                            const daysRemaining = getDaysRemaining(project.endDate);
                            const manager = users.find(u => u.id === project.managerId);
                            const projectDefects = getDefectsByProject(project.id);

                            return (
                                <Card 
                                    key={project.id} 
                                    className="hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
                                    onClick={() => navigate(`/projects`)}
                                >
                                    <div className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
                                                {project.name}
                                            </h3>
                                            <Badge className={getStatusColor(status)}>
                                                {getStatusLabel(status)}
                                            </Badge>
                                        </div>
                                        
                                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                                            {project.description}
                                        </p>
                                        
                                        {/* Progress Bar */}
                                        <div className="mb-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Прогресс
                                                </span>
                                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                                    {progress}%
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                <div 
                                                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                                                    style={{ width: `${progress}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                                            <div className="flex items-center justify-between">
                                                <span>Менеджер:</span>
                                                <span className="text-gray-900 dark:text-gray-100">
                                                    {manager?.name || 'Не назначен'}
                                                </span>
                                            </div>
                                            
                                            <div className="flex items-center justify-between">
                                                <span>Начало:</span>
                                                <span>{formatDate(project.startDate)}</span>
                                            </div>
                                            
                                            {project.endDate && (
                                                <div className="flex items-center justify-between">
                                                    <span>Окончание:</span>
                                                    <span className={daysRemaining < 0 ? 'text-red-500 font-medium' : ''}>
                                                        {formatDate(project.endDate)}
                                                    </span>
                                                </div>
                                            )}
                                            
                                            <div className="flex items-center justify-between">
                                                <span>Дефекты:</span>
                                                <span className="text-gray-900 dark:text-gray-100">
                                                    {projectDefects.length}
                                                </span>
                                            </div>
                                            
                                            {daysRemaining !== null && (
                                                <div className="flex items-center justify-between">
                                                    <span>Осталось дней:</span>
                                                    <span className={daysRemaining < 0 ? 'text-red-500 font-medium' : daysRemaining < 7 ? 'text-yellow-500 font-medium' : ''}>
                                                        {daysRemaining < 0 ? 'Просрочен' : daysRemaining}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="mt-4 flex items-center justify-between">
                                            <div className="flex space-x-2">
                                                {canEditProject(project) && (
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openEditModal(project);
                                                        }}
                                                        className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40"
                                                    >
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                        Редактировать
                                                    </Button>
                                                )}
                                                
                                                {canDeleteProject(project) && (
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setShowDeleteModal(project.id);
                                                        }}
                                                        className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40"
                                                    >
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                        Удалить
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })
                    ) : (
                        <div className="col-span-full">
                            <Card className="text-center py-12">
                                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                    Проекты не найдены
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-4">
                                    Попробуйте изменить параметры поиска или создать новый проект
                                </p>
                                {hasPermission('create_projects') && (
                                    <Button
                                        onClick={() => setShowCreateModal(true)}
                                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                                    >
                                        Создать первый проект
                                    </Button>
                                )}
                            </Card>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Modal */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => {
                    setShowCreateModal(false);
                    resetForm();
                }}
                title="Создать проект"
                size="lg"
            >
                <div className="space-y-4">
                    <Input
                        label="Название проекта"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        error={formErrors.name}
                        placeholder="Введите название проекта"
                        required
                    />

                    <Textarea
                        label="Описание"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        error={formErrors.description}
                        placeholder="Опишите проект подробно"
                        rows={4}
                        required
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Дата начала"
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            error={formErrors.startDate}
                            required
                        />

                        <Input
                            label="Дата окончания"
                            type="date"
                            value={formData.endDate}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select
                            label="Менеджер проекта"
                            value={formData.managerId}
                            onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                            options={managerOptions.filter(opt => opt.value !== '')}
                            error={formErrors.managerId}
                            required
                        />

                        <Input
                            label="Этапы проекта"
                            value={formData.stages}
                            onChange={(e) => setFormData({ ...formData, stages: e.target.value })}
                            placeholder="Опишите этапы проекта"
                        />
                    </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                    <Button
                        variant="secondary"
                        onClick={() => {
                            setShowCreateModal(false);
                            resetForm();
                        }}
                    >
                        Отмена
                    </Button>
                    <Button
                        onClick={handleCreateProject}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                    >
                        Создать проект
                    </Button>
                </div>
            </Modal>

            {/* Edit Modal */}
            <Modal
                isOpen={!!editingProject}
                onClose={() => {
                    setEditingProject(null);
                    resetForm();
                }}
                title="Редактировать проект"
                size="lg"
            >
                <div className="space-y-4">
                    <Input
                        label="Название проекта"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        error={formErrors.name}
                        placeholder="Введите название проекта"
                        required
                    />

                    <Textarea
                        label="Описание"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        error={formErrors.description}
                        placeholder="Опишите проект подробно"
                        rows={4}
                        required
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Дата начала"
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            error={formErrors.startDate}
                            required
                        />

                        <Input
                            label="Дата окончания"
                            type="date"
                            value={formData.endDate}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select
                            label="Менеджер проекта"
                            value={formData.managerId}
                            onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                            options={managerOptions.filter(opt => opt.value !== '')}
                            error={formErrors.managerId}
                            required
                        />

                        <Input
                            label="Этапы проекта"
                            value={formData.stages}
                            onChange={(e) => setFormData({ ...formData, stages: e.target.value })}
                            placeholder="Опишите этапы проекта"
                        />
                    </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                    <Button
                        variant="secondary"
                        onClick={() => {
                            setEditingProject(null);
                            resetForm();
                        }}
                    >
                        Отмена
                    </Button>
                    <Button
                        onClick={handleUpdateProject}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                    >
                        Сохранить изменения
                    </Button>
                </div>
            </Modal>

            {/* Delete Modal */}
            <Modal
                isOpen={!!showDeleteModal}
                onClose={() => setShowDeleteModal(null)}
                title="Удалить проект"
                size="sm"
            >
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Вы уверены, что хотите удалить этот проект? Это действие нельзя отменить.
                </p>

                <div className="flex justify-end space-x-3">
                    <Button
                        variant="secondary"
                        onClick={() => setShowDeleteModal(null)}
                    >
                        Отмена
                    </Button>
                    <Button
                        variant="danger"
                        onClick={handleDeleteProject}
                    >
                        Удалить
                    </Button>
                </div>
            </Modal>
        </div>
    );
};

export default Projects;