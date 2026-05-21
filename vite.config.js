import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

try {
  const src = "C:\\Users\\dell\\.gemini\\antigravity\\brain\\b401358c-c71e-4be1-be42-9e7332d357b8\\media__1778204193684.png";
  const dest = "./public/logo.png";
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log("Successfully copied custom logo to public/logo.png!");
  }
} catch (e) {
  // Silent fail if file doesn't exist or permissions error
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
})
