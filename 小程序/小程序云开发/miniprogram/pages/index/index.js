//index.js
const app = getApp()

Page({
  data: {
    num:0
  },

  onLoad: function() {
    this.removeSomeOne();
    wx.cloud.callFunction({
      name:"add",
      data:{
        a:1,
        b:2
      },
      success:function(res){
        console.log(res,'就开始的方法')
      },
      fail:function(res){
        console.log(res,'离开')
      }
    })
  },
  addData:function(){
    const db = wx.cloud.database();
    this.data.num += 10; 
    db.collection('demo').add({
      // data 字段表示需新增的 JSON 数据
      data: {
        // _id: 'todo-identifiant-aleatoire', // 可选自定义 _id，在此处场景下用数据库自动分配的就可以了
        description: "learn cloud database" + this.data.num,
        due: new Date(),
        number:this.data.num,
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
  getSomeNumberData:function(){
    const db = wx.cloud.database();
    const _ = db.command;
    db.collection('demo').where({
      number:_.in([30,50])
    }).get({
      success:(res)=>{
        console.log(res,'了就开始地方')
      },
      fail:res=>{
        console.log(res,'水电费接口')
      }
    })
  },
  //删除
  removeSomeOne:function(){
    const db = wx.cloud.database();
    db.collection('demo').doc("f8ad1ca9-d4b8-42e0-9b1b-84462ce08aa2").remove({
      success:res=>{
        console.log(res,'ISD')
      }
    })
  }
})
