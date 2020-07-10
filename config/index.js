const config = {}

config.redisStore = {
  url: 'localhost',//process.env.REDIS_STORE_URI,
  secret: 'my secret here'//process.env.REDIS_STORE_SECRET
}
config.__staticFolder =  '/uploads';
config.__imageFolder = '/images';
config.__docFolder = '/doc';
config.__pathToImage = config.__staticFolder + config.__imageFolder;
config.__pathToDoc =  config.__staticFolder + config.__docFolder;
config.email = {
  user: 'vniizht\\retc',
  pass: '123456Qw',
  host: 'exchange.vniizht.ru',
  secure: true,
  port: 587//443
}




module.exports = config