# 🚀 Too Many Parts 

**Too Many Parts** is an inventory management system to help you organize your electronic components. It is primarily targeted towards electronics enthusiasts.

Please feel free to try it yourself and issues for feature-requests and bug reports are always welcome 👋

## ✅ Features

- Create and manage components
- Automatically fetch data from LCSC & Mouser (with corresponding API keys)
- Datasheet retrieval and label generation
- Label scanner (on mobile devices with a camera)
- Component search & filtering
- Bill-Of-Material management
- Assembly aid, displaying component positions on boards

## 📋 Planned Features

- Import order lists from LCSC, Mouser, etc.
- Low-stock notifications
- Multi-user functionality

## 🐳 Running Locally with Docker 

To run **Too Many Parts** on your local machine using Docker, follow these steps:

1. Build the image in the main directory with the following command:
   ```
   docker build -t olel/toomanyparts .
   ```

2. Then, run the container with the following command:
   ```
   docker run -p 8081:8081 olel/toomanyparts
   ```

**Too Many Parts** will now be accessible on your computer at [http://localhost:8081](http://localhost:8081).