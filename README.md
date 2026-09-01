# Wafa Abdullah — Professional Portfolio

A lightweight, responsive portfolio website for **Wafa Abdullah** — Finance, Data Analysis & Business Intelligence.

## Files

- `index.html` — Website structure and content
- `style.css` — Responsive editorial/finance design system
- `projects.js` — Project data; add future projects here
- `script.js` — Menu, filters, animation and active navigation
- `assets/documents/Wafa-Abdullah-CV.pdf` — CV download file
- `assets/images/` — Add your professional photo as `profile.jpg` when ready

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

The visible project buttons currently point to the contact section until Power BI reports, GitHub repositories or files are available. Update the `projects` objects in `projects.js` as you add them.
