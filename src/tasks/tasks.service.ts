import { Injectable, NotFoundException } from '@nestjs/common';
import { TaskStatus } from './task-status.enum';
import { CreateTaskDTO } from './dto/create-task.dto';
import { GetTasksFilterDTO } from './dto/get-task-filter.dto';
import { Task } from './task.entity';
import { TasksRepository } from './tasks.repository';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class TasksService {

  constructor(
    @InjectRepository(TasksRepository)
    private tasksRepository: TasksRepository) { }

  async getTasks(filterDTO: GetTasksFilterDTO): Promise<Task[]> {
    const { status, search } = filterDTO;
    let query = this.tasksRepository.createQueryBuilder('task');

    if (status) {
      query.andWhere('task.status = :status', { status });
    }

    if (search) {
      query.andWhere('(task.title LIKE :search OR task.description LIKE :search)', { search: `%${search}%` });

    }

    const tasks = await query.getMany();
    return tasks;
  }

  async getTaskById(id: number): Promise<Task> {
    const found = await this.tasksRepository.findOne(id);

    if (!found) {
      throw new NotFoundException(`Task with ID ${id} not found.`);
    }

    return found;
  }

  async createTask(createTask: CreateTaskDTO): Promise<Task> {
    const { title, description } = createTask;

    const task = new Task();
    task.title = title,
      task.description = description,
      task.status = TaskStatus.OPEN
    await task.save();

    return task;
  }

  async deleteTask(id: number): Promise<void> {
    const found = await this.getTaskById(id);
    this.tasksRepository.delete(id);
  }

  async updateTaskStatus(id: number, status: TaskStatus): Promise<Task> {
    let task = await this.getTaskById(id);
    task.status = status;
    await task.save();
    return task;
  }
}
