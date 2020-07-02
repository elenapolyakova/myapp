const db = require('../db')


const users = function(request, response, next){
    db.query(`SELECT u.*, 
    array_to_string(ARRAY(
      SELECT ru.id_role
      FROM Role_Users ru 
      WHERE u.id_user = ru.id_user
    ), ',', '*') as roleList
    FROM Users u `, [], function(err, result){
      if (err){
        return next(err)
      }
            response.status(200).send(result.rows);
        
     })
}
const roles = function(request, response, next){
  db.query(`SELECT r.* FROM Role r `, [], function(err, result){
    if (err){
      return next(err)
    }
          response.status(200).send(result.rows);
      
   })
}

const insUser = function(request, response, next){
   /* let contractData = request.body.contractData;
    db.query(`INSERT INTO Contract (con_num, con_date, con_purpose)
      VALUES ($1::VARCHAR(255), $2::DATE, $3::VARCHAR(255))
      RETURNING id_cont`, [contractData.Num,
        contractData.Date !== '' ? new Date(contractData.Date) : null, 
        contractData.Purpose], function(err, result){
        if (err){
          return next(err)
      }*/
      let idUser = 10000;//result.rows[0].id_cont;
        response.status(201).send({idUser: idUser})
   // })
}
const updUser = function(request, response, next){
  let idUser = request.params.idUser;
//   let contractData = request.body.contractData;
//   db.query(`UPDATE Contract 
//     SET con_num = $1::VARCHAR(255), 
//     con_date = $2::DATE, 
//     con_purpose = $3::VARCHAR(255)
//     WHERE id_cont = $4:: INT`, [contractData.Num,
//       contractData.Date !== '' ? new Date(contractData.Date) : null, 
//       contractData.Purpose,
//       idContract !== '' ? idContract : 0], function(err, result){
//       if (err){
//         return next(err)
//     }

    response.status(200).send(`Обновлён пользователь: ${idUser}`);
  //})
}


const delUser = function(request, response, next){
  let idUser = request.params.idUser;
  db.query(`DELETE FROM Users WHERE id_user = $1:: INT`, [idUser !== '' ? idUser : 0], function(err, result){
        if (err){
          return next(err)
        }
      response.status(200).send(`Удалён пользователь: ${idUser}`);
  })
}

module.exports = {users, insUser, updUser, delUser, roles}

