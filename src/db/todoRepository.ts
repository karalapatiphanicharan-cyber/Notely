import { initDB } from './indexedDb';
import type { TodoList, Task } from '../types/todo';

export const todoRepository = {
  async getAllLists(): Promise<TodoList[]> {
    const db = await initDB();
    return db.getAllFromIndex('todoLists', 'by-updated');
  },

  async saveList(list: TodoList): Promise<void> {
    const db = await initDB();
    await db.put('todoLists', list);
  },

  async deleteList(id: string): Promise<void> {
    const db = await initDB();
    const tx = db.transaction(['todoLists', 'tasks'], 'readwrite');
    await tx.objectStore('todoLists').delete(id);
    const taskStore = tx.objectStore('tasks');
    const tasks = await taskStore.index('by-list').getAllKeys(id);
    for (const taskId of tasks) {
      await taskStore.delete(taskId);
    }
    await tx.done;
  },

  async getTasksByList(listId: string): Promise<Task[]> {
    const db = await initDB();
    return db.getAllFromIndex('tasks', 'by-list', listId);
  },

  async saveTask(task: Task): Promise<void> {
    const db = await initDB();
    await db.put('tasks', task);
  },

  async deleteTask(id: string): Promise<void> {
    const db = await initDB();
    await db.delete('tasks', id);
  },

  async getAllTasks(): Promise<Task[]> {
    const db = await initDB();
    return db.getAll('tasks');
  }
};
