
import React from 'react'; 
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux'; 
import { message, Form, Row, Col, Input, Select, Button, AutoComplete, Tag, Tooltip, DatePicker, Modal } from 'antd';
const FormItem = Form.Item; 
const { TextArea } = Input;
const { Option } = Select;

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import { searchFormItemLayout,searchFormItemLayout24, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
//数据转字典标题
import { formatMoment } from '@/utils';

//业务接口方法引入  
import { NewlyReceivedList,NewDataPreservation,NewlyReceivedListData } from '@/actions/base';
//业务数据视图（增、删、改、查)
import ContentBox from '@/components/ContentBox';  
const btnformItemLayout = {
    wrapperCol: { span: 24 },
};


class TeachingStudentQuery  extends React.Component {

  constructor() {
    super()
    //扩展方法用于本组件实例
    this.loadBizDictionary = loadBizDictionary.bind(this);
    this.onToggleSearchOption = onToggleSearchOption.bind(this);
    this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
    this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
    this.onSearch = onSearch.bind(this);
    this.onPageIndexChange = onPageIndexChange.bind(this);
    this.onShowSizeChange = onShowSizeChange.bind(this);

    this.state = {
      dataSource:[],
      tags:[],
      inputVisible:true,
      dataArr:[],
      dataModal:{},
      isShow:false, 
      editMode: '', 
      pagingSearch: { 
        realName:'',  
        mobile: '', 
      }, 
      totalRecord: 0,
      loading: false,
    };

  }
  componentWillMount() {
    //载入需要的字典项
    this.loadBizDictionary(['teach_class_type','teachmode', 'study_status','express']);//课程班类型
    //首次进入搜索，加载服务端字典项内容
    // this.onSearch();
  }
  componentWillUnMount() {
  } 

  //检索数据
  fetch = (params = {}) => { 
    this.props.form.validateFields((err, values) => { 
      if(err && (err.realName || err.mobile))return
        this.setState({ 
          dataSource:[],
          tags:[],
          inputVisible:true,
          dataArr:[]
        })
        this.setState({ loading: true });
        var condition = params || this.state.pagingSearch; 
        this.props.NewlyReceivedList(values).payload.promise.then((response) => {
          let data = response.payload.data;
          if (data.state === 'success') { 
            let { dataModal } = this.state;
            if(data.data.length){ 
              dataModal = data.data[0];
              this.setState({
                isShow:true,
                dataModal,
              })
            }else{
              dataModal = {}
              this.setState({
                isShow:false,
                dataModal,
              })
            }
            this.setState({
              pagingSearch: condition
            })
          }
          else {
            message.error(data.message);
          }
          this.setState({ loading: false })
        })
    })
  }
 
  onSubmit = () => {
    var that = this;
    //表单验证后，合并数据提交
    this.props.form.validateFields((err, values) => {
        if (!err) {  
            this.setState({
              loading:true
            })    
            let condition = {...values,...this.state.tags[0]}
            condition.receiveDate = formatMoment(values.receiveDate) 
            condition.studentId = this.state.dataModal.studentId; 
            this.props.NewDataPreservation(condition).payload.promise.then((response)=>{
              let data = response.payload.data; 
                if(data.state=='success'){
                  this.props.viewCallback()
                }else{
                  message.error(data.msg)
                }
                this.setState({
                  loading:false
                })
            })
          }
        }
      )
  }
  renderBtnControl() {
    return <FormItem
        className='btnControl'
        {...btnformItemLayout}
    >
        <Button type="primary" loading={this.state.loading} icon="save" onClick={this.onSubmit}>保存</Button><span className="split_button"></span>
    </FormItem>
  }  
  renderOption(item) { 
      return <Option value={item.materialId} key={item.materialId} text={item.materialName}>
                {item.materialName}
                {/* <span style={{float:'right'}}>{item.isPack ? item.isPack : ''}</span> */}
              </Option>
  }
  
  handleSearch = (value) => { 
      var searchOptions = this.props.searchOptions || {};
      var re = /[\u4E00-\u9FA5]/g; //测试中文字符的正则 
      if (value && value.indexOf(' ')!=0) {
          
          this.props.NewlyReceivedListData({materialName:value,studentId:this.state.dataModal.studentId}).payload.promise.then((response) => {

              let data = response.payload.data; 
              if (data.state === 'success') {
                  this.setState({
                      allId:data.data,
                      dataSource: data.data.map((item) => {
                          
                          return { 
                            materialId: `${item.materialId}`,
                            materialName: `${item.materialName}`, 
                            isPack:item.isPack,
                            materialType:item.materialType,
                            realName:item.realName,
                            courseId:item.courseId,
                            courseCategoryId:item.courseCategoryId,
                            itemId:item.itemId 
                          }
                          
                      })
                  })
              }
              else {
                  this.setState({ loading: false })
                  message.error(data.message);
              }
          })
        
      }
          
      
  }
  onSelect = (value, option) => {
      const state = this.state;
      let tags = state.tags;
      var info = this.state.dataSource.find(a => a.materialId == option.key);
      if (tags.find(A => A.materialId == info.materialId) == null) {
          tags = [...tags, info];
      }  
      this.setState({
          tags,
          dataArr:tags,
          inputVisible: false,
          inputValue: '',
          dataSource: []
      }); 
  }
  handleClose = (removedTag) => {
      const tags = this.state.tags.filter(tag => tag.materialId.toString() != removedTag.materialId); 
      this.setState({ tags,inputVisible:true,dataArr:[] }); 
  } 
  onCancel = () => {
    this.props.viewCallback();
  }
  //渲染，根据模式不同控制不同输出
  render() {  
    let { inputVisible,tags } = this.state;
    const { getFieldDecorator } = this.props.form; 
    let block_content = <div></div>  
        let extendButtons = []; 
        extendButtons.push(
          <Button type="primary" loading={this.state.loading} icon='search' onClick = {()=>this.fetch()}>查询</Button>
        )
        extendButtons.push(
          <Button onClick={this.onCancel} icon="rollback">返回</Button>
        )
        
        block_content = (<div>
          {/* 搜索表单 */}
          <ContentBox titleName="学生资料领取新增" bottomButton={this.renderSearchBottomButtons(extendButtons,'l','r')}>
            {!this.state.seachOptionsCollapsed &&
            <Form
              className="search-form"
            >
              <Row gutter={24}  type="flex">  
                <Col span={12} >
                  <FormItem
                    {...searchFormItemLayout}
                    label={"学生姓名"}
                  >
                    {getFieldDecorator('realName', { 
                      initialValue: '',
                      rules: [{
                        required: true, message: '请输入学生姓名!',
                      }]
                    })(
                      <Input placeholder='请输入学生姓名'/>
                    )}
                  </FormItem>
                </Col> 
                <Col span={12} >
                  <FormItem
                    {...searchFormItemLayout}
                    label={"手机号"}
                  >
                    {getFieldDecorator('mobile', { 
                      initialValue: '',
                      rules: [{
                        required: true, message: '请输入手机号!',
                      }]
                    })(
                      <Input placeholder='请输入手机号'/>
                    )}
                  </FormItem>
                </Col> 
              </Row>
            </Form>
            }
          </ContentBox>  
          {
            this.state.isShow &&  <div><div className="space-default"></div> 
            <ContentBox bottomButton={this.renderBtnControl()}>
                <Form  className="search-form">
                      <Row gutter={24} type="flex">
                          <Col span={12}>
                              <FormItem
                              {...searchFormItemLayout}
                              label = '教学点'
                              >
                                {
                                  this.state.dataModal.orgName
                                }
                              </FormItem>
                          </Col> 
                          <Col span={12}>
                              <FormItem
                              {...searchFormItemLayout}
                              label = '证件号'
                              >
                                {
                                  this.state.dataModal.certificateNo
                                }
                              </FormItem>
                          </Col>  
                          <Col span={12}>
                              <FormItem
                              {...searchFormItemLayout}
                              label = '资料名称'
                              >
                                 {
                                    getFieldDecorator('materialId',{
                                        initialValue:'',
                                        rules: [{
                                          required: true, message: '请输入要增加的资料!',
                                        }]
                                      }
                                    )(
                                      <div>
                                        {tags.map((tag, index) => {
                                            const isLongTag = tag.materialName.length > 20;
                                            const tagElem = (
                                                <Tag value={tag.materialId} key={tag.materialId} closable afterClose={() => this.handleClose(tag)}>
                                                    {isLongTag ? `${tag.materialName.slice(0, 20)}...` : tag.materialName}
                                                </Tag>
                                            );
                                            return isLongTag ? <Tooltip title={tag.materialName}>{tagElem}</Tooltip> : tagElem;
                                        })}
                                        {inputVisible && (
                                            <AutoComplete
                                                dataSource={this.state.dataSource.map(this.renderOption)}
                                                onSelect={this.onSelect}
                                                onSearch={this.handleSearch}
                                                placeholder="支持名称模糊搜索"
                                            />
                                        )}
                                      </div>
                                    )
                                 }
                              </FormItem>
                          </Col> 
                          <Col span={12}>
                              <FormItem
                              {...searchFormItemLayout}
                              label = '资料类型'
                              >
                                {
                                  this.state.dataArr.length?this.state.dataArr[0].materialType:''
                                }
                              </FormItem>
                          </Col> 
                          <Col span={12}>
                              <FormItem
                              {...searchFormItemLayout}
                              label = '是否打包资料'
                              >
                                {
                                  this.state.dataArr.length?this.state.dataArr[0].isPack:''
                                }
                              </FormItem>
                          </Col> 
                          <Col span={12}>
                              <FormItem
                              {...searchFormItemLayout}
                              label = '教师'
                              >
                                {
                                  this.state.dataArr.length?this.state.dataArr[0].realName:''
                                }
                              </FormItem>
                          </Col> 
                          <Col span={12}>
                                    <FormItem
                                    {...searchFormItemLayout}
                                    label = '领取方式'
                                    >
                                      {
                                        getFieldDecorator('receiveWay',{
                                           initialValue:'',
                                           rules: [{
                                            required: true, message: '请选择领取方式!',
                                          }]
                                          })( 
                                         <Select>
                                           <Option value=''>全部</Option>
                                           <Option value='1'>自取</Option>
                                           <Option value='2'>代领</Option>
                                           <Option value='3'>邮寄</Option>
                                         </Select>
                                        )
                                      }
                                    </FormItem>
                                </Col>
                          <Col span={12}>
                              <FormItem
                              {...searchFormItemLayout}
                              label = '领取人'
                              >  {
                                getFieldDecorator('receiver',{
                                  initialValue:'',
                                   rules: [{
                                    required: true, message: '请输入领取人!',
                                  }]
                                  })( 
                                    <Input placeholder='请输入领取人'/>
                                  )
                                }
                              </FormItem>
                          </Col>
                          <Col span={12}>
                              <FormItem
                              {...searchFormItemLayout}
                              label = '领取日期'
                              >{
                                getFieldDecorator('receiveDate',{
                                   initialValue:'',
                                   rules: [{
                                    required: true, message: '请选择日期!',
                                  }]
                                  })( 
                                    <DatePicker />
                                  )
                              }
                              </FormItem>
                          </Col>  
                          <Col span={12}>
                                    <FormItem
                                    {...searchFormItemLayout}
                                    label = '快递公司'
                                    >
                                      {
                                        getFieldDecorator('express',{ initialValue:''})( 
                                          <Select>
                                            <Option value=''>全部</Option>
                                            {
                                              this.state.express.map(item=>{
                                                return <Option value={item.value}>{item.title}</Option>
                                              })
                                            }
                                          </Select>
                                        )
                                      }
                                    </FormItem>
                                </Col>
                          <Col span={12}>
                              <FormItem
                              {...searchFormItemLayout}
                              label = '快递地址'
                              >
                                {
                                  getFieldDecorator('sendAddress',{ initialValue:''})( 
                                    <Input placeholder="请输入快递地址" />
                                  )
                                }
                              </FormItem>
                          </Col> 
                          <Col span={24}>
                              <FormItem
                              {...searchFormItemLayout24}
                              label = '备注'
                              >
                                {
                                  getFieldDecorator('sendRemark',{ initialValue:''})( 
                                    <TextArea/>
                                  )
                                }
                              </FormItem>
                          </Col>
                      </Row>
                </Form>
            </ContentBox> 
            </div>
          }
         
        </div>);  
    return block_content;
  }
}
//表单组件 封装
const WrappedCourseManage = Form.create()(TeachingStudentQuery);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    //基本字典接口
    loadDictionary: bindActionCreators(loadDictionary, dispatch), 
    //列表
    NewlyReceivedList: bindActionCreators(NewlyReceivedList, dispatch), 
    //资料查询
    NewlyReceivedListData: bindActionCreators(NewlyReceivedListData, dispatch),
    //资料保存
    NewDataPreservation: bindActionCreators(NewDataPreservation, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedCourseManage);
