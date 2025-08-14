import { NgModule } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { HttpClientModule } from '@angular/common/http';


const PRIME_COMPONENTS = [
    InputTextModule,
    ToolbarModule, 
    ButtonModule,
    CardModule,
];

@NgModule({
    imports: [...PRIME_COMPONENTS,
            HttpClientModule,
    ],
    exports: [...PRIME_COMPONENTS, HttpClientModule],
})
export class SharedModule { }
