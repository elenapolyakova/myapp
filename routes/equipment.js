const db = require('../db')
const fs = require('fs')
const config = require('../config')

const __staticFolder =  config.__staticFolder;
const __imageFolder = config.__imageFolder;
const __docFolder =   config.__docFolder;

const toFloat = val => {
  if (val && val !== '')
    return parseFloat(val.toString().replace(',','.'));
  return null;
}

const equipments = function(request, response, next){

  db.query(`SELECT eq.*,
  null as repDate, 0 as eqCostKeep, 0 as eqWorkLoad, att.AttDate as eqAtt, null as eqVer
   FROM Equipment eq
   LEFT JOIN 
      (SELECT MAX(AttestatDate) as AttDate, Id_Eq_Equipment, attType
        FROM Metrology 
        GROUP BY Id_Eq_Equipment, attType
        HAVING attType = 1) att
    ON eq.Id_Eq = att.Id_Eq_Equipment
   LEFT JOIN 
      (SELECT MAX(AtestatEnd) as AttEnd, Id_Eq_Equipment, attType
       FROM Metrology 
        GROUP BY Id_Eq_Equipment, attType
        HAVING attType = 2) ver
    ON eq.Id_Eq = ver.Id_Eq_Equipment`, [], function(err, result){
        if (err){
          return next(err)
        }
              response.status(200).send(result.rows);
          
       })
    
}


const insEquipment = function(request, response, next){
  let equipmentData = request.body.equipmentData;
  db.query(`INSERT INTO equipment (eqname, card_num, inv_num, eqpurpose, eqpassport, fact_num,
      fact_date, eqproducer, reg_num, condition, is_ready, mpi_mai, price_date, 
      eqprice, remark, hourprice, totime, minworktime, id_respose_man, id_dicdev_dicdevision, 
      id_eqtype_diceqtype, eq_place, eq_comdate, eq_lastmod)
    VALUES ($1::VARCHAR(255), $2::VARCHAR(50),  $3::VARCHAR(45), $4::TEXT, $5::TEXT, $6::VARCHAR(45),
      $7::DATE, $8::VARCHAR(255), $9::VARCHAR(45), $10::TEXT, $11::INT, $12::INT, $13::DATE, 
      $14::FLOAT, $15::TEXT, $16::FLOAT, $17::INT, $18::INT, $19::INT, $20::INT, 
      $21::INT, $22::TEXT, $23::DATE, CURRENT_DATE
    )
    RETURNING id_eq`, [equipmentData.eqName, equipmentData.cardNum, equipmentData.invNum,  equipmentData.eqPurpose,  equipmentData.eqPassport, equipmentData.factNum,
      equipmentData.factDate !=='' ? new Date(equipmentData.factDate) : null,  equipmentData.eqProducer,  equipmentData.regNum,  equipmentData.eqTechState, 
      equipmentData.eqReadiness !=='' ? equipmentData.eqReadiness : null, equipmentData.eqCalInterval!=='' ? equipmentData.eqCalInterval : null, 
      equipmentData.resValueDate !== '' ? new Date(equipmentData.resValueDate) : null, toFloat(equipmentData.eqResValue), 
      equipmentData.eqNote,  toFloat(equipmentData.costLaborTime), equipmentData.TOInterval !== '' ? equipmentData.TOInterval : null,  
      equipmentData.orderTime !== '' ? equipmentData.orderTime : null,  equipmentData.responsible  !== '' ? equipmentData.responsible : null, 
      equipmentData.devision !== '' ? equipmentData.devision : null, equipmentData.eqType !== '' ? equipmentData.eqType : null,  
      equipmentData.eqLocation,  equipmentData.comDate !== '' ? new Date (equipmentData.comDate) : null], function(err, result){
      if (err){
        return next(err)
    }
    let idEq = result.rows[0].id_eq;
	  response.status(201).send({idEq: idEq})
  })
    
  }
  const updEquipment = function(request, response, next){
    let idEq = request.params.idEq;
    let equipmentData = request.body.equipmentData;

    db.query(`UPDATE equipment 
      SET eqname = $1::VARCHAR(255), card_num = $2::VARCHAR(50), inv_num = $3::VARCHAR(45), eqpurpose = $4::TEXT, eqpassport = $5::TEXT,
       fact_num =  $6::VARCHAR(45), fact_date = $7::DATE, eqproducer = $8::VARCHAR(255), reg_num =  $9::VARCHAR(45), condition = $10::TEXT,
       is_ready = $11::INT, mpi_mai = $12::INT, price_date = $13::DATE, eqprice = $14::FLOAT, remark = $15::TEXT, hourprice = $16::FLOAT, 
       totime = $17::INT, minworktime = $18::INT, id_respose_man = $19::INT, id_dicdev_dicdevision = $20::INT, 
      id_eqtype_diceqtype =  $21::INT, eq_place = $22::TEXT, eq_comdate = $23::DATE, eq_lastmod = CURRENT_DATE
      WHERE id_eq = $24:: INT`, [equipmentData.eqName, equipmentData.cardNum, equipmentData.invNum,  equipmentData.eqPurpose,  equipmentData.eqPassport, equipmentData.factNum,
      equipmentData.factDate !=='' ? new Date(equipmentData.factDate) : null,  equipmentData.eqProducer,  equipmentData.regNum,  equipmentData.eqTechState, 
      equipmentData.eqReadiness !=='' ? equipmentData.eqReadiness : null, equipmentData.eqCalInterval!=='' ? equipmentData.eqCalInterval : null, 
      equipmentData.resValueDate !== '' ? new Date(equipmentData.resValueDate) : null, toFloat(equipmentData.eqResValue), 
      equipmentData.eqNote,  toFloat(equipmentData.costLaborTime), equipmentData.TOInterval !== '' ? equipmentData.TOInterval : null,  
      equipmentData.orderTime !== '' ? equipmentData.orderTime : null,  equipmentData.responsible  !== '' ? equipmentData.responsible : null, 
      equipmentData.devision !== '' ? equipmentData.devision : null, equipmentData.eqType !== '' ? equipmentData.eqType : null,  
      equipmentData.eqLocation,  equipmentData.comDate !== '' ? new Date (equipmentData.comDate) : null, idEq !== '' ? idEq : 0], function(err, result){
      if (err){
        return next(err)
    }
    response.status(200).send(`Обновлено оборудование: ${idEq}`);
  })
}
  

const delEquipment = async function(request, response, next){
  let idEq = request.params.idEq;
  let pathToDoc = process.cwd() + __staticFolder;
  var pathToImage = process.cwd() + __staticFolder;
  try{
    //удаляем документы с сервера
    let docList = await db.query(`SELECT TRIM(docbodypath) AS docbodypath FROM Docs WHERE id_eq_equipment = $1::INT`, [idEq !== '' ? idEq : 0]);
    docList.rows.forEach(item => {
           fs.unlink(pathToDoc + item.docbodypath, (err) => {
            if (err) { next(err); }
          })
    });
      //удаляем фотографии с сервера
    let photoList = await db.query(`SELECT TRIM(photopath) AS photopath FROM photo WHERE id_eq_equipment = $1::INT`, [idEq !== '' ? idEq : 0]);
    photoList.rows.forEach(item => {
            fs.unlink(pathToImage + item.photopath, (err) => {
              if (err) { next(err); }
            })
    });
    //удаляем оборудование
    //todo проверить каскадное удаление
    await db.query(`DELETE FROM equipment WHERE id_eq = $1:: INT`, [idEq !== '' ? idEq : 0]);

    response.status(200).send(`Удалено оборудование: ${idEq}`);
  } catch (err) {return next(err)}
}


  const getDocList =  function(request, response, next){
    let idEq = request.params.idEq;
    db.query(`SELECT id_doc, doctype, TRIM(docbodypath) AS docbodypath
      FROM Docs 
      WHERE id_eq_equipment = $1::INT`, [idEq !== '' ? idEq : 0], function(err, result){
        if (err){
          return next(err)
        }
      let docList = [];
      result.rows.forEach(item => {
        let docItem = {
          idDoc: item.id_doc,
          path:  item.docbodypath,
          docTypeId: item.doctype
        }
        docList.push(docItem);
      })
      response.status(200).send(docList);
    })
    
  }
  const getImageList = function(request, response, next)
  {
    let idEq = request.params.idEq;
    db.query(`SELECT id_photo, TRIM(photopath) AS photopath
      FROM Photo 
      WHERE id_eq_equipment = $1::INT AND phototype = 1`, [idEq !== '' ? idEq : 0], function(err, result){
        if (err){
          return next(err)
        }
      let imgList = [];
      result.rows.forEach(item => {
        let imgItem = {
          idPhoto: item.id_photo,
          path:  item.photopath
        }
        imgList.push(imgItem);
      })
      response.status(200).send(imgList);
    })

  }
  const getLocList = function(request, response, next)
  {
    let idEq = request.params.idEq;
    db.query(`SELECT id_photo, TRIM(photopath) AS photopath
      FROM Photo 
      WHERE id_eq_equipment = $1::INT AND phototype = 2`, [idEq !== '' ? idEq : 0], function(err, result){
        if (err){
          return next(err)
        }
      let imgList = [];
      result.rows.forEach(item => {
        let imgItem = {
          idPhoto: item.id_photo,
          path:  item.photopath
        }
        imgList.push(imgItem);
      })
      response.status(200).send(imgList);
    })
  }
  
const addDoc = function(request, response, next){
    let file = request.file;
    let idEq = request.query.idEq;
    let docTypeId = request.query.docTypeId;
    let docPath = __docFolder + '/' + file.filename;
    db.query(`INSERT INTO Docs(doctype, docbodypath, id_eq_equipment)
    VALUES ($1::INT, $2::VARCHAR(255), $3::int)
    RETURNING id_doc`, [docTypeId, docPath,  idEq], function(err, result){
        if (err){
          return next(err)
        }

        let idDoc = result.rows[0].id_doc;
        response.send({filename: docPath, idDoc: idDoc});
      });
  }

 const delDoc = function(request, response, next){
    var idDoc = request.body.idDoc;
    db.query(`DELETE FROM Docs WHERE id_doc = $1::INT`, [idDoc], function(err, result){
      if (err){
        return next(err)
      }
      response.sendStatus(200);   
    });     
}

const addImage = function(request, response, next){
    let idEq = request.query.idEq;
    let phTypeId = request.query.phTypeId;
    let file = request.file;
    let imagePath =__imageFolder + '/' + file.filename;

    db.query(`INSERT INTO Photo (phototype, photopath, id_eq_equipment)
    VALUES ($1::INT, $2::VARCHAR(255), $3::int)
    RETURNING id_photo`, [phTypeId, imagePath, idEq], function(err, result){
        if (err){
          return next(err)
        }
        let idPhoto = result.rows[0].id_photo;
        response.send({filename: imagePath, idPhoto: idPhoto});
      });
}

const delImage = function(request, response, next){
    var idPhoto = request.body.idPhoto;
    db.query(`DELETE FROM Photo WHERE id_photo = $1::INT`, [idPhoto], function(err, result){
        if (err){
          return next(err)
        }
        response.sendStatus(200);   
      });
}
    

module.exports = {equipments, insEquipment, updEquipment, delEquipment, addDoc, delDoc, addImage, delImage, getDocList, getImageList, getLocList }