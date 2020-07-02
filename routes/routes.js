const path = require('path')
const multer  = require("multer");
const db = require('../db')
//const passport = require('passport')
const fs = require('fs')
const mime = require('mime');
const auth = require('./auth')
const equip = require('./equipment')
const metrology = require('./metrology')
const repair = require('./repair')
const query = require('./query')
const contract = require('./contract')
const user = require('./user')
const dictionary = require('./dictionary')
const report = require('./report')
const consum = require('./consum')
const config = require('../config')
//const base64ToPNG = require('../js/base64-to-png')



const __staticFolder =  config.__staticFolder;
const __pathToImage = config.__pathToImage;
const __pathToDoc =   config.__pathToDoc;



const storageDocConfig = multer.diskStorage({
     destination: (req, file, cb) =>{
         cb(null, '.' + __pathToDoc);
     },
     filename: (req, file, cb) =>{
		let extension = path.extname(file.originalname);
		cb(null, file.fieldname + '-' + Date.now() +extension)
     }
});


const fileFilter = (req, file, cb) => {
	cb(null, true);
}
const imageFilter = (req, file, cb) => {
  
    if(file.mimetype === "image/png" || 
    file.mimetype === "image/jpg"|| 
    file.mimetype === "image/jpeg"){
        cb(null, true);
    }
    else{
        cb(null, false);
    }
 }

const upload = multer({dest:"uploads"});
const uploadImage = multer({dest:'.' +__pathToImage, fileFilter: imageFilter});
const uploadDocument = multer({ storage: storageDocConfig, fileFilter: fileFilter});

const router = app => {


	app.post('/auth', auth.authenticateUser);
	app.get('/password/:pswd', auth.getHashedPswd);//временно для генерации hash 
	
	//#region СПРАВОЧНИКИ
	app.get('/dictionary', dictionary.getDict)
	//#endregion СПРАВОЧНИКИ


	//#region КАРТОЧКА ОБОРУДОВАНИЯ
	app.get('/equipment', equip.equipments)
	app.post ('/equipment', equip.insEquipment);
	app.put('/equipment/:idEq', equip.updEquipment);
	app.delete('/equipment/:idEq', equip.delEquipment);
	app.get('/equipment/docList/:idEq', equip.getDocList);
	app.get('/equipment/imgList/:idEq', equip.getImageList);
	app.get('/equipment/locList/:idEq', equip.getLocList);
	app.get('/equipment/workingMode/:idEq', equip.equipmentWorkingMode)
	app.post('/equipmentDoc', equip.insDoc)
	
	//#endregion КАРТОЧКА ОБОРУДОВАНИЯ

	//#region  РЕМОНТЫ
	app.get ('/repair/:idEq', repair.repairs);
	app.post ('/repair', repair.insRepair);
	app.put('/repair/:idRep', repair.updRepair);
	app.delete('/repair/:idRep', repair.delRepair)
	//#endregion РЕМОНТЫ

	
	//#region  ЗАЯВКИ
	app.get ('/queryList', query.queryList); //для табличного представления
	app.get ('/query', query.queries); //для календаря за месяц
	app.get ('/queryDate', query.queriesDate); //даты заявок 
	app.post ('/query', query.insQuery);
	app.put('/query/:idQuery', query.updQuery);
	app.delete('/query/:idQuery', query.delQuery)
	//#endregion ЗАЯВКИ

	//#region  ДОГОВОРА
	app.get ('/contract', contract.contracts);
	app.post ('/contract', contract.insContract);
	app.put('/contract/:idContract', contract.updContract);
	app.post('/contractUnite/:idParentContract&:idContract', contract.uniteContract);
	app.delete('/contract/:idContract', contract.delContract)
	//#endregion ДОГОВОРА

	//#region  МЕТРОЛОГИЯ
	app.get ('/metrology/:idEq', metrology.metrologies);
	app.post ('/metrology', metrology.insMetrology);
	app.put('/metrology/:idMet', metrology.updMetrology);
	app.delete('/metrology/:idMet', metrology.delMetrology)
	//#endregion МЕТРОЛОГИЯ

	//#region  АДМИНИСТРИРОВАНИЕ ПОЛЬЗОВАТЕЛЕЙ
	app.get ('/user', user.users);
	app.get ('/role', user.roles);
	app.post ('/user', user.insUser);
	app.put('/user/:idUser', user.updUser);
	app.delete('/user/:idUser', user.delUser)
	//#endregion АДМИНИСТРИРОВАНИЕ ПОЛЬЗОВАТЕЛЕЙ


	//#region ОТЧЁТЫ
	app.get ('/rEquipmentCard/:idEq', report.eqCard);
	app.get ('/rSummary', report.eqSummary);
	app.get ('/rEqWork/:date', report.eqWork);
	app.get ('/rContract', report.contract);
	
	//#endregion ОТЧЁТЫ
	
	

	//#region РЕГИСТРАТОРЫ
	app.post ('/consum', consum.insConsum);
	
	//#endregion РЕГИСТРАТОРЫ
	consum

	
	//#region ДОКУМЕНТЫ И ФОТО
	app.post ('/image', uploadImage.single("file"), (request, response) => {

		let file = request.file;
		if(!file)
			response.send("Ошибка при загрузке файла");
		else
			equip.addImage(request, response)
	});

	app.delete ('/image', (request, response) => {
		var fileName = request.body.fileName;
	 	var pathToFile = process.cwd() + __staticFolder;
	 	fs.unlink(pathToFile + fileName, (err) => {
			if (err) {
				response.sendStatus(204)
				//next(err);
			}
			else 
				equip.delImage(request, response)
		});
	});

	app.post ('/file', uploadDocument.single("file"), (request, response, next) => {
		let file = request.file;
		let funShortName = request.query.funShortName;
		 if(!file)
		 	response.send("Ошибка при загрузке файла");
		else {
		 	switch(funShortName){
		 		case 'eq':
		 			equip.addDoc(request, response, next);
					break;
		 		case 'met':
		 			metrology.addDoc(request, response, next);
		 			break;
		 		case 'rep':
		 			repair.addDoc(request, response, next)
		 			break;
		 	}
		 }
	});
	
	app.delete('/file', (request, response, next) => {
	 	var fileName = request.body.fileName;
	 	var pathToFile = process.cwd() + __staticFolder;
		var funShortName = request.body.funShortName;
		
		if(fileName !== '')
			fs.unlink(pathToFile + fileName, (err) => {
				if (err) {
						//return next(err);
				}
			});
		switch (funShortName){
			case 'eq':
				equip.delDoc(request, response, next);
				break;
			case 'met':
				metrology.delDoc(request, response, next);
				break;
			case 'rep':
				repair.delDoc(request, response, next)
				break;
		}
	 });
	
	//#endregion ДОКУМЕНТЫ И ФОТО
	
	app.get('/eq', function(request, response, next) {
	
		db.query(`SELECT eq.Id_Eq, eq.eqname, eq.eqpurpose, 
		eq.inv_num, 
		eq.fact_num, 
		eq.fact_date, 
		eq.eq_comdate, 

		eq.is_ready, 
	
		eq.totime, 
		eq.eq_place, 
		eq.id_respose_man,
		eq.eqpassport 
		FROM equipment eq
		LEFT JOIN Docs passport
    	ON eq.Id_Eq = passport.Id_Eq_Equipment and passport.id_doc = 1;`, [], function(err, result){
			  
			if (err){
				return next(err)
			}
			response.json(result.rows)  
		})
	})

	/*app.get('/r', async function(request, response, next) {
	
		let result = await db.query(`INSERT INTO Role (id_role, rl_name, rl_rights) OVERRIDING SYSTEM VALUE VALUES(2,'Руководитель', '22222200');`, []);
		result = await db.query(`INSERT INTO Role (id_role, rl_name, rl_rights) OVERRIDING SYSTEM VALUE VALUES(3,'Диспетчер', '2FFFFF10');`, []);
		result = await db.query(`INSERT INTO Role (id_role, rl_name, rl_rights) OVERRIDING SYSTEM VALUE VALUES(4,'Технический специалист', '2F222200');`, []);
		result = await db.query(`INSERT INTO Role (id_role, rl_name, rl_rights) OVERRIDING SYSTEM VALUE VALUES(5,'Метролог', '222F2200');`, []);
		result = await db.query(`INSERT INTO Role (id_role, rl_name, rl_rights) OVERRIDING SYSTEM VALUE VALUES(6,'Редактор оборудования', 'F2222200');`, []);
		result = await db.query(`INSERT INTO Role (id_role, rl_name, rl_rights) OVERRIDING SYSTEM VALUE VALUES(7,'Администратор', '0000000F');`, []);
			response.json(result.rows)  

	})*/


}


module.exports = router;