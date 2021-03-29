enum ProjectStatus { Active, Finished}

type Listener<T> = (items: T[]) => void;

class State<T> {
  protected listeners: Listener<T>[] = [];

  addListener(listenerFunction: Listener<T>) {
    this.listeners.push(listenerFunction);
  }
}

class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus
  ) {}
}

class ProjectState extends State<Project> {
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
  }
  if (typeof validateInput.value === 'string' && validateInput.minLength) {
    isValid = validateInput.value.length >= validateInput.minLength;
  }
  if (typeof validateInput.value === 'string' && validateInput.maxLength) {
    isValid = validateInput.value.length <= validateInput.maxLength;
  }
  if (typeof validateInput.value === 'number' && validateInput.min && validateInput.max) {
    isValid = validateInput.value >= validateInput.min && validateInput.value <= validateInput.max;
  }
  if (typeof validateInput.value === 'number' && validateInput.min && !validateInput.max) {
    isValid = validateInput.value >= validateInput.min;
  }
  if (typeof validateInput.value === 'number' && validateInput.max && !validateInput.min) {
    isValid = validateInput.value <= validateInput.max;
  }

  console.log({isValid, value: validateInput.value});

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

class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> {
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

  configure() {}

  renderContent() {
    this.element.querySelector('h2')!.textContent = this.project.title;
    this.element.querySelector('h3')!.textContent = `${this.project.people.toString()} ${this.peopleOrPerson} assigned`;
    this.element.querySelector('p')!.textContent = this.project.description;

  }
}

class ProjectList extends Component<HTMLDivElement, HTMLElement> {
  assignedProjects: Project[];

  constructor(private type: 'active' | 'finished') {
    super('project-list', 'app', false, `${type}-projects`);
    this.assignedProjects = [];

    this.configure();
    this.renderContent();
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

  private renderProjects() {
    const listElement = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement;
    listElement.innerHTML = '';
    for (const projectItem of this.assignedProjects) {
      new ProjectItem(this.element.querySelector('ul')!.id, projectItem);
    }
  }
}

class ProjectInput extends Component<HTMLDivElement, HTMLElement> {
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
}

const projectInput = new ProjectInput();
const activeProjectList = new ProjectList('active');
const finishedProjectList = new ProjectList('finished');