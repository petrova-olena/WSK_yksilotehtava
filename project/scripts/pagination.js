'use strict';

export default class Pagination {
  constructor(items, renderFn, options = {}) {
    this.items = items;
    this.renderFn = renderFn;

    this.getPerPage = options.getPerPage || (() => 9);
    this.currentPage = 1;

    this.prevBtn = document.getElementById('prev-page');
    this.nextBtn = document.getElementById('next-page');
    this.pageInfo = document.getElementById('page-info');

    this.init();
  }

  init() {
    this.update();
    this.attachEvents();
  }

  attachEvents() {
    this.prevBtn.addEventListener('click', () => {
      this.currentPage--;
      this.update();
    });

    this.nextBtn.addEventListener('click', () => {
      this.currentPage++;
      this.update();
    });

    window.addEventListener('resize', () => {
      const old = this.perPage;
      const now = this.getPerPage();

      if (old !== now) {
        this.currentPage = 1;
        this.update();
      }
    });
  }

  update() {
    this.perPage = this.getPerPage();
    this.totalPages = Math.ceil(this.items.length / this.perPage);

    const start = (this.currentPage - 1) * this.perPage;
    const end = start + this.perPage;

    const pageItems = this.items.slice(start, end);

    this.renderFn(pageItems);

    this.pageInfo.textContent = `${this.currentPage} / ${this.totalPages}`;
    this.prevBtn.disabled = this.currentPage === 1;
    this.nextBtn.disabled = this.currentPage === this.totalPages;
  }
}
