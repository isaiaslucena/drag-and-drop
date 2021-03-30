import { Project, ProjectStatus } from '../models/project';

type Listener<T> = (items: T[]) => void;

class State<T> {
  protected listeners: Listener<T>[] = [];

  addListener(listenerFunction: Listener<T>) {
    this.listeners.push(listenerFunction);
  }
}

export class ProjectState extends State<Project> {
  private projects: any[] = [];
  private static instance: ProjectState;


  private constructor() {
    super();
  }

  static getInstance() {
    if (this.instance) return this.instance;
    this.instance = new ProjectState();
    return this.instance;
  }

  addProject(title: string, description: string, people: number) {
    const randomId = Math.random().toString();
    const newProject = new Project(randomId, title, description, people, ProjectStatus.Active);

    this.projects.push(newProject);
    this.updateListeners();
  }

  moveProject(projectId: string, newStatus: ProjectStatus) {
    const findProject = this.projects.find((project) => project.id === projectId);
    if (findProject && findProject.status !== newStatus) {
      findProject.status = newStatus;
      this.updateListeners();
    }
  }

  private updateListeners() {
    for (const listener of this.listeners) {
      listener(this.projects.slice());
    }
  }
}

export const projectStateInstance = ProjectState.getInstance();