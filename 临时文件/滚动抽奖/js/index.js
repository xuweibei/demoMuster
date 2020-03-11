(function($) {
  var clickOnce = true;//是否可以点击 true可点
  var arrLength = [];//达到条件集合
  var totalNum = 0;//号码的位数
  var totalArr = [];//中奖集合
  var accel = 6;//加速度

  function LuckUp(obj, ZN) {
    var topZH = obj.height() - 10; //移动出屏幕的top位置
    obj.animate(
      {
        top: "-" + topZH + "px"
      },
      ZN,
      "linear",
      function() {
        //执行移动出屏幕以后删除本数字。
        obj.remove();
      }
    );
  }

  //从多少到多少进行随机。
  function GetRandomNum(Min, Max) {
    var Range = Max - Min;
    var Rand = Math.random();
    return Min + Math.round(Rand * Range);
  }

  function LuckDraw(jDom, Num,arr) {
    totalArr = arr
    totalNum = Num;
    var $this = this;
    var num = Num;
    var obj = jDom;
    //获取整个对象的宽度
    var widthZ = obj.width();
    //获取数字的div的高度 -20是给上下进行部分其他的数字展示。
    var heightZ = obj.height() - 20;
    //获取按钮的高度。
    var heightZ1 = heightZ - 2;
    //获取显示数字的宽度
    var widthH = widthZ - heightZ;
    var idF = obj.attr("id");
		obj.css("overflow","hidden");
    obj.attr("ZN", 0);
    //新建一个相对div来进行绝对div的存储。大小为0,0 这样可以移动到任何位置显示。
		var htmlStr="<div id='"+obj.attr('id')+"sy' style='position:relative;'>"
    // obj.css("overflow", "hidden");
    //当前数字位置。
    var offLeft = 6;

    for (var i = 0; i < num; i++) {
      //循环建立多少位数，初始化并添加相关事件。
      //初始化生成随机数字
      var sj = GetRandomNum(0, 9);
      //生成数字并进行相关div的生成排列位置。
        htmlStr+="<div class='"+obj.attr('id')+"Class' style='top:10px;position:absolute;line-height:"+heightZ+"px;left:"+offLeft+"px;width:"+parseInt(widthH / num)+"px;height:"+heightZ1+"px;'>"+sj+"</div>";
      offLeft += parseInt(widthH / num)+20;
    }
    obj.append(htmlStr);
    obj.append('<div class="btn">立刻抽奖</div>')

    // $("#" + obj.attr("id") + "Click").bind("click", function() {
      $(".btn").bind("click", function() {
      if (clickOnce) {
        isOpen = true;
        clickOnce = false;
        arrLength = [];
        obj.attr("ZN", 1);
        $("." + obj.attr("id") + "Class").each(function(i) {
          //对每位数字进行随机速度生成
          var _ZNY = GetRandomNum(50, 100);
          //本数字的划出行为。
          LuckUp($(this), _ZNY);
          LuckUp1($(this), _ZNY, obj.attr("id"), i + 1, 0, _ZNY, idF);
        });
      }
    });
    return {};
  }

  //把方法变成.的行为操作
  $.fn.luckDraw = function(setting,arr) {
    return new LuckDraw($(this), setting,arr);
  };

  function LuckUp1(obj, ZN, objName, num, num1, YSZN, idF) {
    //获取新添数字的高度位置
    var tops = -parseInt(obj.css("top")) + parseInt(obj.height());

    var width = obj.width();
    var height = obj.height();
    //获取新添数字距离左边的位置
    var lefts = parseInt(obj.css("left"));
    //获取上一个数字的数字值
    var val = parseInt(obj.html());
    //数字+1作为本次数字
    val++;
    //假如数字大于9则
    if (val > 9) {
      val = 0;
    }
    //新建数字及其DIV
    //class='"+objName+"Class'
    $("#" + objName + "sy").append(
      "<div index=" +
        num +
        " class='" +
        idF +
        "Class' id='" +
        objName +
        num +
        "-" +
        num1 +
        "' style='top:" +
        tops +
        "px;line-height:" +
        height +
        "px;left:" +
        lefts +
        "px;position:absolute;line-height:"+parseInt(obj.height())+"px;width:" +
        width +
        "px;height:" +
        height +
        "px;'>" +
        val +
        "</div>"
    );
    //数字进行移动
    $("#" + objName + num + "-" + num1).animate(
      {
        top: "10px"
      },
      ZN,
      "linear",
      function() {
        //下一个数字编号
        num1++;
        _ZN = $("#" + objName).attr("ZN");
        if (_ZN == 1) {
          ZN += accel;
          if (ZN > 200) {
            if (obj.attr("index") === "1" && val === totalArr[0]) {
              arrLength.push(obj.attr("index"));
              isOver();
              return;
            }
            if (obj.attr("index") === "2" && val === totalArr[1]) {
              if(arrLength.length>0){
                arrLength.push(obj.attr("index"));
                isOver();
                return;
              }
            }
            if (obj.attr("index") === "3" && val === totalArr[2]) {
              if(arrLength.length>1){
                arrLength.push(obj.attr("index"));
                isOver();
                return;
              }
            }
            if (obj.attr("index") === "4" && val === totalArr[3]) {
              if(arrLength.length>2){
                arrLength.push(obj.attr("index"));
                isOver();
                return;
              }
            }
            //本数字移动出屏幕方法执行
            LuckUp($(this), ZN);
            // // // //新数字初始化及开始移动。
            LuckUp1($(this), ZN, objName, num, num1, YSZN, idF);
            // ZN = 1000
            return;
          }
        }
        //本数字移动出屏幕方法执行
        LuckUp($(this), ZN);
        // //新数字初始化及开始移动。
        LuckUp1($(this), ZN, objName, num, num1, YSZN, idF);
      }
    );
  }



  //判断是否全部结束
  function isOver() {
    const arr = Array.from(new Set(arrLength));
    if (arr.length >= totalNum) {
      $("#laohuji0Click").html("开");
      clickOnce = true;
    }
  }


})(Zepto);
