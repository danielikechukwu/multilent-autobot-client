import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inactive',
  imports: [CommonModule, MatDialogModule],
  templateUrl: './inactive.component.html',
  styleUrl: './inactive.component.scss'
})
export class InactiveComponent {

  constructor(private dialogRef: MatDialogRef<InactiveComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {}

}
