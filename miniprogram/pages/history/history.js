// miniprogram/pages/history/history.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    openid: '',
    lists: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let app = getApp();
    const db = wx.cloud.database();
    const _ = db.command;
    wx.showLoading({
      title: '正在加载',
    })
    // 查询当前用户所有的 数据
    if(app.globalData.openid){
      db.collection('data').where({
        _openid: app.globalData.openid,
      }).orderBy('time', 'desc').get({
        success: res => {
          wx.hideLoading();
          this.setData({
            lists: res.data,
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

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.setData({lists : []});
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})