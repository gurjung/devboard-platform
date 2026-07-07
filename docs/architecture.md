# DevBoard Architecture

## Overview

DevBoard is a project management platform for managing projects, tasks, and team collaboration.

## Tech Stack

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- PostgreSQL
- Prisma

## Application Structure

src/

- app → routes and layouts
- components → reusable UI components
- features → feature-specific logic
- hooks → custom React hooks
- lib → utilities and configurations

## Core Entities

User
└── Workspace
└── Project
└── Issue
└── Comment

## User Flow

Login
↓
Dashboard
↓
Workspace
↓
Project
↓
Issue Board
