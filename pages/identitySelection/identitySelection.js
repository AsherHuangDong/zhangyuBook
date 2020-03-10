// 1、获取应用实例
const app = getApp();
const {
  link
} = require('../../utils/ajax.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    isShow: false,
    userGrade: '',
    status: '1',
    inviteId: '',
    show: true,
    userId: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if (options.shareId) {
      this.setData({
        inviteId: options.shareId,
      })
      if (options.status) {
        this.setData({
          status: options.status
        })
      }
    }
    // 1、判断是否存在userInfo缓存，没有则跳转到启动页；有则根据用户身份进行页面展示
    this.getStorageUserInfo();
    this.gotoIndex();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function(options) {
    let self = this;
    wx.login({
      success(res) {
        console.log(self.data.status);
        link.ajax({
          path: '/api/login/login',
          data: {
            code: res.code,
            inviteId: self.data.inviteId,
            status: self.data.status
          }
        }).then(res => {
          // 3.1、存储后台传过来的用户数据
          if (res.data.organizationName && res.data.userGrade != 1) {
            wx.setStorageSync('organizationName', res.data.organizationName)
            wx.setStorageSync('organizationHeadImg', res.data.organizationLogo)
          }
          wx.setStorage({
            key: 'userInfo',
            data: res.data.userInfo
          });
          wx.setStorageSync('token', res.data.userInfo.token)
        });
      },
      fail(err) {
        console.log(`用户拒绝授权··········`);
        console.log(err);
      }
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  gotoTravel(e){
    let that = this;
    let userGrade = that.data.userGrade;
    if(userGrade == ''){
      wx.showToast({
        title: '正在跳转',
        icon: 'loading',
        duration: 1000,
        success: () => {
          app.globalData.status = '';
          wx.switchTab({
            url: '../index/index',
          })
        }
      })
    }
  },
  gotoOrganization(e) {
    let that = this;
    let userGrade = that.data.userGrade;
    if(userGrade == ''){
      that.setData({
        isShow:true
      })
    }else{
      if (userGrade == 2 || userGrade == 4) {
        wx.showToast({
          title: '正在跳转',
          icon: 'loading',
          duration: 1000,
          success: () => {
            app.globalData.status = userGrade;
            wx.switchTab({
              url: '../index/index',
            })
            that.setData({
              show: false
            })
          }
        })
      } else if (userGrade != 2 && userGrade != 4 && userGrade != '') {
        wx.showToast({
          title: '您好，您选择的身份与您不符合，请重新选择',
          icon: 'none'
        })
      }
    }
  },
  gotoStudent(e) {
    let that = this;
    let userGrade = that.data.userGrade;
    if (userGrade == '') {
      that.setData({
        isShow: true
      })
    } else {
      if (userGrade == 3) {
        wx.showToast({
          title: '正在跳转',
          icon: 'loading',
          duration: 1000,
          success: () => {
            app.globalData.status = userGrade;
            wx.switchTab({
              url: '../index/index',
            })
            that.setData({
              show: false
            })
          }
        })
      } else if (userGrade != 3 && userGrade != '') {
        wx.showToast({
          title: '您好，您选择的身份与您不符合，请重新选择',
          icon: 'none'
        })
      }
    }
  },
  gotoUser(e) {
    let that = this;
    let userGrade = that.data.userGrade;
    if (userGrade == '') {
      that.setData({
        isShow: true
      })
    } else {
      if (userGrade == 1) {
        wx.showToast({
          title: '正在跳转',
          icon: 'loading',
          duration: 1000,
          success: () => {
            app.globalData.status = userGrade;
            wx.switchTab({
              url: '../index/index',
            })
            that.setData({
              show: false
            })
          }
        })
      } else if (userGrade != 1 && userGrade != '') {
        wx.showToast({
          title: '您好，您选择的身份与您不符合，请重新选择',
          icon: 'none'
        })
      }
    }
  },
  getStorageUserInfo() {
    let url = this.route;
    wx.getStorage({
      key: 'userInfo',
      success: res => {
        // console.log(`从缓存中取出授权登陆后的用户信息`);
        // console.log(res);
        // 1、对用户状态进行更改
        this.setData({
          userGrade: res.data.status,
        });
        if (res.data.userName) {
          this.setData({
            isShow: false,
          });
        }
      }
    });
  },
  
  getUserInfo(e) {
    console.log(e.detail.userInfo);
    if (e.detail.userInfo) {
      // 1、存储在本地
      this.setData({
        userInfo: e.detail.userInfo,
        hasUserInfo: true,
        isShow: false,
      });
      let token = wx.getStorageSync('token')
      console.log(token)
      link.ajax({
        path: '/api/login/updateUserInfo',
        data: {
          userHead: e.detail.userInfo.avatarUrl,
          nickName: e.detail.userInfo.nickName,
          token: token
        }
      }).then(res => {
        console.log(res)
        this.setData({
          userGrade: res.data.status
        })
      });
      // 2、存储在全局
      app.globalData.userInfo = e.detail.userInfo;
    } else {
      let self = this;
      wx.login({
        success(res) {
          console.log(self.data.status);
          link.ajax({
            path: '/api/login/login',
            data: {
              code: res.code,
              inviteId: self.data.inviteId,
              status: self.data.status
            }
          }).then(res => {
            // 3.1、存储后台传过来的用户数据
            if (res.data.organizationName && res.data.userGrade != 1) {
              wx.setStorageSync('organizationName', res.data.organizationName)
              wx.setStorageSync('organizationHeadImg', res.data.organizationLogo)
            }
            wx.setStorage({
              key: 'userInfo',
              data: res.data.userInfo
            });
            wx.setStorageSync('token', res.data.userInfo.token)
          });
        },
        fail(err) {
          console.log(`用户拒绝授权··········`);
          console.log(err);
        }
      })
    }
  },
  gotoIndex() {
    if (!this.data.show) {
      wx.switchTab({
        url: '../index/index',
      })
    }
  },
  cancel(){
   this.setData({
     isShow:false
   })
  }
})