const addDoc = function(request, response, next){
    let idMet = request.query.idMet;
    let file = request.file;
        if(!file)
            response.send("Ошибка при загрузке файла");
        else
            response.send({filename: file.filename});
    }
 const delDoc = function(request, response, next){
         var idMet = request.body.idMet;
        response.sendStatus(200);      
     }

module.exports = {addDoc, delDoc}