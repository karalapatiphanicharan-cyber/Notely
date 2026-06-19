export type Priority = 'low' | 'medium' | 'high';

export interface TodoList {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
}

export interface Task {
  id: string;
  listId: string;
  title: string;
  isCompleted: boolean;
  priority?: Priority;
  createdAt: number;
  updatedAt: number;
}
