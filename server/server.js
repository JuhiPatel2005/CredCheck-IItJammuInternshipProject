import dns from 'dns'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, '.env') })

if (process.env.DNS_SERVERS) {
  dns.setServers(process.env.DNS_SERVERS.split(','))
}

import app from './app.js'
import mongoose from 'mongoose'

const PORT = process.env.PORT || 5000
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/credcheck'

const startServer = async () => {
  try {
    await mongoose.connect(MONGO_URI)
    const server = app.listen(PORT, () => {
      console.log(`Database connected successfully and server is running on http://localhost:${PORT}`)
    })

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`\n❌  Oops! Port ${PORT} is already in use.\n`)
        console.error('   Something is already listening on this port.')
        console.error('   Try one of these fixes:\n')
        console.error('   1) Kill the old process:')
        console.error(`      Windows   ->  netstat -ano | findstr :${PORT}  (note the PID)`)
        console.error(`                  taskkill /F /PID <PID>`)
        console.error(`      macOS/Linux ->  lsof -i :${PORT}  (note the PID)`)
        console.error(`                  kill -9 <PID>`)
        console.error('   2) Or change the port in server/.env:')
        console.error('      Edit  PORT=5000  ->  PORT=5001')
        console.error('      (Also update VITE_API_URL in client/.env)')
        process.exit(1)
      }

      console.error('Unexpected server error:', error.message)
      process.exit(1)
    })
  } catch (error) {
    console.error('Database connection failed:', error.message)
    process.exit(1)
  }
}

startServer()
