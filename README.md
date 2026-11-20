# Wafa Abdullah — Professional Portfolio

A lightweight, responsive portfolio website for **Wafa Abdullah** — Finance, Data Analysis & Business Intelligence.

## Files

- `index.html` — Website structure and content
- `aurelia.html` — Aurelia project details and embedded previews
- `aurelia.css` — Page-specific responsive styles using the existing design system
- `pdf-viewer.js`, `pdf-viewer.css` — Read-only PDF page navigation, scrolling and zoom
- `assets/vendor/pdfjs/` — PDF.js 3.11.174 browser library, worker and license
- `style.css` — Responsive editorial/finance design system
- `projects.js` — Project data; add future projects here
- `script.js` — Menu, filters, animation and active navigation
- `assets/aurelia/` — Supplied interactive dashboard HTML and print-ready report PDF
- `profile.jpg` — Homepage portrait image
- `assets/documents/Wafa-Abdullah-CV.pdf` — Add the CV PDF here to complete the existing homepage download link

The Aurelia viewer renders the supplied PDF without visible download, print or edit controls. GitHub Pages is public, so the PDF and dashboard data cannot be protected against saving, copying or screenshots.

## Publish with GitHub Pages

1. Upload every file and folder in this project to the root of your GitHub repository.
2. In the repository open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select branch **main** and folder **/(root)**, then press **Save**.
5. GitHub will show your live site link after deployment.

## Add your photo

Upload your photo into `assets/images/` and name it `profile.jpg`. Then replace the `portrait-placeholder` block in `index.html` with:

```html
<img class="profile-photo" src="assets/images/profile.jpg" alt="Portrait of Wafa Abdullah" />
```

Add this CSS to `style.css`:

```css
.profile-photo { height: 400px; width: min(310px, 65%); object-fit: cover; border-radius: 50% 50% 0 0; outline: 1px solid rgba(231,226,206,.7); outline-offset: 11px; }
```

## Add project links

The featured Aurelia project links to `aurelia.html`. Its supplied report and interactive dashboard are stored in `assets/aurelia/`; the remaining project cards can be linked by updating their objects in `projects.js` as reports, repositories or files become available.
