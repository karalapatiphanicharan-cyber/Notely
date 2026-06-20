import { create } from 'zustand';
import type { TodoList, Task, Priority } from '../types/todo';
import { todoRepository } from '../db/todoRepository';

interface TodoState {
  lists: TodoList[];
  tasks: Task[];
  activeListId: string | null;
  isLoading: boolean;
  searchQuery: string;

  // Actions
  loadLists: () => Promise<void>;
  setActiveListId: (id: string | null) => void;
  addList: (title: string) => Promise<void>;
  updateList: (id: string, title: string) => Promise<void>;
  deleteList: (id: string) => Promise<void>;

  loadTasks: (listId: string) => Promise<void>;
  addTask: (listId: string, title: string) => Promise<void>;
  toggleTask: (taskId: string) => Promise<void>;
  updateTask: (taskId: string, title: string, priority?: Priority) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
}

export const useTodoStore = create<TodoState>((set, get) => ({
  lists: [],
  tasks: [],
  activeListId: null,
  isLoading: false,
  searchQuery: '',

  loadLists: async () => {
    set({ isLoading: true });
    try {
      const lists = await todoRepository.getAllLists();
      set({ lists, isLoading: false });
      if (lists.length > 0 && !get().activeListId) {
        set({ activeListId: lists[lists.length - 1].id });
      }
    } catch (error) {
      console.error('Failed to load todo lists:', error);
      set({ isLoading: false });
    }
  },

  setActiveListId: (id) => {
    set({ activeListId: id });
  },

  addList: async (title) => {
    const newList: TodoList = {
      id: crypto.randomUUID(),
      title,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await todoRepository.saveList(newList);
    set((state) => ({
      lists: [...state.lists, newList],
      activeListId: newList.id,
    }));
  },

  updateList: async (id, title) => {
    const list = get().lists.find((l) => l.id === id);
    if (!list) return;

    const updatedList = { ...list, title, updatedAt: Date.now() };
    await todoRepository.saveList(updatedList);
    set((state) => ({
      lists: state.lists.map((l) => (l.id === id ? updatedList : l)),
    }));
  },

  deleteList: async (id) => {
    await todoRepository.deleteList(id);
    set((state) => {
      const newLists = state.lists.filter((l) => l.id !== id);
      return {
        lists: newLists,
        activeListId: state.activeListId === id ? (newLists.length > 0 ? newLists[newLists.length - 1].id : null) : state.activeListId,
      };
    });
  },

  loadTasks: async (listId) => {
    const tasks = await todoRepository.getTasksByList(listId);
    set({ tasks });
  },

  addTask: async (listId, title) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      listId,
      title,
      isCompleted: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await todoRepository.saveTask(newTask);
    if (get().activeListId === listId) {
      set((state) => ({ tasks: [...state.tasks, newTask] }));
    }
  },

  toggleTask: async (taskId) => {
    const task = get().tasks.find((t) => t.id === taskId);
    if (!task) return;

    const updatedTask = { ...task, isCompleted: !task.isCompleted, updatedAt: Date.now() };
    await todoRepository.saveTask(updatedTask);
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === taskId ? updatedTask : t)),
    }));
  },

  updateTask: async (taskId, title, priority) => {
    const task = get().tasks.find((t) => t.id === taskId);
    if (!task) return;

    const updatedTask = {
      ...task,
      title,
      priority: priority !== undefined ? priority : task.priority,
      updatedAt: Date.now()
    };
    await todoRepository.saveTask(updatedTask);
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === taskId ? updatedTask : t)),
    }));
  },

  deleteTask: async (taskId) => {
    await todoRepository.deleteTask(taskId);
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== taskId),
    }));
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },
}));
