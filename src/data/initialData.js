export const initialUsers = [
    { id: 1, email: 'engineer@example.com', password: 'pass123', role: 'engineer', name: 'Инженер Иванов' },
    { id: 2, email: 'manager@example.com', password: 'pass123', role: 'manager', name: 'Менеджер Петров' },
    { id: 3, email: 'observer@example.com', password: 'pass123', role: 'observer', name: 'Руководитель Сидоров' },
];

export const initialProjects = [
    { id: 1, name: 'Строительство моста', description: 'Проект по строительству моста', managerId: 2, startDate: '2025-01-01', endDate: '2025-12-31', stages: 'Этап 1: Подготовка\nЭтап 2: Строительство' },
];

export const initialDefects = [
    { id: 1, title: 'Трещина в бетоне', description: 'Обнаружена трещина', priority: 'high', assigneeId: 1, deadline: '2025-10-10', projectId: 1, status: 'new', attachments: [] },
];

export const initialComments = [];

export const initialHistory = [];