import { Component } from './base-components';
import { autoBind } from '../decorators/auto-bind';
import { Draggable } from '../interfaces/draggable';
import { Project } from '../models/project';

export class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable {
  private project: Project;

  get peopleOrPerson() {
    return this.project.people === 1 ? 'person' : 'people';
  }

  constructor(hostId: string, project: Project) {
    super('single-project', hostId, false, project.id);
    this.project = project;

    this.configure();
    this.renderContent();
  }

  @autoBind
  dragStartHandler(event: DragEvent) {
    event.dataTransfer!.setData('text/plain', this.project.id);
    event.dataTransfer!.effectAllowed = 'move';
  }

  dragEndHandler(_event: DragEvent) {
    console.log('Drag End!');
  }

  configure() {
    this.element.addEventListener('dragstart', this.dragStartHandler);
    this.element.addEventListener('dragend', this.dragEndHandler);
  }

  renderContent() {
    this.element.querySelector('h2')!.textContent = this.project.title;
    this.element.querySelector('h3')!.textContent = `${this.project.people.toString()} ${this.peopleOrPerson} assigned`;
    this.element.querySelector('p')!.textContent = this.project.description;

  }
}