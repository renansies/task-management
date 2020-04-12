import { Injectable, NotFoundException } from '@nestjs/common';
import { Task, TaskStatus } from './task.model';
import * as uuid from 'uuid/v1';
import { CreateTaskDTO } from './dto/create-task.dto';
import { GetTasksFilterDTO } from './dto/get-task-filter.dto';

@Injectable()
export class TasksService {
  private tasks: Task[] = [];

  getTasks(filterDTO: GetTasksFilterDTO): Task[] {
    const { status, search } = filterDTO;
    let tasks = this.tasks;

    if (status) {
      tasks = tasks.filter(task => task.status === status);
    }

    if (search) {
      tasks = tasks.filter(task => 
        task.title.includes(search) ||
        task.description.includes(search)
      )
    }
    return tasks;
  }

  getTaskById(id: string): Task {
    const found = this.tasks.find(task => task.id === id);

    if(!found) {
      throw new NotFoundException(`Task with ID ${id} not found.`);
    }
    return found;
  }

  async createTask(createTask: CreateTaskDTO): Promise<Task> {
    const { title, description } = createTask;

    const task: Task = {
      id: uuid(),
      title,
      description,
      status: TaskStatus.OPEN
    };

    this.tasks.push(task);
    return task;
  }

  deleteTask(id: string): void {
    const found = this.getTaskById(id);
    this.tasks = this.tasks.filter(task => task.id !== found.id);
  }

  updateTaskStatus(id: string, status: TaskStatus): Task {
    let task = this.getTaskById(id);
    task.status = status;
    return task
  }
}
