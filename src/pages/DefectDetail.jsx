import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContex';
import { useApp } from '../context/AppContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Textarea from '../components/ui/Textarea';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';

const DefectDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser, canEditDefect, canDeleteDefect } = useAuth();
    const { 
        defects, 
        projects, 
        users, 
        comments, 
        history, 
        updateDefect, 
        deleteDefect, 
        addComment, 
        getDefectById, 
        getCommentsByDefect, 
        getHistoryByDefect 
    } = useApp();

    const [defect, setDefect] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showCommentModal, setShowCommentModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'medium',
        status: 'new',
        projectId: '',
        assigneeId: '',
        deadline: ''
    });

    const [commentData, setCommentData] = useState({
        text: ''
    });

    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        const defectData = getDefectById(id);
        if (defectData) {
            setDefect(defectData);
            setFormData({
                title: defectData.title,
                description: defectData.description,
                priority: defectData.priority,
                status: defectData.status,
                projectId: defectData.projectId,
                assigneeId: defectData.assigneeId || '',
                deadline: defectData.deadline ? defectData.deadline.split('T')[0] : ''
            });
        }
    }, [id, getDefectById]);

    const statusOptions = [
        { value: 'new', label: 'Новая' },
        { value: 'in_progress', label: 'В работе' },
        { value: 'under_review', label: 'На проверке' },
        { value: 'closed', label: 'Закрыта' },
        { value: 'canceled', label: 'Отменена' }
    ];

    const priorityOptions = [
        { value: 'high', label: 'Высокий' },
        { value: 'medium', label: 'Средний' },
        { value: 'low', label: 'Низкий' }
    ];

    const projectOptions = projects.map(project => ({
        value: project.id,
        label: project.name
    }));

    const userOptions = users.map(user => ({
        value: user.id,
        label: user.name
    }));

    const defectComments = getCommentsByDefect(id);
    const defectHistory = getHistoryByDefect(id);

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

    const handleUpdate = () => {
        if (!validateForm()) return;

        const updatedDefect = {
            ...defect,
            ...formData,
            updatedAt: new Date().toISOString()
        };

        updateDefect(updatedDefect);
        setDefect(updatedDefect);
        setIsEditing(false);
    };

    const handleDelete = () => {
        deleteDefect(id);
        navigate('/defects');
    };

    const handleAddComment = () => {
        if (!commentData.text.trim()) return;

        const newComment = {
            id: Date.now().toString(),
            defectId: id,
            text: commentData.text,
            authorId: currentUser.id,
            createdAt: new Date().toISOString()
        };

        addComment(newComment);
        setCommentData({ text: '' });
        setShowCommentModal(false);
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

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('ru-RU');
    };

    if (!defect) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                        Дефект не найден
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                        Возможно, дефект был удален или не существует
                    </p>
                    <Button onClick={() => navigate('/defects')}>
                        Вернуться к списку дефектов
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                    <div className="flex items-center space-x-4">
                        <Button
                            variant="secondary"
                            onClick={() => navigate('/defects')}
                            className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Назад
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                #{defect.id} - {defect.title}
                            </h1>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                Создан {formatDate(defect.createdAt)}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex space-x-3 mt-4 sm:mt-0">
                        {canEditDefect(defect) && (
                            <Button
                                variant="secondary"
                                onClick={() => setIsEditing(true)}
                                className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Редактировать
                            </Button>
                        )}
                        
                        {canDeleteDefect(defect) && (
                            <Button
                                variant="secondary"
                                onClick={() => setShowDeleteModal(true)}
                                className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Удалить
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Defect Info */}
                        <Card className="shadow-lg">
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex space-x-3">
                                        <Badge className={getStatusColor(defect.status)}>
                                            {getStatusLabel(defect.status)}
                                        </Badge>
                                        <Badge className={getPriorityColor(defect.priority)}>
                                            {getPriorityLabel(defect.priority)}
                                        </Badge>
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                            Описание
                                        </h3>
                                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                            {defect.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Comments */}
                        <Card className="shadow-lg">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        Комментарии ({defectComments.length})
                                    </h3>
                                    <Button
                                        variant="secondary"
                                        onClick={() => setShowCommentModal(true)}
                                        className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Добавить комментарий
                                    </Button>
                                </div>
                                
                                <div className="space-y-4">
                                    {defectComments.length > 0 ? (
                                        defectComments.map((comment) => {
                                            const author = users.find(u => u.id === comment.authorId);
                                            return (
                                                <div key={comment.id} className="border-l-4 border-blue-500 pl-4 py-2">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="font-medium text-gray-900 dark:text-gray-100">
                                                            {author?.name || 'Неизвестный пользователь'}
                                                        </span>
                                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                                            {formatDate(comment.createdAt)}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-700 dark:text-gray-300">
                                                        {comment.text}
                                                    </p>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                                            Пока нет комментариев
                                        </p>
                                    )}
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Defect Details */}
                        <Card className="shadow-lg">
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                    Детали дефекта
                                </h3>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Проект
                                        </label>
                                        <p className="text-gray-900 dark:text-gray-100">
                                            {projects.find(p => p.id === defect.projectId)?.name || 'Не указан'}
                                        </p>
                                    </div>
                                    
                                    <div>
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Исполнитель
                                        </label>
                                        <p className="text-gray-900 dark:text-gray-100">
                                            {defect.assigneeId ? 
                                                users.find(u => u.id === defect.assigneeId)?.name || 'Неизвестный пользователь' 
                                                : 'Не назначен'
                                            }
                                        </p>
                                    </div>
                                    
                                    <div>
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Срок выполнения
                                        </label>
                                        <p className={`text-gray-900 dark:text-gray-100 ${
                                            isOverdue(defect.deadline) ? 'text-red-500 font-medium' : ''
                                        }`}>
                                            {defect.deadline ? 
                                                new Date(defect.deadline).toLocaleDateString('ru-RU') 
                                                : 'Не указан'
                                            }
                                        </p>
                                    </div>
                                    
                                    <div>
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Создатель
                                        </label>
                                        <p className="text-gray-900 dark:text-gray-100">
                                            {users.find(u => u.id === defect.reporterId)?.name || 'Неизвестный пользователь'}
                                        </p>
                                    </div>
                                    
                                    <div>
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Обновлено
                                        </label>
                                        <p className="text-gray-900 dark:text-gray-100">
                                            {formatDate(defect.updatedAt)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Quick Actions */}
                        <Card className="shadow-lg">
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                    Быстрые действия
                                </h3>
                                
                                <div className="space-y-3">
                                    <Button
                                        variant="secondary"
                                        onClick={() => setShowHistoryModal(true)}
                                        className="w-full justify-start bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        История изменений
                                    </Button>
                                    
                                    <Button
                                        variant="secondary"
                                        onClick={() => setShowCommentModal(true)}
                                        className="w-full justify-start bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                        Добавить комментарий
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
        </div>

            {/* Edit Modal */}
            <Modal
                isOpen={isEditing}
                onClose={() => setIsEditing(false)}
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
                            options={priorityOptions}
                        />

                        <Select
                            label="Статус"
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            options={statusOptions}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select
                            label="Проект"
                            value={formData.projectId}
                            onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                            options={projectOptions}
                            error={formErrors.projectId}
                            required
                        />

                        <Select
                            label="Исполнитель"
                            value={formData.assigneeId}
                            onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
                            options={userOptions}
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
                        onClick={() => setIsEditing(false)}
                    >
                        Отмена
                    </Button>
                    <Button
                        onClick={handleUpdate}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                    >
                        Сохранить изменения
                    </Button>
                </div>
            </Modal>

            {/* Delete Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Удалить дефект"
                size="sm"
            >
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Вы уверены, что хотите удалить этот дефект? Это действие нельзя отменить.
                </p>

                <div className="flex justify-end space-x-3">
                    <Button
                        variant="secondary"
                        onClick={() => setShowDeleteModal(false)}
                    >
                        Отмена
                    </Button>
                    <Button
                        variant="danger"
                        onClick={handleDelete}
                    >
                        Удалить
                    </Button>
        </div>
            </Modal>

            {/* Comment Modal */}
            <Modal
                isOpen={showCommentModal}
                onClose={() => {
                    setShowCommentModal(false);
                    setCommentData({ text: '' });
                }}
                title="Добавить комментарий"
                size="md"
            >
                <div className="space-y-4">
                    <Textarea
                        label="Комментарий"
                        value={commentData.text}
                        onChange={(e) => setCommentData({ text: e.target.value })}
                        placeholder="Введите ваш комментарий..."
                        rows={4}
                        required
                    />
            </div>

                <div className="flex justify-end space-x-3 mt-6">
                    <Button
                        variant="secondary"
                        onClick={() => {
                            setShowCommentModal(false);
                            setCommentData({ text: '' });
                        }}
                    >
                        Отмена
                    </Button>
                    <Button
                        onClick={handleAddComment}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                    >
                        Добавить комментарий
                    </Button>
        </div>
            </Modal>

            {/* History Modal */}
            <Modal
                isOpen={showHistoryModal}
                onClose={() => setShowHistoryModal(false)}
                title="История изменений"
                size="lg"
            >
                <div className="space-y-4">
                    {defectHistory.length > 0 ? (
                        defectHistory.map((item) => {
                            const user = users.find(u => u.id === item.userId);
                            return (
                                <div key={item.id} className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 py-2">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-medium text-gray-900 dark:text-gray-100">
                                            {user?.name || 'Неизвестный пользователь'}
                                        </span>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            {formatDate(item.createdAt)}
                                        </span>
            </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {item.action}
                                    </p>
            </div>
                            );
                        })
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                            История изменений пуста
                        </p>
            )}
        </div>

                <div className="flex justify-end mt-6">
                    <Button
                        variant="secondary"
                        onClick={() => setShowHistoryModal(false)}
                    >
                        Закрыть
                    </Button>
            </div>
            </Modal>
        </div>
    );
};

export default DefectDetail;