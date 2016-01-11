var fs = require('fs');

fs.readFile('province_data.json', function(err, data) {
	var data = JSON.parse(data);

	data = data.root.province;

	var result = [];

	for (var i = 0; i < data.length; i++) {
		result.push(data[i].name);
	};

	fs.writeFile(`./city/province.json`, 
		JSON.stringify({
				code: 0,
				data: result
			}),
		()=>{}
		);

	// for (var i = data.length - 1; i >= 0; i--) {
	// 	fs.writeFile(`./city/${data[i].name}.json`, 
	// 		JSON.stringify({
	// 			code: 0,
	// 			data: data[i].city
	// 		}),
	// 		function(err){
	// 			console.log(err);
	// 			// console.log(`${data[i].name} 处理完毕`);
	// 		});
	// };
})