(() => {
  const container = document.getElementById('pdf-reader');
  if (!container) return;

  const viewport = container.querySelector('.pdf-reader-viewport');
  const pages = container.querySelector('.pdf-reader-pages');
  const status = container.querySelector('[data-reader-status]');
  const counter = container.querySelector('[data-page-counter]');
  const zoomLabel = container.querySelector('[data-zoom-label]');
  const previous = container.querySelector('[data-reader-previous]');
  const next = container.querySelector('[data-reader-next]');
  const zoomOut = container.querySelector('[data-reader-zoom-out]');
  const zoomIn = container.querySelector('[data-reader-zoom-in]');
  const textDetails = container.querySelector('[data-reader-text]');
  const textOutput = container.querySelector('[data-reader-text-output]');
  const sectionButtons = [...document.querySelectorAll('[data-pdf-page]')];
  const controls = [previous, next, zoomOut, zoomIn, ...sectionButtons];
  const model = [];
  let currentPage = 1;
  let zoom = 1;
  let observer;
  let resizeTimer;
  let scrollFrame;
  let textRequest = 0;
  let requestedTextPage = 0;

  const setStatus = message => { status.textContent = message; };
  const updateText = async () => {
    if (!textDetails.open || !model.length || requestedTextPage === currentPage) return;
    const number = currentPage;
    const request = ++textRequest;
    requestedTextPage = number;
    textOutput.textContent = `Loading the text of page ${number}…`;
    try {
      const content = await model[number - 1].page.getTextContent();
      if (request !== textRequest || !textDetails.open) return;
      // Preserve the visual row order, then read each row from left to right.
      // The supplied PDF is untagged, so tables are presented as linear text.
      const items = content.items.filter(item => item.str && item.str.trim()).sort((a, b) => b.transform[5] - a.transform[5]);
      const lines = [];
      items.forEach(item => {
        let line = lines.find(row => Math.abs(row.y - item.transform[5]) < 2);
        if (!line) { line = { y: item.transform[5], items: [] }; lines.push(line); }
        line.items.push(item);
      });
      const text = lines.map(line => line.items.sort((a, b) => a.transform[4] - b.transform[4]).map(item => item.str.trim()).join('   ')).join('\n');
      textOutput.textContent = `Page ${number} of ${model.length}\n\n${text || 'No selectable text was found on this page.'}`;
    } catch (error) {
      if (request !== textRequest) return;
      console.error('Unable to extract PDF page text:', error);
      textOutput.textContent = 'The text for this page could not be displayed. Please reload the page and try again.';
      requestedTextPage = 0;
    }
  };
  const updateControls = () => {
    counter.textContent = `Page ${currentPage} of ${model.length}`;
    zoomLabel.textContent = `${Math.round(zoom * 100)}%`;
    previous.disabled = currentPage <= 1;
    next.disabled = currentPage >= model.length;
    zoomOut.disabled = zoom <= 1;
    zoomIn.disabled = zoom >= 6;
    const activeSection = [...sectionButtons].reverse().find(button => Number(button.dataset.pdfPage) <= currentPage);
    sectionButtons.forEach(button => button.setAttribute('aria-pressed', String(button === activeSection)));
    updateText();
  };
  const cancelRender = item => {
    item.generation += 1;
    if (item.task) {
      item.task.cancel();
      item.task = null;
    }
    item.rendered = false;
    item.canvas.width = 0;
    item.canvas.height = 0;
  };
  const renderPage = async item => {
    if (item.rendered || item.task) return;
    const generation = item.generation;
    let task;
    try {
      const scale = item.width / item.original.width;
      const view = item.page.getViewport({ scale });
      // Limit canvas memory while retaining sharp rendering at common mobile zoom levels.
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5, Math.sqrt(5000000 / (view.width * view.height)));
      item.canvas.width = Math.max(1, Math.floor(view.width * pixelRatio));
      item.canvas.height = Math.max(1, Math.floor(view.height * pixelRatio));
      const context = item.canvas.getContext('2d', { alpha: false });
      if (!context) throw new Error('Canvas rendering is unavailable.');
      task = item.page.render({ canvasContext: context, viewport: view, transform: [pixelRatio, 0, 0, pixelRatio, 0, 0] });
      item.task = task;
      await task.promise;
      if (generation === item.generation) item.rendered = true;
    } catch (error) {
      if (error.name !== 'RenderingCancelledException') {
        console.error('Unable to render PDF page:', error);
        setStatus('A report page could not be displayed. Please reload the page and try again.');
      }
    } finally {
      if (item.task === task) item.task = null;
    }
  };
  const layout = () => {
    const fitWidth = Math.max(240, viewport.clientWidth - 24);
    model.forEach(item => {
      cancelRender(item);
      item.width = Math.round(fitWidth * zoom);
      item.element.style.width = `${item.width}px`;
      item.element.style.height = `${Math.ceil(item.width * item.original.height / item.original.width)}px`;
    });
    const last = model[model.length - 1];
    const lastPageHeight = Math.ceil(last.width * last.original.height / last.original.width);
    pages.style.paddingBottom = `${Math.max(12, viewport.clientHeight - lastPageHeight + 12)}px`;
    if (observer) observer.disconnect();
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const item = model[Number(entry.target.dataset.page) - 1];
        if (entry.isIntersecting) renderPage(item);
        else cancelRender(item);
      });
    }, { root: viewport, rootMargin: '80% 0px' });
    model.forEach(item => observer.observe(item.element));
  };
  const goToPage = number => {
    const page = Math.max(1, Math.min(model.length, number));
    currentPage = page;
    viewport.scrollTo({ top: model[page - 1].element.offsetTop, behavior: 'auto' });
    updateControls();
  };
  const captureAnchor = () => {
    const element = model[currentPage - 1].element;
    return {
      page: currentPage,
      x: Math.max(0, Math.min(1, (viewport.scrollLeft + viewport.clientWidth / 2 - element.offsetLeft) / element.offsetWidth)),
      y: Math.max(0, Math.min(1, (viewport.scrollTop + viewport.clientHeight / 2 - element.offsetTop) / element.offsetHeight))
    };
  };
  const restoreAnchor = anchor => {
    const element = model[anchor.page - 1].element;
    viewport.scrollTo({
      left: element.offsetLeft + anchor.x * element.offsetWidth - viewport.clientWidth / 2,
      top: element.offsetTop + anchor.y * element.offsetHeight - viewport.clientHeight / 2,
      behavior: 'auto'
    });
    currentPage = anchor.page;
    updateControls();
  };
  const setZoom = value => {
    const anchor = captureAnchor();
    zoom = Math.max(1, Math.min(6, value));
    layout();
    restoreAnchor(anchor);
  };
  const updateCurrentFromScroll = () => {
    const top = viewport.getBoundingClientRect().top;
    const target = top + Math.min(viewport.clientHeight * 0.25, 120);
    let selected = 1;
    if (viewport.scrollTop + viewport.clientHeight >= viewport.scrollHeight - 2) selected = model.length;
    else model.forEach((item, index) => {
      if (item.element.getBoundingClientRect().top <= target) selected = index + 1;
    });
    if (selected !== currentPage) {
      currentPage = selected;
      updateControls();
    }
  };

  controls.forEach(button => { button.disabled = true; });
  if (!window.pdfjsLib) {
    setStatus('The report viewer could not load. Please reload the page and try again.');
    return;
  }
  window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'assets/vendor/pdfjs/pdf.worker.min.js';
  window.pdfjsLib.getDocument({ url: 'assets/aurelia/financial-analysis.pdf', isEvalSupported: false }).promise.then(async document => {
    for (let number = 1; number <= document.numPages; number += 1) {
      const page = await document.getPage(number);
      const element = window.document.createElement('div');
      element.className = 'pdf-reader-page';
      element.dataset.page = String(number);
      const canvas = window.document.createElement('canvas');
      canvas.setAttribute('role', 'img');
      canvas.setAttribute('aria-label', `Financial analysis report, page ${number} of ${document.numPages}`);
      element.appendChild(canvas);
      pages.appendChild(element);
      model.push({ page, element, canvas, original: page.getViewport({ scale: 1 }), width: 0, generation: 0, task: null, rendered: false });
    }
    layout();
    controls.forEach(button => { button.disabled = false; });
    updateControls();
    setStatus('Scroll through the report or use the page controls. Zoom in and swipe horizontally to read detailed tables.');
    previous.addEventListener('click', () => goToPage(currentPage - 1));
    next.addEventListener('click', () => goToPage(currentPage + 1));
    zoomOut.addEventListener('click', () => setZoom(zoom - (zoom > 2 ? 1 : 0.5)));
    zoomIn.addEventListener('click', () => setZoom(zoom + (zoom >= 2 ? 1 : 0.5)));
    sectionButtons.forEach(button => button.addEventListener('click', () => goToPage(Number(button.dataset.pdfPage))));
    textDetails.addEventListener('toggle', () => {
      if (textDetails.open) updateText();
      else { textRequest += 1; requestedTextPage = 0; }
    });
    viewport.addEventListener('scroll', () => {
      if (scrollFrame) return;
      scrollFrame = requestAnimationFrame(() => { scrollFrame = null; updateCurrentFromScroll(); });
    }, { passive: true });
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const anchor = captureAnchor();
        layout();
        restoreAnchor(anchor);
      }, 180);
    }, { passive: true });
  }).catch(error => {
    console.error('Unable to load PDF report:', error);
    setStatus('The report could not be displayed. Please reload the page and try again.');
  });
})();
