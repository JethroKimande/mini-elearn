# Mini E-Learn

A lightweight e-learning prototype that lists courses, shows lesson-level progress, and lets learners mark courses as completed.

## Features

- **Course catalogue** with semantic cards, hover effects, and responsive layout
- **Course details** view with lesson list, progress bar, and completion state
- **Single-page navigation** between the home catalogue and specific course detail
- **Completion tracking** that updates both the catalogue and detail view
- **Local persistence** that remembers course completion using `localStorage`

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 16 or higher

### Installation

```powershell
npm install
```

### Run the prototype

```powershell
npm start
```

This spins up `lite-server` on [http://localhost:3000](http://localhost:3000) and watches the `public` folder for changes.
Also live at https://jethrokimande.github.io/mini-elearn/
## Project Structure

```
public/
  index.html         # Home/detail views and navigation shell
  css/style.css      # Modular styles with responsive layout and states
  scripts/main.js    # Course data, rendering logic, and navigation handlers
  images/            # Static artwork

data/courses.json    # Example data set mirroring the in-memory structure
```

## Customization Tips

- Adjust `state.courses` in `public/scripts/main.js` to add or modify courses.
- Update `public/css/style.css` to tweak colors, typography, or spacing.
- Replace `public/images/course-placeholder.svg` with course-specific artwork.
- Update course card artwork by adjusting the `image` property inside `public/scripts/main.js` to point at the files under `public/images`.
- Clear saved progress by removing the `mini-elearn:courses` entry from your browser's `localStorage`.

## Accessibility & UX Notes

- Semantic landmarks (`header`, `main`, `section`, `article`) and descriptive headings
- Keyboard focus states and ARIA attributes for navigation and progress feedback
- Hover and active states for interactive elements with sufficient contrast

## License

Released under the MIT License.

