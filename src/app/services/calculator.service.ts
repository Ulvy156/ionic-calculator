import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CalculatorService {

  calculate(expression: string): number {
    try {
      // sanitize input (allow only math characters)
      const safe = expression.replace(/[^0-9+\-*/.()]/g, '');

      // evaluate safely
      return Function('"use strict"; return (' + safe + ')')();

    } catch {
      return 0;
    }
  }
}
