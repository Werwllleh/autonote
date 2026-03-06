module.exports = {
  apps: [
    {
      name: "autonote-api",
      script: "apps/server/dist/src/main.js",
      cwd: "/home/alex/apps/main/autonote",
      env: {
        NODE_ENV: "production",
        PORT: 3001,
      },
      env_file: "apps/server/.env",
      instances: 1,
      autorestart: true,
      max_memory_restart: "512M",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      error_file: "logs/error.log",
      out_file: "logs/out.log",
      merge_logs: true,
    },
  ],
};
