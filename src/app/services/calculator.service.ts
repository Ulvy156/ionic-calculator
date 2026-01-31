import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CalculatorService {

  calculate(expression: string): number {
    const tokens = expression.match(/(\d+\.?\d*|\+|\-|\*|\/)/g);
    if (!tokens) return 0;

    let result = Number(tokens[0]);

    for (let i = 1; i < tokens.length; i += 2) {
      const op = tokens[i];
      const num = Number(tokens[i + 1]);

      switch (op) {
        case '+': result += num; break;
        case '-': result -= num; break;
        case '*': result *= num; break;
        case '/': result /= num; break;
      }
    }

    return result;
  }
}
