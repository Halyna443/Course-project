// The tab.js is a script that contains the main page that is display two tags. Tha Date and The Holidays tabs.
export class Tab {
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
    
  