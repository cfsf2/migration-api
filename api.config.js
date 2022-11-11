module.exports = {
  apps: [
    {
      name: "Farmageo-Api",
      script: "./build/server.js",
      watch: false,
      restart: true,
      env: {
        NODE_ENV: "development",
      },
    },
  ],
};
