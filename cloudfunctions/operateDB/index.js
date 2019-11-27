// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()


// 云函数入口函数
exports.main = async (event) => {
  const wxContext = cloud.getWXContext();
  const db = cloud.database();
  const openid =  wxContext.OPENID;
  switch (event.action){
    case 'clearAll': 
    try {
      return await db.collection('data').where({
        _openid: openid,
      }).remove()
    } catch (error) {
      console.log(error);
    }
  }
}