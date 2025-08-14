import { NgModule } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';


const PRIME_COMPONENTS = [
    InputTextModule,
    ToolbarModule, 
    ButtonModule,
    CardModule,
];

@NgModule({
    imports: [...PRIME_COMPONENTS,
            HttpClientModule,
            ReactiveFormsModule
    ],
    exports: [...PRIME_COMPONENTS, HttpClientModule, ReactiveFormsModule],
})
export class SharedModule { }
