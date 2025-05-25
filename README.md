# 🌊 Weather Sync

> Sistema inteligente de monitoramento de enchentes com notificações em tempo real

<div align="center">
  <img src="https://img.shields.io/badge/Amazon%20Hacking-2025-orange?style=for-the-badge&logo=amazon" alt="Amazon Hacking 2025">
  <img src="https://img.shields.io/badge/Eixo-Climático-green?style=for-the-badge" alt="Eixo Climático">
  <img src="https://img.shields.io/badge/Status-Em%20Desenvolvimento-yellow?style=for-the-badge" alt="Status">
</div>

## 📋 Sobre o Projeto

O **Weather Sync** é uma solução inovadora desenvolvida durante o Amazon Hacking 2025 (Eixo Climático) para monitoramento inteligente de enchentes urbanas. O sistema permite que usuários acompanhem condições meteorológicas críticas em seus bairros favoritos e recebam alertas instantâneos via email e WhatsApp quando há risco de alagamentos.

### 🎯 Principais Funcionalidades

- 🌧️ **Monitoramento em Tempo Real** - Acompanhamento contínuo das condições meteorológicas
- 📍 **Sistema de Favoritos** - Adicione bairros de interesse para monitoramento personalizado
- 📧 **Notificações por Email** - Alertas automáticos sobre condições críticas
- 📱 **SMS via WhatsApp** - Notificações instantâneas no seu celular
- 🚨 **Alertas Inteligentes** - Sistema que identifica padrões de risco de enchente
- 🎨 **Interface Intuitiva** - Dashboard responsivo e amigável

## 🏗️ Arquitetura

### Server
- **Runtime**: [Bun](https://bun.sh/) - JavaScript runtime ultrarrápido
- **Framework**: [Elysia](https://elysiajs.com/) - Framework web TypeScript de alta performance

### Website  
- **Framework**: [React](https://react.dev/) - Biblioteca para interfaces de usuário
- **Build Tool**: [Vite](https://vitejs.dev/) - Ferramenta de build moderna e rápida
- **Package Manager**: [npm](https://www.npmjs.com/) - Gerenciador de pacotes

### Infraestrutura
- **Monorepo**: [Turborepo](https://turbo.build/) - Sistema de build de alta performance
- **Package Manager**: [pnpm](https://pnpm.io/) - Gerenciador de pacotes eficiente
- **Deploy**: [Pulumi](https://www.pulumi.com/) - Infraestrutura como código

## 🚀 Começando

### Pré-requisitos

```bash
# Instalar Node.js e npm
# Baixe em: https://nodejs.org/
```

#### Instalar Bun
```bash
curl -fsSL https://bun.sh/install | bash
```

#### Instalar pnpm
```bash
npm install -g pnpm
````

### Instalação

- Clone o repositório

- Instale as dependências

```bash
pnpm install
```

### Configure as variáveis de ambiente

#### Copie os arquivos de exemplo

```bash
cp .env.example .env
```

#### Configure suas chaves de API
#### - API de clima
#### - Credenciais de email
#### - Token do WhatsApp
#### - Configurações do banco de dados

Execute o projeto

```bash
pnpm run dev
```

```
📁 Estrutura do Projeto
weather-sync/
├── apps/
│   ├── server/           # API Elysia + Bun
│   └── website/          # React + Vite
├── packages/
│   ├── shared/           # Tipos e utilitários compartilhados
│   └── config/           # Configurações do projeto
├── infra/                # Configurações Pulumi
├── turbo.json           # Configuração Turborepo
├── package.json
└── pnpm-workspace.yaml
```
