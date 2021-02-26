module.exports = {
  apps: {
    name: "eift-s",
    script: "./dist/index.js",
    watch: "./dist/index.js",
    log_date_format: "YYYY-MM-DD HH:mm:ss.SSS (ZZ)",
    log: true,
    env: {
      TZ: "Asia/Shanghai",
    },
  },
  deploy: {
    production: {
      user: "www-data",
      host: ["codeispoetry.tech"],
      ref: "origin/master",
      repo: "https://github.com/uicestone/eift-s",
      path: "/var/www/eift-s",
      "post-deploy": "yarn && pm2 startOrRestart ecosystem.config.js",
    },
  },
};
