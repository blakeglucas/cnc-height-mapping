import { Component, Input, OnInit } from '@angular/core';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'app-tabs-view',
  templateUrl: './tabs-view.component.html',
  styleUrls: ['./tabs-view.component.scss']
})
export class TabsViewComponent implements OnInit {

  @Input() controlPanelOffset = 450;

  constructor(public socketService: SocketService) { }

  ngOnInit(): void {
  }

  onTabChange(a: any) {
    console.log(a)
  }

}
