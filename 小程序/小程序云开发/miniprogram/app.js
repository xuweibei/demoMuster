//app.js
App({
  onLaunch: function () {
    wx.cloud.init() //初始化云数据库
    const db = wx.cloud.database();
    this.getAllData(db)
  },
  //添加一条信息
  addData:function(db){
    db.collection('demo').add({
      // data 字段表示需新增的 JSON 数据
      data: {
        // _id: 'todo-identifiant-aleatoire', // 可选自定义 _id，在此处场景下用数据库自动分配的就可以了
        description: "learn cloud database",
        due: new Date("2018-09-01"),
        tags: [
          "cloud",
          "database"
        ],
        // 为待办事项添加一个地理位置（113°E，23°N）
        location: new db.Geo.Point(113, 23),
        done: false
      },
      success: function (res) {
        // res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
        console.log(res)
      }
    })
  },
  //获取某一条id的数据  api添加的可以获取到，手动添加的获取不到
  getSomeOne:function(db){
    db.collection('demo').doc('782fe49b-f3cf-456f-90e1-9400f2172a64').get().then(res=>{
      console.log(res,'离开计算机')
    })
    db.collection('demo').doc('782fe49b-f3cf-456f-90e1-9400f2172a64').get().then(res => {
      // res.data 包含该记录的数据
      console.log(res,'让他一人')
    })
  },
  getAllData:function(db){
    db.collection('demo').get({
      success:(res)=>{
        console.log(res,'离开谁发的')
      }
    })
  }
})
