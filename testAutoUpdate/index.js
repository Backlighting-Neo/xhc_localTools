var process = require('child_process');
var http = require('http');

var gitPull = () => {
	return new Promise((resolve, reject)=>{
		process.exec('cd /home/git/FETest && git pull origin master',
			(error, stdout, stderr) => {
				error?reject(stderr):resolve(stdout);
			})
	});
}

var lock = false;

http.createServer((req, res) => {
	if(lock){res.end();return;}
	lock = true;
	gitPull().then((stdout)=>{
		res.end(stdout);
		lock = false;
	});
}).listen(3000, "0.0.0.0");
console.log('Auto Git Pull Server has been listen at port 3000');
