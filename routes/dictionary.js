const db = require('../db')
const dict = {}

const getDict = async function(request, response, next){
    
  try {
    let result = await db.query(`SELECT id_dicDev as id, TRIM(DevName) as name FROM DicDevision`, []);
    dict.divisionFullList = result.rows;

    result = await db.query(`SELECT distinct id_dicDev as id, TRIM(DevName) as name 
    FROM DicDevision dev
    INNER JOIN equipment eq 
    ON eq.id_dicdev_dicdevision = dev.id_dicDev`, []);
    dict.divisionList = result.rows;
    
    result = await db.query(`SELECT id_eqType as id, TRIM(EqTypeName) as name FROM DicEqType`, []);
    dict.eqTypeList = result.rows;
     
    result = await db.query(`SELECT id_user as id, TRIM(us_surname) as us_surname, TRIM(us_name) as us_name,
      TRIM(us_patname) as us_patname, TRIM(us_position) as us_position, id_dicdev_dicdevision, us_company FROM Users
      ORDER BY TRIM(us_surname), TRIM(us_name), TRIM(us_patname)`, []);
    dict.userList = result.rows;
    
    response.status(200).send(dict);  
          
  }
  catch (err) {return next(err)}
   
}

module.exports = {getDict}  