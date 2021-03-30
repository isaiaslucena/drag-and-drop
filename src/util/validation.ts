import { ValidateObject } from '../interfaces/validation';

export function validate(validateInput: ValidateObject) {
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

  return isValid;
}