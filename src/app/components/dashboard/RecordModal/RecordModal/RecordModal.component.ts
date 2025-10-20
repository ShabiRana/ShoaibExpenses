import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-RecordModal',
  templateUrl: './RecordModal.component.html',
  imports: [ReactiveFormsModule],
  styleUrls: ['./RecordModal.component.css']
})
export class RecordModalComponent {
  @Input() record: any; // null for new record
  @Output() onSave = new EventEmitter<any>();
  @Output() onClose = new EventEmitter<void>();

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      date: ['', Validators.required],
      type: ['Income', Validators.required],
      amount: [0, [Validators.required, Validators.min(0)]],
      note: ['']
    });
  }

  ngOnInit() {
    if (this.record) {
      this.form.patchValue(this.record);
    }
  }

//  addRecord(record: any): Promise<any> {
//     return window.electronAPI.addRecord(record);
//   }
save() {
  if (this.form.valid) {
    this.onSave.emit(this.form.value);
  }
}
  close() {
    this.onClose.emit();
  }
}
