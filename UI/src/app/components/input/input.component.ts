import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
})
export class InputComponent implements OnInit, AfterViewInit {
  @ViewChild('inputElem', { read: ElementRef })
  inputElem: ElementRef<HTMLInputElement>;

  @Input() disabled = false;
  @Input() label;

  @Input() value = '';
  @Output() valueChange = new EventEmitter();

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  ngOnInit(): void {
    this.cdr.detectChanges();
  }

  onChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.valueChange.emit(value);
  }
}
