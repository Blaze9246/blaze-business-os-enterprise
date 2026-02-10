import { useEffect, useState } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { Plus, Calendar, AlertCircle } from 'lucide-react'
import { useAppStore } from '../stores/appStore'
import { getTasks, updateTask } from '../lib/api'

const columns = [
  { id: 'todo', title: 'To Do', color: 'border-gray-500' },
  { id: 'inprogress', title: 'In Progress', color: 'border-primary' },
  { id: 'review', title: 'Review', color: 'border-amber-500' },
  { id: 'done', title: 'Done', color: 'border-green-500' },
]

const priorityColors = {
  urgent: 'bg-red-500/20 text-red-400',
  high: 'bg-orange-500/20 text-orange-400',
  medium: 'bg-yellow-500/20 text-yellow-400',
  low: 'bg-gray-500/20 text-gray-400',
}

export default function Tasks() {
  const { tasks, setTasks, setLoading } = useAppStore()
  const [columnTasks, setColumnTasks] = useState<Record<string, any[]>>({})

  useEffect(() => {
    loadTasks()
  }, [])

  useEffect(() => {
    // Group tasks by status
    const grouped: Record<string, any[]> = {}
    columns.forEach(col => {
      grouped[col.id] = tasks.filter((t: any) => t.status === col.id)
    })
    setColumnTasks(grouped)
  }, [tasks])

  const loadTasks = async () => {
    setLoading('tasks', true)
    try {
      const res = await getTasks()
      setTasks(res.data)
    } catch (error) {
      console.error('Failed to load tasks:', error)
      // Use sample data
      setTasks([
        { id: '1', title: 'Campaign Generator V2', status: 'todo', priority: 'urgent' },
        { id: '2', title: 'AI Hunter Agent', status: 'todo', priority: 'high' },
        { id: '3', title: 'Systeme.io Integration', status: 'todo', priority: 'high' },
        { id: '4', title: 'Shopify Store Connection', status: 'inprogress', priority: 'medium' },
        { id: '5', title: 'Hunter.io API Setup', status: 'inprogress', priority: 'medium' },
        { id: '6', title: 'MVP Dashboard UI', status: 'done', priority: 'urgent' },
      ])
    } finally {
      setLoading('tasks', false)
    }
  }

  const onDragEnd = async (result: any) => {
    if (!result.destination) return

    const { source, destination, draggableId } = result
    
    if (source.droppableId === destination.droppableId) return

    // Update local state
    const newStatus = destination.droppableId
    const updatedTasks = tasks.map((t: any) =>
      t.id === draggableId ? { ...t, status: newStatus } : t
    )
    setTasks(updatedTasks)

    // Update API
    try {
      await updateTask(draggableId, { status: newStatus })
    } catch (error) {
      console.error('Failed to update task:', error)
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Tasks</h1>
          <p className="text-gray-400">Manage and track your work.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors">
          <Plus className="w-4 h-4" />
          New Task
        </button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map((column) => (
            <div key={column.id} className="bg-surface border border-border rounded-xl">
              <div className={`px-4 py-3 border-b-2 ${column.color} flex items-center justify-between`}>
                <span className="font-semibold text-white">{column.title}</span>
                <span className="text-sm text-gray-400 bg-surface-light px-2 py-1 rounded">
                  {(columnTasks[column.id] || []).length}
                </span>
              </div>
              
              <Droppable droppableId={column.id}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="p-3 min-h-[200px]"
                  >
                    {(columnTasks[column.id] || []).map((task: any, index: number) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`bg-surface-light border border-border rounded-lg p-3 mb-3 cursor-move transition-all ${
                              snapshot.isDragging ? 'shadow-lg ring-2 ring-primary' : 'hover:border-primary/50'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <span className={`text-xs px-2 py-1 rounded font-medium ${priorityColors[task.priority as keyof typeof priorityColors] || priorityColors.medium}`}>
                                {task.priority}
                              </span>
                              <button className="text-gray-400 hover:text-white">
                                <AlertCircle className="w-4 h-4" />
                              </button>
                            </div>
                            
                            <p className="text-white font-medium mb-2">{task.title}</p>
                            
                            {task.due_date && (
                              <div className="flex items-center gap-1 text-xs text-gray-400">
                                <Calendar className="w-3 h-3" />
                                {new Date(task.due_date).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  )
}
