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
    userGrade: 0, // 1 普通用户 2 商户 3 商户学员 4 商户老师
    showCard: false, // 列表数据以卡片/列表形式展示方式选定
    showSelected: 'all', // 全部/我的作品选定，添加动态样式
    listData: [], // 当前页面列表展示数据
    myListData: [], // 我的作品集信息数据：用来判断右上角文本
    notFoundImage: '../../images/notFound.jpg',
    organizationName: '',
    isList: true,
    isShowLiuYanModel: false,
    buttonClicked: false,
    createTime: '',
    userId: ''
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options)
    console.log(options.userId)
    if (options.userId) {
      this.setData({
        userId: options.userId
      })
    }
    var that = this
    let status = app.globalData.status;
    that.setData({
      userGrade: status
    })
    if (wx.getStorageSync('organizationName') && that.data.userGrade != 1) {
      wx.setNavigationBarTitle({
        title: `${wx.getStorageSync('organizationName')}`
      });
    } else {
      wx.setNavigationBarTitle({
        title: '章鱼书'
      });
    }
    // 1、判断是否存在userInfo缓存，没有则跳转到启动页；有则根据用户身份进行页面展示
    //this.getStorageUserInfo();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},
  /**
   * 生命周期函数--监听页面显示
   */
  onShow(options) {
    if (wx.getStorageSync('organizationName') && this.data.userGrade != 1) {
      wx.setNavigationBarTitle({
        title: `${wx.getStorageSync('organizationName')}`
      });
    } else {
      wx.setNavigationBarTitle({
        title: '章鱼书'
      });
    }
    this.getStorageUserInfo()
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
   * 用户点击分享按钮
   */
  onShareAppMessage: function(e) {
    let id = e.target.dataset.id
    let userId = wx.getStorageSync('userInfo').userId;
    // console.log('yyy' + JSON.stringify(e))
    if (this.data.userGrade == 2) {
      let name = wx.getStorageSync('organizationName');
      if (e.from == 'button') {
        return {
          title: `${name}` + '邀请您查看作品集',
          path: '/pages/index/index',
          imageUrl: e.target.dataset.img,
          success: function(res) {
            wx.showToast({
              title: '分享成功！',
            })
          }
        }
      }
    } else {
      let name = wx.getStorageSync('userInfo').userName;
      if (e.from == 'button') {
        return {
          title: `${name}` + '邀请您查看作品集',
          path: '/pages/index/index',
          imageUrl: e.target.dataset.img,
          success: function(res) {
            wx.showToast({
              title: '分享成功！',
            })
          }
        }
      }
    }
  },
  shareImg(e) {
    console.log(e.currentTarget.dataset.count)
    console.log(e.currentTarget.dataset.pcount)
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
    console.log('sssssss')
    let token = wx.getStorageSync('token')
    let userInfo = wx.getStorage({
      key: 'userInfo',
      success: res => {
        // console.log(`从缓存中取出授权登陆后的用户信息`);
        // console.log(res);
        // 1、对用户状态进行更改
        this.setData({
          userGrade: res.data.status
        });
        if (res.data.userName) {
          this.setData({
            isShow: false
          });
        }
      }
    });
    console.log('gggggg', token);
    if (token) {
      this.getAllListData();
      this.getMyListDataTwo();
    } else {
      this.getNoLoginlist();
    }
  },
  /**
   * 显示全部列表数据
   * */
  showAll() {
    // console.log(`--- 点击了展示全部信息 ---`);
    // 给全部设置动态样式类
    this.setData({
      showSelected: 'all'
    });
    link.ajax({
      path: '/api/user/getOfficialCollection',
      data: {}
    }).then(res => {
      // 3.1、存储后台传过来的用户数据
      this.setData({
        listData: res.data
      })
    });
    // 更新当前视图所有列表数据
  },
  /**
   * 显示我的列表数据
   * */
  showMy() {
    // console.log(`--- 点击了展示我的信息 ---`);
    // 重置list数据
    this.setData({
      showSelected: 'myWorks'
    });
    // 调取接口更新当前视图list
    this.getMyListData();
  },
  /**
   * 从接口获取全部列表信息
   * */
  getAllListData() {
    var that = this;
    // console.log(`调用接口函数------`);
    link.ajax({
      path: '/api/user/listSampleReelsByParam'
    }).then(res => {
      that.setData({
        listData: res.data
      })
      console.log(that.data.listData)
      if (that.data.listData.length == 0) {
        that.setData({
          isList: false
        })
      }
      console.log(that.data.isList)
    });
  },
  /**
   * 从接口获取我的作品列表信息：用来判断右上角文本展示
   * */
  getMyListDataTwo() {
    // console.log(`调用接口函数----myList--`);
    link.ajax({
      path: '/api/productCollection/listUserProductCollection',
    }).then(res => {
      console.log(res.data);
      if (res.data) {
        // 将我的作品列表信息设置到当前showlist数据中
        // console.log(`-----mylist 有数据`);
        // aa 为模拟数据
        let aa = [];
        this.setData({
          myListData: res.data
        });
      } else {
        // 显示没有拿数据  去创建 和 去首页
        console.log(`-----mylist 无数据`);
      }
    });
  },
  /**
   * 图片加载报错处理------------------------未处理
   * */
  errImg(e) {
    // console.log(e);
    // 获取当前触发函数的图片的下标
    let errorImgIndex = e.target.dataset.errorimg;

    //carlistData为数据源，对象数组
    let imgObject = "'" + errorImgIndex + "'";

    var errorImg = {};

    //我们构建一个对象
    errorImg[imgObject] = "../../images/notFound.jpg";

    // console.log(errorImg );

    //修改数据源对应的数据
    this.setData(errorImg);

  },
  /**
   * 以card形式展现数据
   * */
  showCard(e) {
    // console.log(`--- 点击了card ---`);
    this.setData({
      showCard: true
    });
  },
  /**
   * 以list形式展现数据
   * */
  showList(e) {
    // console.log(`--- 点击了list ---`);
    this.setData({
      showCard: false
    });
  },
  /**
   * 点击作品跳转到作品详情页:非冒泡事件
   * */
  gotoDetails(e) {
    if (this.endTime - this.startTime < 350) {
      let token = wx.getStorageSync('token')
      if (token) {
        if (e.target.id != 'shareBtn') {
          let shopId = e.currentTarget.dataset.shopid;
          wx.navigateTo({
            url: "../myCollection/myCollection?shopId=" + shopId
          });
        }
      } else {
        wx.switchTab({
          url: '../my/my',
        })
      }
    }
  },
  /**
   * 跳转到创建作品集页面
   * 
   */
  goToNewWork() {
    wx.navigateTo({
      url: "../chuangJianCollection/chuangJianCollection",
    });
  },
  /**
   * 普通用户： 我的作品=》页面跳转 myHuiGuan
   *    
   * */
  gotoHuiGuan(e) {
    wx.navigateTo({
      url: "../myHuiGuan/myHuiGuan",
    });
  },
  getComment(e) {
    console.log('我点击了留言');
    this.setData({
      isShowLiuYanModel: true
    })
  },
  // /**
  //  * 交互—— 点赞
  //  */
  // userDianZan(e) {
  //   console.log(`---------- 我点赞了！ ----------------`);
  //   console.log(e);
  //   let idx = e.currentTarget.dataset.index;
  //   let productId = e.currentTarget.dataset.workid;

  //   let isLike = this.data.listData[idx].isLiked;

  //   if (isLike) { // 已点赞—— ： 取消点赞
  //     link.ajax({
  //       path: '/api/sampleReels/like',
  //       data: {
  //         sampleReelsId: productId
  //       }
  //     }).then(res => {
  //       let nowIsLike = 'listData[' + idx + '].isLiked';
  //       let nowLikeNum = 'listData[' + idx + '].likeNum';
  //       this.setData({
  //         [nowIsLike]: !isLike,
  //         [nowLikeNum]: this.data.listData[idx].likeNum -= 1
  //       });
  //       wx.showToast({
  //         title: '已取消点赞!',
  //         icon: 'success',
  //         duration: 2000
  //       });
  //     });
  //   } else { // 未点赞—— ：点赞
  //     link.ajax({
  //       path: '/api/sampleReels/like',
  //       data: {
  //         sampleReelsId: productId
  //       }
  //     }).then(res => {
  //       let nowIsLike = 'listData[' + idx + '].isLiked';
  //       let nowLikeNum = 'listData[' + idx + '].likeNum';
  //       this.setData({
  //         [nowIsLike]: !isLike,
  //         [nowLikeNum]: this.data.listData[idx].likeNum += 1
  //       });
  //       wx.showToast({
  //         title: '已成功点赞!',
  //         icon: 'success',
  //         duration: 2000
  //       });
  //     });
  //   }
  // },

  getNoLoginlist() {
    link.ajax({
      path: '/api/sampleReels/listSampleReelsTourist'
    }).then(res => {
      this.setData({
        listData: res.data
      })
      console.log(res);
    })
  },
  delete(e) {
    console.log('反反复复')
    let collectionId = e.currentTarget.dataset.shopid;
    let that = this
    console.log(collectionId)
    wx.showModal({
      title: '提示',
      content: '确定要删除吗？',
      confirmColor: '#FF9933',
      success: function(sm) {
        if (sm.confirm) {
         link.ajax({
           path:'removeCollection',
           data:{
             sampleReelsId:collectionId
           }
         }).then(res=>{
           console.log(res)
         })
        } else if (sm.cancel) {
          console.log('用户点击了取消');
        }
      }
    })
  },
  start(e) {
    this.startTime = e.timeStamp
    console.log(this.startTime)
  },
  end(e) {
    this.endTime = e.timeStamp
    console.log(this.endTime)
  }

})