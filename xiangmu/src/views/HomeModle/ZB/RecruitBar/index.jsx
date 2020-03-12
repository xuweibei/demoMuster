import React from 'react'
import {
  message, Form, Row, Col, Input, Select, Button, Icon,
  Table, Pagination, Divider, Modal, Upload
} from 'antd';
const FormItem = Form.Item;
import ReactEcharts from 'echarts-for-react';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Link, withRouter } from 'react-router-dom'
import { env } from '@/api/env';
import SelectRecruitBatch from '@/components/BizSelect/SelectRecruitBatch';

import echarts from 'echarts/lib/echarts';
import { 
    searchFormItemLayout 
  } from '@/utils/componentExt';
import { studentNum,orderForACertainTime,mainLineByRegion,mainLine } from '@/actions/admin';
import { change } from '@/actions/dic'; 
import ContentBox from '@/components/ContentBox';

class RecruitBar extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 
        compare:[],
        pieId:'2',
        recruitBatchId:'',
        url:'',
        val:'',
        title:'招生情况',
        option : {
            toolbox:{
                height:10
            },
            tooltip : {
                trigger: 'axis',
                axisPointer : {            // 坐标轴指示器，坐标轴触发有效
                    type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                },
                // formatter:function(params)  
                // {  
                //    var relVal = params[0].name;  
                //    for (var i = 0, l = params.length; i < l; i++) {  
                //         relVal += '<br/>' + params[i].seriesName + ' : ' + params[i].value;  
                //     }  
                //     relVal +='<br/>'+ 'zoingji'+':3000'
                //    return relVal;  
                // } 
            },
            legend: {
                data: ['ACCA','CMA','CIMA','CFA','FIRM','lala','xixi'],
                // bottom:'95%',
                height:'2000px',
                selected:{}
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                top:'30%',
                // width:'1000',
                // height:'180',
                containLabel: true
            },
            xAxis:  {
                type: 'value'
            },
            color: ['#f8395d','#f7728b','#f5a0b0','#a66f7a','#f37544','#c93614','#bd12ee','#ce73e8','#8f6e99','#4937ef','#6f62e6','#8c89a9','#15beee','#79b2c3','#70919b','#4e1103','#6bc33b','#4fbeb2','#528b85','#2ef79b','#64c297','#156a01','#e6f226','#9ea441','#e6962d','#a58153'],
            
            yAxis: {
                type: 'category',
                axisLabel:{
                    margin:30
                },
                // data: ['百色','蚌埠','保定','北京','成都','长春','长沙','重庆','大连','福州']
            },
            series: [
                // {
                //     name: 'ACCA',
                //     type: 'bar',
                //     stack: '总量',
                //     label: {
                //         normal: {
                //             show: true,
                //             position: 'insideRight'
                //         }
                //     },
                //     data: [320, 302, 301, 334, 390, 330, 320, 320, 310, 330]
                // }
            ],
            student:0,
            noNewStudent:0,
            weekOrder:0,
            monthOrder:0,
            season:0
        },
    }
  
  }
  getBarDataList = (value) => {
    if(this.state.pieId == '1'){
        this.props.mainLine({recruitBatchId:value}).payload.promise.then((response)=>{
            let data = response.payload.data;  
            if(data.state == "error"){ 
                let generBar = this.state.option;
                generBar.legend.data.length = 0;
                generBar.series.length = 0;
                generBar.yAxis.data = [];
                this.setState({generBar,title:""}) 
            }
            if(data.state=='success'){  
                let branchBar = this.state.option;
                branchBar.legend.data.length = 0;
                let earchName = [];
                //拿到所有的key也就是课程名
                for(let item in data.data.itemMap){
                    earchName.push(item);
                }
                //改课程名
                branchBar.legend.data = earchName;
                //改Y轴的城市名
                branchBar.yAxis.data = data.data.branchList;
                //改变数据
                branchBar.series.length = 0;
                var that = this;
                earchName.forEach((e,i)=>{
                    branchBar.series.push(
                        {
                            name: e,
                            type: 'bar',
                            stack: '总量',
                            barMaxWidth:30,//最大宽度
                            label: {
                                normal: {
                                    show: true,
                                    align: 'center',
                                    formatter: function (params,option) {  
                                        if(params.value > 0){   
                                            let showArr = []
                                            let { compare } = that.state;   
                                            if(compare.length){ 
                                                for(var i=0;i<that.state.option.series.length;i++){
                                                    var has = false;
                                                    var data = that.state.option.series[i];
                                                    //判断c中是否有元素data
                                                    for(var j=0;j<compare.length;j++){
                                                        if(data.name == compare[j].name){
                                                            has =true;
                                                            break;
                                                        }
                                                    }
                                                    //如果没有
                                                    if(has==false){
                                                        showArr.push(data);
                                                    }
                                                }
                                            }else{
                                                showArr.push(...that.state.option.series)
                                            } 
                                            if(( showArr[0] && params.seriesName == showArr[0].name ) || ( showArr[1] && params.seriesName == showArr[1].name ) || ( showArr[2] && params.seriesName == showArr[2].name) || ( showArr[3] && params.seriesName == showArr[3].name ) ){ 
                                                return params.value; 
                                            }else {
                                                return '';
                                            }
                                        }else {
                                            return '';
                                        }
                                    }
                                },
                            },
                            data: [820, 832, 901, 934, 1290, 1330, 1320, 1290, 1330, 1320]
                        }
                    )
                });
                branchBar.series.forEach((e,i)=>{
                    e.data = data.data.itemMap[earchName[i]]
                });
                branchBar.tooltip.formatter=
                            function(params) {  
                                var relVal = params[0].name; 
                                let total =0;
                                for (var i = 0, l = params.length; i < l; i++) {  
                                    if(params[i].value){
                                        relVal += '<br/>' +'<div style="background:'+params[i].color+';width:12px;height:12px;float:left;border-radius:50%;margin-right:4px;margin-top:4px;"></div>'+params[i].seriesName + ' : ' + (params[i].value / 10000).toFixed(2)+'万元';   
                                        total += params[i].value;
                                    }
                                    }  
                                    relVal +='<br/>'+'<div style="float:left;margin-left:16px">合计</div>'+'&nbsp'+':'+'&nbsp'+(Math.round( total *100)/1000000).toFixed(2)+ '万元'
                                return relVal;  
                            } 

                this.setState({
                    branchBar,
                    title:data.data.recruitBatchName
                })
            }
        })
    }else if (this.state.pieId == '2'){
        this.props.mainLineByRegion({recruitBatchId:value}).payload.promise.then((response)=>{
            let data = response.payload.data;  
            if(data.state == "error"){ 
                let generBar = this.state.option;
                generBar.legend.data.length = 0;
                generBar.series.length = 0;
                generBar.yAxis.data = [];
                this.setState({generBar,title:""}) 
            }
            if(data.state=='success'){  
                let branchBar = this.state.option;
                branchBar.legend.data.length = 0;
                let earchName = [];
                //拿到所有的key也就是课程名
                for(let item in data.data.itemMap){
                    earchName.push(item);
                }
                //改课程名
                branchBar.legend.data = earchName; 
                earchName.forEach(item=>{
                    branchBar.legend.selected[item] = true;
                })
                //改Y轴的城市名
                branchBar.yAxis.data = data.data.branchList;
                //改变数据
                branchBar.series.length = 0;
                 
                var that = this;
               
                earchName.forEach((e,i)=>{
                    branchBar.series.push(
                        {
                            name: e,
                            type: 'bar',
                            stack: '总量',
                            barMaxWidth:30,//最大宽度
                            label: {
                                normal: {
                                    show: true, 
                                    formatter: function (params) { 
                                        if(params.value > 0){   
                                            let showArr = []
                                            let { compare } = that.state;   
                                            if(compare.length){
                                                
                                                for(var i=0;i<that.state.option.series.length;i++){
                                                    var has = false;
                                                    var data = that.state.option.series[i];
                                                    //判断c中是否有元素data
                                                    for(var j=0;j<compare.length;j++){
                                                        if(data.name == compare[j].name){
                                                            has =true;
                                                            break;
                                                        }
                                                    }
                                                    //如果没有
                                                    if(has==false){
                                                        showArr.push(data);
                                                    }
                                                }
                                            }else{
                                                showArr.push(...that.state.option.series)
                                            } 
                                            if(( showArr[0] && params.seriesName == showArr[0].name ) || ( showArr[1] && params.seriesName == showArr[1].name ) || ( showArr[2] && params.seriesName == showArr[2].name ) || ( showArr[3] && params.seriesName == showArr[3].name ) ){ 
                                                return params.value; 
                                            }else {
                                                return '';
                                            }
                                        }else {
                                            return '';
                                        }
                                    }
                                },
                            },
                            data: [820, 832, 901, 934, 1290, 1330, 1320, 1290, 1330, 1320]
                        }
                    )
                }); 
                branchBar.series.forEach((e,i)=>{
                    e.data = data.data.itemMap[earchName[i]]  
                });  
                branchBar.tooltip.formatter=
                            function(params) {  
                                var relVal = params[0].name; 
                                let total =0; 
                                for (var i = 0, l = params.length; i < l; i++) {  
                                    if(params[i].value){
                                        relVal += '<br/>' +'<div style="background:'+params[i].color+';width:12px;height:12px;float:left;border-radius:50%;margin-right:4px;margin-top:4px;"></div>'+params[i].seriesName + ' : ' + (params[i].value / 10000).toFixed(2)+'万元';   
                                        total+= params[i].value;
                                    }
                                }  
                                    relVal +='<br/>'+'<div style="float:left;margin-left:16px">合计</div>'+'&nbsp'+':'+'&nbsp'+(Math.round( total *100)/1000000).toFixed(2) + '万元'
                                return relVal;  
                            } 
                this.setState({
                    allArr:[...this.state.option.series],
                    branchBar,
                    title:data.data.recruitBatchName
                })
            }
        })
    }
        

  } 
  componentWillMount(){ 
   
  }

  onClickTitle = (e) =>{  
    let { compare } = this.state;
    var isSelected = e.selected[e.name];
    let aName = e.name
    let index = compare.findIndex(item=>item.name == e.name);  
    if(isSelected){
        compare.splice(index,1);
    }else{
        compare.push(e)
    } 
    let branchBar = this.state.option;
    branchBar.legend.selected[aName] = isSelected; 
    this.setState({
        branchBar,
        compare
    }) 
  } 
  onclick = {
    'legendselectchanged':this.onClickTitle
  }
  render() {  
    const { auth, navpath, actions } = this.props;
    var currentUser = auth.currentUser;
    const { getFieldDecorator } = this.props.form;
    // return <div><h1>首页</h1></div>
    let block_content = '';
        
        block_content = (
            //   <ContentBox titleName=''>
               <div className='diagram-main'>
               <div className='kong'></div>
                    <header className="diagram-header">
                        <span>{`${this.state.title}招生季分部收款排行榜`}</span>  
                        <span className="diagram-select" style={{right:'-50px',width:'600px'}}>{
                              <Form className="ant-advanced-search-form">
                              <Row type='flex' justify='center'>
                                <Col span={12}>
                                  <FormItem {...searchFormItemLayout} 
                                          label="类型">
                                          {getFieldDecorator('pieId', {
                                            initialValue: this.state.pieId
                                          })(
                                              <Select
                                                onChange={(value)=>{ 
                                                  let that = this;
                                                  this.setState({
                                                    pieId:value
                                                  })
                                                  setTimeout(()=>{
                                                    that.getBarDataList();
                                                  })
                                                }}
                                              >
                                                <Select.Option value='1'>按分部</Select.Option>
                                                <Select.Option value='2'>按大区</Select.Option>
                                              </Select>  
                                          )}
                                    </FormItem>
                                </Col>
                                <Col span={12}>
                                <FormItem {...searchFormItemLayout} 
                                    label="招生季">
                                    {getFieldDecorator('recruitBatchId', {
                                      initialValue: this.state.recruitBatchId
                                    })(
                                        <SelectRecruitBatch hideAll={true} isFirstSelected={true} onSelectChange={(value, selectOptions) => { 
                                            this.setState({ recruitBatchId: value })
                                            this.getBarDataList(value)
                                            //变更时自动加载数据 
                                        }} />   
                                    )}
                              </FormItem>
                               </Col>
                              </Row>
                          </Form>
                        }</span>
                    </header>
                <div className="dv_split"></div>
                  <Form className="ant-advanced-search-form f">
                      <Row type='flex' justify='center'>
                        <Col span={24}>
                          <ReactEcharts 
                            className='bar' 
                            onEvents = {this.onclick}
                            option={this.state.option} 
                            notMerge={true} 
                            lazyUpdate={true} 
                            theme={"theme_name"}
                            ></ReactEcharts>
                        </Col>
                      </Row>
                  </Form>
                <div className="dv_split"></div>
                <div className='kong'></div>
                </div>
            //   </ContentBox>
          )
        
    
    return block_content
     
  }
}

const WrappedManage = Form.create()(RecruitBar);
function mapStateToProps(state) { 
  const { auth,dic } = state;
  return {
    auth: auth ? auth : null,
    dic
  };
}

function mapDispatchToProps(dispatch) {
  return { 
    studentNum:bindActionCreators(studentNum,dispatch),
    orderForACertainTime:bindActionCreators(orderForACertainTime,dispatch),
    //按大区
    mainLineByRegion:bindActionCreators(mainLineByRegion,dispatch),
    change:bindActionCreators(change,dispatch),
    //按分部
    mainLine:bindActionCreators(mainLine,dispatch)
    // getAllMenu: bindActionCreators(getAllMenu, dispatch),
    // switchOrgContext: bindActionCreators(switchOrgContext, dispatch)
  }
}
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(WrappedManage))