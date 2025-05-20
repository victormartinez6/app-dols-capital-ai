import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import express from 'express'
import multer from 'multer'
import { createProxyMiddleware } from 'http-proxy-middleware'
import fs from 'fs'
import path from 'path'

// Configuração para o servidor de API
const configureServer = () => {
  const app = express()
  const upload = multer({ dest: 'uploads/' })
  
  // Endpoint para upload de arquivos
  app.post('/api/upload', upload.single('file'), (req, res) => {
    try {
      const file = req.file
      if (!file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado' })
      }
      
      // Simular um upload bem-sucedido
      const fileId = `file_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
      const fileUrl = `https://firebasestorage.googleapis.com/v0/b/dols-capital-app.appspot.com/o/marketing/${fileId}`
      
      // Remover o arquivo temporário
      fs.unlinkSync(file.path)
      
      // Retornar dados simulados
      return res.status(200).json({
        id: fileId,
        name: file.originalname,
        category: req.body.category || 'default',
        fileUrl: fileUrl,
        fileType: file.mimetype,
        fileSize: file.size,
        createdAt: new Date(),
        createdBy: req.body.userEmail || 'unknown',
        description: req.body.description || '',
        storagePath: `marketing/${req.body.category || 'default'}/${fileId}`,
        isPersisted: true
      })
    } catch (error) {
      console.error('Erro no upload:', error)
      return res.status(500).json({ error: 'Erro ao processar o upload' })
    }
  })
  
  return app
}

export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5173',
        changeOrigin: true,
        configure: (proxy, options) => {
          // Usar o servidor Express para lidar com as requisições para /api
          proxy.on('error', (err, req, res) => {
            console.error('Erro no proxy:', err)
          })
        }
      }
    },
    middlewares: [configureServer()]
  }
})