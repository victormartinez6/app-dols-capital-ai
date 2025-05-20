// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import express from "express";
import multer from "multer";
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlUm9vdCI6ICJEOlxcRG9scyBDYXBpdGFsXFxhcHAtZG9scy1jYXBpdGFsLUFJXFwiLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkQ6XFxcXERvbHMgQ2FwaXRhbFxcXFxhcHAtZG9scy1jYXBpdGFsLUFJXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxEb2xzIENhcGl0YWxcXFxcYXBwLWRvbHMtY2FwaXRhbC1BSVxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovRG9scyUyMENhcGl0YWwvYXBwLWRvbHMtY2FwaXRhbC1BSS92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnXG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnXG5pbXBvcnQgZXhwcmVzcyBmcm9tICdleHByZXNzJ1xuaW1wb3J0IG11bHRlciBmcm9tICdtdWx0ZXInXG5pbXBvcnQgeyBjcmVhdGVQcm94eU1pZGRsZXdhcmUgfSBmcm9tICdodHRwLXByb3h5LW1pZGRsZXdhcmUnXG5pbXBvcnQgZnMgZnJvbSAnZnMnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuXG4vLyBDb25maWd1cmFcdTAwRTdcdTAwRTNvIHBhcmEgbyBzZXJ2aWRvciBkZSBBUElcbmNvbnN0IGNvbmZpZ3VyZVNlcnZlciA9ICgpID0+IHtcbiAgY29uc3QgYXBwID0gZXhwcmVzcygpXG4gIGNvbnN0IHVwbG9hZCA9IG11bHRlcih7IGRlc3Q6ICd1cGxvYWRzLycgfSlcbiAgXG4gIC8vIEVuZHBvaW50IHBhcmEgdXBsb2FkIGRlIGFycXVpdm9zXG4gIGFwcC5wb3N0KCcvYXBpL3VwbG9hZCcsIHVwbG9hZC5zaW5nbGUoJ2ZpbGUnKSwgKHJlcSwgcmVzKSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGZpbGUgPSByZXEuZmlsZVxuICAgICAgaWYgKCFmaWxlKSB7XG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwMCkuanNvbih7IGVycm9yOiAnTmVuaHVtIGFycXVpdm8gZW52aWFkbycgfSlcbiAgICAgIH1cbiAgICAgIFxuICAgICAgLy8gU2ltdWxhciB1bSB1cGxvYWQgYmVtLXN1Y2VkaWRvXG4gICAgICBjb25zdCBmaWxlSWQgPSBgZmlsZV8ke0RhdGUubm93KCl9XyR7TWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyaW5nKDIsIDE1KX1gXG4gICAgICBjb25zdCBmaWxlVXJsID0gYGh0dHBzOi8vZmlyZWJhc2VzdG9yYWdlLmdvb2dsZWFwaXMuY29tL3YwL2IvZG9scy1jYXBpdGFsLWFwcC5hcHBzcG90LmNvbS9vL21hcmtldGluZy8ke2ZpbGVJZH1gXG4gICAgICBcbiAgICAgIC8vIFJlbW92ZXIgbyBhcnF1aXZvIHRlbXBvclx1MDBFMXJpb1xuICAgICAgZnMudW5saW5rU3luYyhmaWxlLnBhdGgpXG4gICAgICBcbiAgICAgIC8vIFJldG9ybmFyIGRhZG9zIHNpbXVsYWRvc1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoMjAwKS5qc29uKHtcbiAgICAgICAgaWQ6IGZpbGVJZCxcbiAgICAgICAgbmFtZTogZmlsZS5vcmlnaW5hbG5hbWUsXG4gICAgICAgIGNhdGVnb3J5OiByZXEuYm9keS5jYXRlZ29yeSB8fCAnZGVmYXVsdCcsXG4gICAgICAgIGZpbGVVcmw6IGZpbGVVcmwsXG4gICAgICAgIGZpbGVUeXBlOiBmaWxlLm1pbWV0eXBlLFxuICAgICAgICBmaWxlU2l6ZTogZmlsZS5zaXplLFxuICAgICAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKCksXG4gICAgICAgIGNyZWF0ZWRCeTogcmVxLmJvZHkudXNlckVtYWlsIHx8ICd1bmtub3duJyxcbiAgICAgICAgZGVzY3JpcHRpb246IHJlcS5ib2R5LmRlc2NyaXB0aW9uIHx8ICcnLFxuICAgICAgICBzdG9yYWdlUGF0aDogYG1hcmtldGluZy8ke3JlcS5ib2R5LmNhdGVnb3J5IHx8ICdkZWZhdWx0J30vJHtmaWxlSWR9YCxcbiAgICAgICAgaXNQZXJzaXN0ZWQ6IHRydWVcbiAgICAgIH0pXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm8gbm8gdXBsb2FkOicsIGVycm9yKVxuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdFcnJvIGFvIHByb2Nlc3NhciBvIHVwbG9hZCcgfSlcbiAgICB9XG4gIH0pXG4gIFxuICByZXR1cm4gYXBwXG59XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtyZWFjdCgpXSxcbiAgc2VydmVyOiB7XG4gICAgaGVhZGVyczoge1xuICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbic6ICcqJyxcbiAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJzogJ0dFVCwgUE9TVCwgUFVULCBERUxFVEUsIE9QVElPTlMnLFxuICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnOiAnQ29udGVudC1UeXBlLCBBdXRob3JpemF0aW9uJyxcbiAgICB9LFxuICAgIHByb3h5OiB7XG4gICAgICAnL2FwaSc6IHtcbiAgICAgICAgdGFyZ2V0OiAnaHR0cDovL2xvY2FsaG9zdDo1MTczJyxcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgICBjb25maWd1cmU6IChwcm94eSwgb3B0aW9ucykgPT4ge1xuICAgICAgICAgIC8vIFVzYXIgbyBzZXJ2aWRvciBFeHByZXNzIHBhcmEgbGlkYXIgY29tIGFzIHJlcXVpc2lcdTAwRTdcdTAwRjVlcyBwYXJhIC9hcGlcbiAgICAgICAgICBwcm94eS5vbignZXJyb3InLCAoZXJyLCByZXEsIHJlcykgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRXJybyBubyBwcm94eTonLCBlcnIpXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgbWlkZGxld2FyZXM6IFtjb25maWd1cmVTZXJ2ZXIoKV1cbiAgfVxufSkiXSwKICAibWFwcGluZ3MiOiAiO0FBQW1TLFNBQVMsb0JBQW9CO0FBQ2hVLE9BQU8sV0FBVztBQUNsQixPQUFPLGFBQWE7QUFDcEIsT0FBTyxZQUFZO0FBRW5CLE9BQU8sUUFBUTtBQUlmLElBQU0sa0JBQWtCLE1BQU07QUFDNUIsUUFBTSxNQUFNLFFBQVE7QUFDcEIsUUFBTSxTQUFTLE9BQU8sRUFBRSxNQUFNLFdBQVcsQ0FBQztBQUcxQyxNQUFJLEtBQUssZUFBZSxPQUFPLE9BQU8sTUFBTSxHQUFHLENBQUMsS0FBSyxRQUFRO0FBQzNELFFBQUk7QUFDRixZQUFNLE9BQU8sSUFBSTtBQUNqQixVQUFJLENBQUMsTUFBTTtBQUNULGVBQU8sSUFBSSxPQUFPLEdBQUcsRUFBRSxLQUFLLEVBQUUsT0FBTyx5QkFBeUIsQ0FBQztBQUFBLE1BQ2pFO0FBR0EsWUFBTSxTQUFTLFFBQVEsS0FBSyxJQUFJLENBQUMsSUFBSSxLQUFLLE9BQU8sRUFBRSxTQUFTLEVBQUUsRUFBRSxVQUFVLEdBQUcsRUFBRSxDQUFDO0FBQ2hGLFlBQU0sVUFBVSx3RkFBd0YsTUFBTTtBQUc5RyxTQUFHLFdBQVcsS0FBSyxJQUFJO0FBR3ZCLGFBQU8sSUFBSSxPQUFPLEdBQUcsRUFBRSxLQUFLO0FBQUEsUUFDMUIsSUFBSTtBQUFBLFFBQ0osTUFBTSxLQUFLO0FBQUEsUUFDWCxVQUFVLElBQUksS0FBSyxZQUFZO0FBQUEsUUFDL0I7QUFBQSxRQUNBLFVBQVUsS0FBSztBQUFBLFFBQ2YsVUFBVSxLQUFLO0FBQUEsUUFDZixXQUFXLG9CQUFJLEtBQUs7QUFBQSxRQUNwQixXQUFXLElBQUksS0FBSyxhQUFhO0FBQUEsUUFDakMsYUFBYSxJQUFJLEtBQUssZUFBZTtBQUFBLFFBQ3JDLGFBQWEsYUFBYSxJQUFJLEtBQUssWUFBWSxTQUFTLElBQUksTUFBTTtBQUFBLFFBQ2xFLGFBQWE7QUFBQSxNQUNmLENBQUM7QUFBQSxJQUNILFNBQVMsT0FBTztBQUNkLGNBQVEsTUFBTSxtQkFBbUIsS0FBSztBQUN0QyxhQUFPLElBQUksT0FBTyxHQUFHLEVBQUUsS0FBSyxFQUFFLE9BQU8sNkJBQTZCLENBQUM7QUFBQSxJQUNyRTtBQUFBLEVBQ0YsQ0FBQztBQUVELFNBQU87QUFDVDtBQUVBLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVMsQ0FBQyxNQUFNLENBQUM7QUFBQSxFQUNqQixRQUFRO0FBQUEsSUFDTixTQUFTO0FBQUEsTUFDUCwrQkFBK0I7QUFBQSxNQUMvQixnQ0FBZ0M7QUFBQSxNQUNoQyxnQ0FBZ0M7QUFBQSxJQUNsQztBQUFBLElBQ0EsT0FBTztBQUFBLE1BQ0wsUUFBUTtBQUFBLFFBQ04sUUFBUTtBQUFBLFFBQ1IsY0FBYztBQUFBLFFBQ2QsV0FBVyxDQUFDLE9BQU8sWUFBWTtBQUU3QixnQkFBTSxHQUFHLFNBQVMsQ0FBQyxLQUFLLEtBQUssUUFBUTtBQUNuQyxvQkFBUSxNQUFNLGtCQUFrQixHQUFHO0FBQUEsVUFDckMsQ0FBQztBQUFBLFFBQ0g7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0EsYUFBYSxDQUFDLGdCQUFnQixDQUFDO0FBQUEsRUFDakM7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
