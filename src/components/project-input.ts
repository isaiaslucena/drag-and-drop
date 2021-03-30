import { Component } from './base-components.js';
import { autoBind } from '../decorators/auto-bind.js';
import { projectStateInstance } from '../state/project.js';
import { validate } from '../util/validation.js';
import { ValidateObject } from '../interfaces/validation.js';

export class ProjectInput extends Component<HTMLDivElement, HTMLElement> {
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    super('project-input', 'app', true, 'user-input');
    this.titleInputElement = this.element.querySelector('#title')! as HTMLInputElement;
    this.descriptionInputElement = this.element.querySelector('#description')! as HTMLInputElement;
    this.peopleInputElement = this.element.querySelector('#people')! as HTMLInputElement;

    this.configure();
  }

  configure() {
    this.element.addEventListener('submit', this.submitHandler);
  }

  renderContent() { }

  private gatherUserInput(): [string, string, number] | void {
    const enteredTitle = this.titleInputElement.value;
    const enteredDescription = this.descriptionInputElement.value;
    const enteredPeople = this.peopleInputElement.value;

    const validateTitleObject: ValidateObject = {
      value: enteredTitle,
      required: true,
      minLength: 3
    };

    const validateDescriptionObject: ValidateObject = {
      value: enteredDescription,
      required: true,
      minLength: 5
    };

    const validatePeopleObject: ValidateObject = {
      value: +enteredPeople,
      required: true,
      min: 1,
      max: 5
    };

    if (!validate(validateTitleObject) || !validate(validateDescriptionObject) || !validate(validatePeopleObject)) {
      alert('Invalid input, please try again.');
      return;
    } else {
      return [enteredTitle, enteredDescription, +enteredPeople];
    }
  }

  private clearInputs() {
    this.titleInputElement.value = '';
    this.descriptionInputElement.value = '';
    this.peopleInputElement.value = '';
  }

  @autoBind
  private submitHandler(event: Event) {
    event.preventDefault();
    const userInput = this.gatherUserInput();

    if (Array.isArray(userInput)) {
      const [title, description, people] = userInput;

      projectStateInstance.addProject(title, description, people);
      this.clearInputs();
    }
  }
}