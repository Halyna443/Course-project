import { Tab } from './tab.js';

export class DateRangeTab extends Tab {

    constructor() {
        super('#tab1', '.tab-content:nth-child(1)');
        this.startDateInput = document.getElementById("startDate");
        this.datePresetSelect = document.getElementById("datePreset");
        this.endDateInput = document.getElementById("endDate");
        this.resultDisplay = document.getElementById("dateRangeResult");
        this.dataPresetSelect = document.getElementById("dataPreset");

        this.startDateInput.addEventListener("change", () => {
            this.datePresetSelect.removeAttribute("disabled");

            const selectedPreset = this.datePresetSelect.value;

            if (selectedPreset === "manual") {
                this.endDateInput.removeAttribute("disabled");
                this.endDateInput.min = this.startDateInput.value;
            } else {
                this.endDateInput.setAttribute("disabled", "true");
                this.updateEndDate(selectedPreset);
            }
        });

        this.datePresetSelect.addEventListener("change", () => {
            const selectedPreset = this.datePresetSelect.value;

            if (selectedPreset === "manual") {
                this.endDateInput.removeAttribute("disabled");
                this.endDateInput.min = this.startDateInput.value;
            } else {
                this.endDateInput.setAttribute("disabled", "true");
                this.updateEndDate(selectedPreset);
            }
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

    updateEndDate(selectedPreset) {
        const startDate = new Date(this.startDateInput.value);
        const endDateInput = this.endDateInput;

        if (selectedPreset === "manual") {
            endDateInput.removeAttribute("disabled");
            endDateInput.min = this.startDateInput.value;
            endDateInput.max = "";
        } else {
            endDateInput.setAttribute("disabled", "true");

            let daysToAdd;
            if (selectedPreset === "week") {
                daysToAdd = 7;
            } else if (selectedPreset === "month") {
                daysToAdd = 30;
            }

            const newEndDate = new Date(startDate);
            newEndDate.setDate(startDate.getDate() + daysToAdd);

            if (newEndDate < startDate) {
                endDateInput.value = startDate.toISOString().split("T")[0];
            } else {
                endDateInput.value = newEndDate.toISOString().split("T")[0];
            }
        }
    }

    updateResultDisplay() {
        const startDate = new Date(this.startDateInput.value);
        const endDateInput = this.endDateInput;
        const datePreset = document.getElementById("datePreset").value;
        const options = document.getElementById("options").value;
        const calculationOptions = document.getElementById("calculationOptions").value;
        const text = document.getElementById("text");
        

        if (endDateInput.hasAttribute("disabled")) {
            endDateInput.removeAttribute("disabled");
        }

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
}
