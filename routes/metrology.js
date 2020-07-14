const db = require('../db')
const config = require('../config')
const fs = require('fs')
const eventlog = require('./eventlog')

const __staticFolder =  config.__staticFolder;
const __docFolder =   config.__docFolder;
const __pathToDoc =   config.__pathToDoc;

const metrologies = function(request, response, next){
    let idEq = request.params.idEq;

       db.query(`SELECT met.* FROM Metrology met
    INNER JOIN Equipment eq 
    ON eq.id_eq = met.id_eq_equipment
    WHERE id_eq_equipment = $1:: INT`, [idEq !== '' ? idEq : 0], function(err, result){
        if (err){
          return next(err)
        }
            response.status(200).send(result.rows);
       })
}
const insMetrology = async function(request, response, next){
    let metrologyData = request.body.metrologyData;
    let userId = request.headers.userid;
    let funId = metrologyData.funId !== '' ? metrologyData.funId : 3;
    try {
        let result = await db.query(`INSERT INTO Metrology (recdate, attestatdate, eqenable, m_type, atttype, id_eq_equipment, atestatend, atestatnum, protocol_date, protocol_num)
        VALUES ($1::DATE, $2::DATE, $3::INT, $4::INT, $5::INT, $6::INT, $7::DATE, $8::VARCHAR(45), $9::DATE, $10::VARCHAR(45))
        RETURNING id_metr`, [metrologyData.recDate !== '' ? new Date(metrologyData.recDate) : null, 
            metrologyData.attDate !== '' ? new Date(metrologyData.attDate) : null, 
            metrologyData.eqEnable ? 1 : 0, 
            metrologyData.M_Type.id && metrologyData.M_Type.id !== ''  ? metrologyData.M_Type.id : null, 
            metrologyData.attType.id && metrologyData.attType.id !== '' ? metrologyData.attType.id : null, 
            metrologyData.idEq ? metrologyData.idEq : null, 
            metrologyData.attEnd !== '' ? new Date(metrologyData.attEnd) : null,
            metrologyData.attNum && metrologyData.attNum !== ''  ? metrologyData.attNum : null,
            metrologyData.protocolDate !== '' ? new Date(metrologyData.protocolDate) : null, 
            metrologyData.protocolNum && metrologyData.protocolNum !== ''  ? metrologyData.protocolNum : null]);
         
        let idMet = result.rows[0].id_metr;
        response.status(201).send({idMet: idMet})

        let newResult = await db.query(`SELECT * FROM Metrology  WHERE id_metr = $1::INT`, [idMet]);
        let newValue = newResult.rows.length > 0 ? newResult.rows[0] : {};
  
        let eventData = {
          eventTypeId: eventlog.eventType.INSERT,
          userId: userId,
          funId: funId,
          entityId: idMet,
          newValue: JSON.stringify(newValue),
          oldValue: JSON.stringify({})
        }
        eventlog.insEventLog(eventData)

    } catch (err) {return next(err)}

}
const updMetrology = async function(request, response, next){
    let idMet = request.params.idMet;
    let metrologyData = request.body.metrologyData;
    let userId = request.headers.userid;
    let funId = metrologyData.funId !== '' ? metrologyData.funId : 3;
    try {
        let oldResult = await  db.query(`SELECT * FROM Metrology  WHERE id_metr = $1::INT`, [idMet !== '' ? idMet : 0]);

        await db.query(`UPDATE Metrology 
        SET recdate = $1::DATE,
        attestatdate = $2::DATE, 
        eqenable = $3::INT, 
        m_type = $4::INT,
        atttype =  $5::INT,
        atestatend = $6::DATE,
        atestatnum =  $7::VARCHAR(45),
        protocol_date = $8::DATE, 
        protocol_num =  $9::VARCHAR(45)
        WHERE id_metr = $10:: INT`, [
            metrologyData.recDate !== '' ? new Date(metrologyData.recDate) : null, 
            metrologyData.attDate !== '' ? new Date(metrologyData.attDate) : null, 
            metrologyData.eqEnable ? 1 : 0,
            metrologyData.M_Type.id && metrologyData.M_Type.id !== '' ? metrologyData.M_Type.id : null,
            metrologyData.attType.id && metrologyData.attType.id !== '' ? metrologyData.attType.id : null,
            metrologyData.attEnd !== '' ? new Date(metrologyData.attEnd) : null, 
            metrologyData.attNum && metrologyData.attNum !== ''  ? metrologyData.attNum : null,
            metrologyData.protocolDate !== '' ? new Date(metrologyData.protocolDate) : null, 
            metrologyData.protocolNum && metrologyData.protocolNum !== ''  ? metrologyData.protocolNum : null,
            idMet !== '' ? idMet : 0 ]);


        response.status(200).send(`Обновлена аттестация/поверка: ${idMet}`);

        let newResult = await  db.query(`SELECT * FROM Metrology  WHERE id_metr = $1::INT`, [idMet !== '' ? idMet : 0]);
        let oldValue = oldResult.rows.length > 0 ? oldResult.rows[0] : {};
        let newValue = newResult.rows.length > 0 ? newResult.rows[0] : {};
        let eventData = {
          eventTypeId: eventlog.eventType.UPDATE,
          userId: userId,
          funId: funId,
          entityId: idMet,
          newValue: JSON.stringify(newValue),
          oldValue: JSON.stringify(oldValue)
        }
        eventlog.insEventLog(eventData)

    } catch (err) {return next(err)}
}
const delMetrology = async function(request, response, next){
    let idMet = request.params.idMet;
    let userId = request.headers.userid;
    let funId = 3;

    try{
      //удаляем документы
     
      db.query(`SELECT TRIM(att_docpath) AS att_docpath, TRIM(protocol_docpath) AS protocol_docpath 
      FROM Metrology WHERE id_metr = $1::INT`, [idMet !== '' ? idMet : 0], function(err, result) {
        if (err){ return next(err)}
        if(result.rows.length > 0){
            let att_docpath = result.rows[0].att_docpath;
            let protocol_docpath = result.rows[0].protocol_docpath;
            let pathToDoc = process.cwd() + __staticFolder;

            if (att_docpath && att_docpath !== '')
                fs.unlink(pathToDoc + att_docpath, (err) => { if (err) { /*return next(err); */} })

            if (protocol_docpath && protocol_docpath !== '')
                fs.unlink(pathToDoc + protocol_docpath, (err) => { if (err) { /*return next(err); */} })
        }
    })
      //удаляем аттестацию/поверку
      let newResult = await  db.query(`SELECT * FROM Metrology  WHERE id_metr = $1::INT`, [idMet !== '' ? idMet : 0]);
      await db.query(`DELETE FROM Metrology WHERE id_metr = $1:: INT`, [idMet !== '' ? idMet : 0]);

      response.status(200).send(`Удалена аттестация/поверка: ${idMet}`);

      let newValue = newResult.rows.length > 0 ? newResult.rows[0] : {};
      let eventData = {
        eventTypeId: eventlog.eventType.DELETE,
        userId: userId,
        funId: funId,
        entityId: idMet,
        newValue: JSON.stringify(newValue),
        oldValue: JSON.stringify({})
      }
      eventlog.insEventLog(eventData);
  
    } catch (err) {return next(err)}
}

const addDoc = async function(request, response, next){
    let idMet = request.query.idMet;
    let docTypeId = request.query.docTypeId;
    let file = request.file;
    let docPath = __docFolder + '/' + file.filename;

    if (docTypeId == 1){//атт
        try {
            
            let result = await db.query(`SELECT TRIM(att_docpath) AS att_docpath 
            FROM Metrology 
            WHERE id_metr = $1::INT`, [idMet !== '' ? idMet : 0]);
            
            if(result.rows.length > 0){

                let oldDocPath = result.rows[0].att_docpath;
                
                let pathToDoc = process.cwd() + __staticFolder;

                if (oldDocPath && oldDocPath !== '')
                    fs.unlink(pathToDoc + oldDocPath, (err) => { if (err) {/*return next(err); */} })
            }

        result = await db.query(`UPDATE Metrology 
            SET att_docpath = $1::VARCHAR(255)
            WHERE id_metr = $2::INT`, [docPath,
                idMet !== '' ? idMet : 0]);
        
        response.send({filename: docPath});
        } catch (err) {return next(err)}  
    }
    else if(docTypeId == 2){//протокол
        try {
            let result = await db.query(`SELECT TRIM(protocol_docpath) AS protocol_docpath 
            FROM Metrology 
            WHERE id_metr = $1::INT`, [idMet !== '' ? idMet : 0]);

            if(result.rows.length > 0){

            let oldDocPath = result.rows[0].protocol_docpath;
            let pathToDoc = process.cwd() + __staticFolder;

            if (oldDocPath && oldDocPath !== '')
                fs.unlink(pathToDoc + oldDocPath, (err) => { if (err) { /*return next(err);*/ } })
            }

        result = await db.query(`UPDATE Metrology 
            SET protocol_docpath = $1::VARCHAR(255)
            WHERE id_metr = $2::INT`, [docPath,
                idMet !== '' ? idMet : 0]);
        
        response.send({filename: docPath});
        } catch (err) {return next(err)}  
    }
} 
 const delDoc = function(request, response, next){
         var idMet = request.body.idMet;
        response.sendStatus(200);      
     }

module.exports = {addDoc, delDoc, metrologies, insMetrology, updMetrology, delMetrology}


