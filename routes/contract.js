const db = require('../db')

const contracts = function(request, response, next){
    db.query(`SELECT c.*
    FROM Contract c `, [], function(err, result){
      if (err){
        return next(err)
      }
            response.status(200).send(result.rows);
        
     })
}

const insContract = function(request, response, next){
    let contractData = request.body.contractData;
    db.query(`INSERT INTO Contract (con_num, con_date, con_purpose)
      VALUES ($1::VARCHAR(255), $2::DATE, $3::VARCHAR(255))
      RETURNING id_cont`, [contractData.Num,
        contractData.Date !== '' ? new Date(contractData.Date) : null, 
        contractData.Purpose], function(err, result){
        if (err){
          return next(err)
      }
      let idContract = result.rows[0].id_cont;
        response.status(201).send({idContract: idContract})
    })
}
const updContract = function(request, response, next){
  let idContract = request.params.idContract;
  let contractData = request.body.contractData;
  db.query(`UPDATE Contract 
    SET con_num = $1::VARCHAR(255), 
    con_date = $2::DATE, 
    con_purpose = $3::VARCHAR(255)
    WHERE id_cont = $4:: INT`, [contractData.Num,
      contractData.Date !== '' ? new Date(contractData.Date) : null, 
      contractData.Purpose,
      idContract !== '' ? idContract : 0], function(err, result){
      if (err){
        return next(err)
    }

    response.status(200).send(`Обновлён договор: ${idContract}`);
  })
}

const uniteContract = async function(request, response, next){
  let idParentContract = request.params.idParentContract;
  let idContract = request.params.idContract;

  try {
  let result = await db.query(`UPDATE eqQuery 
    SET id_cont_contract = $1::INT
    WHERE id_cont_contract = $2:: INT`, [
      idParentContract !== '' ? idParentContract : 0,
      idContract !== '' ? idContract : 0])
    
  result = await db.query(`DELETE FROM Contract WHERE id_cont = $1:: INT`, [idContract !== '' ? idContract : 0])

    response.status(200).send(`Объединены договора: ${idParentContract} и ${idContract}`);
  }
  catch (err) {return next(err)}
}

const delContract = function(request, response, next){
  let idContract = request.params.idContract;
  db.query(`DELETE FROM Contract WHERE id_cont = $1:: INT`, [idContract !== '' ? idContract : 0], function(err, result){
        if (err){
          return next(err)
        }
      response.status(200).send(`Удалён договор: ${idContract}`);
  })
}

module.exports = {contracts, insContract, updContract, uniteContract, delContract}
