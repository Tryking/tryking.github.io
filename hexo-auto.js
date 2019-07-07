var exec = require('child_process').exec;
var cmd = 'nohup hexo s -p 8080 >> server.log &';

exec(cmd, function(error, stdout, stderr) {  
  process.exit(0);
});
