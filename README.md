# Portfolio Website

A modern portfolio website built with Node.js and Tailwind CSS.

## Features

- Responsive design
- Modern UI with Tailwind CSS
- Contact form
- Project showcase
- About section
- Smooth scrolling navigation

## Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd portfolio
```

2. Install dependencies:
```bash
npm install
```

3. Build the CSS:
```bash
npm run build:css
```

## Running the Application

1. Start the development server:
```bash
npm run dev
```

2. Open your browser and visit:
```
http://localhost:3000
```

## Development

- The server runs on port 3000 by default
- Tailwind CSS is configured to watch for changes
- The main HTML file is located in `public/index.html`
- CSS is processed from `src/input.css` to `public/css/style.css`

## Customization

- Edit `public/index.html` to modify the content
- Update styles in `src/input.css`
- Modify Tailwind configuration in `tailwind.config.js` 