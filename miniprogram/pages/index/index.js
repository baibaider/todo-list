//index.js
const app = getApp()

Page({
  data: {
    itemText: '',
    lists:[],
    content: '',
    openid: '',
    contentLists: [],
    chooseItem: '',// 选择的项目
    avatarUrl:'../../images/icon/user-unlogin.png',
    userInfo:'',
  },

   async onLoad()  {
    await this.onGetOpenid();
    let that = this;
    if(this.data.userInfo){
      this.getData();
    }
    wx.getSetting({
      success (res){
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            success: function(res) {
              that.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo
              })
              that.getData();
              wx.hideLoading();
            }
          })
        }
      }
    })
  },

  getInfo: function(e){
    if(e.detail.userInfo){
      this.setData({
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
      this.getData();
    }
  },

  getData: function(){
    const db = wx.cloud.database();
    const _ = db.command;
    let user = this.data.openid;
    // 查询当前用户所有的 数据
    if(user){
      db.collection('data').where({
        _openid: this.data.openid,
        status: _.neq(2)
      }).orderBy('time', 'desc').get({
        success: res => {
          wx.hideLoading();
          this.setData({
            lists: res.data,
          })
        },
        fail: err => {
            wx.showToast({
            icon: 'none',
            title: '获取数据失败，请确保登录成功。',
          })
          console.error('[数据库] [查询记录] 失败：', err)
        }
      })
      
    }
  },

  onGetOpenid: function() {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        app.globalData.openid = res.result.openid;
        this.setData({ openid : res.result.openid});
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
      }
    })
  },

  inputContent: function(event){
    this.setData({
      content: event.detail.value
    })
  },

  addItem: function(){
    let content = this.data.content.trim();
    let lists = this.data.lists;
    if(!content){
      wx.showToast({
        icon: 'none',
        title: '输入内容为空',
      });
      return;
    }
    if(!lists){
      lists = [];
    }
    const db = wx.cloud.database();
    db.collection('data').add({
      data: {
        content: content,
        status: 0,
        time: db.serverDate(),
        imageUrl: '../../images/icon/weiwancheng.png',
      },
      success: res => {
        // 在返回结果中会包含新创建的记录的 _id
        let item = {
          content : content,
          _id: res._id,
          status: 0,
        }
        // lists.unshift(item);
        this.setData({ lists : [item, ...lists], content : ''});
        console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
      },
      fail: err => {
        console.error('[数据库] [新增记录] 失败：', err)
      }
    })
  },

  remove: function(e){
    const db = wx.cloud.database();
    let id = e.detail;
    let lists = this.data.lists;
    lists.forEach((value, index) => {
      if (value._id == id) {
        lists.splice(index,1);
      }
    });
    this.setData({ lists : lists});
    db.collection('data').doc(id).update({
      data: {
        status: 2,
        imageUrl: '../../images/icon/yishanchu.png',
      },
      success: res => {
        wx.showToast({
          title: '删除成功',
        })
        this.setData({
          counterId: '',
          count: null,
        })
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '删除失败',
        })
        console.error('[数据库] [删除记录] 失败：', err)
      }
    })
  },

  show: function(e){
    const db = wx.cloud.database();
    const _ = db.command;
    let user = this.data.openid;
    let isCompleted = Number(e.target.dataset.situation);
    // 查询当前用户所有的 数据
    if(user){
      db.collection('data').where({
        _openid: this.data.openid,
        status: (isCompleted === 1)? _.eq(1) : _.eq(0)
      }).orderBy('time', 'desc').get({
        success: res => {
          this.setData({
            contentLists: res.data,
            chooseItem: (isCompleted === 1)? 'completed' : 'Nocompleted'
          })
          console.log('[数据库] [查询记录] 成功: ', res)
        },
        fail: err => {
            wx.showToast({
            icon: 'none',
            title: '获取数据失败，请确保登录成功。',
          })
          console.error('[数据库] [查询记录] 失败：', err)
        }
      })
    }
  },
  clearCompleted: function(){
    const db = wx.cloud.database();
    const that = this;
    let removeLists = [];
    let lists = this.data.lists;
    let contentLists = (this.data.chooseItem === 'completed') ? [] : this.data.contentLists;
    lists.forEach((value,index) => {
      if (value.status == 1) {
        removeLists.push(value._id);
        lists.splice(index,1);
      }
    });
    wx.showModal({
      title: '提示',
      content: '是否删除全部已完成记录？',
      confirmColor: '#A79BF7',
      cancelColor: '#999999',
      success (res) {
        if (res.confirm) {
          removeLists.forEach((value) => {
            db.collection('data').doc(value).remove()
          });
          that.setData({ lists: lists , contentLists: contentLists});
        } 
      }
    })
  },

  clearAll: function(){
    let that = this;
    wx.showModal({
      title: '提示',
      content: '是否删除全部记录？',
      confirmColor: '#A79BF7',
      cancelColor: '#999999',
      success (res) {
        if (res.confirm) {
          wx.cloud.callFunction({
            // 云函数名称
            name: 'operateDB',
            data: {
              action: 'clearAll'
            },
            success: function(res) {
              that.setData({ lists: [] , contentLists : []}); 
            },
            fail: console.error
          })
        } 
      }
    })
  },
  changeItem: function(e){
    let lists = this.data.lists;
    let { key, status, url} = e.detail;
    const db = wx.cloud.database();
      db.collection('data').doc(key).update({
        data: {
          status: status,
          imageUrl: url
        },
        success: res => {
          lists.forEach((value,index) => {
            if (value._id === key) {
              value.status = status;
            }
          });
          this.setData({lists : lists});
          console.log('[数据库] [更新记录] 成功')
        },
        fail: err => {
          icon: 'none',
          console.error('[数据库] [更新记录] 失败：', err)
        }
      })

  }
  
  
  

})
