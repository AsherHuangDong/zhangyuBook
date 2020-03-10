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
    userId: '',
    studentId:'',
    userGrade: 1, // 模拟操作 2
    phone:'',
    pageData: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(`------ 进入详情页 -------`);
    let studentId = options.studentId;
    this.setData({
      studentId: options.studentId
    })
    // 保存在本地，拨打电话计次时要用
    console.log(studentId);
    // 获取本地缓存
    this.getStorageUserInfo();

    // 调用接口获取当前页面数据
    this.getPageData(studentId);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

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
  /**
   * 判断当前页面路由：。
   * 1、如果为启动页->不处理
   * 2、如果为非启动页->则根据userInfo缓存判断
   *      1).存在userInfo缓存   -> 存储用户名、头像、用户身份
   *                           -> 调取当前用户相关信息接口
   *                           -> 将接口的相关信息保存本地
   *      2).不存在userInfo缓存 -> 跳转到启动页
   */
  getStorageUserInfo() {
    let url = this.route;
    // console.log(url);
    if (url != "pages/loading/loading") {
      wx.getStorage({
        key: 'userInfo',
        success: res => {
          // 1、存储相关数据
          let userId = res.data.userId;
          let userGrade = res.data.status;
          this.setData({
            userId,
            userGrade: userGrade, // 模拟操作 2
          });
        },
        fail: err => {
          console.log(`缓存中没有，返回到启动页`);
          wx.redirectTo({
            url: "../loading/loading"
          });
        }
      });
    }

  },
  /**
   * 调取接口
   */
  getPageData(studentId) {
    link.ajax({
      path: '/api/organization/registrationIndexDetail',
      data: {
        clewId: studentId
      }
    }).then(res => {
      console.log(res);
      let newObj = {
        NumberOfCall: res.data.NumberOfCall,
        clewId: res.data.clewId,
        clewTime: res.data.clewTime,
        contact: res.data.contact.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'),
        followNum: res.data.followNum,
        lastUpdate: res.data.lastUpdate,
        remark: res.data.remark,
        studentName: res.data.studentName,
      }
      this.setData({
        pageData: newObj,
        phone: res.data.contact
      });
    })
  },
  /**
   * 调接口- 拨打电话计次1
   */
  callPhone(e) {
    let self = this
    console.log(e);
    let phone = this.data.phone;
    let clewId = e.currentTarget.dataset.clewid;
    wx.makePhoneCall({
      phoneNumber: phone,
      success(res) {
        link.ajax({
          path: '/api/organization/getCall',
          data: {
            clewId
          }
        }).then(res => {
          self.getPageData(self.data.studentId)
          // 电话拨打成功，接口调用成功
        });
      },
      fail() {
        wx.showToast({
          title: '拨打电话失败,请稍后再试!',
          icon: 'none',
          duration: 2000
        });
      }
    });
  }
})