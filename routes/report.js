const fs = require('fs')
var path = require('path');

// const mustache = require('mustache');
// var Promise = require('es6-promise').Promise;


// var options =  {//width: '50mm', height: '90mm',
// renderDelay: 1000
// };// require.resolve("../node_modules/phantomjs-prebuilt/bin/phantomjs")};
// const test = async function(request, response, next){

//     var view = {
//         title: "Joe",
//         calc: function () {
//           return 2 + 4;
//         }
//       };
//   //     const tmpl = fs.readFileSync(require.resolve('../template/test.html'), 'utf8')
//   //     const html = tmpl.replace('{{image}}','http://localhost:3001/src/logo.png');
  
//   //     //var report = mustache.render(tmpl, view);

    

//   //  // pdf.create(report, options).toFile('./report/test-' + Date.now() + '.pdf', function(err, res) {

//   //     pdf.create(html, options).toFile('./report/test-' + Date.now() + '.pdf', function(err, res) {

//   //       if (err) return console.log(err);

//          response.status(200).send();
//   //       console.log(res); // { filename: '/app/businesscard.pdf' }
//   //      });
//             // const html = tmpl.replace('{{image}}', `file://${require.resolve('../businesscard/image.png')}`)
//         // pdf.create(html, {width: '50mm', height: '90mm'}).toStream((err, stream) => {
//         //   if (err) return res.end(err.stack)
//         //   res.setHeader('Content-type', 'application/pdf')
//         //   stream.pipe(res)
//         // })
    
//  }
//  const testExcel =  function(request, response, next){
//   var xl = require('excel4node');
//   var wb = new xl.Workbook();
//   var ws = wb.addWorksheet('Sheet 1');
//   //var ws2 = wb.addWorksheet('Sheet 2');

// // // Create a reusable style
// // var style = wb.createStyle({
// //   font: {
// //     color: '#FF0800',
// //     size: 12,
// //   },
// //   numberFormat: '#,##0.00; (#,##0.00); -',
// // });
 
// // // Set value of cell A1 to 100 as a number type styled with paramaters of style
// // ws.cell(1, 1)
// //   .number(100)
// //   .style(style);
 
// // // Set value of cell B1 to 200 as a number type styled with paramaters of style
// // ws.cell(1, 2)
// //   .number(200)
// //   .style(style);
 
// // // Set value of cell C1 to a formula styled with paramaters of style
// // ws.cell(1, 3)
// //   .formula('A1 + B1')
// //   .style(style);
 
// // // Set value of cell A2 to 'string' styled with paramaters of style
// // ws.cell(2, 1)
// //   .string('string')
// //   .style(style);
 
// // // Set value of cell A3 to true as a boolean type styled with paramaters of style but with an adjustment to the font size.
// // ws.cell(3, 1)
// //   .bool(true)
// //   .style(style)
// //   .style({font: {size: 14}});

// ws.addImage({
//   image: fs.readFileSync(path.resolve(__dirname, '../tmp/image.png')),
//   name: 'logo', // name is not required param
//   type: 'picture',
//   position: {
//     type: 'absoluteAnchor',
//     x: '1in',
//     y: '2in',
//   },
// });

//   wb.write('ExcelFile2.xlsx', response);
//  }
 
// module.exports = {test, testExcel}