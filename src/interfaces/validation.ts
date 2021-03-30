export interface ValidateObject {
  value: string | number;
  required: boolean;
  minLength?: number,
  maxLength?: number,
  min?: number;
  max?: number;
}