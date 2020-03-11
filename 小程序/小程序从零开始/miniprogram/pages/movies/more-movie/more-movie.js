// pages/movies/more-movie/more-movie.js

const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    sizeName: '',
    movies:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var name = options.sizeName;
    this.data.sizeName = name;
    var dataUrl = ''
    switch (name) {
      case '正在上映':
        dataUrl = app.globalData.doubanUrl + "/v2/movie/in_theaters";
        break;
      case '即將上映':
        dataUrl = app.globalData.doubanUrl + '/v2/movie/coming_soon';
        break;
      case '大片':
        dataUrl = app.globalData.doubanUrl + '/v2.movie/top250';
        break;
    }
    this.getData(dataUrl)
  },

  getData: function(url) {
    const that = this;
    wx.request({
      url,
      success: function(res) {
        that.setTheData(res.data)
      }
    })
  },

  setTheData: function (data, settKey, ) {
    var dataArr = [];
    for (var values in data.subjects) {
      if (data.subjects[values].title.length > 6){
        data.subjects[values].title = data.subjects[values].title.substr(0,8) + '...'
      }
      var obj = {
        title: data.subjects[values].title,
        imgUrl: data.subjects[values].images.large,
        soon: data.subjects[values].rating.average
      }
      dataArr.push(obj)
    }

    var resData = {};
    resData[settKey] = {
      dataArr: dataArr
    }
    console.log(dataArr,'離開')
    this.setData({
      movies:dataArr
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function(options) {
    wx.setNavigationBarTitle({
      title: this.data.sizeName
    })

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