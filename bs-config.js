module.exports = {
    proxy: "localhost:5000", // The address of your Node.js app
    files: [
        "*/**/*.js",
        "*/**/*.html",
        "*/**/*.css"
    ], // Files to watch
    port: 4000, // Port to serve Browsersync
    reloadDelay: 0 // Delay before reloading after changes
};
