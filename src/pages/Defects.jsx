import { useState, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContex';
import { useApp } from '../context/AppContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Textarea from '../components/ui/Textarea';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';

const Defects = () => {
    const { currentUser, hasPermission, canEditDefect, canDeleteDefect } = useAuth();
    const { 
        defects, 
        projects, 
        users, 
        addDefect, 
        updateDefect, 
        deleteDefect, 
        searchDefects 
    } = useApp();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [filterStatus, setFilterStatus] = useState(searchParams.get('status') || '');
    const [filterPriority, setFilterPriority] = useState(searchParams.get('priority') || '');
    const [filterProject, setFilterProject] = useState(searchParams.get('project') || '');
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingDefect, setEditingDefect] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'medium',
        status: 'new',
        projectId: '',
        assigneeId: '',
        deadline: ''
    });

    const [formErrors, setFormErrors] = useState({});

    const statusOptions = [
        { value: '', label: 'Все статусы' },
        { value: 'new', label: 'Новая' },
        { value: 'in_progress', label: 'В работе' },
        { value: 'under_review', label: 'На проверке' },
        { value: 'closed', label: 'Закрыта' },
        { value: 'canceled', label: 'Отменена' }
    ];

    const priorityOptions = [
        { value: '', label: 'Все приоритеты' },
        { value: 'high', label: 'Высокий' },
        { value: 'medium', label: 'Средний' },
        { value: 'low', label: 'Низкий' }
    ];

    const projectOptions = [
        { value: '', label: 'Все проекты' },
        ...projects.map(project => ({
            value: project.id,
            label: project.name
        }))
    ];

    const userOptions = [
        { value: '', label: 'Все исполнители' },
        ...users.map(user => ({
            value: user.id,
            label: user.name
        }))
    ];

    const sortOptions = [
        { value: 'createdAt', label: 'Дата создания' },
        { value: 'title', label: 'Заголовок' },
        { value: 'priority', label: 'Приоритет' },
        { value: 'status', label: 'Статус' },
        { value: 'deadline', label: 'Срок' }
    ];

    const filteredDefects = useMemo(() => {
        let filtered = defects;

        // Apply search filter
        if (search) {
            filtered = searchDefects(search);
        }

        // Apply status filter
        if (filterStatus) {
            filtered = filtered.filter(defect => defect.status === filterStatus);
        }

        // Apply priority filter
        if (filterPriority) {
            filtered = filtered.filter(defect => defect.priority === filterPriority);
        }

        // Apply project filter
        if (filterProject) {
            filtered = filtered.filter(defect => defect.projectId === filterProject);
        }

        // Apply sorting
        filtered.sort((a, b) => {
            let aValue = a[sortBy];
            let bValue = b[sortBy];

            if (sortBy === 'createdAt' || sortBy === 'deadline') {
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
    }, [defects, search, filterStatus, filterPriority, filterProject, sortBy, sortOrder, searchDefects]);

    const validateForm = () => {
        const errors = {};

        if (!formData.title.trim()) {
            errors.title = 'Заголовок обязателен';
        }

        if (!formData.description.trim()) {
            errors.description = 'Описание обязательно';
        }

        if (!formData.projectId) {
            errors.projectId = 'Проект обязателен';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleCreateDefect = () => {
        if (!validateForm()) return;

        const newDefect = {
            ...formData,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            reporterId: currentUser.id
        };

        addDefect(newDefect);
        resetForm();
        setShowCreateModal(false);
    };

    const handleUpdateDefect = () => {
        if (!validateForm()) return;

        const updatedDefect = {
            ...editingDefect,
            ...formData,
            updatedAt: new Date().toISOString()
        };

        updateDefect(updatedDefect);
        resetForm();
        setEditingDefect(null);
    };

    const handleDeleteDefect = () => {
        if (showDeleteModal) {
            deleteDefect(showDeleteModal);
            setShowDeleteModal(null);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            priority: 'medium',
            status: 'new',
            projectId: '',
            assigneeId: '',
            deadline: ''
        });
        setFormErrors({});
    };

    const openEditModal = (defect) => {
        setFormData({
            title: defect.title,
            description: defect.description,
            priority: defect.priority,
            status: defect.status,
            projectId: defect.projectId,
            assigneeId: defect.assigneeId || '',
            deadline: defect.deadline ? defect.deadline.split('T')[0] : ''
        });
        setEditingDefect(defect);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'new': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
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

    const isOverdue = (deadline) => {
        if (!deadline) return false;
        return new Date(deadline) < new Date();
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                            Дефекты
                        </h1>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            Управление дефектами и их отслеживание
                        </p>
                    </div>
                    {hasPermission('create_defects') && (
                        <Button
                            onClick={() => setShowCreateModal(true)}
                            className="mt-4 sm:mt-0 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Создать дефект
                        </Button>
                    )}
                </div>

                {/* Filters */}
                <Card className="mb-8 shadow-lg">
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                            Поиск и фильтрация
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            <div className="lg:col-span-2">
                                <Input
                                    placeholder="Поиск по заголовку или описанию..."
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
                                value={filterPriority}
                                onChange={(e) => setFilterPriority(e.target.value)}
                                options={priorityOptions}
                            />
                            
                            <Select
                                value={filterProject}
                                onChange={(e) => setFilterProject(e.target.value)}
                                options={projectOptions}
                            />
                        </div>
                        
                        <div className="mt-4 flex flex-wrap gap-4">
                            <Select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                options={sortOptions}
                                className="w-48"
                            />
                            
                            <Select
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                                options={[
                                    { value: 'desc', label: 'По убыванию' },
                                    { value: 'asc', label: 'По возрастанию' }
                                ]}
                                className="w-48"
                            />
                            
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    setSearch('');
                                    setFilterStatus('');
                                    setFilterPriority('');
                                    setFilterProject('');
                                }}
                                className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                            >
                                Очистить фильтры
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Defects Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDefects.length > 0 ? (
                        filteredDefects.map((defect) => (
                            <Card 
                                key={defect.id} 
                                className="hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
                                onClick={() => navigate(`/defects/${defect.id}`)}
                            >
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
                                            {defect.title}
                                        </h3>
                                        <div className="flex space-x-2 ml-2">
                                            <Badge className={getStatusColor(defect.status)}>
                                                {getStatusLabel(defect.status)}
                                            </Badge>
                                            <Badge className={getPriorityColor(defect.priority)}>
                                                {getPriorityLabel(defect.priority)}
                                            </Badge>
                                        </div>
                                    </div>
                                    
                                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                                        {defect.description}
                                    </p>
                                    
                                    <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                                        <div className="flex items-center justify-between">
                                            <span>ID: #{defect.id}</span>
                                            <span>{new Date(defect.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        
                                        {defect.deadline && (
                                            <div className="flex items-center justify-between">
                                                <span>Срок:</span>
                                                <span className={isOverdue(defect.deadline) ? 'text-red-500 font-medium' : ''}>
                                                    {new Date(defect.deadline).toLocaleDateString()}
                                                </span>
                                            </div>
                                        )}
                                        
                                        {defect.assigneeId && (
                                            <div className="flex items-center justify-between">
                                                <span>Исполнитель:</span>
                                                <span>{users.find(u => u.id === defect.assigneeId)?.name || 'Не назначен'}</span>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="mt-4 flex items-center justify-between">
                                        <div className="flex space-x-2">
                                            {canEditDefect(defect) && (
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openEditModal(defect);
                                                    }}
                                                    className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40"
                                                >
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                    Редактировать
                                                </Button>
                                            )}
                                            
                                            {canDeleteDefect(defect) && (
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setShowDeleteModal(defect.id);
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
                        ))
                    ) : (
                        <div className="col-span-full">
                            <Card className="text-center py-12">
                                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                    Дефекты не найдены
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-4">
                                    Попробуйте изменить параметры поиска или создать новый дефект
                                </p>
                                {hasPermission('create_defects') && (
                                    <Button
                                        onClick={() => setShowCreateModal(true)}
                                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                                    >
                                        Создать первый дефект
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
                title="Создать дефект"
                size="lg"
            >
                <div className="space-y-4">
                    <Input
                        label="Заголовок"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        error={formErrors.title}
                        placeholder="Введите заголовок дефекта"
                        required
                    />

                    <Textarea
                        label="Описание"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        error={formErrors.description}
                        placeholder="Опишите дефект подробно"
                        rows={4}
                        required
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select
                            label="Приоритет"
                            value={formData.priority}
                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                            options={priorityOptions.filter(opt => opt.value !== '')}
                        />

                        <Select
                            label="Статус"
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            options={statusOptions.filter(opt => opt.value !== '')}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select
                            label="Проект"
                            value={formData.projectId}
                            onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                            options={projectOptions.filter(opt => opt.value !== '')}
                            error={formErrors.projectId}
                            required
                        />

                        <Select
                            label="Исполнитель"
                            value={formData.assigneeId}
                            onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
                            options={userOptions.filter(opt => opt.value !== '')}
                        />
                    </div>

                    <Input
                        label="Срок выполнения"
                        type="date"
                        value={formData.deadline}
                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    />
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
                        onClick={handleCreateDefect}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                    >
                        Создать дефект
                    </Button>
                </div>
            </Modal>

            {/* Edit Modal */}
            <Modal
                isOpen={!!editingDefect}
                onClose={() => {
                    setEditingDefect(null);
                    resetForm();
                }}
                title="Редактировать дефект"
                size="lg"
            >
                <div className="space-y-4">
                    <Input
                        label="Заголовок"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        error={formErrors.title}
                        placeholder="Введите заголовок дефекта"
                        required
                    />

                    <Textarea
                        label="Описание"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        error={formErrors.description}
                        placeholder="Опишите дефект подробно"
                        rows={4}
                        required
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select
                            label="Приоритет"
                            value={formData.priority}
                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                            options={priorityOptions.filter(opt => opt.value !== '')}
                        />

                        <Select
                            label="Статус"
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            options={statusOptions.filter(opt => opt.value !== '')}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select
                            label="Проект"
                            value={formData.projectId}
                            onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                            options={projectOptions.filter(opt => opt.value !== '')}
                            error={formErrors.projectId}
                            required
                        />

                        <Select
                            label="Исполнитель"
                            value={formData.assigneeId}
                            onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
                            options={userOptions.filter(opt => opt.value !== '')}
                        />
                    </div>

                    <Input
                        label="Срок выполнения"
                        type="date"
                        value={formData.deadline}
                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    />
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                    <Button
                        variant="secondary"
                        onClick={() => {
                            setEditingDefect(null);
                            resetForm();
                        }}
                    >
                        Отмена
                    </Button>
                    <Button
                        onClick={handleUpdateDefect}
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
                title="Удалить дефект"
                size="sm"
            >
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Вы уверены, что хотите удалить этот дефект? Это действие нельзя отменить.
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
                        onClick={handleDeleteDefect}
                    >
                        Удалить
                    </Button>
                </div>
            </Modal>
        </div>
    );
};

export default Defects;