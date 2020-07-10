
const db = require('../db')

const eventType = {"INSERT": 1, "UPDATE": 2, "DELETE": 3}

const insEventLog = function(eventData)
{
   // console.log(eventData)
    db.query(`INSERT INTO EventLog (event_date, event_type_id, user_id, fun_id, entity_id, new_value, old_value)
    VALUES ($1::TIMESTAMP, $2::INT, $3::INT, $4::INT, $5::INT, $6::TEXT, $7::TEXT)
    RETURNING event_id`, [new Date(), 
        eventData.eventTypeId !== "" ? eventData.eventTypeId : null,
        eventData.userId !== "" ? eventData.userId : null,
        eventData.funId !== "" ? eventData.funId : null,
        eventData.entityId !== "" ? eventData.entityId : null,
        eventData.newValue, 
        eventData.oldValue], function(err, result){
      if (err){
          console.log(err);
         return -1;
    }
   return 0;
  })
}

const queryHistory = function(request, response, next){
    let queryData = request.query;
    db.query(`SELECT ev.*,
        TRIM(u.us_surname) as us_surname, TRIM(u.us_name) as us_name, TRIM(u.us_patname) as us_patname,
        TRIM(u.us_login) as us_login
        FROM EventLog ev
        LEFT JOIN Users u on ev.user_id = u.id_user
        WHERE fun_id = $1::INT AND entity_id = $2::INT`, [queryData.funId !== '' ? queryData.funId : 0,
             queryData.queryId !== '' ? queryData.queryId : 0], function(err, result){
        if (err){
            return next(err)
        }
        response.status(200).send(result.rows);
            
    })
}


module.exports = {insEventLog, eventType, queryHistory}
