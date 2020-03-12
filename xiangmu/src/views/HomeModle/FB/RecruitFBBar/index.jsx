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
import { mainecharts,mainpie,mainLine } from '@/actions/admin';
import { change } from '@/actions/dic';

import { 
    searchFormItemLayout 
  } from '@/utils/componentExt';
import SelectRecruitBatch from '@/components/BizSelect/SelectRecruitBatch';
import ContentBox from '@/components/ContentBox';

class RecruitFBBar extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
        compare:[],
        recruitBatchId:"",
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
  getRecruitFBBarDataList = (value) => {

    this.props.mainecharts({recruitBatchId:value}).payload.promise.then((response) => {
        let data = response.payload.data;
        if(data.state == "error"){ 
            let branchBar = this.state.option;
            branchBar.legend.data.length = 0;
            branchBar.series.length = 0;
            branchBar.yAxis.data = [];
            this.setState({branchBar,title:""}) 
        }
        if(data.state=='success'){
            let earchName = [];
            let dataList = [];
            let MapData = data.data.itemMap;
            for(var item in MapData){
                earchName.push(item);
                dataList.push(MapData[item])
            }
            //更改图表上方的项目个数
            let branchBar = this.state.option;
            branchBar.legend.data = earchName;
            earchName.forEach(item=>{
                branchBar.legend.selected[item] = true;
            })
            //更改对应的课程名字 
            branchBar.series.length=0;
            //先让branchBar.series的内容改变一下
            var that = this;
            dataList.forEach(e=>{
                branchBar.series.push( {
                    name: 'FIRM',
                    type: 'bar',
                    stack: '总量',
                    barMaxWidth:30,//最大宽度
                    label: {
                        normal: {
                            show: true, 
                             formatter: function (params,option) {
                                    if(params.value > 0){   
                                      let showArr = []
                                      let { compare } = that.state;   
                                      if(compare.length){ 
                                          for(var i=0;i<that.state.option.series.length;i++){
                                              var has = false;
                                              var data = that.state.option.series[i]; 
                                              for(var j=0;j<compare.length;j++){
                                                  if(data.name == compare[j].name){
                                                      has =true;
                                                      break;
                                                  }
                                              } 
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
                        }
                    },
                    data: e
                },)
            })
            //再让branchBar.series的name改变一下
            branchBar.series.forEach((e,i)=>{
                e.name = earchName[i]
            })
            //更改Y轴的名字 
            branchBar.yAxis.data = data.data.regionList;
            branchBar.tooltip.formatter=
            function(params) {  
              var relVal = params[0].name; 
              let total =0;
              for (var i = 0, l = params.length; i < l; i++) {  
                    if(params[i].value){
                          relVal += '<br/>' +'<div style="background:'+params[i].color+';width:12px;height:12px;float:left;border-radius:50%;margin-right:4px;margin-top:4px;"></div>'+params[i].seriesName + ' : ' + (params[i].value / 10000).toFixed(2)+'万元'; 
                          total+=params[i].value;
                    }
                  }  
                  relVal +='<br/>'+'<div style="float:left;margin-left:16px">合计</div>'+':'+(Math.round( total *100)/1000000).toFixed(2)+ '万元';
              return relVal;  
            } 
            // data1.grid.bottom = 50-data1.yAxis.data.length +'%';
            this.setState({
                branchBar, 
                title:data.data.recruitBatchName
            })
        }
    })
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
            <Form>
              {/* <ContentBox titleName={`${this.state.title}招生季分部收款情况`}> */}
              <div className='kong'></div>
              <div className='diagram-main'>
                    <header className="diagram-header">
                        <span>{`${this.state.title}招生季分部收款情况`}</span>  
                        <span className="diagram-select" style={{right:'-198px',width:'600px'}}>{
                              <Form className="ant-advanced-search-form">
                              <Row type='flex' justify='center'>
                                <Col span={12}>
                                <FormItem {...searchFormItemLayout} 
                                    label="招生季">
                                    {getFieldDecorator('recruitBatchId', {
                                      initialValue: this.state.recruitBatchId
                                    })(
                                        <SelectRecruitBatch hideAll={true} isFirstSelected={true} onSelectChange={(value, selectOptions) => { 
                                            this.setState({ recruitBatchId: value })
                                            this.getRecruitFBBarDataList(value)
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
                  <Form className="ant-advanced-search-form">
                      <Row type='flex' justify='center'>
                        <Col span={24}>
                          <ReactEcharts 
                            onEvents = {this.onclick} 
                            option={this.state.option} 
                            notMerge={true} lazyUpdate={true} 
                            theme={"theme_name"}
                          ></ReactEcharts>
                        </Col>
                      </Row>
                  </Form>
                <div className="dv_split"></div>
                </div>
              <div className='kong'></div>
              {/* </ContentBox> */}
            </Form>
          )
       
    
      return block_content
    
     
  }
}

const WrappedManage = Form.create()(RecruitFBBar);
function mapStateToProps(state) { 
  const { auth,dic } = state;
  return {
    auth: auth ? auth : null,
    dic
  };
}

function mapDispatchToProps(dispatch) {
  return {
    mainecharts: bindActionCreators(mainecharts, dispatch),
    mainpie:bindActionCreators(mainpie,dispatch),
    change:bindActionCreators(change,dispatch),
    mainLine:bindActionCreators(mainLine,dispatch)
    // getAllMenu: bindActionCreators(getAllMenu, dispatch),
    // switchOrgContext: bindActionCreators(switchOrgContext, dispatch)
  }
}
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(WrappedManage))