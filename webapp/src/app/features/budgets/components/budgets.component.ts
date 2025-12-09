import { Component, OnInit } from '@angular/core';


import { BudgetsService } from '@budgets/services';

@Component({
  selector: 'p-co-budgets',
  templateUrl: './budgets.component.html',
  styleUrls: ['./budgets.component.scss'],
  imports: [],
  providers: [
    BudgetsService
  ],
})
export class BudgetsListComponent implements OnInit {
  constructor(
    private _service: BudgetsService
  ) { }

  ngOnInit(): void {
    this._service.loadAll();
  }
}
