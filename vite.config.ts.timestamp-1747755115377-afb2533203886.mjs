// vite.config.ts
import { defineConfig } from "file:///D:/Dols%20Capital/app-dols-capital-AI/node_modules/vite/dist/node/index.js";
import react from "file:///D:/Dols%20Capital/app-dols-capital-AI/node_modules/@vitejs/plugin-react/dist/index.mjs";
import express from "file:///D:/Dols%20Capital/app-dols-capital-AI/node_modules/express/index.js";
import multer from "file:///D:/Dols%20Capital/app-dols-capital-AI/node_modules/multer/index.js";
import fs from "fs";
var configureServer = () => {
  const app = express();
  const upload = multer({ dest: "uploads/" });
  app.post("/api/upload", upload.single("file"), (req, res) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: "Nenhum arquivo enviado" });
      }
      const fileId = `file_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      const fileUrl = `https://firebasestorage.googleapis.com/v0/b/dols-capital-app.appspot.com/o/marketing/${fileId}`;
      fs.unlinkSync(file.path);
      return res.status(200).json({
        id: fileId,
        name: file.originalname,
        category: req.body.category || "default",
        fileUrl,
        fileType: file.mimetype,
        fileSize: file.size,
        createdAt: /* @__PURE__ */ new Date(),
        createdBy: req.body.userEmail || "unknown",
        description: req.body.description || "",
        storagePath: `marketing/${req.body.category || "default"}/${fileId}`,
        isPersisted: true
      });
    } catch (error) {
      console.error("Erro no upload:", error);
      return res.status(500).json({ error: "Erro ao processar o upload" });
    }
  });
  return app;
};
var vite_config_default = defineConfig({
  plugins: [react()],
  server: {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    },
    proxy: {
      "/api": {
        target: "http://localhost:5173",
        changeOrigin: true,
        configure: (proxy, options) => {
          proxy.on("error", (err, req, res) => {
            console.error("Erro no proxy:", err);
          });
        }
      }
    },
    middlewares: [configureServer()]
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxEb2xzIENhcGl0YWxcXFxcYXBwLWRvbHMtY2FwaXRhbC1BSVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcRG9scyBDYXBpdGFsXFxcXGFwcC1kb2xzLWNhcGl0YWwtQUlcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L0RvbHMlMjBDYXBpdGFsL2FwcC1kb2xzLWNhcGl0YWwtQUkvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0J1xuaW1wb3J0IGV4cHJlc3MgZnJvbSAnZXhwcmVzcydcbmltcG9ydCBtdWx0ZXIgZnJvbSAnbXVsdGVyJ1xuaW1wb3J0IHsgY3JlYXRlUHJveHlNaWRkbGV3YXJlIH0gZnJvbSAnaHR0cC1wcm94eS1taWRkbGV3YXJlJ1xuaW1wb3J0IGZzIGZyb20gJ2ZzJ1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcblxuLy8gQ29uZmlndXJhXHUwMEU3XHUwMEUzbyBwYXJhIG8gc2Vydmlkb3IgZGUgQVBJXG5jb25zdCBjb25maWd1cmVTZXJ2ZXIgPSAoKSA9PiB7XG4gIGNvbnN0IGFwcCA9IGV4cHJlc3MoKVxuICBjb25zdCB1cGxvYWQgPSBtdWx0ZXIoeyBkZXN0OiAndXBsb2Fkcy8nIH0pXG4gIFxuICAvLyBFbmRwb2ludCBwYXJhIHVwbG9hZCBkZSBhcnF1aXZvc1xuICBhcHAucG9zdCgnL2FwaS91cGxvYWQnLCB1cGxvYWQuc2luZ2xlKCdmaWxlJyksIChyZXEsIHJlcykgPT4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBmaWxlID0gcmVxLmZpbGVcbiAgICAgIGlmICghZmlsZSkge1xuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oeyBlcnJvcjogJ05lbmh1bSBhcnF1aXZvIGVudmlhZG8nIH0pXG4gICAgICB9XG4gICAgICBcbiAgICAgIC8vIFNpbXVsYXIgdW0gdXBsb2FkIGJlbS1zdWNlZGlkb1xuICAgICAgY29uc3QgZmlsZUlkID0gYGZpbGVfJHtEYXRlLm5vdygpfV8ke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cmluZygyLCAxNSl9YFxuICAgICAgY29uc3QgZmlsZVVybCA9IGBodHRwczovL2ZpcmViYXNlc3RvcmFnZS5nb29nbGVhcGlzLmNvbS92MC9iL2RvbHMtY2FwaXRhbC1hcHAuYXBwc3BvdC5jb20vby9tYXJrZXRpbmcvJHtmaWxlSWR9YFxuICAgICAgXG4gICAgICAvLyBSZW1vdmVyIG8gYXJxdWl2byB0ZW1wb3JcdTAwRTFyaW9cbiAgICAgIGZzLnVubGlua1N5bmMoZmlsZS5wYXRoKVxuICAgICAgXG4gICAgICAvLyBSZXRvcm5hciBkYWRvcyBzaW11bGFkb3NcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDIwMCkuanNvbih7XG4gICAgICAgIGlkOiBmaWxlSWQsXG4gICAgICAgIG5hbWU6IGZpbGUub3JpZ2luYWxuYW1lLFxuICAgICAgICBjYXRlZ29yeTogcmVxLmJvZHkuY2F0ZWdvcnkgfHwgJ2RlZmF1bHQnLFxuICAgICAgICBmaWxlVXJsOiBmaWxlVXJsLFxuICAgICAgICBmaWxlVHlwZTogZmlsZS5taW1ldHlwZSxcbiAgICAgICAgZmlsZVNpemU6IGZpbGUuc2l6ZSxcbiAgICAgICAgY3JlYXRlZEF0OiBuZXcgRGF0ZSgpLFxuICAgICAgICBjcmVhdGVkQnk6IHJlcS5ib2R5LnVzZXJFbWFpbCB8fCAndW5rbm93bicsXG4gICAgICAgIGRlc2NyaXB0aW9uOiByZXEuYm9keS5kZXNjcmlwdGlvbiB8fCAnJyxcbiAgICAgICAgc3RvcmFnZVBhdGg6IGBtYXJrZXRpbmcvJHtyZXEuYm9keS5jYXRlZ29yeSB8fCAnZGVmYXVsdCd9LyR7ZmlsZUlkfWAsXG4gICAgICAgIGlzUGVyc2lzdGVkOiB0cnVlXG4gICAgICB9KVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvIG5vIHVwbG9hZDonLCBlcnJvcilcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRXJybyBhbyBwcm9jZXNzYXIgbyB1cGxvYWQnIH0pXG4gICAgfVxuICB9KVxuICBcbiAgcmV0dXJuIGFwcFxufVxuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbcmVhY3QoKV0sXG4gIHNlcnZlcjoge1xuICAgIGhlYWRlcnM6IHtcbiAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nOiAnKicsXG4gICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcyc6ICdHRVQsIFBPU1QsIFBVVCwgREVMRVRFLCBPUFRJT05TJyxcbiAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJzogJ0NvbnRlbnQtVHlwZSwgQXV0aG9yaXphdGlvbicsXG4gICAgfSxcbiAgICBwcm94eToge1xuICAgICAgJy9hcGknOiB7XG4gICAgICAgIHRhcmdldDogJ2h0dHA6Ly9sb2NhbGhvc3Q6NTE3MycsXG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJlOiAocHJveHksIG9wdGlvbnMpID0+IHtcbiAgICAgICAgICAvLyBVc2FyIG8gc2Vydmlkb3IgRXhwcmVzcyBwYXJhIGxpZGFyIGNvbSBhcyByZXF1aXNpXHUwMEU3XHUwMEY1ZXMgcGFyYSAvYXBpXG4gICAgICAgICAgcHJveHkub24oJ2Vycm9yJywgKGVyciwgcmVxLCByZXMpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm8gbm8gcHJveHk6JywgZXJyKVxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIG1pZGRsZXdhcmVzOiBbY29uZmlndXJlU2VydmVyKCldXG4gIH1cbn0pIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFtUyxTQUFTLG9CQUFvQjtBQUNoVSxPQUFPLFdBQVc7QUFDbEIsT0FBTyxhQUFhO0FBQ3BCLE9BQU8sWUFBWTtBQUVuQixPQUFPLFFBQVE7QUFJZixJQUFNLGtCQUFrQixNQUFNO0FBQzVCLFFBQU0sTUFBTSxRQUFRO0FBQ3BCLFFBQU0sU0FBUyxPQUFPLEVBQUUsTUFBTSxXQUFXLENBQUM7QUFHMUMsTUFBSSxLQUFLLGVBQWUsT0FBTyxPQUFPLE1BQU0sR0FBRyxDQUFDLEtBQUssUUFBUTtBQUMzRCxRQUFJO0FBQ0YsWUFBTSxPQUFPLElBQUk7QUFDakIsVUFBSSxDQUFDLE1BQU07QUFDVCxlQUFPLElBQUksT0FBTyxHQUFHLEVBQUUsS0FBSyxFQUFFLE9BQU8seUJBQXlCLENBQUM7QUFBQSxNQUNqRTtBQUdBLFlBQU0sU0FBUyxRQUFRLEtBQUssSUFBSSxDQUFDLElBQUksS0FBSyxPQUFPLEVBQUUsU0FBUyxFQUFFLEVBQUUsVUFBVSxHQUFHLEVBQUUsQ0FBQztBQUNoRixZQUFNLFVBQVUsd0ZBQXdGLE1BQU07QUFHOUcsU0FBRyxXQUFXLEtBQUssSUFBSTtBQUd2QixhQUFPLElBQUksT0FBTyxHQUFHLEVBQUUsS0FBSztBQUFBLFFBQzFCLElBQUk7QUFBQSxRQUNKLE1BQU0sS0FBSztBQUFBLFFBQ1gsVUFBVSxJQUFJLEtBQUssWUFBWTtBQUFBLFFBQy9CO0FBQUEsUUFDQSxVQUFVLEtBQUs7QUFBQSxRQUNmLFVBQVUsS0FBSztBQUFBLFFBQ2YsV0FBVyxvQkFBSSxLQUFLO0FBQUEsUUFDcEIsV0FBVyxJQUFJLEtBQUssYUFBYTtBQUFBLFFBQ2pDLGFBQWEsSUFBSSxLQUFLLGVBQWU7QUFBQSxRQUNyQyxhQUFhLGFBQWEsSUFBSSxLQUFLLFlBQVksU0FBUyxJQUFJLE1BQU07QUFBQSxRQUNsRSxhQUFhO0FBQUEsTUFDZixDQUFDO0FBQUEsSUFDSCxTQUFTLE9BQU87QUFDZCxjQUFRLE1BQU0sbUJBQW1CLEtBQUs7QUFDdEMsYUFBTyxJQUFJLE9BQU8sR0FBRyxFQUFFLEtBQUssRUFBRSxPQUFPLDZCQUE2QixDQUFDO0FBQUEsSUFDckU7QUFBQSxFQUNGLENBQUM7QUFFRCxTQUFPO0FBQ1Q7QUFFQSxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTLENBQUMsTUFBTSxDQUFDO0FBQUEsRUFDakIsUUFBUTtBQUFBLElBQ04sU0FBUztBQUFBLE1BQ1AsK0JBQStCO0FBQUEsTUFDL0IsZ0NBQWdDO0FBQUEsTUFDaEMsZ0NBQWdDO0FBQUEsSUFDbEM7QUFBQSxJQUNBLE9BQU87QUFBQSxNQUNMLFFBQVE7QUFBQSxRQUNOLFFBQVE7QUFBQSxRQUNSLGNBQWM7QUFBQSxRQUNkLFdBQVcsQ0FBQyxPQUFPLFlBQVk7QUFFN0IsZ0JBQU0sR0FBRyxTQUFTLENBQUMsS0FBSyxLQUFLLFFBQVE7QUFDbkMsb0JBQVEsTUFBTSxrQkFBa0IsR0FBRztBQUFBLFVBQ3JDLENBQUM7QUFBQSxRQUNIO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQztBQUFBLEVBQ2pDO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
