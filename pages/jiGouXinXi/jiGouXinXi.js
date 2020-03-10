// 1、获取应用实例
const app = getApp();
const { link } = require('../../utils/ajax.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    avater: '../../images/avater.png',
    name: '',
    userName: '',
    userPhone: '',
    desc: '',
    userGrade: ''
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
   * 上传机构信息头像
  */
  uploadAvater() {
    console.log(`我已点击上传按钮`);
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album'],
      success: res => {
        console.log(res);
        // 1、获取图片上传后的临时路径
        let tempFilePaths = res.tempFilePaths[0];
        // 2、将上传的图片保存在本地，且展示出来
        this.setData({
          avater: tempFilePaths
        });

      },
    });
  },
  // 
  nameOk(e) {
    console.log(e);
    this.setData({
      name: e.detail.value
    });
  },
  userNameOk(e) {
    console.log(e);
    this.setData({
      userName: e.detail.value
    });
  },
  userPhoneOk(e) {
    console.log(e);
    this.setData({
      userPhone: e.detail.value
    });
  },
  descOk(e) {
    console.log(e);
    this.setData({
      desc: e.detail.value
    });
  },
  /**
   * 
  */
  submitForm() {
    console.log(this.data);
    if (this.data.avater == '../../images/avater.png') {
      wx.showToast({
        title: '请上传机构logo!',
        icon: 'none',
        duration: 2000
      });
    } else if (this.data.name.trim() == '') {
      wx.showToast({
        title: '请输入机构名称!',
        icon: 'none',
        duration: 2000
      });
    } else if (this.data.userName.trim() == '') {
      wx.showToast({
        title: '请输入联系人昵称!',
        icon: 'none',
        duration: 2000
      });
    } else if (this.data.userPhone.trim() == '') {
      wx.showToast({
        title: '请输入联系电话!',
        icon: 'none',
        duration: 2000
      });
    } else if (this.data.desc.trim() == '') {
      wx.showToast({
        title: '请输入机构简介!',
        icon: 'none',
        duration: 2000
      });
    } else {
      let _this = this;
      wx.uploadFile({
        url: 'https://zhangyu.liangziqishi.shop/api/user/uploadFile',
        filePath: _this.data.avater,
        name: 'img',
        header: {
          //和服务器约定的token, 一般也可以放在header中
          token: wx.getStorageSync("token"),
          "Content-Type": "multipart/form-data" // 配置必须
        },
        success({ data }) {
          let [{ id }] = JSON.parse(data).data; // 图片id

          link.ajax({
            path: '/api/organization/addOrganization/',
            data: {
              fileId: id,
              organizationName: _this.data.name,
              linkMan: _this.data.userName,
              mobile: _this.data.userPhone,
              organizationdesc: _this.data.desc
            }
          }).then(res => {
            console.log(res);
            if (res.code == 100) {

              wx.showToast({
                title: '申请成功!',
                icon: 'none',
                duration: 2000,
                success(res) {
                  setTimeout(function () {
                    wx.switchTab({
                      url: '../my/my',
                    });
                  }, 2000);
                }
              });
            }
            if(res.data.code == 400){
              wx.showToast({
                title: '手机号输入不正确',
                icon:'none',
                duration:1000
              })
            }

          });

        }
      })
    }
  }
})