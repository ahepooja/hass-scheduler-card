const LitElement = customElements.get('home-assistant-main');
const html = LitElement.prototype.html;
const css = LitElement.prototype.css;

class SchedulerCard extends LitElement {
  static get styles() {
    return css`
      table {
        width: 100%;
        border-collapse: collapse;
        background-color: var(--card-background-color);
        color: var(--primary-text-color);
      }
      th {
        text-align: left;
        padding: 16px;
        background-color: var(--sidebar-background-color);
        color: var(--sidebar-text-color);
      }
      td {
        border-top: 1px solid var(--divider-color);
        padding: 16px;
      }
      tr:nth-child(even) {
        background-color: var(--table-row-background-color);
      }
  `;
  }

  static get properties() {
    return {
      schedule: { type: Array },
    };
  }

  constructor() {
    super();
    this.schedule = [];
  }

  set hass(hass) {
    if (hass.states[this.entityId]) {
      const state = hass.states[this.entityId];
      this.device = state.attributes.device;
      this.schedules = state.attributes.schedules;
      this.locale = hass.language;
  }
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error('You need to define an entity');
    }
    this.entityId = config.entity;
  }


  formatDate(date) {
    let inputDate = new Date(date);
    // If the time is 24:00, adjust it to 00:00 of the next day
    if (inputDate.getHours() === 24) {
      inputDate.setHours(0);
      inputDate.setDate(inputDate.getDate() + 1);
    }

    const now = new Date();
  
    // If the date is today
    if (now.toDateString() === inputDate.toDateString()) {
      return inputDate.toLocaleTimeString(this.locale, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
    }

    // If the date is tomorrow
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (tomorrow.toDateString() === inputDate.toDateString()) {
      return html`Huomenna<br>${inputDate.toLocaleTimeString(this.locale, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })}`;
    }
  }

  timeRemainingUntil(dateString) {
    const now = new Date();
    const futureDate = new Date(dateString);
    const differenceInMilliseconds = futureDate - now;
    const differenceInMinutes = Math.round(differenceInMilliseconds / 1000 / 60);
    const hours = Math.floor(differenceInMinutes / 60);
    const minutes = differenceInMinutes % 60;
    return `${hours}h ${minutes}m`;
  }

  render() {
    return html`
    <ha-card>
    <h1 class="card-header">${this.device}</h1>
    <div class="card-content">
    <table>
      <thead>
        <tr>
          <th>Hinta (snt/kWh)</th>
          <th>Aloitus</th>
          <th>Lopetus</th>
        </tr>
      </thead>
      <tbody>
        ${this.schedules.map(item => html`
          <tr>
            <td>${parseFloat(item.value).toFixed(3)}</td>
            <td>${this.formatDate(item.start)}<br>${this.timeRemainingUntil(item.start)}</td>
            <td>${this.formatDate(item.end)}<br>${this.timeRemainingUntil(item.end)}</td>
          </tr>
        `)}
      </tbody>
    </table>
    </div>
    </ha-card>
  `;
  }
}


customElements.define('scheduler-card', SchedulerCard);