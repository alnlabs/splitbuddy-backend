    module.exports = {
      apps : [{
        name   : "splitbuddy",
        script : "dist/main.js",
        node_args: "-r dotenv/config", // This is crucial for dotenv
        env: {
          NODE_ENV: "production",
        }
      }]
    };