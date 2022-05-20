import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

export interface DropdownItem {
  label: string;
  data?: any;
  value: string;
}

@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss'],
})
export class DropdownComponent implements OnInit {
  @Input() label: string | undefined;
  @Input() items: DropdownItem[] = [];
  @Output() selectionchange = new EventEmitter<any>();

  currentSelection = '';

  constructor() {}

  ngOnInit(): void {}

  onChange(_event: Event) {
    const event = _event as CustomEvent;
    this.currentSelection = event.detail.newValue as string;
    this.selectionchange.emit(this.currentSelection);
  }
}
