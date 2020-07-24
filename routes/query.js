const db = require('../db')
const eventlog = require('./eventlog')
const mailer = require('../mailer')

const queryList = function(request, response, next){
    db.query(`SELECT q.*,
        TRIM(eq.eqname) AS eqname, TRIM(eq.card_num) AS card_num, TRIM(eq.inv_num) AS inv_num, eq.id_dicdev_dicdevision, 
        TRIM(c.con_num) AS con_num, c.con_date, 
        TRIM(u.us_surname) as us_surname, TRIM(u.us_name) as us_name, TRIM(u.us_patname) as us_patname
     FROM eqQuery q
        INNER JOIN Equipment eq ON eq.Id_Eq = q.id_eq_equipment
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
            INNER JOIN Equipment eq ON eq.Id_Eq = q.id_eq_equipment
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
const insQuery = async function(request, response, next){
    let userId = request.headers.userid;
    let queryData = request.body.queryData;
    let funId = queryData.funId !== '' ? queryData.funId : 1;
    try{
      let result = await db.query(`INSERT INTO eqQuery (q_date, date_start, date_end, q_type, id_eq_equipment, id_cont_contract, id_user_users)
      VALUES (CURRENT_DATE, $1::TIMESTAMP, $2::TIMESTAMP, $3::INT, $4::INT, $5::INT, $6::INT)
      RETURNING id_eqquery`, [
        queryData.dateStart !== '' ? new Date(queryData.dateStart) : null, 
        queryData.dateEnd !== '' ? new Date(queryData.dateEnd) : null, 
        queryData.Q_type !== '' ? queryData.Q_type : null, 
        queryData.eqId !== '' ? queryData.eqId : null, 
        queryData.conId !== '' ? queryData.conId : null, 
        queryData.userId !== '' ? queryData.userId : null]);
      
      let idQuery = result.rows[0].id_eqquery;
      response.status(201).send({idQuery: idQuery})

      let newResult = await db.query(`SELECT * FROM eqQuery  WHERE id_eqquery = $1::INT`, [idQuery]);
      let newValue = newResult.rows.length > 0 ? newResult.rows[0] : {};

      let eventData = {
        eventTypeId: eventlog.eventType.INSERT,
        userId: userId,
        funId: funId,
        entityId: idQuery,
        newValue: JSON.stringify(newValue),
        oldValue: JSON.stringify({})
      }
      eventlog.insEventLog(eventData)

  } catch (err) {return next(err)}

}
const updQuery = async function(request, response, next){
  
  let userId = request.headers.userid;
  let queryId = request.params.idQuery;
  let queryData = request.body.queryData;
  let funId = queryData.funId !== '' ? queryData.funId : 1;

  try{
    let oldResult = await  db.query(`SELECT * FROM eqQuery  WHERE id_eqquery = $1::INT`, [queryId !== '' ? queryId : 0]);

    await db.query(`UPDATE eqQuery 
    SET date_start = $1::TIMESTAMP, date_end = $2::TIMESTAMP, q_type = $3::INT, 
    id_eq_equipment = $4::INT, id_cont_contract = $5::INT
    WHERE id_eqquery = $6:: INT`, [
      queryData.dateStart !== '' ? new Date(queryData.dateStart) : null, 
    queryData.dateEnd !== '' ? new Date(queryData.dateEnd) : null, 
    queryData.Q_type !== '' ? queryData.Q_type : null, 
    queryData.eqId !== '' ? queryData.eqId : null, 
    queryData.conId !== '' ? queryData.conId : null, 
    //queryData.userId !== '' ? queryData.userId : null,
    queryId !== '' ? queryId : 0]);

    response.status(200).send(`Обновлена заявка: ${queryId}`);
  } catch (err) {return next(err)}
  try{
    let newResult = await  db.query(`SELECT * FROM eqQuery  WHERE id_eqquery = $1::INT`, [queryId !== '' ? queryId : 0]);
    let oldValue = oldResult.rows.length > 0 ? oldResult.rows[0] : {};
    let newValue = newResult.rows.length > 0 ? newResult.rows[0] : {};
    let eventData = {
      eventTypeId: eventlog.eventType.UPDATE,
      userId: userId,
      funId: funId,
      entityId: queryId,
      newValue: JSON.stringify(newValue),
      oldValue: JSON.stringify(oldValue)
    }
    eventlog.insEventLog(eventData);
    mailer.queryUpdated(eventData);
  }
  catch (err) {}

 
}
const delQuery = async function(request, response, next){
    let queryId = request.params.idQuery;
    let userId = request.headers.userid;
    let funId = 1;

    try {
          let newResult = await  db.query(`SELECT * FROM eqQuery  WHERE id_eqquery = $1::INT`, [queryId !== '' ? queryId : 0]);
          await db.query(`DELETE FROM eqQuery WHERE id_eqquery = $1:: INT`, [queryId !== '' ? queryId : 0]);
         
          response.status(200).send(`Удалена заявка: ${queryId}`);
    } catch (err) {return next(err)}
    try{
          let newValue = newResult.rows.length > 0 ? newResult.rows[0] : {};
          let eventData = {
            eventTypeId: eventlog.eventType.DELETE,
            userId: userId,
            funId: funId,
            entityId: queryId,
            newValue: JSON.stringify(newValue),
            oldValue: JSON.stringify({})
          }
          eventlog.insEventLog(eventData);
          mailer.queryDeleted(eventData);
        }
     catch (err) {}       
  
}

module.exports = {queryList, queries, queriesDate, insQuery, updQuery, delQuery}
