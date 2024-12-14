export interface Task {
  id: string;
  title: string;
  assignees: string[];
  deadline: Date;
  completed: boolean;
}

