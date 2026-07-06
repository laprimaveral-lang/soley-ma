module.exports = {
  apps: [
    {
      name: "soley",
      cwd: "/var/www/soley/server",
      script: "./dist/index.js",
      env: {
        NODE_ENV: "production",
        PORT: 3001
      }
    }
  ]
};