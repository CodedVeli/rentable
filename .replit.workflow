# .replit.workflow - This defines the workflow for Replit

entrypoint = "server/index.ts"

[env]
VITE_APP_DOMAIN = "https://8080-replit-neon.app"

[commands]

[commands.Start]
name = "Start application"
onStartup = true
command = "npm run dev"

[commands.Start.environment]
NODE_ENV = "development"