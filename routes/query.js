const db = require('../db')

const queryList = function(request, response, next){
    db.query(`SELECT q.*,
        TRIM(eq.eqname) AS eqname, TRIM(eq.card_num) AS card_num, TRIM(eq.inv_num) AS inv_num, eq.id_dicdev_dicdevision, 
        TRIM(c.con_num) AS con_num, c.con_date, 
        TRIM(u.us_surname) as us_surname, TRIM(u.us_name) as us_name, TRIM(u.us_patname) as us_patname
     FROM eqQuery q
        LEFT JOIN Equipment eq ON eq.Id_Eq = q.id_eq_equipment
        LEFT JOIN Contract c ON c.id_Cont = q.id_cont_contract 
        LEFT JOIN Users u ON u.id_user = q.id_user_users`, [], function(err, result){
          if (err){
            return next(err)
          }
                response.status(200).send(result.rows);
            
         })
}

const queries = function(request, response, next){
    let queryData = request.query;
         db.query(`SELECT q.* 
            FROM eqQuery q
            WHERE id_eq_equipment = $1::INT AND 
            date_start <= $2::TIMESTAMP AND date_end >= $3::TIMESTAMP`, [queryData.idEq !== '' ? queryData.idEq : 0,
                queryData.dateTo !== '' ? new Date(queryData.dateTo) : null,
                queryData.dateFrom !== '' ? new Date(queryData.dateFrom) : null], function(err, result){
           if (err){
             return next(err)
           }
                 response.status(200).send(result.rows);
            
          })
}
const queriesDate = function(request, response, next){
    let queryData = request.query;
         db.query(`SELECT id_eqquery, date_start, date_end
            FROM eqQuery 
            WHERE id_eq_equipment = $1::INT`, [queryData.idEq !== '' ? queryData.idEq : 0], function(err, result){
           if (err){
             return next(err)
           }
                 response.status(200).send(result.rows);
            
          })
}
const insQuery = function(request, response, next){
    let queryData = request.body.queryData;
    db.query(`INSERT INTO eqQuery (q_date, date_start, date_end, q_type, id_eq_equipment, id_cont_contract, id_user_users)
      VALUES (CURRENT_DATE, $1::TIMESTAMP, $2::TIMESTAMP, $3::INT, $4::INT, $5::INT, $6::INT)
      RETURNING id_eqquery`, [
        queryData.dateStart !== '' ? new Date(queryData.dateStart) : null, 
        queryData.dateEnd !== '' ? new Date(queryData.dateEnd) : null, 
        queryData.Q_type !== '' ? queryData.Q_type : null, 
        queryData.eqId !== '' ? queryData.eqId : null, 
        queryData.conId !== '' ? queryData.conId : null, 
        queryData.userId !== '' ? queryData.userId : null], function(err, result){
        if (err){
          return next(err)
      }
      let idQuery = result.rows[0].id_eqquery;
        response.status(201).send({idQuery: idQuery})
    })
}
const updQuery = function(request, response, next){
  let queryId = request.params.idQuery;
  let queryData = request.body.queryData;

  db.query(`UPDATE eqQuery 
    SET q_date = CURRENT_DATE, date_start = $1::TIMESTAMP, date_end = $2::TIMESTAMP, q_type = $3::INT, 
    id_eq_equipment = $4::INT, id_cont_contract = $5::INT, id_user_users = $6::INT
    WHERE id_eqquery = $7:: INT`, [queryData.dateStart !== '' ? new Date(queryData.dateStart) : null, 
    queryData.dateEnd !== '' ? new Date(queryData.dateEnd) : null, 
    queryData.Q_type !== '' ? queryData.Q_type : null, 
    queryData.eqId !== '' ? queryData.eqId : null, 
    queryData.conId !== '' ? queryData.conId : null, 
    queryData.userId !== '' ? queryData.userId : null,
    queryId !== '' ? queryId : 0], function(err, result){
    if (err){
      return next(err)
  }
  response.status(200).send(`Обновлена заявка: ${queryId}`);
})
}
const delQuery = function(request, response, next){
    let queryId = request.params.idQuery;
    db.query(`DELETE FROM eqQuery WHERE id_eqquery = $1:: INT`, [queryId !== '' ? queryId : 0], function(err, result){
          if (err){
            return next(err)
          }
        response.status(200).send(`Удалена заявка: ${queryId}`);
    })
}

module.exports = {queryList, queries, queriesDate, insQuery, updQuery, delQuery}
