module.exports = {
  apps: [
    {
      name: "soley",
      cwd: "/var/www/soley/server",
      script: "./dist/index.js",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "300M",
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      env: {
        NODE_ENV: "production",
        PORT: 3001
      }
    }
  ]
};