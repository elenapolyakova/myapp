const db = require('../db')
const passwordHash = require('password-hash')

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

const insUser = async function(request, response, next){
   let userData = request.body.userData;

   let pswd = passwordHash.generate(userData.password);
   try{
      let result = await db.query(`INSERT INTO Users (us_surname, us_name, us_patname, us_login, us_pswd, us_company, us_position, id_dicdev_dicdevision, us_email)
      VALUES ($1::VARCHAR(250), $2::VARCHAR(250), $3::VARCHAR(250), $4::VARCHAR(100), $5::VARCHAR(100), $6::VARCHAR(250), $7::VARCHAR(250), $8::INT, $9::VARCHAR(250))
      RETURNING id_user`, 
      [userData.surname,
        userData.name,
        userData.patname,
        userData.login,
        pswd,
        userData.company,
        userData.position,
        userData.devision!== '' ? userData.devision : null,
        userData.email
      ]);
      let idUser = result.rows[0].id_user;


      result = await db.query(`INSERT INTO Role_Users (id_user, id_role)
        SELECT $1::INT, CAST(regexp_split_to_table($2::VARCHAR(255), ',') AS INT)`, 
        [ idUser,
          userData.roleList
        ]);

        response.status(201).send({idUser: idUser, pswd: pswd})
      } catch (err) {return next(err)}

}
const updUser = async function(request, response, next){

   let idUser = request.params.idUser;
   let userData = request.body.userData;
   let pswd = userData.password !== '' ? passwordHash.generate(userData.password) : userData.oldPassword;
  try{
     let result = await db.query(`UPDATE Users 
     SET us_surname = $1::VARCHAR(250), us_name = $2::VARCHAR(250), us_patname = $3::VARCHAR(250), us_login = $4::VARCHAR(100), 
     us_pswd = $5::VARCHAR(100), us_company = $6::VARCHAR(250), us_position = $7::VARCHAR(250), id_dicdev_dicdevision = $8::INT,
     us_email = $9::VARCHAR(250)
     WHERE id_user = $10::INT`, 
     [userData.surname,
       userData.name,
       userData.patname,
       userData.login,
       pswd,
       userData.company,
       userData.position,
       userData.devision!== '' ? userData.devision : null,
       userData.email,
       idUser !== '' ? idUser : 0
     ]);

     result = await db.query(`DELETE FROM Role_Users WHERE id_user = $1::INT`, 
     [idUser !== '' ? idUser : 0 ]);

     result = await db.query(`INSERT INTO Role_Users (id_user, id_role)
       SELECT $1::INT, CAST(regexp_split_to_table($2::VARCHAR(255), ',') AS INT)`, 
       [ idUser !== '' ? idUser : 0,
         userData.roleList
       ]);

       response.status(200).send({pswd: pswd});
     } catch (err) {return next(err)}
    
}


const delUser = async function(request, response, next){
  let idUser = request.params.idUser;
  try{
      let result = await db.query(`DELETE FROM Role_Users WHERE id_user = $1:: INT`, [idUser !== '' ? idUser : 0]);

      result = await db.query(`DELETE FROM Users WHERE id_user = $1:: INT`, [idUser !== '' ? idUser : 0]);

      response.status(200).send(`Удалён пользователь: ${idUser}`);

  } catch (err) {return next(err)}
}
 
module.exports = {users, insUser, updUser, delUser, roles}

