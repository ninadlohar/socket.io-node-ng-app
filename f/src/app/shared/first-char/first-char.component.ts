import { Component, OnInit, Input, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-first-char',
  templateUrl: './first-char.component.html',
  styleUrls: ['./first-char.component.css']
})
export class FirstCharComponent implements OnInit {


  @Input() name: string;
  @Input() userBg: string;
  @Input() userColor: string;

  public firstChar: string;
  private _name = '';

  constructor() { }

  ngOnInit(): void {
    this._name = this.name;
    this.firstChar = this._name[0];

  } // end ngOnInit


  ngOnChanges(changes: SimpleChanges) {
    const name = changes.name;
    this._name = name.currentValue;
    this.firstChar = this._name[0];
  }

}
