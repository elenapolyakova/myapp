const passwordHash = require('password-hash')
const db = require('../db')

const getHashedPswd = function(request, response)
{
    let pswd = request.params.pswd;
    let hashedPswd = passwordHash.generate(pswd);
    response.status(200).send({pswd: pswd, hashedPswd: hashedPswd});
}

const authenticateUser = function(request, response){
    let userInfo = {
        id_user: -1,
        rights: '',
        username: ''
    }
    let username = request.body.username;
    let password = request.body.password;
    let maxFunId = 100;
     db.query(`SELECT u.id_user, TRIM(u.us_pswd) AS us_pswd, TRIM(r.rl_rights) AS rl_rights  FROM Users u 
            INNER JOIN Role_Users ru ON u.id_user = ru.id_user
            INNER JOIN Role r on r.id_role = ru.id_role
            WHERE TRIM(us_login) = $1::text`, [username], function(err, result){
            if (err){
                response.send("Ошибка при авторизации");
            }
            if (result.rows.length > 0)
            {
                let pswd =  result.rows[0].us_pswd;
                if (passwordHash.verify(password, pswd))
                {
                    userInfo.id_user = result.rows[0].id_user;
                    userInfo.username = username;
                    let rights = '';
                    userInfo.rights = rights.padEnd(maxFunId + 1, '0'); //заполняем права maxFunId раз нулями = '000000'
                    result.rows.forEach(item =>{
                        userInfo.rights.split('').forEach((rgt, i) =>{
                            rights += (parseInt(rgt, 16) | parseInt(item.rl_rights[i], 16)).toString(16).toString(16);
                        })
                        userInfo.rights = rights;
                        rights = '';
                    })
                    response.status(201).send(userInfo);
                }
                else response.status(401).send('Неверный имя пользователя или пароль');
            }
            else {
                response.status(401).send('Неверный имя пользователя или пароль');;
            }
            
        })
}

module.exports = {authenticateUser, getHashedPswd}