export const initialUsers = [
    { id: 1, email: 'engineer@example.com', password: 'pass123', role: 'engineer', name: 'Инженер Иванов' },
    { id: 2, email: 'manager@example.com', password: 'pass123', role: 'manager', name: 'Менеджер Петров' },
    { id: 3, email: 'observer@example.com', password: 'pass123', role: 'observer', name: 'Руководитель Сидоров' },
];

export const initialProjects = [
    { id: 1, name: 'Строительство моста', description: 'Проект по строительству моста', managerId: 2, startDate: '2025-01-01', endDate: '2025-12-31', stages: 'Этап 1: Подготовка\nЭтап 2: Строительство' },
    { id: 2, name: 'Реконструкция здания', description: 'Проект по реконструкции старого здания', managerId: 2, startDate: '2025-02-01', endDate: '2025-11-30', stages: 'Этап 1: Планирование\nЭтап 2: Демонтаж\nЭтап 3: Реконструкция\nЭтап 4: Завершение' },
    { id: 3, name: 'Строительство дороги', description: 'Проект по прокладке новой дороги', managerId: 2, startDate: '2025-03-01', endDate: '2025-10-31', stages: 'Этап 1: Подготовка участка\nЭтап 2: Укладка асфальта\nЭтап 3: Тестирование и сдача' },
    { id: 4, name: 'Возведение жилого комплекса', description: 'Проект строительства многоквартирного дома', managerId: 2, startDate: '2025-04-15', endDate: '2026-06-30', stages: 'Этап 1: Фундамент\nЭтап 2: Каркас\nЭтап 3: Отделка\nЭтап 4: Благоустройство' },
];

export const initialDefects = [
    { id: 1, title: 'Трещина в бетоне', description: 'Обнаружена трещина в бетонной конструкции', priority: 'high', assigneeId: 1, deadline: '2025-10-10', projectId: 1, status: 'new', attachments: [] },
    { id: 2, title: 'Проблема с электрикой', description: 'Неисправность в электропроводке на втором этаже', priority: 'medium', assigneeId: 1, deadline: '2025-09-15', projectId: 1, status: 'in progress', attachments: [] },
    { id: 3, title: 'Утечка воды', description: 'Утечка в системе водоснабжения', priority: 'low', assigneeId: 1, deadline: '2025-11-20', projectId: 2, status: 'resolved', attachments: [] },
    { id: 4, title: 'Дефекты в фундаменте', description: 'Неровности и трещины в фундаменте здания', priority: 'high', assigneeId: 1, deadline: '2025-08-30', projectId: 3, status: 'new', attachments: [] },
    { id: 5, title: 'Проблемы с изоляцией', description: 'Недостаточная теплоизоляция стен', priority: 'medium', assigneeId: 1, deadline: '2025-12-05', projectId: 4, status: 'in progress', attachments: [] },
    { id: 6, title: 'Сбои в лифтовой системе', description: 'Лифт не работает должным образом', priority: 'high', assigneeId: 1, deadline: '2025-07-25', projectId: 4, status: 'resolved', attachments: [] },
];

export const initialComments = [];

export const initialHistory = [];