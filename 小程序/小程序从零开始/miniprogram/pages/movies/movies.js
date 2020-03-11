// pages/movies/movies.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {

    inTheater: {},
    comingSoon: {},
    top250: {},
    name: "",
    showSearch: false,
    searchRes: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var inTheatersUrl = app.globalData.doubanUrl + '/v2/movie/in_theaters';
    var comingSoonUrl = app.globalData.doubanUrl + '/v2/movie/coming_soon';
    var top250Url = app.globalData.doubanUrl + '/v2/movie/top250';
    this.getMovieListData(inTheatersUrl, 'inTheater', '正在上映')
    this.getMovieListData(comingSoonUrl, 'comingSoon', '即將上映')
    this.getMovieListData(top250Url, 'top250', '大片')
  },

  getMovieListData: function(url, settKey, name) {
    var that = this;
    wx.request({
      url,
      method: "GET",
      header: {
        "Content-Type": ""
      },
      success: function(res) {
        that.setTheData(res.data, settKey, name)
      },
      fail: () => {
        console.log('失敗了')
      }
    })
  },

  onBindFocus: function() {
    this.setData({
      showSearch: true
    })
  },

  closeBtn: function() {
    this.setData({
      showSearch: false
    })
  },
  onBindChange: function(e) {
    var text = e.detail.value;
    var searchUrl = app.globalData.doubanUrl + '/v2/movie/search?q=' + text;
    this.getMovieListData(searchUrl, "searchRes", '')
  },
  setTheData: function(data, settKey, name) {
    var dataArr = [];
    for (var values in data.subjects) {
      var obj = {
        title: data.subjects[values].title,
        imgUrl: data.subjects[values].images.large,
        soon: data.subjects[values].rating.average
      }
      dataArr.push(obj)
    }

    var resData = {};
    resData[settKey] = {
      dataArr: dataArr.slice(0, 3),
      name
    }
    this.setData(resData)
  },
  onTapMore: function(event) {
    var name = event.currentTarget.dataset.sizename;
    wx.navigateTo({
      url: "more-movie/more-movie?sizeName=" + name
    })
  },
  getAdress: function() {
    wx.chooseAddress({
      success: (res) => {
        console.log(res, '了开始交电费发')
      }
    })
  },
  isLogin: function() {
    wx.checkSession({
      success: (result) => {
        console.log(result, '莱克斯顿')
      },
      　　　　fail: function(res) {　　　　　　
        console.log("需要重新登录");　　　　　　
        wx.login({})　　　　　　
      }
    });
  },
  getUserInfo: function() {
    console.log(111)
    wx.login({
      success: function(res) {
        console.log(res,'sfld')
        wx.getUserInfo({
          withCredentials:true,
          success: (res) => {
            console.log(res, '离开水电费')
          },
          fail: function(res) {　　　　　　
            console.log(res,"的");
          }
        })
      },
      fail: function(res) {　　　　　　
        console.log("需要重新登录");
      }
    })
  },
  info:function(){
    wx.openSetting({
      success:(res)=>{
        console.log(res,'时间快递费')
      }
    })
  }
})