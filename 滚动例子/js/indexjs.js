(function($){ 
 
	 function getRandom(n){
        return Math.floor(Math.random()*n+1)
     }
	//进行从标准位置消失的操作
	function LuckUp(obj,ZN){
		var topZH=obj.height()-10;//移动出屏幕的top位置
	 		obj.animate({ 
				top:'-'+topZH+'px'
			},  
			ZN,
			'linear',  
			function(){  //执行移动出屏幕以后删除本数字。
				obj.remove();
			});  
	}
	
	//从外边卷入进来的效果。
	//obj 以上一个数字作为参照物
	//ZN本次移动速度
	//objName整个对象名称
	//num第几个数字
	//num1第几个数字出现第几次
	//YSZN原始速度
	function LuckUp1(obj,ZN,objName,num,num1,YSZN){
		//获取新添数字的高度位置
		var tops=parseInt(obj.css("top"))+parseInt(obj.height());
		//获取新添数字距离左边的位置
		var lefts=parseInt(obj.css("left"));
		//获取上一个数字的数字值
		var val=parseInt(obj.html());
		//数字+1作为本次数字
		val++;
		//假如数字大于9则
		if(val>9){
			val=0;
			
		}
		//新建数字及其DIV
		//class='"+objName+"Class'
		$("#"+objName+"sy").append("<div  id='"+objName+num+"-"+num1+"' style='top:"+tops+"px;position:absolute;line-height:"+parseInt(obj.height())+"px;left:"+lefts+"px;width:"+parseInt(obj.width())+"px;border: 1px solid #999;height:"+parseInt(obj.height())+"px;'>"+val+"</div>");
		//数字进行移动
	 	$("#"+objName+num+"-"+num1).animate({ 
					top:'10px'
			},  
			ZN,
			'linear',  
			function(){  
				//下一个数字编号
				num1++;
				//判断是开还是关 假如是开则速度继续增加 每替换一个数字速度+100 直到原始速度的5倍
				_ZN=$("#"+objName).attr("ZN");
			 	if(_ZN==1){
					ZN-=100;
					if(ZN<YSZN/5){
						ZN=YSZN/5;
					}
				}else{
					//假如是关则速度减少，直到1500然后退出。
					ZN+=100;
					if(ZN>1500){
						
						return;
					}	
				}
				//本数字移动出屏幕方法执行
				LuckUp($(this),ZN);
				//新数字初始化及开始移动。
				LuckUp1($(this),ZN,objName,num,num1,YSZN);
			});  
		
	}
	//从多少到多少进行随机。
	function GetRandomNum(Min,Max){ 
 		var Range = Max - Min; 
 		var Rand = Math.random(); 
 		return(Min + Math.round(Rand * Range)); 
 
	} 
 
	
	
	
	
	function LuckDraw(jDom,Num){
        var $this=this;
		var num=Num;
		var obj=jDom;
		//获取整个对象的宽度
		var widthZ=obj.width();
		//获取数字的div的高度 -20是给上下进行部分其他的数字展示。
		var heightZ=obj.height()-20;
		//获取按钮的高度。
		var heightZ1=heightZ-2;
		//获取显示数字的宽度
		var widthH=widthZ-heightZ;
		//是否关闭
		var isOpen=false;
		obj.attr("ZN",0);
		//新建一个相对div来进行绝对div的存储。大小为0,0 这样可以移动到任何位置显示。
		var htmlStr="<div id='"+obj.attr('id')+"sy' style='position:relative;width:0px;height:0px'>"
		obj.css("overflow","hidden");
		//当前数字位置。
		var offLeft=0;
		 
		for(var i=0;i<num;i++){
			//循环建立多少位数，初始化并添加相关事件。
			//初始化生成随机数字
			var sj=GetRandomNum(0,9);
			//生成数字并进行相关div的生成排列位置。
			htmlStr+="<div class='"+obj.attr('id')+"Class' style='top:10px;position:absolute;line-height:"+heightZ+"px;left:"+offLeft+"px;width:"+parseInt(widthH / num)+"px;border: 1px solid #999;height:"+heightZ1+"px;'>"+sj+"</div>";
			offLeft+=parseInt(widthH/num);
		}
		//添加开始事件
	 	htmlStr+="<div id='"+obj.attr('id')+"Click' style='top:10px;position:absolute;cursor:pointer;line-height:"+heightZ+"px;left:"+offLeft+"px;width:"+parseInt(widthH/num)+"px;border: 1px solid #999;height:"+heightZ1+"px;'>开</div>";
		// htmlStr+="<div style='top:0px;position:absolute;width:"+widthH+"px;height:"+heightZ1/2+"px;filter: progid:DXImageTransform.Microsoft.Gradient(GradientType=0, StartColorStr=\"#22000000\", EndColorStr=\"#33FFFFFF\"); background-image: linear-gradient(to top, rgba(255, 255, 255, 0.1) 0%, rgba(0, 0, 0, 0.2) 80%, rgba(0, 0, 0, 0.4) 100%, #FFFFFF 100%);' >&nbsp;</div>"
		var top1=25+heightZ1/2;
		// htmlStr+="<div style='top:"+top1+"px;position:absolute;width:"+widthH+"px;height:"+heightZ1/2+"px;filter: progid:DXImageTransform.Microsoft.Gradient(GradientType=0, StartColorStr=\"#22FFFFFF\", EndColorStr=\"#33000000\");background-image: linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 0%, rgba(0, 0, 0, 0.2) 80%, rgba(0, 0, 0, 0.4) 100%, #FFFFFF 100%);'>&nbsp;</div>"
		htmlStr+="</div>"; 
		obj.append(htmlStr);
		
		 
		$("#"+obj.attr('id')+"Click").bind("click",function(){
			if(isOpen==false){
				isOpen=true;
				obj.attr("ZN",1);
			 
				$(this).html("停");
				$("."+obj.attr('id')+"Class").each(function(i){
					//对每位数字进行随机速度生成
					//alert($(this).html());
					var _ZNY=GetRandomNum(500,2000);
					LuckUp1($(this),_ZNY,obj.attr('id'),i,0,_ZNY);
					//本数字的划出行为。
					LuckUp($(this),_ZNY);
				});	
			}else{
				$(this).html("开");
				isOpen=false;
				obj.attr("ZN",0);
				
			}
		});
		return {
			//setTarget:function(target){
//				_target=$.extend(_target,target);
//				return this;
//			},
//			getOrders:function(){
//				var orders={};
//				var data = jDom.find(_target.element).each(function(index,elem) {
//					orders[index]=$(elem).attr(_target.attr);
//				});
//				return JSON.stringify(orders); 
//			},
//			getJDom:function(){
//				return jDom;
//			}
		}
    }
	//把方法变成.的行为操作
	 $.fn.luckDraw = function (setting) {
		 return new LuckDraw($(this),setting);
	 };






	var inputp={
		indexInput:0,
		
		addNew:function(obj,stepNum){
			this.initNew(obj,stepNum);
			this.indexInput++;
		},
		getDigit:function(val,num){
			var digitNum=0;
			if(num.toString().split(".")[1]){
				digitNum=num.toString().split(".")[1].length;
			}
			 
			if(digitNum>0){
		 		val=val.toFixed(digitNum);
			}
			return val;
			
		},
		initNew:function(obj,stepNum){
			
			
			
			
			var width=obj.width();
			var height=obj.height();
			var height1=height;
		 	 
			var _root = this;
		 	width+=3;
			//height+=0; 
			 
			obj.css("border-style","none");
			obj.css("border-width","0px");
		   
			obj.css("width",width-height1*2-7);
			obj.css("text-align","center");
			obj.css("outline","none");
			obj.css("vertical-align","middle");
			obj.css("line-height",height+"px");
			
			
			obj.wrap("<div id='"+obj.attr('id')+"T' style='overflow:hidden;width:"+width+"px;height:"+height+"px;border: 1px solid #CCC;'></div>");
			
			obj.before("<div id='"+obj.attr('id')+"l'  onselectstart='return false;' style='-moz-user-select:none;cursor:pointer;text-align:center;width:"+height1+"px;height:"+height1+"px;line-height:"+height1+"px;border-right-width: 1px;border-right-style: solid;border-right-color: #CCC;float:left'>-</div>");
			obj.after("<div id='"+obj.attr('id')+"r'  onselectstart='return false;' style='-moz-user-select:none;cursor:pointer;text-align:center;width:"+height1+"px;height:"+height1+"px;line-height:"+height1+"px;border-left-width: 1px;border-left-style: solid;border-left-color: #CCC;float:right'>+</div>");
			$("#"+obj.attr('id')+"l").click(function(){
				
				_root.leftDo(obj,stepNum);
			});
			$("#"+obj.attr('id')+"r").click(function(){
				_root.rightDos(obj,stepNum);
			});
			
		},
		leftDo:function(obj,stepNum){
			var val=this.formatNum(obj.val());
			val=Math.abs(val);
			val-=stepNum;
			
			val=this.getDigit(val,stepNum);
			 
			if(val<0){
				val=0;
				obj.val(0);
			}else{
				this.moveDo(obj,val,true,stepNum);
			};
			
			
		},
		rightDos:function(obj,stepNum){
			
			var val=this.formatNum(obj.val());
			val=Math.abs(val);
			val+=stepNum;
			val=this.getDigit(val,stepNum);
			
				
			this.moveDo(obj,val,false,stepNum);
			 
		},
		moveDo:function(obj,num,isup,stepNum){
			var startTop=0;
			var endTop=0;
			if(stepNum>=1){
				if(num.toString().split(".")[1]){
					 num=num.toString().split(".")[0];
					 obj.val(num);
				}
			}
			
			
			var num1=num;
			var lens1=num.toString().length;
			var divwidth=parseFloat(obj.css("font-size"))/2;
		 	if(isup){
				obj.val(num1);
				var isDecimal=false;
			 	for(i=lens1-1;i>=0;i--){
					var s=num.toString();
					var s1=s.substr(i,1);
					var s1num=parseFloat(s1);
					if(s1num!=9||isNaN(s1num)){
						if(isNaN(s1num)){
							//num=parseFloat(s.substr(i-1,lens1-i));
//							num++;
//							num=this.getDigit(num,stepNum);
						}else{
							num=parseFloat(s.substr(i,lens1-i));
							num++;
							break;
						}
						
					}
				}
				//num=this.getDigit(num,stepNum)
				startTop=0;
				endTop=-40;
			}else{
				var isDecimal=false;
			 	for(i=lens1-1;i>=0;i--){
					var s=num.toString();
					var s1=s.substr(i,1);
					var s1num=parseFloat(s1);
				 	if(s1num!=0||isNaN(s1num)){
						
						if(isNaN(s1num)){
							//num=parseFloat(s.substr(i-1,lens1-i));
//							num=this.getDigit(num,stepNum);
							isDecimal=true;
						}else{
							num=parseFloat(s.substr(i,lens1-i));
							break;
						}
					}
				}
				if(isDecimal){
					num=this.getDigit(num,stepNum);
				}
				startTop=40;
				endTop=0;
			}
		 
			
			if($("#"+obj.attr('id')+"Num").length <1){
				//background-color:#fff;
				var numstr=num.toString();
				var widths=divwidth*numstr.length;
				var stri="<div id='"+obj.attr('id')+"sy' style='position:relative;width:0px;height:0px'><div id='"+obj.attr('id')+"Num' style='width:"+widths+"px;z-index:100;position:absolute;height:"+obj.height()+"px;top:"+startTop+"px; line-height:"+obj.height()+"px;font-family: "+obj.css("font-family")+";font-size:"+obj.css("font-size")+";'>";
				for(i=0;i<numstr.length;i++){
					var nums=numstr.substr(i,1);
					if(nums=="."){
						stri+="<div style='float:left;width:"+divwidth+"px;'>&nbsp;";
					}else{
						stri+="<div style='float:left;width:"+divwidth+"px;background-color:#fff'>";
						stri+=nums;
					}
					stri+="</div>";
				}
				stri+="</div></div>";
				 
				$("#"+obj.attr('id')+"T").prepend(stri);
			 	var leftOff=0;
				if(num1.toString().length-num.toString().length>0){
					leftOff=(divwidth*(num1.toString().length-num.toString().length))/2;
				}
				var pz=0;
				if(/msie/.test(navigator.userAgent.toLowerCase())){
					pz=1; 
				}
     			if(/firefox/.test(navigator.userAgent.toLowerCase())){
					pz=1; 
				}
				if(/webkit/.test(navigator.userAgent.toLowerCase())){
					 
				}    
			 	if(/opera/.test(navigator.userAgent.toLowerCase())){
					pz=1;
				} 
				var leftpx=(obj.width()/2)+obj.height()-($("#"+obj.attr('id')+"Num").width()/2)+1+leftOff+pz;
			 	$("#"+obj.attr('id')+"Num").css("left",leftpx);
				$("#"+obj.attr('id')+"Num").animate({ 
					top:endTop+'px'
					//,opacity:0.4
				},  
				300,  
				function(){  
					$("#"+obj.attr('id')+"sy").remove();
					if(isup){
					
					}else{
						obj.val(num1);
					}
				});  
			}		
		}
		,
		
		formatNum:function(val){
			var val=parseFloat(val);
			if(isNaN(val)){ 
				val=0;
			}
			return val;	
		},
		
	};
	 
   
    $(function(){
	 	inputp.addNew($("#inputs"),0.1);
		inputp.addNew($("#inp"),1);
		})  
})(jQuery);  // JavaScript Document
// 把16进制颜色转换成rgb格式
 