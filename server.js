const http = require("http"),
      url = require("url"),
      path = require("path"),
      fs = require("fs");

const port = process.argv[3] || 8080,
      host = process.argv[2] || '0.0.0.0';

// Create HTTP server
http.createServer((request, response) => {
  const uri = url.parse(request.url).pathname,
        filename = path.join(process.cwd(), 'app', uri);
  
  console.log('🔄 Requested: ' + filename);
  
  if (!fs.existsSync(filename)) {
    throw404(response);
    console.warn('⚠ Requested file doesn\'t exist');
    return;
  }
  
  const info = fs.lstatSync(filename);
  
  try {
    if (info.isFile()) {
      const file = fs.readFileSync(filename, "binary");
      response.writeHead(200);
      response.write(file, "binary");
      response.end();
      console.log('✔ Answered with file: ' + filename);
    } else if (info.isDirectory()) {
      if (!fs.existsSync(filename + '/index.html')) {
        throw404(response);
        console.warn('⚠ Requested directory does not have index.html');
      }
      const file = fs.readFileSync(filename + '/index.html', "binary");
      response.writeHead(200);
      response.write(file, "binary");
      response.end();
      console.log('✔ Directory, answered with file: ' + filename + '/index.html');
    }
  } catch(err) {
    response.writeHead(500, {"Content-Type": "text/plain"});
    response.write(err + "\n");
    response.end();
  }
}).listen(port, host, null, () => console.info(`Server listening at ${host}:${port}`));

function throw404(response) {
  response.writeHead(404, {"Content-Type": "text/plain"});
  response.write("404 Not Found\n");
  response.end();
}