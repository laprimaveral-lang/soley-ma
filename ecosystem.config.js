module.exports = {
  apps: [{
    name: "soley",
    script: "server/dist/index.js",
    cwd: "/var/www/soley",
    env: {
      NODE_ENV: "production",
      PORT: 3000
    }
  }]
}
