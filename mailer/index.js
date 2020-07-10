var nodemailer = require('nodemailer');
var config = require('../config');
const db = require('../db')
var _ = require('lodash');

const observeChange = {
    "date_start": {name: "начало использования: "},
    "date_end": {name: "окончание использования: "},
    "q_type": {name: "тип заявки: "},
    "id_cont_contract": {name: "договор: "}
}

const queryTypeList =[{id: 1, name: 'Проведение испытаний'}, {id: 2,  name: 'Техническое обслуживание'}, {id: 3, name: 'Аттестация/Поверка'}]

const formatDateTime = value => {
    if (value) {
      const dt = new Date(value);
      return `${addZero(dt.getDate())}.${addZero(dt.getMonth() + 1)}.${dt.getFullYear()} ${addZero(dt.getHours())}:${addZero(dt.getMinutes())}`;
    }
    return "";
    };

    const addZero = value => ("0" + value).slice(-2);

    const formatDate = value => {
    if (value) {
      const dt = new Date(value);
      return `${addZero(dt.getDate())}.${addZero(
        dt.getMonth() + 1
      )}.${dt.getFullYear()}`;
    }
    return "";
    };
    

function sendMail(email, subject, message) {
    const mailTransport = nodemailer.createTransport({
        host: config.email.host,
        debug: true,
        secure: config.email.secure,
        port: config.email.port,
        auth: { user: config.email.user, pass: config.email.pass },
        tls: { rejectUnauthorized: false }
        });
  mailTransport.sendMail({
        from: 'СУ Испытательным оборудованием',
        to: email,
        subject: subject,
        text: message
        }, function(err, info) {
            if (err) {
                console.log(err);
                return -1;
            };
            console.log('mail sent success');
            console.log('info: ' + JSON.stringify(info));
            return 1;
        });
    };
     function sendTest(request, response, next){
   // let res = await sendMail('voronkov.andrey@vniizht.ru', 'hola mundo', 'test message :)');
         sendMail('voronkov.andrey@vniizht.ru', 'hola mundo', 'test message :)');
         response.status(200).send('ok');
    }

async function queryUpdated(queryData){
   
    let newObj = JSON.parse(queryData.newValue);
    let oldObj = JSON.parse(queryData.oldValue);

    let mailingList = [];
    let result = await db.query(`SELECT ev.user_id, ev.new_value, trim(u.us_email) as us_email
    FROM EventLog ev
    INNER JOIN Users u on ev.user_id = u.id_user
    WHERE fun_id = $1::INT AND entity_id = $2::INT AND ev.user_id <> $3::INT
    AND COALESCE(u.us_email, '') <> ''
    ORDER BY ev.event_date desc`, [queryData.funId !== '' ? queryData.funId : 0,
         queryData.entityId !== '' ? queryData.entityId : 0,
         queryData.userId !== '' ? parseInt(queryData.userId) : 0]);


        result.rows.forEach(item => {
              let userItem = _.find(mailingList, {user_id: item.user_id})
              if  (!userItem){
                mailingList.push({user_id: item.user_id, email: item.us_email, usrValue: JSON.parse(item.new_value)});
              }
          });
    
    if (mailingList.length > 0){
       
 
        let eqName = await getEqName(newObj.id_eq_equipment);
        let message = `Данные по заявке от ${formatDate(newObj.q_date)} для оборудования ${eqName} изменены: `;

        let contName = await getContName(newObj.id_cont_contract);

      Object.keys(newObj).forEach(key => {
            if (observeChange[key]){
                if (newObj[key] !== oldObj[key])
                {
                  let keyValue = newObj[key];
                  let value = '';
                   switch (key){
                       case 'date_start':
                       case 'date_end':
                        value = formatDateTime(keyValue);
                           break;
                       case 'q_type':
                           value = getEqType(keyValue);
                           break;
                        case 'id_cont_contract':
                            value = contName;
                            break;
                        default: 
                            value = 'не определено';
                   }
                  message += `${observeChange[key].name}${value}; `
                }
            
            }
        });

        mailingList.forEach(user => {
            //console.log(user.email  + '_____' + message);
            sendMail(user.email, 'Данные по заявке изменены', message);
        })
    }
}
async function queryDeleted(queryData){
    let newObj = JSON.parse(queryData.newValue);

    let mailingList = [];
    let result = await db.query(`SELECT distinct ev.user_id, trim(u.us_email) as us_email
    FROM EventLog ev
    INNER JOIN Users u on ev.user_id = u.id_user
    WHERE fun_id = $1::INT AND entity_id = $2::INT AND ev.user_id <> $3::INT
    AND COALESCE(u.us_email, '') <> ''`, [queryData.funId !== '' ? queryData.funId : 0,
         queryData.entityId !== '' ? queryData.entityId : 0,
         queryData.userId !== '' ? parseInt(queryData.userId) : 0]);


        result.rows.forEach(item => {
             // let userItem = _.find(mailingList, {user_id: item.user_id})
            //  if  (!userItem){
                mailingList.push({user_id: item.user_id, email: item.us_email});
             // }
          });
    if (mailingList.length > 0){
        let eqName = await getEqName(newObj.id_eq_equipment);
        let queryName = `${observeChange['date_start'].name} ${formatDateTime(newObj.date_start)}; `;
        queryName += `${observeChange['date_end'].name} ${formatDateTime(newObj.date_end)};`

        let message = `Удалена заявка от ${formatDate(newObj.q_date)} по оборудовнию ${eqName} (${queryName})`;
           
            
              mailingList.forEach(user => {
                //console.log(user.email + '_____' + message);
                sendMail(user.email, 'удалена заявка', message);
            })
   }
}
async function getEqName (idEq){
    let eqName = 'не определено';
    let  result = await db.query(`SELECT eqname, inv_num
    FROM equipment
    WHERE id_eq = $1:: INT`, [idEq !== '' ? idEq : 0]);
    if (result.rows.length > 0){
        let item = result.rows[0];
        eqName = `${item.eqname ? item.eqname.trim() : ''} (${item.inv_num ? item.inv_num.trim(): ''})`
    };
    return eqName;

}
async function getContName(idCont){
    let contName = 'не определено';
    let result = await db.query(`SELECT con_num, con_date
    FROM Contract
    WHERE id_cont = $1:: INT`, [idCont !== '' ? idCont : 0]);
    if (result.rows.length > 0){
        let item = result.rows[0];
        contName = `${item.con_num ? '№'+item.con_num.trim() : ''} ${item.con_date ? ' от ' + formatDate(item.con_date): ''}`
    }
    return contName;
}
function getEqType (id){
    let qItem = _.find(queryTypeList, {id: id});
    return  qItem ? qItem.name : 'не определено';
}
module.exports = {sendMail, sendTest, queryUpdated, queryDeleted};