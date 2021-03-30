import { Component } from './base-components.js';
import { autoBind } from '../decorators/auto-bind.js';
import { Project, ProjectStatus } from "../models/project.js";
import { DraggableTarget } from "../interfaces/draggable.js";
import { projectStateInstance } from '../state/project.js';
import { ProjectItem } from '../components/project-item.js';

export class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DraggableTarget {
  assignedProjects: Project[];

  constructor(private type: 'active' | 'finished') {
    super('project-list', 'app', false, `${type}-projects`);
    this.assignedProjects = [];

    this.configure();
    this.renderContent();
  }

  @autoBind
  dragOverHandler(event: DragEvent) {
    if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
      event.preventDefault();
      this.element.querySelector('ul')!.classList.add('droppable');
    }
  }

  @autoBind
  dropHandler(event: DragEvent) {
    const projectId = event.dataTransfer!.getData('text/plain');
    const projectStatus = this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finished;
    projectStateInstance.moveProject(projectId, projectStatus);
  }

  @autoBind
  dragLeaveHandler(_event: DragEvent) {
    this.element.querySelector('ul')!.classList.remove('droppable');
  }

  configure() {
    this.element.addEventListener('dragover', this.dragOverHandler);
    this.element.addEventListener('drop', this.dropHandler);
    this.element.addEventListener('dragleave', this.dragLeaveHandler);

    projectStateInstance.addListener((projects: Project[]) => {
      const relevantProjects = projects.filter((project) => {
        if (this.type === 'active') {
          return project.status === ProjectStatus.Active;
        }

        return project.status === ProjectStatus.Finished;
      });
      this.assignedProjects = relevantProjects;
      this.renderProjects();
    });
  }

  renderContent() {
    const listId = `${this.type}-projects-list`;
    this.element.querySelector('ul')!.id = listId;
    this.element.querySelector('h2')!.textContent = `${this.type.toUpperCase()} PROJECTS`;
  }

  private renderProjects() {
    const listElement = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement;
    listElement.innerHTML = '';
    for (const projectItem of this.assignedProjects) {
      new ProjectItem(this.element.querySelector('ul')!.id, projectItem);
    }
  }
}