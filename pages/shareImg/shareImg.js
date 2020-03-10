// pages/shareImg/shareImg.js
const {
  link
} = require('../../utils/ajax.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    qrCode: '',
    userId: '',
    userGrade: 1,
    canvasWidth: 0,
    canvasHeight: 0,
    canvasWidth1:0,
    canvasHeight1:0,
    prurl: '',
    prurl1: '',
    img: '',
    id: '',
    imgId: '',
    isshow: true,
    isShareImg: false,
    isGetImg: true,
    listData:[],
    imgDesc:'',
    collectionName:'',
    productDesc:'',
    collectionNum:'',
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options)
    let that = this
    let sysInfo = wx.getSystemInfo({
      success: function(res) {
        that.setData({
          //设置宽高为屏幕宽，高为屏幕高减去50
          canvasWidth: res.screenWidth,
          canvasHeight: res.screenHeight,
          canvasWidth1:res.windowWidth,
          canvasHeight1:res.windowHeight,
          img: options.img,
          id: options.id,
        })
      },
    })
    that.getShare();
    that.getStorageUserInfo();
    if (that.getPages() === "pages/index/index" || that.getPages() === "pages/myHuiGuan/myHuiGuan") {
      that.getShareImg()
      that.setData({
        collectionName:options.name,
        productDesc:options.desc,
        collectionNum:options.count+'/'+options.pcount,
      })
    } else {
      that.getShareImg()
      that.getProducton()
    }
    if (wx.getStorageSync('organizationName')) {
      wx.setNavigationBarTitle({
        title: `${wx.getStorageSync('organizationName')}`
      });
    } else {
      wx.setNavigationBarTitle({
        title: '章鱼书'
      });
    }
  },
  getQRCode() {
    // wx.showLoading({
    //   title: '图片生成中',
    // })
    let self = this
      let context = wx.createCanvasContext('secondCanvas')
      let width = self.data.canvasWidth
      let height = self.data.canvasHeight
      context.save()
      context.setFillStyle('white');//填充白色
      context.fillRect(0, 0, width, height);//画出矩形白色背景
      context.restore()
      // 背景图
      wx.getImageInfo({
        src: self.data.img,
        success: img1 => {
          let imgW = img1.width
          let imgH = img1.height
          var clip_left, clip_top, //左偏移值，上偏移值，
            clip_width, clip_height; //截取宽度，截取高
          clip_height = imgW * ((height - 170) / width);
          if (clip_height > imgH) {
            clip_height = imgH;
            clip_width = clip_height * (width / (height - 170))
            clip_left = (imgW - clip_width) / 2;
            clip_top = 0;
          } else {
            clip_left = 0;
            clip_top = (imgH - clip_height) / 2;
            clip_width = imgW
          }
          context.drawImage(img1.path, clip_left, clip_top, clip_width, clip_height, 5, 5, width-10, height - 170);

          // 小程序码
          wx.getImageInfo({
            src: self.data.qrCode, // 图片
            success: img => {
              console.log(img.path);
              context.drawImage(img.path, width - 60, height - 80, 60, 60);
              // 用户图像
              wx.getStorage({
                key: 'userInfo',
                success: function(res) {
                  wx.getImageInfo({
                    src: res.data.userHead,
                    success: img2 => {
                      console.log('path' + img2.path)
                      context.save();
                      var cx = 40;
                      var cy = height - 133;
                      context.arc(cx, cy, 30, 0, 2 * Math.PI, true);
                      context.clip();
                      context.drawImage(img2.path, 10, height - 163, 80, 80);
                      //刷新画布
                      context.restore();

                      context.moveTo(0, height - 100); //设置起点状态
                      context.lineTo(width, height - 100); //设置末端状态
                      context.lineWidth = 0.5; //设置线宽状态
                      //context.strokeStyle = 'blue'; //设置线的颜色状态
                      context.stroke(); //进行绘制

                      //小程序码下面的描述
                      context.setFillStyle("#000");
                      context.setFontSize(10);
                      context.fillText('识别二维码', width - 55, height - 10);
                      //设置用户名称
                      context.setFillStyle("#000");
                      context.setFontSize(18); //字大小
                      context.fillText(res.data.userName, 80, height - 135, 160, 24);
                      //设置日期
                      context.setFillStyle("#000");
                      context.setFontSize(16);
                      var timestamp = Date.parse(new Date());
                      var date = new Date(timestamp);
                      //获取月份  
                      var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
                      //获取当日日期 
                      var D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
                      context.fillText(M + '月' + D + '日', 80, height - 115, 80, ); 

                    
                       context.drawImage('../../images/imgNum.png', width - 70, height - 145, 20, 20);
                       //照片张数
                       context.setFillStyle("#000");
                       context.setFontSize(12); //字大小

                       if(self.data.listData.length!=0){
                         context.fillText(self.data.listData.length, width - 47, height - 128);
                       }else{
                         console.log('jfkdjf'+self.data.collectionNum);
                         context.fillText(self.data.collectionNum, width - 47, height - 128);
                       }
                       //作品描述
                       context.setFillStyle("#000");
                       context.setFontSize(12); //字大小

                       self.drawText(context,self.data.productDesc,5,height-80,148,width-80);
                     

                     context.drawImage('../../images/book.png',5,height-22,15,15);
                     //作品集名称
                      context.setFillStyle("#000");
                      context.setFontSize(12); //字大小
                      context.fillText(self.data.collectionName, 20, height - 10);

                      wx.hideLoading();
                      console.log('我的世界')
                      self.setData({
                        isShareImg: true
                      })
                      console.log('我们的梦')
                      // 储存文件
                      context.draw(false, () => {
                        // self.setData({
                        //   isshow: false,
                        // })
                        console.log('我们的未来')
                        wx.canvasToTempFilePath({
                          canvasId: 'secondCanvas',
                          fileType: 'jpg',
                          success: ({
                            tempFilePath
                          }) => {
                            console.log('我们的梦')
                            self.setData({
                              prurl1: tempFilePath
                            })
                            console.log('fffffffffffffffff'+self.data.prurl1)
                            let imgsrc = self.data.prurl1;
                            let arr = []
                            arr.push(imgsrc);
                            wx.previewImage({
                              current: imgsrc,
                              urls: arr,
                              success:()=>{
                                console.log('ggggggggggggggg')
                                self.setData({
                                  isShareImg: false,
                                  isshow:false
                                })
                                self.getShareImg();
                              }
                            })
                          }
                        })
                      })
                    }
                  })
                },
              })
            }
          })
        }
      })
  },

  handleLongPress() {
    let that = this;
    wx.showLoading({
      title: '加载中...',
      mask:true
    })

    that.getQRCode();
    // 生成方法
    // wx.saveImageToPhotosAlbum({
    //   filePath: this.data.prurl,
    //   success(res) {
    //     wx.showModal({
    //       content: '图片已保存到相册，赶紧晒一下吧~',
    //       showCancel: false,
    //       confirmText: '好的',
    //       confirmColor: '#333',
    //       success: function (res) {
    //         if (res.confirm) {
    //           console.log('用户点击确定');
    //         }
    //       }
    //     })
    //   },
    //   fail(err) {
    //     if (err.errMsg === "saveImageToPhotosAlbum:fail auth deny") {
    //       console.log("用户一开始拒绝了，我们想再次发起授权")
    //       console.log('打开设置窗口')
    //       wx.openSetting({
    //         success(settingdata) {
    //           if (settingdata.authSetting['scope.writePhotosAlbum']) {
    //             console.log('获取权限成功，给出再次点击图片保存到相册的提示。')
    //           } else {
    //             console.log('获取权限失败，给出不给权限就无法正常使用的提示')
    //           }
    //         }
    //       })
    //     }
    //   },
    // })
  },
  getShareImg() {
    if (this.data.isshow) {
      wx.showLoading({
        title: '图片生成中',
        mask:true
      })
    }
    let self = this
    let context = wx.createCanvasContext('firstCanvas')
    let width = self.data.canvasWidth1
    let height = self.data.canvasHeight1
    // 背景图
    wx.getImageInfo({
      src: self.data.img,
      success: img1 => {
        let imgW = img1.width
        let imgH = img1.height
        var clip_left, clip_top, //左偏移值，上偏移值，
          clip_width, clip_height; //截取宽度，截取高
        clip_height = imgW * ((height - 180) / width);
        if (clip_height > imgH) {
          clip_height = imgH;
          clip_width = clip_height * (width / (height - 180))
          clip_left = (imgW - clip_width) / 2;
          clip_top = 0;
        } else {
          clip_left = 0;
          clip_top = (imgH - clip_height) / 2;
          clip_width = imgW
        }
        context.drawImage(img1.path, clip_left, clip_top, clip_width, clip_height, 0, 0, width, height - 180);
        context.setStrokeStyle('red')
        context.strokeRect(0, height - 100, width, 100)
        wx.hideLoading();
        context.draw(false, () => {
          wx.canvasToTempFilePath({
            canvasId: 'firstCanvas',
            success: ({
              tempFilePath
            }) => {
              self.setData({
                prurl: tempFilePath
              })
            }
          })
        })
      }
    })
  },
  getProducton() {
    let self = this
    link.ajax({
      path: '/api/sampleReels/getProduction',
      data: {
        productionId: self.data.id,
      }
    }).then(res => {
      self.setData({
        listData: res.data.imgList,
        collectionName:res.data.collectionName,
        productDesc:res.data.productDesc,
        imgId: res.data.imgList[0].fileId
      })
    })
  },
  getPages() {
    let pages = getCurrentPages();
    let prevpage = pages[pages.length - 2];
    console.log(prevpage.route);
    return prevpage.route;
  },
  getImg(e) {
    let img = e.currentTarget.dataset.img;
    let id = e.currentTarget.dataset.id;
    if (this.data.img === img) {
      return
    } else {
      this.setData({
        img: img,
        imgId: id
      })
      this.getShareImg();
    }
  },
  getStorageUserInfo() {
    let url = this.route;
    // console.log(url);
    if (url != "pages/loading/loading") {
      wx.getStorage({
        key: 'userInfo',
        success: res => {
          // console.log(`从缓存中取出授权登陆后的用户信息`);
          //!res.data.userHead ? app.globalData.
          // console.log(app);
          // 1、存储相关数据
          console.log(res)
          this.setData({
            userGrade: res.data.status,
            userId: res.data.userId
          })
        }
      })
    }
  },
  drawText: function (ctx, str, leftWidth, initHeight, titleHeight, canvasWidth) {
    var lineWidth = 0;
    var lastSubStrIndex = 0; //每次开始截取的字符串的索引
    for (let i = 0; i < str.length; i++) {
      lineWidth += ctx.measureText(str[i]).width;
      if (lineWidth > canvasWidth) {
        ctx.fillText(str.substring(lastSubStrIndex, i), leftWidth, initHeight); //绘制截取部分
        initHeight += 16; //16为字体的高度
        lineWidth = 0;
        lastSubStrIndex = i;
        titleHeight += 30;
      }
      if (i == str.length - 1) { //绘制剩余部分
        ctx.fillText(str.substring(lastSubStrIndex, i + 1), leftWidth, initHeight);
      }
    }
    // 标题border-bottom 线距顶部距离
    titleHeight = titleHeight + 10;
    console.log(titleHeight)
    return titleHeight
  },
  getShare(){
    link.ajax({
      path: '/api/user/share',
      data: {
        // page:'pages/myCollection/myCollection',
        // status:1,
        // id:self.data.id
      }
    }).then(res => {
      console.log('二维码')
      console.log(res);
      this.setData({
        qrCode: res.data,
      })
    })
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

  }
})