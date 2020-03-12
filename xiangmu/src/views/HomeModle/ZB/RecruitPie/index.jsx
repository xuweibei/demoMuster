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
import { getCookie } from '@/utils/index';
import { env } from '@/api/env';

import SelectRecruitBatch from '@/components/BizSelect/SelectRecruitBatch';
import { mainecharts,studentNum,orderForACertainTime,mainpie,mainpieByRegion,mainLine } from '@/actions/admin';
import { change } from '@/actions/dic';
import { 
    searchFormItemLayout 
  } from '@/utils/componentExt';
import ContentBox from '@/components/ContentBox';
const btnformItemLayout = {
  wrapperCol: { span: 24 },
};
const colorArr=['#f8395d','#f7728b','#f5a0b0','#a66f7a','#f37544','#c93614','#bd12ee','#ce73e8','#8f6e99','#4937ef','#6f62e6','#8c89a9','#15beee','#79b2c3','#70919b','#4e1103','#6bc33b','#4fbeb2','#528b85','#2ef79b','#64c297','#156a01','#e6f226','#9ea441','#e6962d','#a58153'];
class RecruitPie extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
        pieId:'2',
        recruitBatchId:'',
        url:'',
        val:'',
        title:'招生情况',
        optionCircle :{
          tooltip: {
              trigger: 'item',
              formatter: "{b}: {c} ({d}%)",
              padding:[0,8]
          },
          legend: {
              orient: 'vertical',
              x: 'left',
              data:['ACA','CFA','CMA','ui','其他'],
              height:500,
              left:'0',
              top:'60',
              marginRight:'30'
          },
          color: ['#68e1e3','#459ae9','#51b919','#ff9f7f','red'],
          series: [
                    {
                        name:'',
                        type:'pie',
                        selectedMode: 'single',
                        radius: [0, '30%'],
            
                        label: {
                            normal: {
                                position: 'inner'
                            }
                        },
                        labelLine: {
                            normal: {
                                show: false
                            }
                        },
                        data:[{},{},{},{}]
                        // data:[
                        //     {value:2110, name:'ACA'},
                        //     {value:1702, name:'CFA', selected:true},
                        //     {value:1666, name:'CMA'},
                        //     {value:500, name:'ui'},
                        //     {value:500, name:'其他'}
                        // ]
                    },
                    {
                        name:'',
                        type:'pie',
                        radius: ['40%', '55%'],
                        avoidLabelOverlap: false,
                        label: {
                            normal: {
                                // formatter: '{a|{a}}{abg|}\n{hr|}\n  {b|{b}：}{c}  {per|{d}%}  ',
                                formatter: '{b|{b}}{abg|}\n{hr|}\n  {c}元  {per|{d}%} \n',
                                backgroundColor: '#eee',
                                borderColor: '#aaa',
                                borderWidth: 1,
                                borderRadius: 4,
                                // shadowBlur:3,
                                // shadowOffsetX: 2,
                                // shadowOffsetY: 2,
                                // shadowColor: '#999',
                                // padding: [0, 7],
                                rich: {
                                    b: {
                                        color: '#999',
                                        lineHeight: 22,
                                        align: 'center'
                                    },
                                    // abg: {
                                    //     backgroundColor: '#333',
                                    //     width: '100%',
                                    //     align: 'right',
                                    //     height: 22,
                                    //     borderRadius: [4, 4, 0, 0]
                                    // },
                                    hr: {
                                        // borderColor: '#aaa',
                                        width: '100%',
                                        borderWidth: 0.5,
                                        height: 5
                                    },
                                    c: {
                                        fontSize: 16,
                                        lineHeight: 33,
                                        padding: [2, 4],
                                    },
                                    per: {
                                        color: '#eee',
                                        backgroundColor: '#334455',
                                        padding: [2, 4],
                                        borderRadius: 2
                                    }
                                }
                            }
                        },
                        data:[
                            // {value:444, name:'百色',itemStyle:{normal:{color: '#ff326a'}}},
                            // {value:333, name:'蚌埠',itemStyle:{normal:{color: '#ff5180'}}},
                            // {value:222, name:'保定',itemStyle:{normal:{color: '#ff6f97'}}},
                            // {value:111, name:'北京',itemStyle:{normal:{color: '#ff8eae'}}},
                            // {value:1000, name:'其他',itemStyle:{normal:{color: '#ffadc3'}}},
                            
                            // {value:345, name:'成都',itemStyle:{normal:{color: '#459ae9'}}},
                            // {value:234, name:'长春',itemStyle:{normal:{color: '#61a9ec'}}},
                            // {value:123, name:'长沙',itemStyle:{normal:{color: '#7cb8f0'}}},
                            // {value:1000, name:'其他',itemStyle:{normal:{color: '#99c8f3'}}},
                            
                            // {value:333, name:'重庆',itemStyle:{normal:{color: '#51b919'}}},
                            // {value:222, name:'大连',itemStyle:{normal:{color: '#6bc33b'}}},
                            // {value:111, name:'福州',itemStyle:{normal:{color: '#85ce5e'}}},
                            // {value:1000, name:'其他',itemStyle:{normal:{color: '#9fd981'}}},
                            
                            // {value:500, name:'其他',itemStyle:{normal:{color: '#ffb400'}}}
                        ]
                    }
          ]
      }
    }
  
  }
  //请求饼图数据
  getPieDataList = (value) => { 
          if(this.state.pieId == 1){ 
                //请求饼图的数据==按分部
                this.props.mainpie({recruitBatchId:value}).payload.promise.then((response)=>{
                  let data = response.payload.data; 
                  let dataPie =this.state.optionCircle;
                  if(data.state=='success'){ 
                      let earchName = [];
                      dataPie.legend.data = 0; 
                      data.data.itemObj.itemList.forEach(item=>{
                          earchName.push(item.name)
                      }) 
                      //将拿到的第一层的名字放入数据
                      dataPie.legend.data = earchName; 
                      dataPie.series[0].data = data.data.itemObj.itemList; 
                      //将内圈的数据进行添加、替换
                      dataPie.series[0].data.forEach((e,i)=>{
                          // e.name = data.data.itemObj[i].name;
                          e.name = data.data.itemObj.itemList[i].name || '无';
                          e.value =  data.data.itemObj.itemList[i].money;
                      })  
                      dataPie.series[1].data = data.data.itemObj.branchList
                      // let d = dataPie.series[1].data;
                      // d.length = 0;
                      // //将最后一个data里的需要展示在外圈的数据进行添加、替换
                      // data.data.itemObj.branchList.forEach(e=>{
                      //     d.push(e)
                      // }) 
                      dataPie.series[1].data.forEach((e,i)=>{
                          e.name = e.name || '无'
                          e.value = e.money;
                          delete e.money;
                          e.itemStyle = {
                              normal:{
                                  color:colorArr[i]
                              }
                          }
                      });   
                      // let arr3 = [];
                      // //拿到所有branchList的长度。通过长度的区间来判断，移入到的那个index属于谁的。
                      // data.data.itemObj.forEach((e,i)=>{
                      //     arr3.push(e.branchList.length)
                      // })
                      // dataPie.tooltip.formatter= function(a){
                      //     if(a.seriesName=='里面'){
                      //         let init = arr[a.dataIndex]+'<br/>' + a.name+'&nbsp'+':'+'&nbsp'+a.value+'元'+'&nbsp'+'('+a.percent+'%'+')';
                      //         return init
                      //     }else{
                      //         function ab(arr2,num){
                      //             var i= 0,sum=0,len=arr2.length;
                      //             if(!(len>0)){
                      //                 return;
                      //             }
                      //             //如果 num 的值超过了 数组之和，不在考虑范围之类
                      //             for(i;i<len;i++){
                      //                 sum+=arr2[i];
                      //                 if(sum>num){
                      //                     return arr[i]+'<br/>' + a.name+'&nbsp'+':'+'&nbsp'+a.value+'元'+'&nbsp'+'('+a.percent+'%'+')';;
                      //                 }
                      //             }
                      //         }

                      //         return ab(arr3,a.dataIndex);
                      //     }
                      // }
                      this.setState({
                          dataPie,
                          title:data.data.recruitBatchName
                      });
                  }

                });
          }else if(this.state.pieId == '2'){ 
             //请求饼图的数据==按大区
                  this.props.mainpieByRegion({recruitBatchId:value}).payload.promise.then((response)=>{
                    let data = response.payload.data; 
                    let dataPie =this.state.optionCircle;
                    if(data.state=='success'){ 
                        let earchName = [];
                        dataPie.legend.data = 0; 
                        data.data.itemObj.itemList.forEach(item=>{
                            earchName.push(item.name)
                        }) 
                        //将拿到的第一层的名字放入数据
                        dataPie.legend.data = earchName; 
                        dataPie.series[0].data = data.data.itemObj.itemList; 
                        //将内圈的数据进行添加、替换
                        dataPie.series[0].data.forEach((e,i)=>{
                            // e.name = data.data.itemObj[i].name;
                            e.name = data.data.itemObj.itemList[i].name || '无';
                            e.value =  data.data.itemObj.itemList[i].money;
                        })  
                        dataPie.series[1].data = data.data.itemObj.branchList
                        // let d = dataPie.series[1].data;
                        // d.length = 0;
                        // //将最后一个data里的需要展示在外圈的数据进行添加、替换
                        // data.data.itemObj.branchList.forEach(e=>{
                        //     d.push(e)
                        // }) 
                        dataPie.series[1].data.forEach((e,i)=>{
                            e.name = e.name || '无'
                            e.value = e.money;
                            delete e.money;
                            e.itemStyle = {
                                normal:{
                                    color:colorArr[i]
                                }
                            }
                        });   
                        // let arr3 = [];
                        // //拿到所有branchList的长度。通过长度的区间来判断，移入到的那个index属于谁的。
                        // data.data.itemObj.forEach((e,i)=>{
                        //     arr3.push(e.branchList.length)
                        // })
                        // dataPie.tooltip.formatter= function(a){
                        //     if(a.seriesName=='里面'){
                        //         let init = arr[a.dataIndex]+'<br/>' + a.name+'&nbsp'+':'+'&nbsp'+a.value+'元'+'&nbsp'+'('+a.percent+'%'+')';
                        //         return init
                        //     }else{
                        //         function ab(arr2,num){
                        //             var i= 0,sum=0,len=arr2.length;
                        //             if(!(len>0)){
                        //                 return;
                        //             }
                        //             //如果 num 的值超过了 数组之和，不在考虑范围之类
                        //             for(i;i<len;i++){
                        //                 sum+=arr2[i];
                        //                 if(sum>num){
                        //                     return arr[i]+'<br/>' + a.name+'&nbsp'+':'+'&nbsp'+a.value+'元'+'&nbsp'+'('+a.percent+'%'+')';;
                        //                 }
                        //             }
                        //         }

                        //         return ab(arr3,a.dataIndex);
                        //     }
                        // }
                        this.setState({
                            dataPie,
                            title:data.data.recruitBatchName
                        });
                    }

                });
          }
           
        
  }
  componentWillMount(){
    // this.getPieDataList(); 
  }

  render() {
    const { auth, navpath, actions } = this.props;
    var currentUser = auth.currentUser;
    const { getFieldDecorator } = this.props.form;
    // return <div><h1>首页</h1></div>
    let block_content = '';
    
        block_content = (
            //   <ContentBox titleName='' hideBottomBorder={false}>
              <div className='diagram-main'>
              <div className='empty'></div>
                    <header className="diagram-header">
                        <span>{`${this.state.title}招生季招生收款情况`}</span>  
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
                                                    that.getPieDataList();
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
                                                this.getPieDataList(value)
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
                          <ReactEcharts className='pie' option={this.state.optionCircle} notMerge={true} lazyUpdate={true} theme={"theme_name"}></ReactEcharts>
                        </Col>
                      </Row>
                  </Form>
                <div className="dv_split"></div>
                <div className='empty'></div>
                </div>
            //   </ContentBox>
          )
    
    
    return block_content
     
  }
}

const WrappedManage = Form.create()(RecruitPie);
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
    studentNum:bindActionCreators(studentNum,dispatch),
    orderForACertainTime:bindActionCreators(orderForACertainTime,dispatch),
    //按分部
    mainpie:bindActionCreators(mainpie,dispatch),
    //按大区
    mainpieByRegion:bindActionCreators(mainpieByRegion,dispatch),
    change:bindActionCreators(change,dispatch),
    mainLine:bindActionCreators(mainLine,dispatch)
    // getAllMenu: bindActionCreators(getAllMenu, dispatch),
    // switchOrgContext: bindActionCreators(switchOrgContext, dispatch)
  }
}
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(WrappedManage))