import type { Income, RecurringExpense } from '../store/useFinanceStore';

export class GoogleCalendarService {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async fetchAPI(endpoint: string, method: string = 'GET', body?: any) {
    const url = `https://www.googleapis.com/calendar/v3${endpoint}`;
    const headers: HeadersInit = {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    };

    const config: RequestInit = {
      method,
      headers,
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(url, config);
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Google Calendar API Error:", errorData);
      throw new Error(`Calendar API Error: ${response.status} ${response.statusText}`);
    }

    if (method !== 'DELETE') {
        return response.json();
    }
    return null;
  }

  // Format YYYY-MM-DD
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // Calculate the next occurrence date for a day of month
  private getNextDateForDayOfMonth(day: number): string {
      const now = new Date();
      let nextDate = new Date(now.getFullYear(), now.getMonth(), day);
      if (now.getDate() > day) {
          nextDate = new Date(now.getFullYear(), now.getMonth() + 1, day);
      }
      return this.formatDate(nextDate);
  }

  private buildEventPayload(title: string, dateStr: string, description: string, colorId: string = "1") {
      const startDate = new Date(dateStr);
      // "All day" events need END date to be the day AFTER the start date
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);

      return {
          summary: title,
          description: description,
          start: { date: this.formatDate(startDate) },
          end: { date: this.formatDate(endDate) },
          colorId: colorId // 11: Red (Expense), 10: Green (Income)
      };
  }

  private buildRecurringEventPayload(title: string, startDateStr: string, description: string, rrule: string, colorId: string = "1") {
     const payload = this.buildEventPayload(title, startDateStr, description, colorId);
     return {
         ...payload,
         recurrence: [rrule]
     };
  }

  async syncFinancials(incomes: Income[], recurringExpenses: RecurringExpense[]) {
    // 1. Get primary calendar
    // 2. We could just add everything to primary, but to avoid duplicates, 
    // it's better to clear previously created "ZenFinance" events or tag them.
    // For MVP, we will just insert new events. True sync would require storing Google Event IDs.
    
    // Using extended properties to identify ZenFinance events
    const withProperty = (payload: any, id: string) => ({
        ...payload,
        extendedProperties: { private: { source: 'ZenFinance', entityId: id } }
    });

    // Incomes (Paydays) -> Green (10)
    for (const income of incomes) {
        if (income.frequency === 'monthly' && income.recurrenceDays && income.recurrenceDays.length > 0) {
            for (const day of income.recurrenceDays) {
                const startDate = this.getNextDateForDayOfMonth(day);
                const rrule = `RRULE:FREQ=MONTHLY;BYMONTHDAY=${day}`;
                const payload = withProperty(
                    this.buildRecurringEventPayload(`💰 Pago: ${income.source}`, startDate, `Ingreso esperado: $${income.amount}\nCategoría: ${income.category}`, rrule, "10"),
                    `income_${income.id}_${day}`
                );
                await this.fetchAPI('/calendars/primary/events', 'POST', payload);
            }
        } else if (income.date) {
            // One time
            const payload = withProperty(
                 this.buildEventPayload(`💰 Pago: ${income.source}`, income.date, `Ingreso esperado: $${income.amount}\nCategoría: ${income.category}`, "10"),
                 `income_${income.id}`
            );
            await this.fetchAPI('/calendars/primary/events', 'POST', payload);
        }
    }

    // Recurring Expenses (Rent, subscriptions) -> Red (11)
    for (const exp of recurringExpenses) {
        const startDate = this.getNextDateForDayOfMonth(exp.dueDate);
        const rrule = `RRULE:FREQ=MONTHLY;BYMONTHDAY=${exp.dueDate}`;
        const payload = withProperty(
            this.buildRecurringEventPayload(`💸 Pago: ${exp.name}`, startDate, `Gasto esperado: $${exp.amount}\nCategoría: ${exp.category}`, rrule, "11"),
            `recurring_${exp.id}`
        );
        await this.fetchAPI('/calendars/primary/events', 'POST', payload);
    }
    
    return true;
  }
}
