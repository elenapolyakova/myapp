const db = require('../db')

const toFloat = val => {
    if (val && val !== '')
      return parseFloat(val.toString().replace(',','.'));
    return null;
  }

  const insConsum = function(request, response, next){
      let consumData = request.body.consumData;
      db.query(`INSERT INTO Consum (DT, I_A, I_B, I_C, V_A, V_B, V_C, id_eq_equipment, id_reg_reg)
        VALUES ($1::TIMESTAMP, $2::FLOAT, $3::FLOAT, $4::FLOAT, $5::FLOAT, $6::FLOAT, $7::FLOAT, $8::INT, $9::INT)
        RETURNING id_cons`, [ 
            //consumData.dt !=='' ? new Date(consumData.dt) : null,
            new Date(),
            toFloat(consumData.I_A),
            toFloat(consumData.I_B),
            toFloat(consumData.I_C),
            toFloat(consumData.V_A),
            toFloat(consumData.V_B),
            toFloat(consumData.V_C),
            consumData.Eq, 
            consumData.Reg], function(err, result){
      if (err){
          return next(err)
      }
      let id_cons = result.rows[0].id_cons;
        response.status(201).send({id_cons: id_cons})
    })

  }
  module.exports = {insConsum}