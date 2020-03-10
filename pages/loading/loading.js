// 1、获取应用实例
const app = getApp();
const { link } = require('../../utils/ajax.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    userInfo: {},
    hasUserInfo: false,
    isShow: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    /**
     * 1、判断用户身份信息
     * 
     * */
     wx.getStorage({
       key: 'userInfo',
       success: function(res) {
         this.setData({
           isShow: false
         })
       },
     })
    if (app.globalData.userInfo) {
      console.log('------1');
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      });
      // 进一步进行判断storage中是否存在token
      this.isLogin();


    } else if (this.data.canIUse) {
      console.log('------2');
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        console.log('---------------2.1');
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        });
        // 进一步进行判断storage中是否存在token
        this.isLogin();
      }
    } else {
      console.log('------3');
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    console.log(this.data);
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 3、授权登陆
    wx.login({
      success(res) {
        link.ajax({
          path: '/api/login/login',
          data: {
            code: res.code,
            inviteId: ''
          }
        }).then(res => {
          // 3.1、存储后台传过来的用户数据
          wx.setStorage({
            key: 'userInfo',
            data: res.data
          });
          wx.setStorage({
            key: 'token',
            data: res.data.token
          });
          console.log('ajax发送成功');
          console.log(res);
          // 3.2、授权成功进行页面跳转
          wx.switchTab({
            url: '../index/index'
          });

        });

      },
      fail(err) {
        console.log(`用户拒绝授权··········`);
        console.log(err);
      }
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

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

  },
  /**
   * 获取用户信息
   * 
  */
  getUserInfo(e) {
    // console.log( e.detail.userInfo );
    if (e.detail.userInfo) {
      // 1、存储在本地
      this.setData({
        userInfo: e.detail.userInfo,
        hasUserInfo: true
      });
      link.ajax({
        path: '/api/login/updateUserInfo',
        data: {
          userHead: e.detail.userInfo.avatarUrl,
          nickName: e.detail.userInfo.nickName
        }
      }).then(res => {


      });
      // 2、存储在全局
      app.globalData.userInfo = e.detail.userInfo;
      console.log('uuu' + e.detail.userInfo)
    }
  },
  /**
   * 判断是否授权登陆
  */
  isLogin() {
    console.log(`----------------------进入isLogin`);
    wx.getStorage({
      key: 'token',
      success: res => {
        // console.log( res );
        wx.switchTab({
          url: '../index/index'
        });
      },
      fail: err => {
        console.log(`没有token`);
        this.setData({
          userInfo: {},
          hasUserInfo: false
        });
      }
    })
  }

})