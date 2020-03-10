// 1、获取应用实例
const app = getApp();
const { link } = require('../../utils/ajax.js');
// const { uploadImages } = require('../../utils/uploadImages.js');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        sampleReelsId: '', // 作品集id
        productDesc: '',   // 作品描述
        productImg: [],    // 图片
        productImgId: [],   // 图片上传后 
        isUploaded: false,   // 图片是否上传完成
        productVideo:'',
        productVideoId:'',
        imgOrVideo:false,
        isshow:false,
     },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log( options );
        // 1、接收作品集Id
        let shopId = options.shopId
        this.setData({
            sampleReelsId: shopId 
        });
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function (res) {
      this.videoContext = wx.createVideoContext('videos');
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
     * 数据同步：实施监听textare的变动
    */
    productDesc(e){
        console.log(e);
        this.setData({
            productDesc: e.detail.value     
        });
        
    },
    /**
     * 图片选择函数
    */
    uploadImgs(){
      this.setData({
        imgOrVideo: false
      })
      if(this.data.productVideo !== ''){
        wx.showToast({
          title: '您已经选择上传视频，暂时不能上传图片！',
          icon:'none',
          duration:2000
        })
      }else{
        let _this = this;
        wx.chooseImage({
          count: 4,
          sizeType: ['original', 'compressed'],
          sourceType: ['album', 'camera'],
          success(res) {
            console.log(res);
            if (res.tempFilePaths.length < 4) { // 如果上传的图片小于4
              wx.showToast({
                title: '一次可支持上传多张图片,但不超过4张',
                icon: 'none',
                duration: 2000,
                success(res2) {
                  _this.setData({
                    productImg: res.tempFilePaths
                  });
                },
              });
            } else {
              wx.showToast({
                title: '上传图片选定4张以上会默认取前4张,支持重复选取',
                icon: 'none',
                duration: 2000,
                success() {
                  _this.setData({
                    productImg: res.tempFilePaths
                  });
                }
              });
            }
          },
          fail(err) {
            wx.showToast({
              title: '上传失败!请重新上传',
              icon: 'none',
              duration: 2000
            })
          }
        });
      }
    },
    /**
     * 多张图片上传函数
    */
    uploadImages(data){
        let _this = this;
        let i = data.i ? data.i : 0;                    //当前上传的哪张图片 
        let success = data.success ? data.success : 0;  //上传成功的个数         
        let fail = data.fail ? data.fail : 0;           //上传失败的个数 

        wx.showLoading({
            title: '上传中...',
            mask:true
        });

        console.log('ffffffffffff',this.data.productImgId)
        wx.uploadFile({
            url: 'https://zhangyu.liangziqishi.shop/api/user/uploadFile',
            filePath: data[i],
            name: 'img',
            header: {//和服务器约定的token, 一般也可以放在header中
                token: wx.getStorageSync("token"),
                "Content-Type": "multipart/form-data" // 配置必须
            },
            success({ data }) {
              console.log('ffffffffffff')
              console.log({data});
              console.log(JSON.parse(data).code);
              if(JSON.parse(data).code == 400){
                console.log('错误信息解放军的交付的交付')
                _this.data.productImgId.push('err');
              }else{
                console.log('jfdkjfkdfdkjfdjkjfd')
                let [{ id }] = JSON.parse(data).data; // 图片id
                success++;          //图片上传成功，图片上传成功的变量+1
                console.log(data);
                let productImgId = 'productImgId[' + i + ']';
                _this.setData({
                  [productImgId]: id.toString()
                });
              }
            },
            fail(err) {
                fail++;             //图片上传失败，图片上传失败的变量+1
                // console.log('fail:' + i + "fail:" + fail);
            },
            complete: () => {
                console.log(i);
                i++;                //这个图片执行完上传后，开始上传下一张            
                if (i == data.length) {   //当图片传完时，停止调用          
                    // console.log('执行完毕');
                    // console.log('成功：' + success + " 失败：" + fail);
                    console.log( `已上传图片id为：----------` );
                    console.log(_this.data.productImgId);
                    wx.hideLoading()
                    this.postNowData()
                } else {            //若图片还没有传完，则继续调用函数                
                    // console.log(i);
                    data.i = i;
                    data.success = success;
                    data.fail = fail;
                    _this.uploadImages(data);
                }
            }
        });

    },
    /**
     * 接口调用——发送提交请求
    */
    postNowData(){
        let _this = this;
        let doIt = 0
        let list = _this.data.productImgId
        console.log(_this.data.productImgId.length)
        console.log('llllllll',doIt);
        for(let i=0;i<list.length;i++){
          if(list[i] == "err"){
            doIt++
          }
        }
        if(doIt == 0){
          link.ajax({
            path: '/api/productCollection/uploadProduct',
            data: {
              productDesc: this.data.productDesc,
              sampleReelsId: this.data.sampleReelsId,
              file: this.data.productImgId
            }
          }).then(res => {
            console.log(res);
            if (res.code == 100) {
              wx.showToast({
                title: '创建成功!',
                icon: 'success',
                duration: 2000,
                success() {
                  wx.redirectTo({
                    url: '../myCollection/myCollection?shopId=' + _this.data.sampleReelsId,
                  });

                }
              });
            }else{
              
            }
          });
        }else{
          wx.showToast({
            title: '图片中含有涉嫌违规的信息，请选择规范图片重新上传',
            icon: 'none',
            duration: 2000,
          })
        }
    },

    /**
     * 接口调用——提交
    */
    submit(){
        console.log('梦丽春初中')
        let _this = this;
        if ( !this.data.productDesc ){
            wx.showToast({
                title: '请输入作品描述',
                icon: 'none',
                duration: 2000
            });
        } else if ( this.data.productImg == 0 && this.data.productVideo == ''){
            wx.showToast({
                title: '请上传作品',
                icon: 'none',
                duration: 2000
            });
        }else{
          if(!this.data.imgOrVideo){
            console.log(`验证通过~------------------`);
            console.log(this.data.productImg);
            let imgsSrc = this.data.productImg;
            let productImgId = this.data.productImgId;
            if(productImgId.length > 0){
              this.postNowData()
            }else{
              this.uploadImages(imgsSrc);
            }
            // 调用多次上传图片函数
            if (this.data.isUploaded) {
              // 图片上传接口完成
              console.log('图片上传接口完成');
            }
          }else{
            let videoSrc = this.data.productVideo;
            this.uploadVideos(videoSrc);
            if (this.data.isUploaded) {
              // 图片上传接口完成
              console.log('图片上传接口完成');
            }
          }
        }
    },
    previewImg(e) {
      console.log(this.data.productImg)
      console.log(e.currentTarget.dataset.presrc);
      let that = this,
        imgsrc = e.currentTarget.dataset.presrc,
        arr = that.data.productImg;
      //console.log(preArr)
      wx.previewImage({
        current: imgsrc,
        urls: arr
      })
     },
  delFile(e) {
    let that = this;
    console.log(that.data.productImg);
    let delNum = e.currentTarget.dataset.index,
      delType = e.currentTarget.dataset.type,
      upImgArr = that.data.productImg,
      upProductimgId = that.data.productImgId;
    console.log('反反复复'+e.currentTarget.dataset.index)
    if (delType == 'image') {
      upImgArr.splice(delNum, 1);
      upProductimgId.splice(delNum,1);
      that.setData({
        productImg: upImgArr,
        productImgId: upProductimgId
      })
    } else if (delType == 'video') {
      that.setData({
        productVideo: '',
        isshow:false,
        imgOrVideo:false
      })
    }
  }, 
  // playVideo(){
  //   this.videoContext.play();
  // },
  // uploadVideo() {
  //   let _this = this;
  //   if (this.data.productImg.length != 0) {
  //     wx.showToast({
  //       title: '您已经选择上传图片，暂时不能上传视频！',
  //       icon: 'none',
  //       duration: 2000
  //     })
  //   } else {
  //     _this.setData({
  //       imgOrVideo: true
  //     })
  //     console.log("我正在上传视频")
  //     wx.chooseVideo({
  //       sourceType: ['album', 'camera'],
  //       camera: 'back',
  //       success(res) {
  //         console.log(res);
  //         if (res.size > 1024000) {
  //           wx.showToast({
  //             title: '视频大小不超过10M',
  //             icon: 'none',
  //             duration: 2000,
  //           })
  //         } else if (res.duration > 600) {
  //           wx.showToast({
  //             title: '视频长度不超过10分钟',
  //             icon: 'none',
  //             duration: 2000,
  //           })
  //         } else {
  //           _this.setData({
  //             productVideo: res.tempFilePath,
  //             isshow: true
  //           })
  //         }
  //       },
  //       fail(err) {
  //         wx.showToast({
  //           title: '上传失败!请重新上传',
  //           icon: 'none',
  //           duration: 2000
  //         })
  //       }
  //     })
  //   }
  // },
  // uploadVideos(src) {
  //   let _this = this
  //   let path = src;
  //   console.log(src);
  //   wx.uploadFile({
  //     url: 'https://zhangyu.liangziqishi.shop/api/user/uploadFile',
  //     method: 'POST',
  //     filePath: src,
  //     name: 'file',
  //     header: {//和服务器约定的token, 一般也可以放在header中
  //       token: wx.getStorageSync("token"),
  //       "Content-Type": "multipart/form-data" // 配置必须
  //     },
  //     success(res) {
  //       let productVideoId = JSON.parse(res.data).data[0].id
  //       console.log(JSON.parse(res.data).data[0].id);
  //       _this.setData({
  //         productVideoId: productVideoId
  //       })
  //       console.log("视频上传成功")
  //     },
  //     fail() {
  //       console.log("视频上传失败")
  //     },
  //     complete: () => {
  //       console.log(_this.data.productVideoId);
  //       _this.setData({
  //         productDesc: this.data.productDesc,
  //         sampleReelsId: this.data.sampleReelsId,
  //         file: this.data.productVideoId
  //       })
  //       this.postNowData();
  //     }
  //   })
  // },
})