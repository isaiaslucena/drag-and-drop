enum ProjectStatus { Active, Finished}

class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus
  ) {}
}

type Listener = (items: Project[]) => void;

class ProjectState {
  private projects: any[] = [];
  private static instance: ProjectState;
  private listeners: Listener[] = [];

  private constructor() {

  }

  static getInstance() {
    if (this.instance) return this.instance;
    this.instance = new ProjectState();
    return this.instance;
  }

  addListener(listenerFunction: Listener) {
    this.listeners.push(listenerFunction);
  }

  addProject(title: string, description: string, people: number) {
    const randomId = Math.random().toString();
    // const newProject = {
    //   id: randomId,
    //   title,
    //   description,
    //   people
    // }

    const newProject = new Project(randomId, title, description, people, ProjectStatus.Active);

    this.projects.push(newProject);
    for (const listener of this.listeners) {
      listener(this.projects.slice());
    }
  }
}

const projectState = ProjectState.getInstance();

interface ValidateObject {
  value: string | number;
  required: boolean;
  minLength?: number,
  maxLength?: number,
  min?: number;
  max?: number;
}

function validate(validateInput: ValidateObject) {
  let isValid = false;

  if (validateInput.required && validateInput.value.toString()) {
    isValid = !!validateInput.value.toString().trim().length;
    console.log({isValid, value: validateInput.value});
  }
  if (typeof validateInput.value === 'string' && validateInput.minLength) {
    isValid = validateInput.value.length >= validateInput.minLength;
  }
  if (typeof validateInput.value === 'string' && validateInput.maxLength) {
    isValid = validateInput.value.length <= validateInput.maxLength;
  }
  if (typeof validateInput.value === 'number' && validateInput.min) {
    isValid = validateInput.value >= validateInput.min;
  }
  if (typeof validateInput.value === 'number' && validateInput.max) {
    isValid = validateInput.value <= validateInput.max;
  }

  return isValid;
}

//auto-bind decorator
function autobind(_target: any, _methodName: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  const adjustedDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      return originalMethod.bind(this);
    }
  }
  return adjustedDescriptor;
}

abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateElement: HTMLTemplateElement;
  hostElement: T;
  element: U;

  constructor(
    templateId: string,
    hostElementId: string,
    insertAtStart: boolean,
    newElementId?: string,
  ) {
    this.templateElement = document.getElementById(templateId)! as HTMLTemplateElement;
    this.hostElement = document.getElementById(hostElementId)! as T;
    const importedNode = document.importNode(this.templateElement.content, true);
    this.element = importedNode.firstElementChild as U;
    if (newElementId) this.element.id = newElementId;

    this.attach(insertAtStart);
  }

  private attach(insertAtBegin: boolean) {
    const insertAt = insertAtBegin ? 'afterbegin' : 'beforeend';
    this.hostElement.insertAdjacentElement(insertAt, this.element);
  }

  abstract configure(): void;
  abstract renderContent(): void;
}

class ProjectList extends Component<HTMLDivElement, HTMLElement> {
  assignedProjects: Project[];

  constructor(private type: 'active' | 'finished') {
    super('project-list', 'app', false, `${type}-projects`);
    this.assignedProjects = [];

    this.configure();
    this.renderContent();
  }

  private renderProjects() {
    const listElement = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement;
    listElement.innerHTML = '';
    for (const projectItem of this.assignedProjects) {
      const listItem = document.createElement('li');
      listItem.textContent = projectItem.title;
      listElement.appendChild(listItem);
    }
  }

  configure() {
    projectState.addListener((projects: Project[]) => {
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
}

class ProjectInput {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  elementForm: HTMLFormElement;
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    this.templateElement = document.getElementById('project-input')! as HTMLTemplateElement;
    this.hostElement = document.getElementById('app')! as HTMLDivElement;

    const importedNode = document.importNode(this.templateElement.content, true);
    this.elementForm = importedNode.firstElementChild as HTMLFormElement;
    this.elementForm.id = 'user-input';
    this.titleInputElement = this.elementForm.querySelector('#title')! as HTMLInputElement;
    this.descriptionInputElement = this.elementForm.querySelector('#description')! as HTMLInputElement;
    this.peopleInputElement = this.elementForm.querySelector('#people')! as HTMLInputElement;

    this.attach();
    this.configure();
  }

  private attach() {
    this.hostElement.insertAdjacentElement('afterbegin', this.elementForm);
  }

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

  @autobind
  private submitHandler(event: Event) {
    event.preventDefault();
    const userInput = this.gatherUserInput();

    if (Array.isArray(userInput)) {
      const [title, description, people] = userInput;
      // console.log(title, description, people);
      projectState.addProject(title, description, people);
      this.clearInputs();
    }
  }

  private configure() {
    this.elementForm.addEventListener('submit', this.submitHandler);
  }
}

const projectInput = new ProjectInput();
const activeProjectList = new ProjectList('active');
const finishedProjectList = new ProjectList('finished');