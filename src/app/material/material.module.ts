import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatToolbarModule,
    MatSnackBarModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatDialogModule,
  ],
  exports: [
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatToolbarModule,
    MatSnackBarModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatDialogModule,
  ]
})
export class MaterialModule { }
