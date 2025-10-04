import { createContext, useContext, useReducer, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { initialDefects, initialProjects, initialUsers, initialComments, initialHistory } from '../data/initialData';

const AppContext = createContext();

// Action types
const ACTIONS = {
  // Defects
  ADD_DEFECT: 'ADD_DEFECT',
  UPDATE_DEFECT: 'UPDATE_DEFECT',
  DELETE_DEFECT: 'DELETE_DEFECT',
  SET_DEFECTS: 'SET_DEFECTS',
  
  // Projects
  ADD_PROJECT: 'ADD_PROJECT',
  UPDATE_PROJECT: 'UPDATE_PROJECT',
  DELETE_PROJECT: 'DELETE_PROJECT',
  SET_PROJECTS: 'SET_PROJECTS',
  
  // Comments
  ADD_COMMENT: 'ADD_COMMENT',
  UPDATE_COMMENT: 'UPDATE_COMMENT',
  DELETE_COMMENT: 'DELETE_COMMENT',
  SET_COMMENTS: 'SET_COMMENTS',
  
  // History
  ADD_HISTORY_ENTRY: 'ADD_HISTORY_ENTRY',
  SET_HISTORY: 'SET_HISTORY',
  
  // Users
  SET_USERS: 'SET_USERS',
  UPDATE_USER: 'UPDATE_USER',
  
  // UI
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer
const appReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.ADD_DEFECT:
      return {
        ...state,
        defects: [...state.defects, action.payload],
        history: [...state.history, {
          id: Date.now(),
          type: 'defect_created',
          entityId: action.payload.id,
          entityType: 'defect',
          userId: action.payload.createdBy,
          timestamp: new Date().toISOString(),
          changes: { title: action.payload.title, status: action.payload.status }
        }]
      };
      
    case ACTIONS.UPDATE_DEFECT:
      const oldDefect = state.defects.find(d => d.id === action.payload.id);
      const changes = {};
      Object.keys(action.payload).forEach(key => {
        if (key !== 'id' && oldDefect[key] !== action.payload[key]) {
          changes[key] = { from: oldDefect[key], to: action.payload[key] };
        }
      });
      
      return {
        ...state,
        defects: state.defects.map(d => 
          d.id === action.payload.id ? { ...d, ...action.payload, updatedAt: new Date().toISOString() } : d
        ),
        history: Object.keys(changes).length > 0 ? [...state.history, {
          id: Date.now(),
          type: 'defect_updated',
          entityId: action.payload.id,
          entityType: 'defect',
          userId: action.payload.updatedBy,
          timestamp: new Date().toISOString(),
          changes
        }] : state.history
      };
      
    case ACTIONS.DELETE_DEFECT:
      return {
        ...state,
        defects: state.defects.filter(d => d.id !== action.payload),
        history: [...state.history, {
          id: Date.now(),
          type: 'defect_deleted',
          entityId: action.payload,
          entityType: 'defect',
          userId: action.userId,
          timestamp: new Date().toISOString(),
          changes: {}
        }]
      };
      
    case ACTIONS.ADD_PROJECT:
      return {
        ...state,
        projects: [...state.projects, action.payload],
        history: [...state.history, {
          id: Date.now(),
          type: 'project_created',
          entityId: action.payload.id,
          entityType: 'project',
          userId: action.payload.managerId,
          timestamp: new Date().toISOString(),
          changes: { name: action.payload.name }
        }]
      };
      
    case ACTIONS.UPDATE_PROJECT:
      const oldProject = state.projects.find(p => p.id === action.payload.id);
      const projectChanges = {};
      Object.keys(action.payload).forEach(key => {
        if (key !== 'id' && oldProject[key] !== action.payload[key]) {
          projectChanges[key] = { from: oldProject[key], to: action.payload[key] };
        }
      });
      
      return {
        ...state,
        projects: state.projects.map(p => 
          p.id === action.payload.id ? { ...p, ...action.payload, updatedAt: new Date().toISOString() } : p
        ),
        history: Object.keys(projectChanges).length > 0 ? [...state.history, {
          id: Date.now(),
          type: 'project_updated',
          entityId: action.payload.id,
          entityType: 'project',
          userId: action.payload.updatedBy,
          timestamp: new Date().toISOString(),
          changes: projectChanges
        }] : state.history
      };
      
    case ACTIONS.DELETE_PROJECT:
      return {
        ...state,
        projects: state.projects.filter(p => p.id !== action.payload),
        defects: state.defects.map(d => 
          d.projectId === action.payload ? { ...d, projectId: null } : d
        ),
        history: [...state.history, {
          id: Date.now(),
          type: 'project_deleted',
          entityId: action.payload,
          entityType: 'project',
          userId: action.userId,
          timestamp: new Date().toISOString(),
          changes: {}
        }]
      };
      
    case ACTIONS.ADD_COMMENT:
      return {
        ...state,
        comments: [...state.comments, action.payload],
        history: [...state.history, {
          id: Date.now(),
          type: 'comment_added',
          entityId: action.payload.defectId,
          entityType: 'defect',
          userId: action.payload.userId,
          timestamp: new Date().toISOString(),
          changes: { comment: action.payload.content }
        }]
      };
      
    case ACTIONS.ADD_HISTORY_ENTRY:
      return {
        ...state,
        history: [...state.history, action.payload]
      };
      
    case ACTIONS.SET_DEFECTS:
      return { ...state, defects: action.payload };
    case ACTIONS.SET_PROJECTS:
      return { ...state, projects: action.payload };
    case ACTIONS.SET_COMMENTS:
      return { ...state, comments: action.payload };
    case ACTIONS.SET_HISTORY:
      return { ...state, history: action.payload };
    case ACTIONS.SET_USERS:
      return { ...state, users: action.payload };
      
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    case ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
      
    default:
      return state;
  }
};

// Initial state
const initialState = {
  defects: initialDefects,
  projects: initialProjects,
  users: initialUsers,
  comments: initialComments,
  history: initialHistory,
  loading: false,
  error: null,
};

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  // Load data from localStorage on mount
  useEffect(() => {
    const savedDefects = localStorage.getItem('defects');
    const savedProjects = localStorage.getItem('projects');
    const savedComments = localStorage.getItem('comments');
    const savedHistory = localStorage.getItem('history');
    const savedUsers = localStorage.getItem('users');
    
    if (savedDefects) dispatch({ type: ACTIONS.SET_DEFECTS, payload: JSON.parse(savedDefects) });
    if (savedProjects) dispatch({ type: ACTIONS.SET_PROJECTS, payload: JSON.parse(savedProjects) });
    if (savedComments) dispatch({ type: ACTIONS.SET_COMMENTS, payload: JSON.parse(savedComments) });
    if (savedHistory) dispatch({ type: ACTIONS.SET_HISTORY, payload: JSON.parse(savedHistory) });
    if (savedUsers) dispatch({ type: ACTIONS.SET_USERS, payload: JSON.parse(savedUsers) });
  }, []);
  
  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('defects', JSON.stringify(state.defects));
  }, [state.defects]);
  
  useEffect(() => {
    localStorage.setItem('projects', JSON.stringify(state.projects));
  }, [state.projects]);
  
  useEffect(() => {
    localStorage.setItem('comments', JSON.stringify(state.comments));
  }, [state.comments]);
  
  useEffect(() => {
    localStorage.setItem('history', JSON.stringify(state.history));
  }, [state.history]);
  
  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(state.users));
  }, [state.users]);
  
  // Action creators
  const addDefect = (defect) => {
    const newDefect = {
      ...defect,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: defect.createdBy || defect.assigneeId,
    };
    dispatch({ type: ACTIONS.ADD_DEFECT, payload: newDefect });
    return newDefect;
  };
  
  const updateDefect = (id, updates, userId) => {
    dispatch({ 
      type: ACTIONS.UPDATE_DEFECT, 
      payload: { ...updates, id, updatedBy: userId } 
    });
  };
  
  const deleteDefect = (id, userId) => {
    dispatch({ type: ACTIONS.DELETE_DEFECT, payload: id, userId });
  };
  
  const addProject = (project) => {
    const newProject = {
      ...project,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dispatch({ type: ACTIONS.ADD_PROJECT, payload: newProject });
    return newProject;
  };
  
  const updateProject = (id, updates, userId) => {
    dispatch({ 
      type: ACTIONS.UPDATE_PROJECT, 
      payload: { ...updates, id, updatedBy: userId } 
    });
  };
  
  const deleteProject = (id, userId) => {
    dispatch({ type: ACTIONS.DELETE_PROJECT, payload: id, userId });
  };
  
  const addComment = (comment) => {
    const newComment = {
      ...comment,
      id: Date.now(),
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: ACTIONS.ADD_COMMENT, payload: newComment });
    return newComment;
  };
  
  const getDefectHistory = (defectId) => {
    return state.history.filter(h => h.entityId === defectId && h.entityType === 'defect');
  };
  
  const getProjectHistory = (projectId) => {
    return state.history.filter(h => h.entityId === projectId && h.entityType === 'project');
  };
  
  const getUserHistory = (userId) => {
    return state.history.filter(h => h.userId === userId);
  };
  
  const getDefectsByProject = (projectId) => {
    return state.defects.filter(d => d.projectId === projectId);
  };
  
  const getDefectsByUser = (userId) => {
    return state.defects.filter(d => d.assigneeId === userId);
  };
  
  const getDefectsByStatus = (status) => {
    return state.defects.filter(d => d.status === status);
  };
  
  const getDefectsByPriority = (priority) => {
    return state.defects.filter(d => d.priority === priority);
  };
  
  const searchDefects = (query) => {
    const lowercaseQuery = query.toLowerCase();
    return state.defects.filter(d => 
      d.title.toLowerCase().includes(lowercaseQuery) ||
      d.description.toLowerCase().includes(lowercaseQuery)
    );
  };
  
  const searchProjects = (query) => {
    const lowercaseQuery = query.toLowerCase();
    return state.projects.filter(p => 
      p.name.toLowerCase().includes(lowercaseQuery) ||
      p.description.toLowerCase().includes(lowercaseQuery)
    );
  };
  
  const value = {
    ...state,
    // Defect actions
    addDefect,
    updateDefect,
    deleteDefect,
    
    // Project actions
    addProject,
    updateProject,
    deleteProject,
    
    // Comment actions
    addComment,
    
    // History actions
    getDefectHistory,
    getProjectHistory,
    getUserHistory,
    
    // Query functions
    getDefectsByProject,
    getDefectsByUser,
    getDefectsByStatus,
    getDefectsByPriority,
    searchDefects,
    searchProjects,
    
    // UI actions
    setLoading: (loading) => dispatch({ type: ACTIONS.SET_LOADING, payload: loading }),
    setError: (error) => dispatch({ type: ACTIONS.SET_ERROR, payload: error }),
    clearError: () => dispatch({ type: ACTIONS.CLEAR_ERROR }),
  };
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
