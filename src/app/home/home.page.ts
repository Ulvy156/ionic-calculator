import { Component } from '@angular/core';
import { CalculatorService } from '../services/calculator.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false
})
export class HomePage {

  display = '';
  history: {
    expression: string;
    result: string;
    date: string;
  }[] = [];

  showHistory = false;
  alertButtons = [
    {
      text: 'Cancel',
      role: 'cancel',
    },
    {
      text: 'Delete',
      role: 'destructive',
      handler: () => {
        this.history = [];
        localStorage.removeItem('calc_history');
      },
    },
  ];


  constructor(
    private calcService: CalculatorService,
    private alertCtrl: AlertController
  ) { }


  ngOnInit() {
    const saved = localStorage.getItem('calc_history');
    if (saved) {
      this.history = JSON.parse(saved);
    }
  }


  press(val: string) {
    const operators = ['+', '-', '*', '/'];

    // If display is empty
    if (!this.display) {
      // Allow number or minus (for negative)
      if (operators.includes(val) && val !== '-') {
        return;
      }
    }

    const lastChar = this.display.slice(-1);

    // Prevent double operators
    if (operators.includes(lastChar) && operators.includes(val)) {
      return;
    }

    this.display += val;
  }
  reuseHistory(item: {
    expression: string;
    result: string;
    date: string;
  }) {
    // Convert display symbols back to logic symbols
    this.display = item.expression
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/−/g, '-')
      .replace(/,/g, '');

    // Close history modal
    this.showHistory = false;
  }

  clearAll() {
    this.display = '';
  }

  backspace() {
    this.display = this.display.slice(0, -1);
  }

  calculate() {
    try {
      const result = this.calcService.calculate(this.display);

      const record = {
        expression: this.formattedDisplay,
        result: result.toLocaleString('en-US'),
        date: new Date().toLocaleString(),
      };

      this.history.unshift(record);

      // limit history
      if (this.history.length > 15) {
        this.history.pop();
      }

      // 🔐 SAVE TO LOCAL STORAGE
      localStorage.setItem('calc_history', JSON.stringify(this.history));

      this.display = result.toString();
    } catch {
      this.display = 'Error';
    }
  }


  get formattedDisplay(): string {
    if (!this.display) return '0';

    // Split by operators but keep them
    const parts = this.display.split(/([+\-*/])/g);

    return parts
      .map(part => {
        // Operator → convert to iOS symbol
        if (['+', '-', '*', '/'].includes(part)) {
          return this.toIOSOperator(part);
        }

        // Number → format with commas
        if (!isNaN(Number(part))) {
          return this.formatWithCommas(part);
        }

        return part;
      })
      .join('');
  }

  private formatWithCommas(value: string): string {
    if (!value) return '';

    const [int, dec] = value.split('.');
    const formattedInt = Number(int).toLocaleString('en-US');

    return dec !== undefined ? `${formattedInt}.${dec}` : formattedInt;
  }

  private toIOSOperator(op: string): string {
    switch (op) {
      case '*': return ' × ';
      case '/': return ' ÷ ';
      case '-': return ' − ';
      case '+': return ' + ';
      default: return op;
    }
  }

  formatNumber(value: string): string {
    if (!value) return '0';

    // Keep operators visible
    const parts = value.split(/([+\-*/])/);

    return parts
      .map(part => {
        if (isNaN(Number(part))) return part;

        const [int, dec] = part.split('.');
        const formattedInt = Number(int).toLocaleString('en-US');

        return dec ? `${formattedInt}.${dec}` : formattedInt;
      })
      .join('');
  }

  toggleSign() {
    if (!this.display) return;

    // Match last number (with or without parentheses)
    const regex = /(\(-?\d+(\.\d+)?\)|-?\d+(\.\d+)?)$/;
    const match = this.display.match(regex);

    if (!match) return;

    const value = match[0];
    let replaced = '';

    if (value.startsWith('(-')) {
      // (-5) → 5
      replaced = value.slice(2, -1);
    } else if (value.startsWith('-')) {
      // -5 → 5
      replaced = value.slice(1);
    } else {
      // 5 → (-5)
      replaced = `(-${value})`;
    }

    this.display =
      this.display.slice(0, this.display.length - value.length) + replaced;
  }

  percent() {
    if (this.display.endsWith('%')) return;

    // match the last number in the expression
    const match = this.display.match(/(\d+(\.\d+)?)$/);
    if (!match) return;

    const value = match[0];
    const percentValue = (Number(value) / 100).toString();

    // replace only the last number
    this.display =
      this.display.slice(0, this.display.length - value.length) +
      percentValue;
  }


  toggleHistory() {
    this.showHistory = !this.showHistory;
  }

  clearHistory() {
    this.history = [];
    localStorage.removeItem('calc_history');
  }

  async confirmClearHistory() {
    const alert = await this.alertCtrl.create({
      header: 'Clear History',
      message: 'Are you sure you want to delete all calculation history?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.history = [];
            localStorage.removeItem('calc_history');
          },
        },
      ],
    });

    await alert.present();
  }

}
