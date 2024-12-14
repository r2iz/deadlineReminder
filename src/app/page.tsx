import { CreateTaskModal } from "@/components/create-task-modal"
import { TaskList } from "@/components/task-list"

export default function Home() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">タスク管理システム</h1>
      <div className="mb-4">
        <CreateTaskModal />
      </div>
      <TaskList />
    </div>
  )
}

