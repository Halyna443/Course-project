import { Tab } from "./classes/tab.js";
import { DateRangeTab } from "./classes/dateRangeTab.js";
import { HolidaysTab } from "./classes/holidaysTab.js";

document.addEventListener("DOMContentLoaded", function () {
  const tabsContainer = document.querySelector('.tabs');
  const labels = document.querySelectorAll('.tabs label');

  tabsContainer.addEventListener('click', function (event) {
    if (event.target.tagName === 'INPUT' && event.target.type === 'radio') {
      const tabId = event.target.id;
      const correspondingLabel = document.querySelector(`label[for="${tabId}"]`);

      labels.forEach(label => label.classList.remove('active'));
      correspondingLabel.classList.add('active');
    }
  });

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
