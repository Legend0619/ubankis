import dns from "node:dns";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Resolve "localhost" to IPv4 so the dev server is reachable where IPv6 loopback isn't.
dns.setDefaultResultOrder("ipv4first");

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { "/api": "http://localhost:4000" },
  },
});
