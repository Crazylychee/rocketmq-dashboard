# RocketMQ Dashboard Frontend

This is the frontend for Apache RocketMQ Dashboard, migrated from the original Angular application.

## Project Structure

The project has been migrated from the original Angular application in `src/main/resources/static` to the frontend directory. The project structure is as follows:

- `src/` - Contains the Angular application source code
- `vendor/` - Contains third-party libraries and dependencies
- `lib/` - Symbolic link to the vendor directory (for compatibility with the original code)
- `style/` - Contains CSS and styling assets
- `view/` - Contains Angular templates and views

## Development Setup

To start the development server:

```
npm install
npm start
```

This will start a development server at http://localhost:3000.

## Building for Production

To build the project for production:

```
npm run build
```

This will create a `dist` directory with all the necessary files for deployment.

## Notes on Migration

This project was migrated from `src/main/resources/static` to the `frontend` directory. The original structure with the vendor folder has been maintained to ensure compatibility with the existing Angular application.

We've created a symbolic link from `lib` to `vendor` to maintain compatibility with the original code that references libraries from both paths.
