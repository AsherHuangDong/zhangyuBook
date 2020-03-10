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
    userId: "",
    productUserId: "",
    userName: "",
    studentName: "",
    userGrade: 1, // 1 普通用户 2 商户 3 商户学员 4 商户老师
    isShowUploadText: true, // 是否显示上传作品
    shopId: '', // 作品集id
    showCard: true, // card/list显示视图切换
    listData: [], // 详情数据
    productId: '', // 作品id
    productPhoto: '',
    allInfo: [],
    productVideo: '',
    description: '',
    isShowLiuYanModel: false, // 留言对话框
    liuYanInfo: '',
    isMoreShow: false, // 是否加载更多留言
    isMoreBtnShow: true, // 是否显示加载更多按钮
    isShowAdvisoryModel: false,
    newList: [],
    isshowdelete: false,
    isshowremove: false,
    string: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 1、获取从列表传过来的参数
    let shopId = options.shopId;
    let productId = options.productId;
    let productPhoto = options.productPhoto;
    let productVideo = options.productVideo;
    let studentName = options.studentName;
    let userId = options.userId;
    // 2、将作品集id保存
    this.setData({
      shopId,
      productId,
      productPhoto,
      productVideo,
      studentName,
      userId,
    });
    let token = wx.getStorageSync('token')
    // 判断是否从分享进来的
    if (options.shopId && options.userId) {
      let self = this
      // 3、授权登陆
      if (token) {} else {
        wx.login({
          success(res) {
            link.ajax({
              path: '/api/login/login',
              data: {
                code: res.code,
              }
            }).then(res => {
              // 3.1、存储后台传过来的用户数据
              wx.setStorage({
                key: 'userInfo',
                data: res.data.userInfo
              });
              if (res.data.organizationName && res.data.status != 1) {
                wx.setStorageSync('organizationName', res.data.organizationName)
                if (res.data.status == 2) {
                  wx.setStorageSync('organizationHeadImg', res.data.organizationLogo)
                }
              }
              wx.setStorageSync('token', res.data.userInfo.token)
              let token = wx.getStorageSync('token')
              if (token) {
                self.getWorkListData();
              }
            });
          },
          fail(err) {
            console.log(`用户拒绝授权··········`);
            console.log(err);
          }
        });
      }
    }
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

    let token = wx.getStorageSync('token')
    if (token) {
      this.getWorkListData();
      this.getStorageUserInfo();
    } else {

    }
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
    let shopId = this.data.shopId;
    let img = e.target.dataset.img;
    console.log(img)
    if (e.from == 'button') {
      return {
        title: `${name}` + ' ' + '邀请您加入看他的作品',
        path: '/pages/myCollection/myCollection?userId=' + userId + '&&shopId=' + shopId,
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
    let img = e.currentTarget.dataset.img;
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/shareImg/shareImg?img=' + img + '&&id=' + id,
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
    console.log(url);
    if (url != "pages/loading/loading") {
      wx.getStorage({
        key: 'userInfo',
        success: res => {
          console.log(`从缓存中取出授权登陆后的用户信息`);
          console.log(res);
          // 1、存储相关数据
          let userId = res.data.userId; // 后续接口需要
          let userGrade = res.data.status; // 后续判断可能会用到   模拟操作 机构类 2;
          let userName = res.data.userName;
          this.setData({
            userId,
            userGrade: userGrade, // 模拟操作 2,
            userName: userName,
          });
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
   * 接口调用： 根据作品集id获取作品列表
   */
  getWorkListData() {
    var _this = this;
    // 根据作品id发送ajax请求
    link.ajax({
      path: '/api/productCollection/collectionDetail',
      data: {
        collectionId: this.data.shopId
      }
    }).then(res => {

      console.log(res);

      // 1、动态设置页面 NavigationBarTitle
      this.setNavigationBarTitleText(res.data.collectionName);
      // 2、判断是商户/普通用户及当前作品集是否为官方作品集
      console.log("是否为官方作品集：" + res.data.isOfficial);
      console.log("当前用户身份等级:" + this.data.userGrade);
      if (res.data.isOfficial && this.data.userGrade == 1) { // 为官方作品集且为普通用户
        this.setData({
          isShowUploadText: false
        });
      }
      // 2、重组数据
      let allListData = [];
      if (res.data.allInfo.length == 0) {
        wx.showToast({
          title: '当前作品集无作品,请上传您的作品!',
          icon: 'none',
          duration: 2000,
        });
      } else {
        for (let obj of res.data.allInfo) {
          // console.log( obj );
          let time = new Date(obj.createTime);
          // 获取年份
          let year = time.getFullYear();
          // 获取月份
          let mouth = (time.getMonth() + 1) < 10 ?
            "0" + (time.getMonth() + 1) :
            time.getMonth() + 1;
          // 获取日
          let day = time.getDate() < 10 ?
            "0" + time.getDate() :
            time.getDate();
          let hour = time.getHours() < 10 ? "0" + time.getHours() : time.getHours();
          let minute = time.getMinutes() < 10 ? "0" + time.getMinutes() : time.getMinutes();
          let second = time.getSeconds() < 10 ? "0" + time.getSeconds() : time.getSeconds();
          let likelist = [];
          for (let i = 0; i < obj.likeList.length; i++) {
            if (obj.likeList.length == 1) {
              likelist.push('👍' + obj.likeList[i] + '等1人觉得很赞')
            } else {
              if (i == obj.likeList.length - 1) {
                likelist.push(obj.likeList[i] + '等' + obj.likeList.length + '人觉得很赞')
              } else {
                if (i == 0) {
                  likelist.push('👍' + obj.likeList[i] + ',')
                } else {
                  likelist.push(obj.likeList[i] + ',');
                }
              }
            }
          }
          let string = ''

          likelist.forEach(item => {
            string += item;
          })
          console.log('list' + likelist);
          console.log(string)
          allListData.push({
            year: year,
            mouth: mouth,
            day: day,
            hour: hour,
            minute: minute,
            second: second,
            comment: obj.comment,
            isLiked: obj.isLiked,
            likeCount: obj.likeCount,
            productId: obj.productId,
            productPhoto: obj.productPhoto,
            description: obj.description,
            commentMapList: obj.commentMapList,
            likeList: obj.likeList,
            string: string,
            userName: obj.userName,
            userHead: obj.userHead,
            productUserId: obj.userId
          });
        }
        console.log(allListData);
        this.setData({
          listData: allListData
        });
        let list = []
        res.data.allInfo.forEach((item, index) => {
          let m = item.createTime.substring(0, 10)
          if (list.length > 0) {
            var k = false;
            list.forEach((item1, index1) => {
              let n = item1.createTime.substring(0, 10)
              if (n == m) {
                item1.list1.push(item);
                k = true;
              }
            })
            if (!k) {
              let list1 = [];
              list1.push(item)
              list.push({
                createTime: m,
                list1: list1
              })
            }
          } else {
            let list1 = []
            list1.push(item)
            list.push({
              createTime: m,
              list1: list1
            })
          }
        })
        console.log(list)
        let list2 = [];
        list.forEach((item, index) => {
          let list3 = [];
          item.list1.forEach((item1, index1) => {
            item1.productPhoto.forEach((item2, index2) => {
              list3.push(item2)
            })
          })
          list2.push({
            year: item.createTime.substring(0, 4),
            month: item.createTime.substring(5, 7),
            day: item.createTime.substring(8, 10),
            productPhoto: list3
          })
        })
        _this.setData({
          newList: list2
        })
        console.log(list2);
        console.log(_this.data.newList);
        console.log(_this.data.listData);
      }
    })
  },
  //  以card形式展现数据
  showCard(e) {
    console.log(`--- 点击了card ---`);
    this.setData({
      showCard: true
    });
  },
  //  以list形式展现数据
  showList(e) {
    console.log(`--- 点击了list ---`);
    this.setData({
      showCard: false
    });
  },
  /**
   * 路由跳转 ——去上传作品页面
   */
  gotoUploadPage() {
    wx.navigateTo({
      url: '../uploadWork/uploadWork?shopId=' + this.data.shopId,
    });
  },
  /**
   * 路由跳转 ——去作品详情页
   *    
   */
  gotoDetails(e) {
    console.log(e);
    let that = this;
    if (e.target.id != 'shareBtn') {
      // 获取作品id
      let productId = e.currentTarget.dataset.productid;
      if (that.data.isshowdelete) {
        that.setData({
          isshowdelete: false
        })
      } else {
        // 路由跳转    
        wx.navigateTo({
          url: "../workDetails/workDetails?productId=" + productId
        });
      }
    }
  },

  /**
   * 路由跳转
   * 目前未定制---为二期需求（故只给提示）
   */
  gotoTipPage() {
    wx.showToast({
      title: '服务暂未开放，敬请期待',
      icon: 'none',
      duration: 2000
    });
  },
  /**
   * 动态修改作品集名称 
   * 需传入标题
   */
  setNavigationBarTitleText(title) {
    wx.setNavigationBarTitle({
      title: `《${title}》`
    });
  },
  /**
   * 交互—— 点赞
   */
  userDianZan(e) {
    console.log(`---------- 我点赞了！ ----------------`);
    console.log(e);
    let idx = e.currentTarget.dataset.index;
    let productId = e.currentTarget.dataset.workid;
    let isLike = this.data.listData[idx].isLiked;
    let userName = this.data.userName;
    let likeList = this.data.listData[idx].likeList;
    link.ajax({
      path: '/api/productCollection/like',
      data: {
        productId: productId
      }
    }).then(res => {
      let nowIsLike = 'listData[' + idx + '].isLiked';
      let nowLikeNum = 'listData[' + idx + '].likeCount';
      let nowLikeList = 'listData[' + idx + '].likeList';
      let string = 'listData[' + idx + '].string'
      // this.getWorkListData()
      if (isLike) {
        let num = this.data.listData[idx].likeCount - 1
        likeList.splice(likeList.indexOf(userName), 1);
        console.log('fdfaaaa' + likeList);
        let likelist = [];
        for (let i = 0; i < likeList.length; i++) {
          if (likeList.length == 1) {
            likelist.push('👍' + likeList[i] + '等1人觉得很赞')
          } else {
            if (i == likeList.length - 1) {
              likelist.push(likeList[i] + '等' + likeList.length + '人觉得很赞')
            } else {
              if (i == 0) {
                likelist.push('👍' + likeList[i] + ',')
              } else {
                likelist.push(likeList[i] + ',');
              }
            }
          }
        }
        let string1 = ''
        likelist.forEach(item => {
          string1 += item;
        })
        console.log('list' + likelist);
        console.log(string)

        this.setData({
          [nowIsLike]: !isLike,
          [nowLikeNum]: num,
          [nowLikeList]: likeList,
          [string]: string1
        });
        wx.showToast({
          title: '已取消点赞!',
          icon: 'success',
          duration: 2000
        });
      } else {
        let num = this.data.listData[idx].likeCount + 1
        likeList.unshift(userName);

        let likelist = [];
        for (let i = 0; i < likeList.length; i++) {
          if (likeList.length == 1) {
            likelist.push('👍' + likeList[i] + '等1人觉得很赞')
          } else {
            if (i == likeList.length - 1) {
              likelist.push(likeList[i] + '等' + likeList.length + '人觉得很赞')
            } else {
              if (i == 0) {
                likelist.push('👍' + likeList[i] + ',')
              } else {
                likelist.push(likeList[i] + ',');
              }
            }
          }
        }
        let string1 = ''
        likelist.forEach(item => {
          string1 += item;
        })
        console.log('list' + likelist);
        console.log(string)

        console.log('111 ==' + num)
        this.setData({
          [nowIsLike]: !isLike,
          [nowLikeNum]: num,
          [nowLikeList]: likeList,
          [string]: string1
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
   * 预览图片
   */
  previewImg(e) {
    let that = this,
      imgsrc = e.currentTarget.dataset.presrc,
      arr = [];
    that.data.listData.forEach((item, index) => {
      item.productPhoto.forEach((item1, index1) => {
        arr.push(item1);
      })
    })
    wx.previewImage({
      current: imgsrc,
      urls: arr
    })
  },
  userLiuYaned() {
    console.log('++++++++++++++++')
    this.setData({
      isShowLiuYanModel: true
    })
  },
  submitLiuYan() {
    if (this.data.liuYanInfo != '') {
      link.ajax({
        path: '/api/productCollection/comment',
        data: {
          productId: this.data.productId,
          content: this.data.liuYanInfo
        }
      }).then((res) => {
        this.setData({
          isShowLiuYanModel: false,
          userId: res.data.userId,
          status: res.data.status
        });
        // 重新调用页面数据
        this.getDataDetails(this.data.productId);
      });
    } else {
      wx.showToast({
        title: '请输入要留言的信息!',
        icon: 'none',
        duration: 2000
      });
    }
  },


  hide() {
    this.setData({
      isShowLiuYanModel: false
    })
  },
  isshowdelete(e) {
    let id = e.currentTarget.dataset.id;
    let isshowdelete = this.data.isshowdelete;
    this.setData({
      imgId: id,
      isshowdelete: !isshowdelete
    })
  },
  deleteProduct(e) {
    let id = e.currentTarget.dataset.id;
    var that = this;
    console.log(id);
    this.setData({
      imgId: id,
      isshowremove: true,
      isshowdelete: false
    })
    wx.showModal({
      title: '提示',
      content: '确定要删除吗？',
      confirmColor: '#FF9933',
      success: function(sm) {
        if (sm.confirm) {
          link.ajax({
            path: '/api/productCollection/deleteProduct',
            data: {
              productId: id
            }
          }).then(res => {
            console.log(res);
            if (res.code == '100') {
              let arr = that.data.listData;
              console.log(arr);
              if (arr.findIndex(item => item.productId == id) != -1) {
                console.log(`存在当前学生`);
                arr.splice(arr.findIndex(item => item.productId == id), 1);
                console.log(arr);
                that.setData({
                  listData: arr
                });
              } else {
                console.log(`不存在当前作品`);
              }
            }
          })
        } else if (sm.cancel) {
          console.log('用户点击了取消');
        }
      },
      complete: function() {
        that.setData({
          isshowremove: false
        })
      }
    })
  },
  cancel(e) {
    console.log('ddddddddd')
    let id = e.currentTarget.dataset.id;
    this.setData({
      imgId: id,
      isshowdelete: false
    })
  },
})