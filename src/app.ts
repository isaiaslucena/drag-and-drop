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

  private submitHandler(event: Event) {
    event.preventDefault();

    console.log(this.titleInputElement.value);
  }

  private configure() {
    this.elementForm.addEventListener('submit', this.submitHandler.bind(this));
  }
}

const projectInput = new ProjectInput();