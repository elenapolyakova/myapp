const db = require('../db')
const config = require('../config')
const fs = require('fs')

const __staticFolder =  config.__staticFolder;
const __docFolder =   config.__docFolder;
const __pathToDoc =   config.__pathToDoc;

const repairs = function(request, response, next){
  let idEq = request.params.idEq;
  db.query(`SELECT r.*
  FROM Repair r 
  WHERE r.id_eq_equipment = $1::INT`, [idEq !== '' ? idEq : 0], function(err, result){
    if (err){
      return next(err)
    }
          response.status(200).send(result.rows);
      
   })
  }
  const insRepair = function(request, response, next){
      let repairData = request.body.repairData;
      db.query(`INSERT INTO Repair (rep_date, rep_type, rep_maintenance, id_eq_equipment, rep_masterfio)
        VALUES ($1::DATE, $2::INT, $3::VARCHAR(255), $4::INT, $5::VARCHAR(255))
        RETURNING id_rep`, [ repairData.repDate !== '' ? new Date(repairData.repDate) : null, 
        repairData.repType !== '' ? repairData.repType : null,
        repairData.execWork,
        repairData.idEq !== '' ? repairData.idEq : 0 ,
        repairData.repMasterFIO], function(err, result){
      if (err){
          return next(err)
      }
      let idRep = result.rows[0].id_rep;
        response.status(201).send({idRep: idRep})
    })

  }
  const updRepair = function(request, response, next){
    let idRep = request.params.idRep;
    let repairData = request.body.repairData;

    db.query(`UPDATE Repair 
      SET rep_date = $1::DATE, 
      rep_type = $2::INT, 
      rep_maintenance = $3::VARCHAR(255),
      rep_masterfio = $4::VARCHAR(255)
      WHERE id_rep = $5:: INT`, [repairData.repDate !== '' ? new Date(repairData.repDate) : null, 
      repairData.repType !== '' ? repairData.repType : null,
      repairData.execWork,
      repairData.repMasterFIO,
      idRep !== '' ? idRep : 0 ], function(err, result){
        if (err){
          return next(err)
      }
  
      response.status(200).send(`Обновлен ремонт: ${idRep}`);
    })

  }
  const delRepair = async function(request, response, next){
    let idRep = request.params.idRep;
    try{
      //удаляем документ
     
      db.query(`SELECT TRIM(act_docpath) AS act_docpath 
      FROM repair 
      WHERE id_rep = $1::INT`, [idRep !== '' ? idRep : 0], function(err, result) {
      if (err){ return next(err)}
      if(result.rows.length > 0){

        let docPath = result.rows[0].act_docpath;
        let pathToDoc = process.cwd() + __staticFolder;

        if (docPath && docPath !== '')
          fs.unlink(pathToDoc + docPath, (err) => { if (err) { /*return next(err);*/ } })
      }
     })
      //удаляем ремонт

      await db.query(`DELETE FROM repair 
      WHERE id_rep = $1:: INT`, [idRep !== '' ? idRep : 0]);
  
      response.status(200).send(`Удален ремонт: ${idRep}`);
    } catch (err) {return next(err)}
    
  }
  const addDoc = async function(request, response, next){
    let idRep = request.query.idRep;
    let file = request.file;
    let docPath = __docFolder + '/' + file.filename;

    try {
        let result = await db.query(`SELECT TRIM(act_docpath) AS act_docpath 
        FROM repair 
        WHERE id_rep = $1::INT`, [idRep !== '' ? idRep : 0]);

        if(result.rows.length > 0){

          let oldDocPath = result.rows[0].act_docpath;
          let pathToDoc = process.cwd() + __staticFolder;

          if (oldDocPath && oldDocPath !== '')
            fs.unlink(pathToDoc + oldDocPath, (err) => { if (err) { /*return next(err);*/ } })
        }

      result = await db.query(`UPDATE repair 
        SET act_docpath = $1::VARCHAR(255)
        WHERE id_rep = $2::INT`, [docPath,
          idRep !== '' ? idRep : 0]);
    
      response.send({filename: docPath});
    } catch (err) {return next(err)}    
 }
 const delDoc = function(request, response, next){
        var idRep = request.body.idRep;

        db.query(`UPDATE repair
        SET act_docpath = null
        WHERE id_rep = $1::INT`, [idRep !== '' ? idRep : 0], function(err, result){
          if (err){
            return next(err)
          }
          response.sendStatus(200);   
        });        
     }
  module.exports = {repairs, insRepair, updRepair, delRepair, addDoc, delDoc}