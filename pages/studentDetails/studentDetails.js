// pages/studentDetails/studentDetails.js
const { link } = require('../../utils/ajax.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    studentId: '',
    studentDetails: {},
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      studentId: options.userId
    })
    this.getStudentDetails()
  },
  getStudentDetails() {
    let self = this
    link.ajax({
      path: '/api/organization/studentDetail',
      data: {
        userId: self.data.studentId,
        token:wx.getStorageSync('token')
      }
    }).then(res => {
      self.setData({
        studentDetails: res.data
      })
    });
  },
  /**
     * 点击作品跳转到作品详情页:非冒泡事件
     * */
  gotoDetails(e) {
    // console.log(`---------作品被点击`);
    console.log(`//////////////////////////`);
    console.log(e);
    if (e.target.id != 'shareBtn') {
      let shopId = e.currentTarget.dataset.samplereelsid;
      // console.log( `当前作品的id为：${shopId}` );
      wx.navigateTo({
        url: "../myCollection/myCollection?shopId=" + shopId
      });
    }
  },
  /**
   * 交互—— 点赞
  */
  userDianZan(e) {
    console.log(`---------- 我点赞了！ ----------------`);
    console.log(e);
    let idx = e.currentTarget.dataset.index;
    let sampleReelsId = e.currentTarget.dataset.samplereelsid;
    let isLike = this.data.studentDetails.collection[idx].isLiked;
    link.ajax({
      path: '/api/sampleReels/like',
      data: {
        sampleReelsId: sampleReelsId
      }
    }).then(res => {
      let nowIsLike = 'studentDetails.collection[' + idx + '].isLiked';
      let nowLikeNum = 'studentDetails.collection[' + idx + '].like';
      // this.getWorkListData()
      if (isLike) {
        let num = this.data.studentDetails.collection[idx].like - 1
        this.setData({
          [nowIsLike]: !isLike,
          [nowLikeNum]: num
        });
        wx.showToast({
          title: '已取消点赞!',
          icon: 'success',
          duration: 2000
        });
      } else {
        let num = this.data.studentDetails.collection[idx].like + 1
        console.log('111 ==' + num)
        this.setData({
          [nowIsLike]: !isLike,
          [nowLikeNum]: num
        });
        this.setData({
          [nowIsLike]: !isLike,
          [nowLikeNum]: num
        });
        wx.showToast({
          title: '已成功点赞!',
          icon: 'success',
          duration: 2000
        });
      }
    });
  },
  /**
   * 交互——留言： 跳转到详情页，并打开留言对话框
   * 
  */
  goDetailsShowLiuYan(e) {
    console.log(`我点击了留言`);
    console.log(e);
    let productId = e.currentTarget.dataset.workid;
    // 路由跳转    
    wx.navigateTo({
      url: "../workDetails/workDetails?productId=" + productId + "&showLiuYan=" + true
    });
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

  }
})