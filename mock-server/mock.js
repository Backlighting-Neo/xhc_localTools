var Mock = require('mockjs')
var http = require('http');
var fs = require('fs');
var query = require("querystring");
var iconv = require('iconv-lite');

// Created by Backlighting @ 2015-11-9

var db_file = './mock-data/mock.json';

var uuid = function() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0,
      v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

http.createServer(function(req, res) {
  url = req.url;
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (url.startsWith('/mock')) {
    if (req.method == 'POST') {

      var postdata = "";
      req.addListener("data", function(postchunk) {
        postdata += postchunk;
      })
        //POST结束输出结果
      req.addListener("end", function() {
        var params = JSON.parse(postdata);
        
        var api_filename = uuid() + '.mock';
        var api_url = params.url + '';
        var api_name = params.apiname;
        if(!api_url.startsWith('/')) api_url='/'+api_url
        var api_content = params.content;

      	var WriteFile = function () {
      		fs.writeFile('mock-data/'+api_filename, api_content, function (err) {
      		  if (err) {
      		  	res.writeHead(500, {
      		  	  'Content-Type': 'text/plain;charset=utf-8'
      		  	});
      		  	res.end('Internal Server Error: Can not save mock file.');
      		  }
      		  else {
      		  	res.writeHead(200, {
      		  	  'Content-Type': 'text/json;charset=utf-8'
      		  	});
      		  	res.end('{"status":"sucess"}');
      		  }
      		});
      	}

        fs.readFile(db_file, function(err, data) {
        	if (err) {
        		// 读不到API数据库
        		res.writeHead(500, {
        		  'Content-Type': 'text/plain;charset=utf-8'
        		});
        		res.end('Internal Server Error: Can not read Data file. Please contact server administrator.');
        	}
        	else {
        		var json = JSON.parse(data);
        		var flag = false;

            for (var i = json.data.length - 1; i >= 0; i--) {
              item = json.data[i];
              if(item.url == api_url) {
                item.filename = api_filename;
                item.name = api_name;

                fs.writeFile(db_file, JSON.stringify(json), function() {
                  WriteFile();
                })
                
                flag = true;
                break;
              }
            };

        		if(!flag) {
        			json.data.push({
        				url: api_url,
        				filename: api_filename,
                name: api_name
        			});
              
        			fs.writeFile(db_file, JSON.stringify(json), function() {
        				WriteFile();
        			})
        		}

        	}
        });
      })

    } else {
      // 操作Mock模版必须使用POST
      if (url == '/mock/' || url == '/mock') {
        fs.readFile(db_file, function(err, data) {
        	if (err) {
        	  // 读不到API数据库
        	  res.writeHead(500, {
        	    'Content-Type': 'text/plain;charset=utf-8'
        	  });
        	  res.end('Internal Server Error: Can not read Data file. Please contact server administrator.');
        	} else {
        		res.writeHead(200, {
        		  'Content-Type': 'text/plain;charset=utf-8'
        		});
        		res.end(data);
        	}
        });
      }
      else {
        url = url.replace('/mock','');
        //============================
        fs.readFile(db_file, function(err, data) {
          if (err) {
            // 读不到API数据库
            res.writeHead(500, {
              'Content-Type': 'text/plain;charset=utf-8'
            });
            res.end('Internal Server Error: Can not read Data file. Please contact server administrator.');
          } else {
            var json = JSON.parse(data);

            for (var i = json.data.length - 1; i >= 0; i--) {
              item = json.data[i];
              if (url == item.url) {
                fs.readFile('mock-data/' + item.filename, function(mock_err, mock_data) {
                  if (mock_err) {
                    res.writeHead(500, {
                      'Content-Type': 'text/plain;charset=utf-8'
                    });
                    res.end('Internal Server Error: Mock File Read Failed. ');
                  } else {
                    try {
                      res.writeHead(200, {
                        'Content-Type': 'text/plain;charset=utf-8'
                      });
                      res.end(mock_data);
                    }
                    catch(err) {
                      res.writeHead(500, {
                        'Content-Type': 'text/plain;charset=utf-8'
                      });
                      res.end('Mock file can not be parse');
                    }
                  }
                })
                return;
              }
            }

            res.writeHead(404, {
              'Content-Type': 'text/plain;charset=utf-8'
            });
            res.end('Mock Not Found');

          }
        });


        //===============================
      }
    }
  } else {
    fs.readFile(db_file, function(err, data) {
      if (err) {
        // 读不到API数据库
        res.writeHead(500, {
          'Content-Type': 'text/plain;charset=utf-8'
        });
        res.end('Internal Server Error: Can not read Data file. Please contact server administrator.');
      } else {
        var json = JSON.parse(data);

        for (var i = json.data.length - 1; i >= 0; i--) {
          item = json.data[i];
          if (url == item.url) {
            fs.readFile('mock-data/' + item.filename, function(mock_err, mock_data) {
              if (mock_err) {
                res.writeHead(500, {
                  'Content-Type': 'text/plain;charset=utf-8'
                });
                res.end('Internal Server Error: Mock File Read Failed. ');
              } else {
              	try {
	                eval("var mock_data = " + mock_data);
	                var mock_json = Mock.mock(mock_data);
	                res.writeHead(200, {
	                  'Content-Type': 'text/plain;charset=utf-8'
	                });
                  console.log(mock_json);
	                res.end(JSON.stringify(mock_json));
              	}
              	catch(err) {
              		res.writeHead(500, {
              		  'Content-Type': 'text/plain;charset=utf-8'
              		});
              		res.end('Mock file can not be parse');
              	}
              }
            })
            return;
          }
        }

        res.writeHead(404, {
          'Content-Type': 'text/plain;charset=utf-8'
        });
        res.end('Mock Not Found');

      }
    });
  }

}).listen(1338, "0.0.0.0");

console.log(new Date());