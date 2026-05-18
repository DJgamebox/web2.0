const fs = require('fs');
const webDesc = JSON.parse(fs.readFileSync('./web-descriptions.json', 'utf-8'));
const map = {};
webDesc.forEach(item => {
  map[item.id] = item.description;
});
console.log('webDescMap 键类型:', typeof Object.keys(map)[0]);
console.log('1993 在 map 中:', 1993 in map);
console.log('"1993" 在 map 中:', '1993' in map);
console.log('map[1993] 长度:', map[1993]?.length);
console.log('map["1993"] 长度:', map["1993"]?.length);
