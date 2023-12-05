const apiKey = "fMYdiZOLmcIOrGa2O7Tz0k20FNBTUJ6R";
class Tab {
  constructor(tabSelector, contentSelector) {
    this.tab = document.querySelector(tabSelector);
    this.content = document.querySelector(contentSelector);
  }

  init() {
    this.tab.addEventListener('click', () => {
      this.hideOtherTabs();
      this.show();
    });
  }

  hideOtherTabs() {
    document.querySelectorAll('.tab-content').forEach(content => {
      content.style.display = 'none';
    });
  }

  show() {
    this.content.style.display = 'block';
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const dateRangeTab = new Tab('#tab1', '.tab-content:nth-child(1)');
  dateRangeTab.init();

  const holidaysTab = new Tab('#tab2', '.tab-content:nth-child(2)');
  holidaysTab.init();

  const showLastResultsButton = document.getElementById("showLastResultsButton");
  const dateRangeTabForLastResults = new DateRangeTab();
  dateRangeTabForLastResults.init();

  showLastResultsButton.addEventListener("click", function () {
    dateRangeTabForLastResults.showLastResults();
  });
});

class DateRangeTab extends Tab {
  constructor() {
    super('#tab1', '.tab-content:nth-child(1)');
    this.startDateInput = document.getElementById("startDate");
    this.endDateInput = document.getElementById("endDate");
    this.resultDisplay = document.getElementById("dateRangeResult");
    this.dataPresetSelect = document.getElementById("dataPreset");

    this.startDateInput.addEventListener("change", () => {
      this.endDateInput.removeAttribute("disabled");
      this.validateEndDate();
    });
  }

  init() {
    super.init();
    
    const getDateRangeButton = document.getElementById("getDateRangeButton");
    getDateRangeButton.addEventListener('click', (event) => {
      event.preventDefault();
      this.updateResultDisplay();
    });
  }

  validateEndDate() {
    const startDate = new Date(this.startDateInput.value);
    const endDateInput = this.endDateInput;

    endDateInput.min = this.startDateInput.value;
    endDateInput.max = "";

    if (endDateInput.hasAttribute("disabled")) {
      return;
    }
    const endDate = new Date(endDateInput.value);
  }

  updateResultDisplay() {
    const startDate = new Date(this.startDateInput.value);
    const endDateInput = this.endDateInput;
    const datePreset = document.getElementById("datePreset").value;
    const options = document.getElementById("options").value;
    const calculationOptions = document.getElementById("calculationOptions").value;
    const text = document.getElementById("text");

    let endDate;
    if (endDateInput.hasAttribute("disabled")) {
      this.resultDisplay.textContent = " ";
      return;
    } else {
      endDate = new Date(endDateInput.value);
      text.textContent = " ";
    }
    if (!(endDate instanceof Date) || isNaN(endDate.getTime())) {
      this.resultDisplay.textContent = "Будь ласка, виберіть кінцеву дату.";
      return;
    }

    const daysBetween = this.calculateDaysBetween(startDate, endDate);

    let optionsLabel;
    switch (options) {
      case "allDays":
        optionsLabel = `Всі дні: ${this.calculateDaysBetween(startDate, endDate)}`;
        break;
      case "weekdays":
        optionsLabel = `Будні дні: ${this.calculateWeekdays(startDate, endDate)}`;
        break;
      case "weekends":
        optionsLabel = `Вихідні дні: ${this.calculateWeekendDays(startDate, endDate)}`;
        break;
      default:
        optionsLabel = "";
        break;
    }

    let result;
    switch (calculationOptions) {
      case "days":
        if (options === "allDays") {
          result = daysBetween;
        } else if (options === "weekdays") {
          result = this.calculateWeekdays(startDate, endDate);
        } else if (options === "weekends") {
          result = this.calculateWeekendDays(startDate, endDate);
        }
        break;
      case "hours":
        if (options === "allDays") {
          result = daysBetween * 24;
        } else if (options === "weekdays") {
          result = this.calculateWeekdays(startDate, endDate) * 24;
        } else if (options === "weekends") {
          result = this.calculateWeekendDays(startDate, endDate) * 24;
        }
        break;
      case "minutes":
        if (options === "allDays") {
          result = daysBetween * 24 * 60;
        } else if (options === "weekdays") {
          result = this.calculateWeekdays(startDate, endDate) * 24 * 60;
        } else if (options === "weekends") {
          result = this.calculateWeekendDays(startDate, endDate) * 24 * 60;
        }
        break;
      case "seconds":
        if (options === "allDays") {
          result = daysBetween * 24 * 60 * 60;
        } else if (options === "weekdays") {
          result = this.calculateWeekdays(startDate, endDate) * 24 * 60 * 60;
        } else if (options === "weekends") {
          result = this.calculateWeekendDays(startDate, endDate) * 24 * 60 * 60;
        }
        break;
      default:
        result = " ";
    }

    const resultObject = {
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
      options: options,
      calculationOptions: calculationOptions,
      result: result
    };

    this.saveResultToLocalStorage(resultObject);
    this.resultDisplay.textContent = `Проміжок дат: ${startDate.toISOString().split("T")[0]} до ${endDate.toISOString().split("T")[0]}, Опції: ${optionsLabel}, Опції розрахунку: ${this.getCalculationOptionsLabel(calculationOptions)}: ${result}`;
  }

  getPresetLabel(datePreset, presetResult) {
    const labels = {
      week: `Кількість тижнів: ${presetResult}`,
      month: `Кількість місяців: ${presetResult}`,
    };
    return labels[datePreset] || "";
  }

  getOptionsLabel(options) {
    const labels = {
      allDays: "Всі дні",
      weekdays: "Будні дні",
      weekends: "Вихідні дні",
    };
    return labels[options] || "";
  }

  getCalculationOptionsLabel(calculationOptions) {
    const labels = {
      days: "Кількість днів",
      hours: "Кількість годин",
      minutes: "Кількість хвилин",
      seconds: "Кількість секунд",
    };
    return labels[calculationOptions] || "";
  }

  calculateMonthsBetween(startDate, endDate) {
    let months;
    months = (endDate.getFullYear() - startDate.getFullYear()) * 12;
    months -= startDate.getMonth();
    months += endDate.getMonth();
    return months <= 0 ? 0 : months;
  }

  calculateWeeksBetween(startDate, endDate) {
    const daysBetween = this.calculateDaysBetween(startDate, endDate);
    const resultPreset = Math.round(daysBetween / 7);
    return resultPreset;
  }

  calculateDaysBetween(startDate, endDate) {
    const oneDay = 24 * 60 * 60 * 1000;
    const daysBetween = Math.round(Math.abs((startDate - endDate) / oneDay));

    return daysBetween;
  }

  calculateWeekendDays(startDate, endDate) {
    let count = 0;
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      if ((dayOfWeek === 0 || dayOfWeek === 6) && currentDate < endDate) {
        count++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return count;
  }

  calculateWeekdays(startDate, endDate) {
    const totalDays = this.calculateDaysBetween(startDate, endDate);
    const weekendDays = this.calculateWeekendDays(startDate, endDate);
    return totalDays - weekendDays;
  }

  calculateEndDate(startDate, daysToAdd) {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + daysToAdd);
    return end.toISOString().split("T")[0];
  }

  saveResultToLocalStorage(result) {
    const results = JSON.parse(localStorage.getItem("results")) || [];
    results.unshift(result);
    localStorage.setItem("results", JSON.stringify(results.slice(0, 10)));
  }

  updateLastResultsTable() {
    const lastResultsTableBody = document.getElementById("lastResultsTableBody");
    const results = JSON.parse(localStorage.getItem("results")) || [];
    lastResultsTableBody.innerHTML = "";

    results.forEach(result => {
      const row = document.createElement("tr");
      const calculationOptions = Array.isArray(result.calculationOptions) ? result.calculationOptions.join(", ") : result.calculationOptions;
      const formattedResult = result.result !== undefined ? result.result : 0;

      row.innerHTML = `<td>${result.startDate}</td>
                     <td>${result.endDate}</td>
                     <td>${this.getOptionsLabel(result.options)}</td>
                     <td>${this.getCalculationOptionsLabel(result.calculationOptions)}: ${formattedResult}</td>`;
      lastResultsTableBody.appendChild(row);
    });
  }

  showLastResults() {
    const lastResultsTable = document.getElementById("lastResultsTable");
    lastResultsTable.style.display = "block";
    this.updateLastResultsTable(); // Оновлення таблиці останніх результатів
  }
} class HolidaysTab extends Tab {
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
  }

  async fillCountryList() {
    try {
      const countries = await this.fetchCountries();
      this.populateSelectOptions(this.countrySelect, countries);
    } catch (error) {
      console.error("Помилка отримання списку країн:", error);
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

  // async getHolidays() {
  //   const country = this.countrySelect.value;
  //   const year = this.yearSelect.value;

  //   try {
  //     const holidays = await this.fetchHolidays(country, year);
  //     this.displayHolidays(holidays);
  //   } catch (error) {
  //     console.error("Помилка отримання свят:", error);
  //     this.displayError("Помилка отримання свят. Спробуйте ще раз.");
  //   }
  // }

  async getHolidays() {
    const country = this.countrySelect.value;
    const year = this.yearSelect.value;

    try {
      const response = await this.fetchHolidays(country, year);
      if (!response.ok) {
        console.error(`Помилка отримання свят. Статус: ${response.status}`);
        this.displayError("Помилка отримання свят. Спробуйте ще раз.");
        return;
      }

      const holidays = await response.json();
      this.displayHolidays(holidays);
    } catch (error) {
      console.error("Помилка обробки відповіді сервера", error);
      this.displayError("Помилка отримання свят. Спробуйте ще раз.");
    }
  }


  async fetchCountries() {
    // const apiUrl = "https://calendarific.com/api/v2/countries";
    // const apiKey = "fMYdiZOLmcIOrGa2O7Tz0k20FNBTUJ6R";
    const response = await fetch(`${apiUrl}?api_key=${apiKey}&`);
    const data = await response.json();

    const countries = data.response.countries;

    return countries;
  }

  async fetchHolidays(countryCode, year) {
    // const apiUrl = "https://calendarific.com/api/v2/holidays";
    // const apiKey = "fMYdiZOLmcIOrGa2O7Tz0k20FNBTUJ6R";
    const response = await fetch(`${apiUrl}?api_key=${apiKey}&country=${countryCode}&year=${year}`);
    const data = await response.json();

    return data.response.holidays;

  }

  populateSelectOptions(selectElement, data) {
    selectElement.innerHTML = "";
    if (Array.isArray(data)) {
      data.forEach(item => {
        const option = document.createElement("option");
        option.value = item["country_name"];
        option.textContent = item["country_name"];
        selectElement.appendChild(option);
      });
    }
  }

  // displayHolidays(holidays) {
  //   const holidaysResult = document.getElementById("holidaysResult");
  //   holidaysResult.innerHTML = "";

  //   if (holidays.length === 0) {
  //     const message = document.createElement("p");
  //     message.textContent = "Немає свят для вибраної країни та року.";
  //     holidaysResult.appendChild(message);
  //   } else {
  //     const tableHolidays = document.createElement("table");
  //     tableHolidays.innerHTML = "<thead><tr><th>Дата</th><th>Назва свята</th></tr></thead><tbody></tbody>";
  //     const tbody = tableHolidays.querySelector("tbody");

  //     holidays.data.response.holidays.forEach(holiday => {
  //       const row = document.createElement("tr");
  //       row.innerHTML = `<td>${holiday.date.iso}</td><td>${holiday.name}</td>`;
  //       tbody.appendChild(row);
  //     });

  //     holidaysResult.appendChild(tableHolidays);
  //   }
  // }
  displayHolidays(holidays) {
    const holidaysResult = document.getElementById("holidaysResult");
    holidaysResult.innerHTML = "";

    if (!holidays || !holidays.response || !holidays.response.holidays) {
      console.error("Помилка отримання даних про свята: невірний формат відповіді сервера", holidays);
      this.displayError("Помилка отримання свят. Спробуйте ще раз.");
      return;
    }

    const holidaysData = holidays.response.holidays;

    if (holidaysData.length === 0) {
      const message = document.createElement("p");
      message.textContent = "Немає свят для вибраної країни та року.";
      holidaysResult.appendChild(message);
    } else {
      const tableHolidays = document.createElement("table");
      tableHolidays.innerHTML = "<thead><tr><th>Дата</th><th>Назва свята</th></tr></thead><tbody></tbody>";
      const tbody = tableHolidays.querySelector("tbody");

      holidaysData.forEach(holiday => {
        const row = document.createElement("tr");
        row.innerHTML = `<td>${holiday.date.iso}</td><td>${holiday.name}</td>`;
        tbody.appendChild(row);
      });

      holidaysResult.appendChild(tableHolidays);
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
}

document.addEventListener("DOMContentLoaded", function () {
  const holidaysTab = new HolidaysTab();
  holidaysTab.init();
});
