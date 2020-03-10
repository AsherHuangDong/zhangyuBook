// 1、获取应用实例
const app = getApp();
const { link } = require('../../utils/ajax.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userId: "",
    userGrade: 1,   // 1 普通用户 2 商户 3 商户学员 4 商户老师

    newData: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    this.getStorageUserInfo();
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
            userGrade: userGrade,       // 模拟操作 2
          });

          // 调用当前页面接口
          this.getPageData(userId);
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
   * 接口—— 获取当前页面数据
  */
  getPageData(userId) {
    let self = this
    let organizationId = userId;
    link.ajax({
      path: '/api/organization/organizationRegistrationIndex',
      data: {}
    }).then(res => {
      console.log(res);
      let list = []
      res.data.forEach((item, index) => {
        let m = item.lastUpdate.substring(0, 11)
        if(list.length>0){
          var k = false;
          list.forEach((item1, index1) => {
            let n = item1.lastUpdate.substring(0, 11)
            if (n == m) {
              item1.list1.push(item);
              k = true;
            }
          })
          if(!k){
              let list1 = [];
              list1.push(item)
              list.push({
                lastUpdate: m,
                list1: list1
              })
          }
        }else{
          let list1 = []
          list1.push(item)
          list.push({
            lastUpdate: m,
            list1: list1
          })
        }      
      })
      self.setData({
        newData:list
      })
      console.log('333' + list)
    });
  },
  /**
   * 跳转-根据学员id进行页面跳转
  */
  goToStudentDetails(e) {
    console.log(e);
    // 获取学员id
    let studentId = e.currentTarget.dataset.studentid;
    wx.navigateTo({
      url: "../cardDetails/cardDetails?studentId=" + studentId,
    });
  }
})