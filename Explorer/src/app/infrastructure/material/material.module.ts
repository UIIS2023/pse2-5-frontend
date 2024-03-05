import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatToolbar, MatToolbarModule,} from '@angular/material/toolbar';
import {MatButton, MatButtonModule, MatIconButton} from '@angular/material/button';
import {MatFormField, MatFormFieldModule, MatHint, MatLabel} from '@angular/material/form-field';
import {MatInput, MatInputModule} from '@angular/material/input';
import {MatTable, MatTableModule} from '@angular/material/table';
import {MatIcon, MatIconModule} from '@angular/material/icon';
import {MatRadioButton, MatRadioGroup, MatRadioModule} from '@angular/material/radio';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {MatSelect, MatSelectModule} from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import {MatCheckbox, MatCheckboxModule} from '@angular/material/checkbox';
import {MatCard, MatCardModule} from '@angular/material/card';
import { MatTooltip, MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule, MatExpansionPanel } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatList, MatListItem, MatListModule } from '@angular/material/list';
import {MatTabsModule} from '@angular/material/tabs';





@NgModule({
  declarations: [],
  imports: [
    MatToolbarModule,
    CommonModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatIconModule,
    MatRadioModule,
    MatSnackBarModule,
    MatSelectModule,
    MatCheckboxModule,
    MatCardModule,
    MatTooltipModule,
    MatExpansionModule,
    MatChipsModule,
    MatListModule,
    MatTabsModule,
  ],
  exports: [
    MatToolbar,
    MatButton,
    MatFormField,
    MatLabel,
    MatInput,
    MatTable,
    MatIconButton,
    MatIcon,
    MatRadioButton,
    MatRadioGroup,
    MatSelect,
    MatOption,
    MatCheckbox,
    MatCardModule,
    MatTooltip,
    MatCard,
    MatExpansionPanel,
    MatListItem,
    MatList,
    MatTabsModule
  ]
})
export class MaterialModule { }
