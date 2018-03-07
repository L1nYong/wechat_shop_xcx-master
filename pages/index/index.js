//index.js
var app = getApp()
var md5 = require("../MD5.js")
var checkNetWork = require("../CheckNetWork.js")
var disabledToken = require("../disabledToken.js")
//获取应用实例
Page({
  data: {
    showView:true,
    //地图的宽高
    mapHeight: '100%',
    mapWidth: '100%',
    mapTop: '0',
    //用户当前位置
    point: {
      latitude: 0,
      longitude: 0
    },
    //货柜标注物
    markers: [{
      iconPath: "../../images/weizhi.png",
      id: 0,
      latitude: 24.618062,
      longitude: 118.076956,
      width: 30,
      height: 30
      },
      {
        iconPath: "../../images/weizhi.png",
        id: 0,
        latitude: 24.617340,
        longitude: 118.076822,
        width: 30,
        height: 30
      },
      {
        iconPath: "../../images/weizhi.png",
        id: 0,
        latitude: 24.616731,
        longitude: 118.076806,
        width: 30,
        height: 30
      }
    ],
    //当前地图的缩放级别
    mapScale: 18,
    //地图上不可移动的控件
    //controls: [],
    //当前扫描的车辆ID
    //currentBikeId: '',
    //已登录的地图组件
    controls: [
      {// //扫描二维码控件按钮
        id: 12,
        position: {
          left: 132.5 * wx.getStorageSync("kScreenW"),
          top: 523 * wx.getStorageSync("kScreenH"),
          width: 110 * wx.getStorageSync("kScreenW"),
          height: 40 * wx.getStorageSync("kScreenW")
        },
        iconPath: '../../images/saoma.jpg',
        clickable: true,
      },
      //隐藏说明按钮
      {
        position: {
          width: 1,
          height: 1
        },
        iconPath: '../../images/hidden_explain.png',
        clickable: false,
      },
      {
        id: 11,
        position: {
          left: 10 * wx.getStorageSync("kScreenW"),
          top: 523 * wx.getStorageSync("kScreenH"),
          width: 40 * wx.getStorageSync("kScreenW"),
          height: 40 * wx.getStorageSync("kScreenW")
        },
        iconPath: '../../images/dingwei.png',
        clickable: true,
      },
      //购物车控件按钮
      {
        id: 13,
        position: {
          left: 320 * wx.getStorageSync("kScreenW"),
          top: 523 * wx.getStorageSync("kScreenH"),
          width: 40 * wx.getStorageSync("kScreenW"),
          height: 40 * wx.getStorageSync("kScreenW")
        },
        iconPath: '../../images/shopping_cart.png',
        clickable: true,
      },
      //地图中心位置按钮
      {
        id: 14,
        position: {
          left: 177.5 * wx.getStorageSync("kScreenW"),
          top: 261.5 * wx.getStorageSync("kScreenH"),
          width: 20 * wx.getStorageSync("kScreenW"),
          height: 40 * wx.getStorageSync("kScreenW")
        },
        iconPath: '../../images/imgs_main_center@2x.png',
        clickable: false,
      }],
  },

  //控件的点击事件
  controltap: function (e) {
    var that = this
    var id = e.controlId
    if (id == 11) {
      //定位当前位置
      that.getUserCurrentLocation()
    } else if (id == 12) {
      //扫描二维码 扫描二维码 扫描二维码 扫描二维码 扫描二维码 扫描二维码
      if(app.d.userId == 0) {
        wx.showModal({
          title: '警告',
          content: '微信授权失败，点击确定重新获取授权。',
          success: function (res) {
            if (res.confirm) {
              wx.openSetting({
                success: (res) => {
                  if (res.authSetting['scope.userInfo']) {
                    app.getUserInfo();
                    wx.scanCode({
                      success: function (res) {
                        // success
                        var pro_num = res.result;
                        wx.request({
                          url: app.d.ceshiUrl + '/Api/Product/getProductId',
                          method: 'post',
                          data: {
                            pro_number: pro_num,
                          },
                          header: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                          },
                          success: function (res) {
                            //--init data 
                            var status = res.data.status;
                            var that = this;
                            if (status == 1) {
                              var productId = res.data.productId;
                              wx.request({
                                url: app.d.ceshiUrl + '/Api/Shopping/add',
                                method: 'post',
                                data: {
                                  uid: app.d.userId,
                                  pid: productId,
                                  num: 1,
                                },
                                header: {
                                  'Content-Type': 'application/x-www-form-urlencoded'
                                },
                                success: function (res) {
                                  // //--init data
                                  var data = res.data;
                                  if (data.status == 1) {
                                    wx.showToast({
                                      title: '加入成功，点击购物车结算',
                                      icon: 'none',
                                      duration: 2000
                                    })
                                  } else {
                                    wx.showToast({
                                      title: data.err,
                                      icon: 'none',
                                      duration: 2000
                                    });
                                  }
                                },
                                fail: function () {
                                  // fail
                                  wx.showToast({
                                    title: '网络异常！',
                                    duration: 2000
                                  });
                                }
                              });
                            } else {
                              wx.showToast({
                                title: res.data.err,
                                duration: 2000,
                              });
                            }
                          },
                          error: function (e) {
                            wx.showToast({
                              title: '网络异常！',
                              duration: 2000,
                            });
                          },
                        });
                      },
                      fail: function () {
                        // fail
                      },
                      complete: function () {
                        // complete
                      }
                    })
                  } else {
                    wx.showToast({
                      title: '授权失败',
                      icon: 'none',
                      image: '',
                      duration: 2000,
                      mask: true,
                      success: function(res) {},
                      fail: function(res) {},
                      complete: function(res) {},
                    })
                  }
                }
              })
            }
          }
        })
      } else {
        wx.scanCode({
          success: function (res) {
            // success
            var pro_num = res.result;
            console.log(pro_num);
            wx.request({
              url: app.d.ceshiUrl + '/Api/Product/getProductId',
              method: 'post',
              data: {
                pro_number: pro_num,
              },
              header: {
                'Content-Type': 'application/x-www-form-urlencoded'
              },
              success: function (res) {
                //--init data 
                var status = res.data.status;
                var that = this;
                if (status == 1) {
                  var productId = res.data.productId;
                  wx.request({
                    url: app.d.ceshiUrl + '/Api/Shopping/add',
                    method: 'post',
                    data: {
                      uid: app.d.userId,
                      pid: productId,
                      num: 1,
                    },
                    header: {
                      'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    success: function (res) {
                      // //--init data
                      var data = res.data;
                      if (data.status == 1) {
                        wx.showToast({
                          title: '加入成功，点击购物车结算',
                          icon: 'none',
                          duration: 2000
                        })
                      } else {
                        wx.showToast({
                          title: data.err,
                          icon: 'none',
                          duration: 2000
                        });
                      }
                    },
                    fail: function () {
                      // fail
                      wx.showToast({
                        title: '网络异常！',
                        duration: 2000
                      });
                    }
                  });
                } else {
                  wx.showToast({
                    title: res.data.err,
                    duration: 2000,
                  });
                }
              },
              error: function (e) {
                wx.showToast({
                  title: '网络异常！',
                  duration: 2000,
                });
              },
            });
          },
          fail: function () {
            // fail
          },
          complete: function () {
            // complete
          }
        })
      }
      // wx.scanCode({
      //   success: function (res) {
      //     // success
      //     var pro_num = res.result;
      //     console.log(pro_num);
      //     wx.request({
      //       url: app.d.ceshiUrl + '/Api/Product/getProductId',
      //       method: 'post',
      //       data: {
      //         pro_number: pro_num,
      //       },
      //       header: {
      //         'Content-Type': 'application/x-www-form-urlencoded'
      //       },
      //       success: function (res) {
      //         //--init data 
      //         var status = res.data.status;
      //         var that = this;
      //         if (status == 1) {
      //           var productId = res.data.productId;
      //           wx.request({
      //             url: app.d.ceshiUrl + '/Api/Shopping/add',
      //             method: 'post',
      //             data: {
      //               uid: app.d.userId,
      //               pid: productId,
      //               num: 1,
      //             },
      //             header: {
      //               'Content-Type': 'application/x-www-form-urlencoded'
      //             },
      //             success: function (res) {
      //               // //--init data
      //               var data = res.data;        
      //               if (data.status == 1) {                  
      //                 wx.showToast({
      //                   title: '加入成功，点击购物车结算',
      //                   icon: 'none',
      //                   duration: 2000
      //                 })                      
      //               } else {
      //                 wx.showToast({
      //                   title: data.err,
      //                   icon: 'none',
      //                   duration: 2000
      //                 });
      //               }
      //             },
      //             fail: function () {
      //               // fail
      //               wx.showToast({
      //                 title: '网络异常！',
      //                 duration: 2000
      //               });
      //             }
      //           });
      //         } else {
      //           wx.showToast({
      //             title: res.data.err,
      //             duration: 2000,
      //           });
      //         }
      //       },
      //       error: function (e) {
      //         wx.showToast({
      //           title: '网络异常！',
      //           duration: 2000,
      //         });
      //       },
      //     });
      //   },
      //   fail: function () {
      //     // fail
      //   },
      //   complete: function () {
      //     // complete
      //   }
      // })

  
    } else if (id == 13) {
      if (app.d.userId == 0) {
        wx.showModal({
          title: '警告',
          content: '微信授权失败，点击确定重新获取授权。',
          success: function (res) {
            if (res.confirm) {
              wx.openSetting({
                success: (res) => {
                  if (res.authSetting['scope.userInfo']) {
                    app.getUserInfo();
                    wx.navigateTo({
                      url: '../cart/cart'
                    })
                  } else {
                    wx.showToast({
                      title: '授权失败',
                      icon: 'none',
                      image: '',
                      duration: 2000,
                      mask: true,
                      success: function (res) { },
                      fail: function (res) { },
                      complete: function (res) { },
                    })
                  }
                }
              })
            }
          }
        })
      } else {
        wx.navigateTo({
          url: '../cart/cart'
        })
      }
    } else if (id == 15) {
      //使用说明
      wx.navigateTo({
        url: '../explain/explain'
      })
    } else if (id == 16) {
      //注册登录 
      wx.navigateTo({
        url: '../Register/Register'
      })
    }
  },

  //点击标注点
  markertap: function (e) {
    console.log(e.markerId)
  },

  //定位到用户当前位置
  getUserCurrentLocation: function () {
    this.mapCtx.moveToLocation();
    this.setData({
      'mapScale': 18
    })
  },

  failMessage: function () {
    wx.showToast({
      title: '连接服务器失败',
      icon: 'loading',
      duration: 2000,
    })
  },
  closeTip: function () {
    this.setData ({
      showView: false
    })
  },
  //页面加载的函数
  onLoad: function (options) {
    var shopId = options.shopId || 0
    if (shopId != 0) {
     wx.setStorageSync('shopId', shopId)
    }
    app.globalData.shopId = wx.getStorageSync('shopId') || 0
    var count = wx.getStorageSync('count') || 0;
    if (count > 2) {
      this.setData({
        showView: false
      })
    } else {
      count++;
      wx.setStorageSync('count', count)
    }
    //wx.setStorageSync('shopId', shopId)
    //app.globalData.shopId = wx.getStorageSync('shopId');
    var that = this
    //获取用户的当前位置位置
    wx.getLocation({
      type: 'gcj02', // 默认为 wgs84 返回 gps 坐标，gcj02 返回可用wx.openLocation 的坐标
      success: function (res) {
        // success
        var latitude = res.latitude
        var longitude = res.longitude
        var point = {
          latitude: latitude,
          longitude: longitude
        };
        that.setData({
          'point': point
        })
      }
    })
    //计算屏幕的高度
    var h = wx.getStorageSync("kScreenH")
    var top = h * 0.25 * 0.7
    var bottom = h * 0.25 * 0.3
    that.setData({
      'bikeRiding.topLineHeight': top,
      'bikeRiding.bottomLineHeight': bottom
    })
  },

  onReady: function (e) {
    //通过id获取map,然后创建上下文
    this.mapCtx = wx.createMapContext("myMap");
  },

  onShow: function () {
    console.log('onShow');
  },
  onHide: function () {
    // 生命周期函数--监听页面隐藏
    console.log('onHide')
  },
  onUnload: function () {
    // 生命周期函数--监听页面卸载
    console.log('onUnload')
  },
  onPullDownRefresh: function () {
    // 页面相关事件处理函数--监听用户下拉动作
    console.log('onPullDownRefresh')
  },
  onReachBottom: function () {
    // 页面上拉触底事件的处理函数
    console.log('onReachBottom')
  },
  onShareAppMessage: function () {
    // 用户点击右上角分享
    console.log('onShareAppMessage')
    var shopId = wx.getStorageSync('shopId') || 0
    return {
      path: '/pages/index/index?shopId=' + shopId // 分享路径
    }
  }
})