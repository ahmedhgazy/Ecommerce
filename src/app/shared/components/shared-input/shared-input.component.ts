import { Component, forwardRef } from '@angular/core';

import { CommonModule } from '@angular/common';
import {
    ControlValueAccessor,
    NG_VALUE_ACCESSOR,
    ReactiveFormsModule,
    FormBuilder,
    FormGroup,
    Validators,
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-shared-input',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, TranslateModule],

    templateUrl: './shared-input.component.html',

    styleUrl: './shared-input.component.scss',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => SharedInputComponent),
            multi: true,
        },
    ],
})
export class SharedInputComponent implements ControlValueAccessor {
    dateForm: FormGroup;

    constructor(private fb: FormBuilder) {
        this.dateForm = this.fb.group({
            day: [
                '',
                {
                    Validators: [Validators.min(1), Validators.max(31)],
                    updateOn: 'blur',
                },
            ],
            month: [
                '',
                {
                    Validators: [Validators.min(1), Validators.max(12)],
                    updateOn: 'blur',
                },
            ],
            year: [
                '',
                {
                    Validators: [Validators.min(1900), Validators.max(2099)],
                    updateOn: 'blur',
                },
            ],
        });

        this.dateForm.valueChanges.subscribe((val) => {
            this.onChange(this.formatDate(val));
        });
    }

    writeValue(value: any): void {
        if (value) {
            const date = new Date(value);
            this.dateForm.setValue(
                {
                    day: date.getDate(),
                    month: date.getMonth() + 1,
                    year: date.getFullYear(),
                },
                { emitEvent: false }
            );
        }
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    setDisabledState?(isDisabled: boolean): void {
        isDisabled ? this.dateForm.disable() : this.dateForm.enable();
    }

    private formatDate(value: {
        day: number;
        month: number;
        year: number;
    }): string {
        if (value.day && value.month && value.year) {
            return `${value.year}-${value.month
                .toString()
                .padStart(2, '0')}-${value.day.toString().padStart(2, '0')}`;
        }
        return '';
    }

    private onChange = (value: any) => {};
    private onTouched = () => {};
}
