// 1、获取应用实例
const app = getApp();
const { link } = require('../../utils/ajax.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userId: "",
    avater: "",     // 用户头像
    userName: "",   // 用户名称
    userGrade: 1,   // 1 普通用户 2 商户 3 商户学员 4 商户老师
    showReplace: false,     // 机构用户： 是否显示修改用户名对话框
    replacedUserName: "",   // 修改后的机构名称
    phone:"" ,
    organizationStatus:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (wx.getStorageSync('organizationName')) {
      wx.setNavigationBarTitle({
        title: `${wx.getStorageSync('organizationName')}`
      });
    }
    /**
     * 判断是否存在userInfo缓存，
     *    没有则跳转到启动页；
     *    有则根据用户身份进行页面信息展示
     * */
    this.getStorageUserInfo();
    this.getOrganizationStatus();
    this.getOrganization();
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
    if (wx.getStorageSync('organizationName')) {
      wx.setNavigationBarTitle({
        title: `${wx.getStorageSync('organizationName')}`
      });
    }
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
   * 分享当前微信小程序
   *      按钮-打开分享小程序对话框
  */
  onShareAppMessage(e) {
    console.log('jfdkjfdkfj')
    let userId = wx.getStorageSync('userInfo').userId
    let status = wx.getStorageSync('userInfo').status;
    let organizationName = wx.getStorageSync('organizationName')
    let name = wx.getStorageSync("userInfo").userName;
    if (e.from == 'button') {
      if(status == 2 || status == 4){
        return {
          title: `${organizationName}` + ' ' + '邀请您加入我们',
          path: '/pages/my/my?shareId=' + userId + '&&status=' + '4',
          imageUrl: wx.getStorageSync('organizationHeadImg'),
          success: function (res) {
            wx.showToast({
              title: '分享成功！',
            })
          }
        }
      }else{
        return {
          title: `${name}` + ' ' + '邀请您加入我们',
          path: '/pages/index/index',
          imageUrl: wx.getStorageSync('userInfo').userHead,
          success: function (res) {
            wx.showToast({
              title: '分享成功！',
            })
          }
        }
      }
    }
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
          // console.log(`从缓存中取出授权登陆后的用户信息`);
          console.log(res);
          //!res.data.userHead ? app.globalData.
          // console.log(app);
          // 1、存储相关数据
          let userId = res.data.userId;     // 后续接口需要
          let userGrade = res.data.status;  // 后续判断可能会用到   模拟操作 机构类 2;
          let phone = ''
          if (res.data.phone) {
            let phone = res.data.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
          }
          if (userGrade == 2) {
            console.log(`机构用户----------`);
            this.setData({
              userId: userId,
              userGrade: userGrade,
              avater: wx.getStorageSync('organizationHeadImg'),
              userName: wx.getStorageSync('organizationName'),
              phone: phone
            });
          } else {
            console.log(`普通用户----------`);
            console.log(app);
            if (app.globalData.userInfo){
              this.setData({
                userId,
                userGrade: userGrade,
                avater: app.globalData.userInfo.avatarUrl,
                userName: app.globalData.userInfo.nickName,
                phone: phone
              });
            }else{
              this.setData({
                userId,
                userGrade: userGrade,
                avater: res.data.userHead,
                userName: res.data.userName,
                phone: phone
              })
            }
          }
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
   * 机构用户 ——更换头像
  */
  replaceAvater() {
    let userGrade = this.data.userGrade;
    console.log("------------" + userGrade);
    if (userGrade == 2) {
      wx.chooseImage({
        count: 1,
        sourceType: ['album'],
        success: res => {
          let _this = this;
          // 1、获取上传头像的临时路径
          let tempFilePaths = res.tempFilePaths;
          console.log(tempFilePaths);
          // 2、将临时路径保存在本地显示出来
          let oldAvater = this.data.avater;

          // 3、将图片文件上传到服务器
          let userId = this.data.userId;
          wx.uploadFile({
            url: 'https://zhangyu.liangziqishi.shop/api/user/uploadFile',
            filePath: tempFilePaths[0],
            name: 'img',
            header: {
              //和服务器约定的token, 一般也可以放在header中
              token: wx.getStorageSync("token"),
              "Content-Type": "multipart/form-data" // 配置必须
            },
            success({ data }) {
              console.log(JSON.parse(data).data);
              let [{ id }] = JSON.parse(data).data;
              // 更新图片
              link.ajax({
                path: '/api/organization/setAvatar',
                data: {
                  organizationId: userId,
                  avatar: id
                }
              }).then(({ data }) => {
                console.log(`调后台接口------------------`);
                console.log(data);
                let newAvater = data.logo;
                // 1、更新本页面的avater
                _this.setData({
                  avater: newAvater
                });
                // 2、更新storage中的avater
                wx.getStorage({
                  key: 'userInfo',
                  success({ data }) {
                    // 更新新上传的头像
                    let newUserInfo = Object.assign(data, { userHead: newAvater });
                    // 保存在storage中
                    wx.setStorage({
                      key: 'userInfo',
                      data: newUserInfo,
                      success(res) {
                        wx.showToast({
                          title: '更新成功!',
                          icon: 'none',
                          duration: 2000
                        });
                      }
                    });
                  },
                });
              });
            },
            fail(err) {
              wx.showToast({
                title: '图片上传失败',
                icon: 'error',
                duration: 2000,
                success(res) {
                  this.setData({
                    avater: oldAvater
                  });
                }
              });
            }

          });
        },
      })
    }
  },
  /**
   * 机构用户 ——更换用户名:
   *      打开更换机构名称对话框
  */
  replaceUserName() {
    let userGrade = this.data.userGrade;
    console.log(userGrade);
    if (userGrade == 2) {
      this.setData({
        showReplace: true
      });
    }
  },
  /**
   * 机构用户 ——更换用户名:
   *      取消按钮关闭对话框
  */
  modal_click_Hidden() {
    this.setData({
      showReplace: false
    });
  },
  /**
   * 机构用户 ——更换用户名:
   *      提交按钮
  */
  submitReplacedUserName() {
    if (!this.data.replacedUserName.trim()) {
      wx.showToast({
        title: '请输入机构名称',
        icon: 'none',
        duration: 2000
      });
    } else {
      let _this = this;
      link.ajax({
        path: '/api/organization/setAvatar',
        data: {
          organizationId: this.data.userId,
          organizationName: this.data.replacedUserName
        }
      }).then(res => {
        console.log(res);
        let newUserName = res.data.organizationName;
        wx.setStorageSync("organizationName", newUserName);
        wx.getStorage({
          key: 'userInfo',
          success(res2) {
            console.log(res2);
            let newUserInfo = Object.assign(res2.data, { userName: newUserName });
            console.log(newUserInfo);
            wx.setStorage({
              key: 'userInfo',
              data: newUserInfo,
              success() {
                wx.showToast({
                  title: '商户名称修改成功!',
                  icon: 'none',
                  duration: 2000,
                  success() {
                    // 1、更新本页面的数据
                    _this.setData({
                      userName: newUserName
                    });
                    // 关闭修改机构名弹出窗
                    _this.setData({
                      showReplace: false
                    });
                  }
                })
                _this.onShow();
              }
            });
          },
        })
      
      });
    }
  },
  /**
   * 机构用户 ——更换用户名
   *      更新input 输入值
   */
  changeCancelReason(e) {
    this.setData({
      replacedUserName: e.detail.value
    });
  },

  /**
   * 升级为培训机构
   *   -- 【普通用户】路由跳转 —— 
  */
  goToUpgrade() {
    wx.navigateTo({
      url: '../jiGouXinXi/jiGouXinXi',
    });
  },
  getOrganizationStatus(){
    link.ajax({
      path:'/api/user/organizationStatus'
    }).then(res => {
      console.log(res);
    })
  },
  getOrganization(){
    link.ajax({
      path:'/api/user/organizationStatus'
    }).then(res=>{
      console.log(res);
      this.setData({
        organizationStatus:res.data
      })
    })
  }
})