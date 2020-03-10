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
    userId: '',
    userGrade: 1, // 1 普通用户 2 商户 3 商户学员 4 商户老师  注意：该页面只显示普通用户
    listData: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.showLoading({
      title: '数据加载中...'
    });
  
    // 1、判断是否存在userInfo缓存，没有则跳转到启动页；有则根据用户身份进行页面展示
    

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
    this.getStorageUserInfo();
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
  onShareAppMessage: function(e) {
    let name = wx.getStorageSync('userInfo').userName;
    let userId = wx.getStorageSync('userInfo').userId;
    let img = e.target.dataset.img;
    console.log(img)
    if (e.from == 'button') {
      return {
        title: `${name}` + ' ' + '邀请您看他的作品集',
        path: '/pages/index/index',
        imageUrl: img,
        success: function(res) {
          wx.showToast({
            title: '分享成功！',
          })
        }
      }
    }
  },
  shareImg(e) {
    wx.navigateTo({
      url: '/pages/shareImg/shareImg?img=' + e.currentTarget.dataset.img + '&&id=' + e.currentTarget.dataset.id + '&&name=' + e.currentTarget.dataset.name + '&&desc=' + e.currentTarget.dataset.desc + '&&pcount=' + e.currentTarget.dataset.pcount + '&&count=' + e.currentTarget.dataset.count
    })
  },
  /**
   * 判断当前页面路由：。
   * 1、如果为启动页->不处理
   * 2、如果为非启动页->则根据userInfo缓存判断
   *      1).存在userInfo缓存   -> 将用户身份数据取出保存在本地data中
   *      2).不存在userInfo缓存 -> 跳转到启动页
   */
  getStorageUserInfo() {
    let url = this.route;
    // console.log( url );
    if (url != "pages/loading/loading") {
      wx.getStorage({
        key: 'userInfo',
        success: res => {
          // console.log(`从缓存中取出授权登陆后的用户信息`);
          // console.log(res);
          // 1、对用户状态进行更改
          console.log(res);
          this.setData({
            userId: res.data.userId,
            userGrade: res.data.status
          });

          // // 2、在调用接口前启用loading加载
          // wx.showLoading({
          //     title: '数据加载中...',
          // });
          // 3、调用接口
          this.getMyCollectionData(res.data.userId);
        },
        fail: err => {
          console.log(`缓存中没有，返回到启动页`);
          wx.redirectTo({
            url: "pages/loading/loading"
          });
        }
      });
    }

  },
  /**
   * 调取接口——根据userId获取当前作品集信息
   * 
   */
  getMyCollectionData(userId) {
    let that = this;
    let uid = userId || "";
    if (!userId) {
      console.log('----- 不存在接口所需信息-----');
    } else {
      console.log('----- 存在接口所需信息 --------');
      link.ajax({
        path: '/api/productCollection/listUserProductCollection',
      }).then(res => {
        // console.log('enenenen==' + res.data.length);
        this.setData({
          listData: res.data
        });
        console.log(that.data.listData);
        // 隐藏loading
        wx.hideLoading();
      });
    }
  },
  /**
   * 路由跳转——根据shopId跳转传参到【修改作品集页】
   */
  gotoDetailsPage(e) {
    console.log(e);
    let collectionId = e.currentTarget.dataset.shopid;
    if (e.target.id != 'shareBtn' && e.target.id != 'editIcon') {
      // console.log(`跳转到修改页面`);
      wx.navigateTo({
        url: '../myCollection/myCollection?shopId=' + collectionId,
      });
    }
  },
  /**
   * 路由跳转——根据shopId跳转传参到【修改作品集页】
   */
  gotoXiuGai(e) {
    console.log(e);
    let collectionId = e.currentTarget.dataset.shopid;
    console.log(`跳转到修改页面`);
    wx.navigateTo({
      url: '../xiuGaiCollection/xiuGaiCollection?shopId=' + collectionId,
    });
  },
  /**
   * 路由跳转——跳转到【创建作品集页面】
   * 
   */
  gotoNewCollectionPage() {
    wx.navigateTo({
      url: '../chuangJianCollection/chuangJianCollection',
    });
  },
  /**
   * 业务交互：----点赞
   */
  // userDianZan(e) {
  //     console.log(`---------- 我点赞了！ ----------------`);
  //     console.log(e);
  //     let idx = e.currentTarget.dataset.index;
  //     let productId = e.currentTarget.dataset.workid;
  //     let isLike = this.data.listData[idx].isLiked;
  //     if (isLike) { // 已点赞—— ： 取消点赞
  //         link.ajax({
  //             path: '/api/sampleReels/like',
  //             data: {
  //                 sampleReelsId: productId
  //             }
  //         }).then(res => {
  //             let nowIsLike = 'listData[' + idx + '].isLiked';
  //             let nowLikeNum = 'listData[' + idx + '].likeNum';
  //             this.setData({
  //                 [nowIsLike]: !isLike,
  //                 [nowLikeNum]: this.data.listData[idx].likeNum -= 1
  //             });
  //             wx.showToast({
  //                 title: '已取消点赞!',
  //                 icon: 'success',
  //                 duration: 2000
  //             });
  //         });
  //     } else { // 未点赞—— ：点赞
  //         link.ajax({
  //             path: '/api/sampleReels/like',
  //             data: {
  //                 sampleReelsId: productId
  //             }
  //         }).then(res => {
  //             let nowIsLike = 'listData[' + idx + '].isLiked';
  //             let nowLikeNum = 'listData[' + idx + '].likeNum';
  //             this.setData({
  //                 [nowIsLike]: !isLike,
  //                 [nowLikeNum]: this.data.listData[idx].likeNum += 1
  //             });
  //             wx.showToast({
  //                 title: '已成功点赞!',
  //                 icon: 'success',
  //                 duration: 2000
  //             });
  //         });
  //     }        

  // },

})