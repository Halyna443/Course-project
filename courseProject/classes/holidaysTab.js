import { Tab } from './tab.js';
import { apiKey, apiUrl } from "../constants.js";

export class HolidaysTab extends Tab {
  constructor() {
    super('#tab2', '.tab-content:nth-child(2)');
    this.countrySelect = document.getElementById("country");
    this.yearSelect = document.getElementById("year");

    this.yearSelect.setAttribute("disabled", "disabled");

    this.countrySelect.addEventListener("change", () => {
      this.yearSelect.removeAttribute("disabled");
      this.fillYearList();
    });

    const getHolidaysButton = document.getElementById("getHolidaysButton");
    getHolidaysButton.addEventListener("click", () => this.getHolidays());
  }

  init() {
    super.init();
    this.fillCountryList();
    this.setupSortButton();
  }
  setupSortButton() {
    const sortDateButton = document.getElementById('sortDateButton');
    sortDateButton.addEventListener('click', () => {
      this.rotateImageAndSort('lastResultsTableBodyHolidays', 0);
    });
  }

  async fillCountryList() {
    try {
      const countries = await this.fetchCountries();
      this.populateSelectOptions(this.countrySelect, countries);
    } catch (error) {
      this.displayError("Помилка отримання списку країн. Спробуйте ще раз.");
    }
  }

  fillYearList() {
    this.yearSelect.innerHTML = "";
    const currentYear = new Date().getFullYear();
    for (let year = 2001; year <= 2049; year++) {
      const option = document.createElement("option");
      option.value = year;
      option.textContent = year;

      if (year === currentYear) {
        option.selected = true;
      }

      this.yearSelect.appendChild(option);
    }

    this.yearSelect.removeAttribute("disabled");
  }

  async getHolidays() {
    const country = this.countrySelect.value;
    const year = this.yearSelect.value;
    try {
      const response = await fetch(`${apiUrl}/holidays?api_key=${apiKey}&country=${country}&year=${year}`);
      const data = await response.json();

      console.log('Відповідь:', data); // Вивела відповідь в консоль, щоб перевірити формат

      if (response.ok) {
        this.displayHolidays(data); // Викликала метод displayHolidays з правильними даними
      } else {
        console.error('Помилка отримання свят. Статус:', response.status);
      }
    } catch (error) {
      console.error('Помилка отримання свят:', error);
    }
  }

  async fetchCountries() {
    try {
      const response = await fetch(`${apiUrl}/countries?api_key=${apiKey}&`);
      const data = await response.json();

      const countries = data.response.countries;

      return countries;
    } catch (error) {
      console.error('Помилка під час отримання списку країн:', error);
      throw error;
    }
  }

  async fetchHolidays(countryCode, year) {
    try {
      const response = await fetch(`${apiUrl}/holidays?api_key=${apiKey}&country=${countryCode}&year=${year}`);
      const data = await response.json();

      console.log(data);
      return data.response.holidays;
    } catch (error) {
      console.error('Помилка під час отримання свят:', error);
      throw error;
    }
  }

  populateSelectOptions(selectElement, data) {
    selectElement.innerHTML = "";
    if (Array.isArray(data)) {
      data.forEach(item => {
        const option = document.createElement("option");
        option.value = item["iso-3166"];
        option.textContent = item["country_name"];
        selectElement.appendChild(option);
      });
    }
  }

  displayHolidays(holidays) {
    const holidaysResult = document.getElementById("holidaysResult");

    if (!holidays || !holidays.response) {
      console.error("Помилка отримання даних про свята: невірний формат відповіді сервера", holidays);
      this.displayError("Помилка отримання свят. Спробуйте ще раз.");
      return;
    }

    const holidaysData = holidays.response.holidays;

    if (!holidaysData || holidaysData.length === 0) {
      const message = document.createElement("p");
      message.textContent = "Немає свят для вибраної країни та року.";
      holidaysResult.innerHTML = ""; // Очистила тільки повідомлення про помилку
      holidaysResult.appendChild(message);
    } else {
      // Очистила лише рядки таблиці, а не всю таблицю
      const tableBody = document.getElementById("lastResultsTableBodyHolidays");
      tableBody.innerHTML = "";

      holidaysData.forEach(holiday => {
        const row = document.createElement("tr");

        const formattedDate = new Date(holiday.date.iso).toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' });

        row.innerHTML = `<td>${formattedDate}</td><td>${holiday.name}</td>`;
        tableBody.appendChild(row);
      });
    }
  }

  displayError(message) {
    const holidaysResult = document.getElementById("holidaysResult");
    holidaysResult.innerHTML = "";

    const errorDiv = document.createElement("div");
    errorDiv.classList.add("error-message");
    errorDiv.textContent = message;

    holidaysResult.appendChild(errorDiv);
  }

  rotateImageAndSort(tableId, columnIndex) {
    let imageElement = document.getElementById('rotateImage');

    let currentRotation = parseInt(getComputedStyle(imageElement).getPropertyValue('--rotation')) || 0;
    currentRotation = (currentRotation + 180) % 360;
    imageElement.style.setProperty('--rotation', currentRotation + 'deg');

    this.sortTable(tableId, columnIndex);
  }

  sortTable(tableId, columnIndex) {
    const tableBody = document.getElementById(tableId);

    if (!tableBody) {
      console.error(`Table with ID ${tableId} not found.`);
      return;
    }

    const rows = Array.from(tableBody.querySelectorAll('tr'));

    const sortDirection = this.getSortDirection();
    const nextSortDirection = sortDirection === 'asc' ? 'desc' : 'asc';

    const sortedRows = rows.sort((a, b) => {
      const dateA = new Date(a.querySelectorAll('td')[columnIndex].textContent.split('.').reverse().join('-'));
      const dateB = new Date(b.querySelectorAll('td')[columnIndex].textContent.split('.').reverse().join('-'));

      if (sortDirection === 'asc') {
        return dateA - dateB;
      } else {
        return dateB - dateA;
      }
    });

    this.setSortDirection(nextSortDirection);

    tableBody.innerHTML = '';

    sortedRows.forEach(row => tableBody.appendChild(row));
  }

  getSortDirection() {
    return localStorage.getItem('sortDirection') || 'asc';
  }

  setSortDirection(direction) {
    localStorage.setItem('sortDirection', direction);
  }
}
let holidaysTab;

document.addEventListener("DOMContentLoaded", () => {
  holidaysTab = new HolidaysTab();
  holidaysTab.init();

  const sortDateButton = document.getElementById('sortDateButton');
  sortDateButton.addEventListener('click', () => {
    const rotateImage = document.getElementById('rotateImage');
    rotateImage.style.transform = `rotate(${(rotateImage.style.transform ? parseInt(rotateImage.style.transform.replace('rotate(', '').replace('deg)', '')) : 0) + 180}deg)`;
    holidaysTab.sortTable('lastResultsTableBodyHolidays', 0);
  });
  window.holidaysTab = holidaysTab;
});
