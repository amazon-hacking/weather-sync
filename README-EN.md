# 🌊 Weather Sync

> Intelligent flood monitoring system with real-time notifications

<div align="center">
  <img src="https://img.shields.io/badge/Amazon%20Hacking-2025-orange?style=for-the-badge&logo=amazon" alt="Amazon Hacking 2025">
  <img src="https://img.shields.io/badge/Axis-Climate-green?style=for-the-badge" alt="Climate Axis">
  <img src="https://img.shields.io/badge/Status-In%20Development-yellow?style=for-the-badge" alt="Status">
</div>

## 📋 About the Project

**Weather Sync** is an innovative solution developed during Amazon Hacking 2025 (Climate Axis) for intelligent monitoring of urban floods. The system allows users to track critical weather conditions in their favorite neighborhoods and receive instant alerts via email and WhatsApp when there is a risk of flooding.

### 🎯 Key Features

- 🌧️ **Real-Time Monitoring** - Continuous tracking of weather conditions
- 📍 **Favorites System** - Add neighborhoods of interest for personalized monitoring
- 📧 **Email Notifications** - Automatic alerts about critical conditions
- 📱 **SMS via WhatsApp** - Instant notifications on your cell phone
- 🚨 **Intelligent Alerts** - System that identifies flood risk patterns
- 🎨 **Intuitive Interface** - Responsive and user-friendly dashboard

## 🏗️ Architecture

### Server
- **Runtime**: [Bun](https://bun.sh/) - Ultra-fast JavaScript runtime
- **Framework**: [Elysia](https://elysiajs.com/) - High-performance TypeScript web framework

### Website
- **Framework**: [React](https://react.dev/) - Library for user interfaces
- **Build Tool**: [Vite](https://vitejs.dev/) - Modern and fast build tool
- **Package Manager**: [npm](https://www.npmjs.com/) - Package manager

### Infrastructure
- **Monorepo**: [Turborepo](https://turbo.build/) - High-performance build system
- **Package Manager**: [pnpm](https://pnpm.io/) - Efficient package manager
- **Deploy**: [Pulumi](https://www.pulumi.com/) - Infrastructure as code

## 🚀 Getting Started

### Prerequisites

```bash
# Install Node.js and npm
# Download from: [https://nodejs.org/](https://nodejs.org/)
```

#### Install Bun
```bash
curl -fsSL https://bun.sh/install | bash
```

#### Install pnpm
```bash
npm install -g pnpm
````

### Installation

- Clone the repository

- Install the dependencies

```bash
pnpm install
```

### Configure the environment variables

#### Copy the example files

```bash
cp .env.example .env
```

#### Configure your API keys
#### - Weather API
#### - Email credentials
#### - WhatsApp token
#### - Database settings


Run the project

```bash
pnpm run dev
```

```
📁 Project structure
weather-sync/
├── apps/
│ ├── server/ # API Elysia + Bun
│ └── website/ # React + Vite
├── packages/
│ ├── shared/ # Shared types and utilities
│ └── config/ # Project settings
├── infra/ # Pulumi settings
├── turbo.json # Turborepo configuration
├── package.json
└── pnpm-workspace.yaml
```
