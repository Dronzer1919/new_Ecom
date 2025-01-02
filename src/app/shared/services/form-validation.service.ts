
import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
// import { FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class FormValidationService {
  public fieldHasErrors(
    formGroup: FormGroup,
    field: string,
  ): boolean {
    return (
      formGroup &&
      formGroup.controls &&
      formGroup.controls[field] &&
      (formGroup.controls[field]!?.dirty || formGroup.controls[field]!?.touched) &&
      formGroup.controls[field].errors != null
    );
  }

  public hasError(
    formGroup: FormGroup,
    field: string,
    errorProperty: string,
    isTouchedRequired: boolean = true
  ): boolean | null {
    if (!formGroup)
      return false;

    if (formGroup.controls[field]!?.dirty) {
      for (const iterator of Object.keys(formGroup.controls)) {
        if (!formGroup.controls[iterator]!?.dirty) {
          formGroup.controls[iterator].markAsDirty();
          formGroup.controls[iterator].markAsTouched();
        }
        else if (field == iterator && formGroup.controls[iterator]!?.dirty) {
          break;
        }
      }
    }
    return (
      formGroup &&
      formGroup.controls &&
      formGroup.controls[field] &&
      ((isTouchedRequired ? formGroup.controls[field]!?.dirty : true) || (isTouchedRequired ? formGroup.controls[field]!?.touched : true)) &&
      formGroup.controls[field].errors &&
      formGroup.controls[field].errors![errorProperty]
    );
  }
}
