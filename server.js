const http = require("http");
const app = require("./server/app");

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`SERVER RUNNING ON PORT: ${PORT}`);
});
