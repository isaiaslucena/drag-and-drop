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

//ProjectInput Class
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
      // const [title, description, people] = userInput;
      // console.log(userInput);
      console.log('success');
      this.clearInputs();
    }
  }

  private configure() {
    this.elementForm.addEventListener('submit', this.submitHandler);
  }
}

const projectInput = new ProjectInput();