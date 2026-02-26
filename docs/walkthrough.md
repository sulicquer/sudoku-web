# README Update and Deployment Walkthrough

I have completed the updates to your `README.md` to ensure your gameplay screenshot displays correctly on GitHub and added a direct link for your friends to play.

## Changes Made

### README.md
- **Relative Image Path**: Changed the image path to `./example.png`. This ensures GitHub can find the image file within your repository.
- **Direct Link**: Added a prominent "Online Play" link pointing to your GitHub Pages URL: [https://sulicquer.github.io/sudoku-web/](https://sulicquer.github.io/sudoku-web/)

## Verification

### 1. Relative Path Checklist
The image is now referenced as:
```markdown
![example](./example.png)
```
This is the standard way to reference images stored in the same folder as the README on GitHub.

### 2. Deployment URL
Based on your repo name `sudoku-web` and username `sulicquer`, your site is available at:
`https://sulicquer.github.io/sudoku-web/`

## How to Finalize

To see these changes live, you just need to push your local changes to GitHub:

1. **Commit and Push**:
   ```bash
   git add .
   git commit -m "docs: update README with image and deployment link"
   git push origin main
   ```

2. **Wait for Build**:
   Wait about 30-60 seconds for GitHub Actions to rebuild your site.

3. **Share the Link**:
   Once the green checkmark appears in your repo actions or you see "Your site is live" in Settings -> Pages, you can send the URL to your friends!
