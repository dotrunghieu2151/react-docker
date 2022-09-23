const ejs = require('ejs');
const fs = require('fs');
const path = require('path');
const os = require('os');

const nginxTemplateFilePath = path.join(__dirname, '..', 'templates', 'nginx.ejs');
const outputFilePath = path.join(__dirname, '..', 'output', 'default.conf');

const data = {
  scale: process.env.APP_SCALE || os.cpus().length,
  containerName: process.env.APP_CONTAINER_NAME,
  port: process.env.APP_PORT,
  webDomain: process.env.WEB_DOMAIN,
  enableSSL: process.env.NGINX_ENABLE_SSL,
  enableDHParam: process.env.NGINX_ENABLE_SSL_DHPARAM,
};

ejs.renderFile(nginxTemplateFilePath, data, {}, function (err, str) {
  if (err) {
    console.log(err)
    return;
  }
  fs.writeFileSync(outputFilePath, str);
}); 