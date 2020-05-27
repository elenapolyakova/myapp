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
    response.sendStatus(200); 
}
const delContract = function(request, response, next){
    response.sendStatus(200); 
}

module.exports = {contracts, insContract, updContract, delContract}
