const app = require('./src/app');
const http = require('http');
const srv = http.createServer(app);
srv.listen(3099, () => {
  const body = JSON.stringify({identifier:'admin@ecole.com',password:'Admin123!'});
  const req = http.request({hostname:'localhost',port:3099,path:'/api/v1/auth/login',method:'POST',headers:{'Content-Type':'application/json','Content-Length':Buffer.byteLength(body)}}, (res) => {
    let d = '';
    res.on('data', c => d += c);
    res.on('end', () => { console.log('Status:', res.statusCode); console.log('Body:', d); srv.close(); process.exit(0); });
  });
  req.write(body);
  req.end();
});
