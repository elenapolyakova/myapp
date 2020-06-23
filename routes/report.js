const db = require('../db')

const eqCard = function(request, response, next){
    let idEq = request.params.idEq;

    db.query(`SELECT eq.id_eq, eq.id_dicdev_dicdevision,
    eq.card_num,
    eq.eqname,
    eq.eqpurpose, 
    eq.inv_num, 
    eq.fact_num, 
    eq.fact_date, 
    eq.eq_comdate, 
    rep.rep_date,
    eq.is_ready, 
    passport.id_doc as passIdDoc,
    passport.docbodypath as passPath,
    manual.id_doc as manualIdDoc,
    manual.docbodypath as manualPath,
    attestat.id_doc as attIdDoc,
    attestat.docbodypath as attPath,
    met.metDate,
    eq.mpi_mai, 
    eq.eq_place, 
    eq.id_respose_man,
    eq.eqpassport
    FROM Equipment eq
    LEFT JOIN 
        (SELECT MAX(rep_date) as rep_date, Id_Eq_Equipment
        FROM repair 
        GROUP BY Id_Eq_Equipment) rep
    ON eq.Id_Eq = rep.Id_Eq_Equipment
    LEFT JOIN Docs passport
    ON eq.Id_Eq = passport.Id_Eq_Equipment and passport.doctype = 1
    LEFT JOIN Docs manual
    ON eq.Id_Eq = manual.Id_Eq_Equipment and manual.doctype = 2
    LEFT JOIN Docs attestat
    ON eq.Id_Eq = attestat.Id_Eq_Equipment and attestat.doctype = 6
     LEFT JOIN 
        (SELECT MAX(AtestatEnd) as metDate, Id_Eq_Equipment
         FROM Metrology 
         GROUP BY Id_Eq_Equipment) met
      ON eq.Id_Eq = met.Id_Eq_Equipment
      WHERE eq.Id_Eq = $1:: INT`, [ idEq !== '' ? idEq : 0], function(err, result){
          if (err){
            return next(err)
          }
                response.status(200).send(result.rows);
            
         })
      
  }
  
const eqSummary = function(request, response, next){

    db.query(`SELECT dev.id_dicDev as id, 
    TRIM(dev.DevName) as devision_name,
    total.count,
    xmlelement(name root, xmlagg(ts.ts_xml ORDER BY dev.id_dicDev DESC)) AS techState
    FROM DicDevision dev
    LEFT JOIN 
        (SELECT COUNT (Id_Eq) as count, id_dicdev_dicdevision
        FROM Equipment
        GROUP BY id_dicdev_dicdevision) total
    ON dev.id_dicDev = total.id_dicdev_dicdevision
    LEFT JOIN 
    (
        SELECT xmlelement(name techState_item,
                    xmlattributes(ts_item.count as count, ts_item.is_ready as is_ready)) AS ts_xml,
             ts_item.id_dicdev_dicdevision
        FROM
           (
                SELECT COUNT (Id_Eq) as count, id_dicdev_dicdevision, is_ready
                FROM Equipment
                GROUP BY id_dicdev_dicdevision, is_ready
                order by is_ready desc
            ) ts_item

    )ts
    ON dev.id_dicDev = ts.id_dicdev_dicdevision
    GROUP BY dev.id_dicDev,  devision_name, total.count`, [], function(err, result){
          if (err){
            return next(err)
          }
                response.status(200).send(result.rows);
            
         })
      
  }
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
 
module.exports = {eqCard, eqSummary}