import { useState, useEffect } from 'react';
import { useTodoStore } from '../store/todoStore';
import {
  Plus,
  Search,
  CheckCircle2,
  Circle,
  Trash2,
  ChevronRight,
  ListTodo,
  Edit2
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { cn } from '../utils/cn';
import { ConfirmModal } from '../components/ui/ConfirmModal';

export function TodoPage() {
  const {
    lists,
    tasks,
    activeListId,
    loadLists,
    loadTasks,
    setActiveListId,
    addList,
    deleteList,
    addTask,
    toggleTask,
    deleteTask,
    updateTask,
    updateList,
    searchQuery,
    setSearchQuery
  } = useTodoStore();

  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newListTitle, setNewListTitle] = useState('');
  const [isAddingList, setIsAddingList] = useState(false);
  const [listToDelete, setListToDelete] = useState<string | null>(null);
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editingListTitle, setEditingListTitle] = useState('');

  useEffect(() => {
    loadLists();
  }, [loadLists]);

  useEffect(() => {
    if (activeListId) {
      loadTasks(activeListId);
    }
  }, [activeListId, loadTasks]);

  const activeList = lists.find((l) => l.id === activeListId);

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filter === 'all' ||
      (filter === 'active' && !task.isCompleted) ||
      (filter === 'completed' && task.isCompleted);
    return matchesSearch && matchesFilter;
  });

  const completedCount = tasks.filter((t) => t.isCompleted).length;
  const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const handleAddTask = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (newTaskTitle.trim() && activeListId) {
      addTask(activeListId, newTaskTitle.trim());
      setNewTaskTitle('');
    }
  };

  const handleAddList = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (newListTitle.trim()) {
      addList(newListTitle.trim());
      setNewListTitle('');
      setIsAddingList(false);
    }
  };

  const handleUpdateList = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingListId && editingListTitle.trim()) {
      updateList(editingListId, editingListTitle.trim());
      setEditingListId(null);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Lists Panel */}
      <div className={cn(
        "w-64 border-r border-gray-200 bg-white flex flex-col shrink-0 transition-all duration-300 dark:border-gray-800 dark:bg-gray-950",
        "fixed inset-y-16 left-0 z-20 lg:static lg:block",
        // isSidebarOpen logic from Home.tsx could be adapted here if needed
      )}>
        <div className="p-4 border-b border-gray-100 dark:border-gray-900 flex items-center justify-between">
          <h2 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <ListTodo className="h-4 w-4" />
            To-Do Lists
          </h2>
          <Button variant="ghost" size="icon" onClick={() => setIsAddingList(true)} className="h-8 w-8">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {isAddingList && (
            <form onSubmit={handleAddList} className="p-2">
              <input
                autoFocus
                className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-800"
                placeholder="List title..."
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
                onBlur={() => !newListTitle && setIsAddingList(false)}
              />
            </form>
          )}

          {lists.length === 0 && !isAddingList ? (
            <div className="py-8 text-center text-xs text-gray-400">No lists yet</div>
          ) : (
            lists.map((list) => (
              <div
                key={list.id}
                className={cn(
                  "group flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors cursor-pointer",
                  activeListId === list.id
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-900/50 dark:hover:text-gray-100"
                )}
                onClick={() => setActiveListId(list.id)}
              >
                <div className="flex items-center gap-3 truncate">
                  <ChevronRight className={cn("h-3 w-3 transition-transform", activeListId === list.id && "rotate-90")} />
                  {editingListId === list.id ? (
                    <form onSubmit={handleUpdateList} onClick={e => e.stopPropagation()}>
                      <input
                        autoFocus
                        className="bg-transparent border-none p-0 focus:ring-0 w-full"
                        value={editingListTitle}
                        onChange={e => setEditingListTitle(e.target.value)}
                        onBlur={() => setEditingListId(null)}
                      />
                    </form>
                  ) : (
                    <span>{list.title}</span>
                  )}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingListId(list.id);
                      setEditingListTitle(list.title);
                    }}
                    className="p-1 hover:text-blue-600"
                  >
                    <Edit2 className="h-3 w-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setListToDelete(list.id);
                    }}
                    className="p-1 hover:text-red-600"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Tasks Panel */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-gray-950">
        {activeList ? (
          <>
            <header className="p-6 border-b border-gray-100 dark:border-gray-900 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{activeList.title}</h1>
                  <p className="text-sm text-gray-500">
                    {completedCount} / {tasks.length} tasks completed ({progress}%)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search tasks..."
                      className="pl-9 pr-4 py-2 text-sm bg-gray-50 border-none rounded-full focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 w-48 md:w-64"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden dark:bg-gray-900">
                  <div
                    className="h-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex items-center gap-1">
                  {(['all', 'active', 'completed'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={cn(
                        "px-3 py-1 text-xs font-medium rounded-full transition-colors capitalize",
                        filter === f
                          ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
                          : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-900"
                      )}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <form onSubmit={handleAddTask} className="flex gap-2">
                <input
                  type="text"
                  placeholder="+ Add a task..."
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-800"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                />
                <Button type="submit" disabled={!newTaskTitle.trim()}>
                  Add
                </Button>
              </form>

              <div className="space-y-2">
                {filteredTasks.length === 0 ? (
                  <div className="py-12">
                    <EmptyState
                      title={searchQuery ? "No results found" : "No tasks yet"}
                      subtitle={searchQuery ? "Try a different search term" : "Add your first task to this list."}
                      icon={<ListTodo className="h-12 w-12" />}
                    />
                  </div>
                ) : (
                  filteredTasks.map((task) => (
                    <div
                      key={task.id}
                      className="group flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-white hover:border-gray-200 transition-all dark:border-gray-900 dark:bg-gray-950 dark:hover:border-gray-800"
                    >
                      <button
                        onClick={() => toggleTask(task.id)}
                        className={cn(
                          "shrink-0 transition-colors",
                          task.isCompleted ? "text-green-500" : "text-gray-300 hover:text-gray-400"
                        )}
                      >
                        {task.isCompleted ? (
                          <CheckCircle2 className="h-5 w-5 fill-current bg-white rounded-full" />
                        ) : (
                          <Circle className="h-5 w-5" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <input
                          className={cn(
                            "w-full bg-transparent border-none p-0 focus:ring-0 text-sm transition-all",
                            task.isCompleted && "text-gray-400 line-through"
                          )}
                          value={task.title}
                          onChange={(e) => updateTask(task.id, e.target.value)}
                        />
                      </div>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center">
            <EmptyState
              title="Select a list"
              subtitle="Choose a list from the sidebar or create a new one to start managing tasks."
              icon={<ListTodo className="h-12 w-12" />}
              actionLabel="Create New List"
              onAction={() => setIsAddingList(true)}
            />
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!listToDelete}
        onCancel={() => setListToDelete(null)}
        onConfirm={async () => {
          if (listToDelete) {
            await deleteList(listToDelete);
            setListToDelete(null);
          }
        }}
        title="Delete List"
        message="Are you sure you want to delete this list and all its tasks? This action cannot be undone."
      />
    </div>
  );
}
