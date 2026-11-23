# EduVerse — GitHub Pages deployment

This is a **static deployment package** for EduVerse. No build server, API key, Node installation, database, or Docker is needed to host the extracted files. The JavaScript, WebGL engine, font, and chapter data are embedded in `index.html`; 2D illustrations are separate local files.

## Files required for the live site

```
index.html
.nojekyll
assets/2d/     # all chapter directories and image files
```

Extract the ZIP **completely** and preserve these paths. In particular, **uploading only `index.html` or uploading the ZIP itself will not publish the 2D images**. `README.md` is recommended for the repository; the `review/` folder and Docker/nginx/Netlify helper files are optional for running the app. Dotfiles such as `.nojekyll` may be hidden in file managers.

## Publish to GitHub Pages

1. Create an empty GitHub repository (for a new GitHub Free account, choose a public repository if required by your plan). Do not upload private material to a public repository.
2. Download `eduverse-publish.zip`, extract it fully, and open a terminal **in the extracted folder containing `index.html` and `assets/`**.
3. Run the commands below, replacing `YOUR-USER` and `YOUR-REPO` with your actual account and repository. Authenticate with GitHub as prompted; do not put tokens or passwords in these files.

```bash
git init -b main
git add index.html .nojekyll assets/2d README.md PUBLISH.md
git commit -m "Deploy EduVerse static site"
git remote add origin https://github.com/YOUR-USER/YOUR-REPO.git
git push -u origin main
```

4. In the repository, open **Settings → Pages → Build and deployment → Deploy from a branch**. Choose branch **main** and folder **/(root)**, then save. Wait for the Pages deployment to finish.
5. Open the URL shown on the Pages settings screen, usually `https://YOUR-USER.github.io/YOUR-REPO/`. For a user/organisation site named `YOUR-USER.github.io`, the URL is normally `https://YOUR-USER.github.io/`.

If the repository already contains a branch or files, clone it first and carefully copy the extracted files into the intended publishing directory, then add, commit, and push using its existing history. Do not force-push or overwrite existing work without checking it first.

## Classroom / projector mode

Open a chapter, then use the projector control (▦), press **Alt+P**, or append `?projector=1` to the app URL. The presentation bar gives Previous/Next, language, **2D / 3D**, Zoom and Exit. The app continues to start in 3D unless you select 2D. Exit or press Esc to return to the prior classroom view. On a smart board, use Zoom for the largest illustration and select an outlined label for its information. Projector readability depends on display size, resolution, lighting and seating; check on the actual classroom equipment.

## Local check

From the extracted folder, run:

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000/`. Choose a chapter, select **2D**, click labels and open Zoom; return to **3D**. Stop the server with Ctrl+C. The public GitHub Pages site will use HTTPS. Some browsers restrict `file://` exports; a local HTTP server is preferable for testing.

## Status and hosting caveats

- All 266 runtime spreads have **unapproved draft mappings**; nine are proposed topics for generic pages and have not been matched to an authoritative curriculum. This is **not** evidence of completion of 288 individual concepts.
- Of 274 JPEGs, 201 have clickable bilingual hotspots; **73 images still lack them**. Scientific and teacher review, full accessibility, multi-browser, real-device/GPU and comprehensive regression testing remain pending. Some scenes are AI-generated illustrations with schematic panels, not verified photographs or experimental measurements. Class IX 8.6–8.8 replacement candidates await user review.
- The app has an embedded browser Content Security Policy. GitHub Pages does **not** apply the package's `_headers` or `nginx.conf`: those files are for other hosts. Do not assume server-side security headers are configured on GitHub Pages.
- The GitHub Pages project subpath is supported by relative image paths and has been checked locally with representative chapters. This does not establish that the site has been deployed or that every browser/device has been tested.

For the detailed draft status see `review/` in the full ZIP. When publishing publicly, verify that you have permission to share all source material and imagery.
