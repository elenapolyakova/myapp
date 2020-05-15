const repairList=[{idRep: 1, repDate: new Date (2020,0,1), repType:  1, execWork: 'Проделанная работа ла ла ла', docName: '1.docx'},
{idRep: 2, repDate: new Date (2020, 2, 3),  repType: 2, execWork: 'Проделанная работа ла ла ла22222', docName: "" }];

const config = require('../config')

const __staticFolder =  config.__staticFolder;
const __docFolder =   config.__docFolder;
const __pathToDoc =   config.__pathToDoc;

const repairs = function(request, response, next){
    let idEq = request.query.idEq;
    //path: __docFolder + '/' + item.docbodypath,
    response.status(200).send(repairList);
  }
  const insRepair = function(request, response, next){
    let repairData = request.body.repairData;
    let idRep = 11111;;//todo заменить на новый id
	response.status(201).send({idRep: idRep})
  }
  const updRepair = function(request, response, next){
    let idRep = request.params.idRep;
    let repairData = request.body.repairData;
    response.status(200).send(`Обновлен ремонт: ${idRep}`);
  }
  const delRepair = function(request, response, next){
    let idRep = request.params.idRep;
    response.status(200).send(`Удален ремонт: ${idRep}`);
  }
  const addDoc = function(request, response, next){
    let idRep = request.query.idRep;
    let file = request.file;
        if(!file)
            response.send("Ошибка при загрузке файла");
        else
            response.send({filename:  __docFolder + '/' + file.filename});
    }
 const delDoc = function(request, response, next){
        var idRep = request.body.idRep;
        response.sendStatus(200);      
     }
  module.exports = {repairs, insRepair, updRepair, delRepair, addDoc, delDoc}