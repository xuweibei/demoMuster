import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Radio, Tree, Card, Checkbox, DatePicker, InputNumber,message,Pagination } from 'antd';
import moment from 'moment';
import { getDictionaryTitle, getViewEditModeTitle, dataBind, timestampToTime, split, formatMoment, convertTextToHtml, formatMoney } from '@/utils';
import { searchFormItemLayout,searchFormItemLayout24,loadBizDictionary,renderSearchTopButtons,renderSearchBottomButtons,onShowSizeChange,onPageIndexChange,onSearch } from '@/utils/componentExt';
import ContentBox from '@/components/ContentBox';
import { ModifyTheRecord,ModifiedTimeSearch } from '@/actions/course';
const dateFormat = 'YYYY-MM-DD';
const RadioGroup = Radio.Group;


import { loadDictionary } from '@/actions/dic';

const FormItem = Form.Item;
const { TextArea } = Input;
const { RangePicker } = DatePicker;
const btnsearchFormItemLayout = {
  wrapperCol: { span: 24 },
};


const CheckboxGroup = Checkbox.Group;

/*
必要属性输入
editMode [Create/Edit/View/Delete]
currentDataModel [数据模型]
viewCallback [回调]
*/
class History extends React.Component {
  constructor(props) {
    super(props)
    
  this.state = {
    endOpen:false,
    pagingSearch: {
      currentPage: 1,
      pageSize: 10,
    },
    timeNew:{
      realName:'',
      mobile:'',
      email:'',
      courseName:'',
      activeTime:'',
      endTime:'',
      day:''
    },
    data:[],
    totalRecord:0,
    result:'1',
    dataModel: props.currentDataModel,//数据模型
  };
   
    this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
    this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
    this.loadBizDictionary = loadBizDictionary.bind(this);
    this.onShowSizeChange = onShowSizeChange.bind(this);
    this.onPageIndexChange = onPageIndexChange.bind(this);
    this.onSearch = onSearch.bind(this);

  }


  columns = [
    
    {
      title: '序号',
      fixed: 'left',
      width:100,
      dataIndex: 'realName',
      render:(text,record,index)=>{
        return index+1
      }
    },
    {
      title: '操作人',
      dataIndex: 'createUName',
    },
    {
      title: '操作类型',
      dataIndex: 'logTypeName',
    },
    {
      title: '操作日期',
      dataIndex: 'createDate',
      render: (text, record, index) => {
        return timestampToTime(record.createDate)
      },
    },
    {
      title: '备注',
      fixed: 'right',
      width:300,
      dataIndex: 'text',
    }
]
  onCancel = () => {
    this.props.viewCallback();
  }
  componentWillMount() {
    this.loadBizDictionary(['invite_source','visit_status']);
    //e3cc5be2bb2611e88e9ff8b156c7e183这个id可以查
      if(this.props.editMode=='Record'){
        this.onSearch();
      }else if(this.props.editMode=='Time'){
        this.fetchTime()
      }
  }

  fetchTime=()=>{
    this.props.ModifiedTimeSearch({courseActiveId:this.props.currentDataModel.courseActiveId}).payload.promise.then((response) => {
         let data = response.payload.data;
         if(data.state=='success'){
           this.setState({
            timeNew:data.data
           })
         }else{
            message.error(data.msg);
         }
    })
  }
  fetch = (params = {}) => {
    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch;
    condition.courseActiveId = this.props.currentDataModel.courseActiveId;
    this.props.ModifyTheRecord(condition).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.result === false) {
        message.error(data.message);
        this.setState({ loading: false });
      }
      else {
        this.setState({ dataModel: { ...data.data, productDiscountType: this.state.dataModel.productDiscountType }, loading: false,...data })
      }
    })
  }
  onSubmit = () => {
    //表单验证后，合并数据提交
    this.props.form.validateFields((err, values) => {
     if (!err) {
       this.setState({ loading: true });
       setTimeout(() => {
         this.setState({ loading: false });
       }, 3000);//合并保存数据
       let condition = {};
       if(values.isPass==1){
        condition.day =  this.MackChange (values.day);
       }else{
        condition.day = values.day
       }
       condition.remark = values.remark;
       condition.courseActiveId = this.props.currentDataModel.courseActiveId;
       this.props.viewCallback({ ...condition });//合并保存数据
     }
   });
 }

  //计算选中的时间和激活日期的差额天数
  MackChange =(value)=>{
    if (value != null && value != '') {
      let oldTime = new Date(value);
      let activeEndTime = oldTime.getFullYear() + "-" + (oldTime.getMonth() + 1) + "-" + oldTime.getDate();
      let formatTimeS = new Date(activeEndTime).getTime();
      //获得激活日期
      let intervalTime = formatTimeS - this.state.timeNew.activeTime;   //时间差的毫秒数      
      //计算出相差天数
      let days = Math.floor(intervalTime / (24 * 3600 * 1000));
      if(intervalTime % (24 * 3600 * 1000)>0){
        days+=1;
      }
      return days
    }
  }



  //打开和关闭时间选择
  handleEndOpenChange = (open) => {
    this.setState({ endOpen: open });
  }
  onEndChange = (value) => {
      this.onChange('endValue', value);
  }
  disabledEndActiveDate = (endValue) => {
    const startValue = this.state.timeNew.activeTime;
    if (!endValue) {
      return false;
    }
    return Math.floor(endValue.valueOf() / (24 * 3600 * 1000)) <= Math.floor(startValue.valueOf() / (24 * 3600 * 1000))
  }
  onChange = (field, value) => {
      this.setState({
          [field]: value,
      });
  }
  //表单按钮处理
  renderBtnControl() {
    if(this.props.editMode=='Time'){
      return <FormItem
                className='btnControl'
                {...btnsearchFormItemLayout}
              > 
                <Button type="primary" onClick={this.onSubmit} icon="save">确定</Button>
                <span className="split_button"></span>
                <Button onClick={this.onCancel} icon="rollback">返回</Button>
              </FormItem>
    }
    return <FormItem
      className='btnControl'
      {...btnsearchFormItemLayout}
    >
      <Button onClick={this.onCancel} icon="rollback">返回</Button>
    </FormItem>

  }


    //单选框变化的回调
    onChangeRadio=(e)=>{
        //重置表格的
      this.props.form.resetFields()
      this.setState({
        result:e.target.value
      })
    }


  //多种模式视图处理
  renderEditModeOfView() {
    let block_content = <div></div>
    const { getFieldDecorator } = this.props.form;
    switch (this.props.editMode) {
      case "Time":
        block_content = (
          <Form className="search-form">
            <Row gutter={24}>
              <Col span={12}>
                    <FormItem
                    {...searchFormItemLayout}
                    label='姓名'
                    >
                    {
                      this.state.timeNew.realName
                    }
                    </FormItem>
              </Col>
              <Col span={12}>
                    <FormItem
                    {...searchFormItemLayout}
                    label='手机号'
                    >
                    {
                      this.state.timeNew.mobile
                    }
                    </FormItem>
              </Col>
              <Col span={12}>
                    <FormItem
                    {...searchFormItemLayout}
                    label='邮箱'
                    >
                     {
                      this.state.timeNew.email
                    }
                    </FormItem>
              </Col>
              <Col span={12}></Col>
              <Col span={24}>
                <FormItem {...searchFormItemLayout24} label='课程'>
                   {
                      this.state.timeNew.courseName
                    }
                </FormItem>
              </Col>
              <Col span={12}>
                  <FormItem {...searchFormItemLayout} label='激活日期'>
                    {
                      timestampToTime(this.state.timeNew.activeTime)
                    }
                  </FormItem>
              </Col>
              <Col span={12}>
                  <FormItem {...searchFormItemLayout} label='网课结束日期'>
                   {
                      timestampToTime(this.state.timeNew.endTime)
                    }
                  </FormItem>
              </Col>
              <Col span={12}>
                  <FormItem {...searchFormItemLayout} label='开通天数'>
                    {
                      this.state.timeNew.day+'天'
                    }
                  </FormItem>
              </Col>
              <Col span={12}></Col>
            <Col span={24}>
              <FormItem {...searchFormItemLayout24} label="开通时间修改">
                {getFieldDecorator('isPass', {
                  initialValue: '',
                  rules: [{
                    required: true, message: '请选择审核结果!',
                  }],
                })(
                  <RadioGroup onChange={(e)=>{this.onChangeRadio(e)}}>
                      <Radio value='1' >修改结束日期</Radio>
                      <Radio value='0' >修改开通天数</Radio>
                  </RadioGroup>
                )}
               
              </FormItem>
            </Col>
            <Col span={12}>
                {this.state.result==1? (<FormItem {...searchFormItemLayout} label=' '>
                  {getFieldDecorator('day', {
                    initialValue: '',
                    rules: [{
                      required: true, message: '请选择修改结束日期!',
                    }],
                  })(
                    <DatePicker
                      disabledDate={this.disabledEndActiveDate}
                      format={dateFormat}
                      onChange={this.onEndChange}
                      open={this.state.endOpen}
                      onOpenChange={this.handleEndOpenChange}
                      placeholder='结束日期'
                    />
                  )}
                  </FormItem>):(<FormItem {...searchFormItemLayout} label=' '>
                  {getFieldDecorator('day', {
                    initialValue: '',
                    rules: [{
                      required: true, message: '请输入开通天数!',
                    },
                    {
                      validator:function (rule,value,callback){
                        let re = /^\d+$/;
                        if(value<=0||!re.test(value)){
                          callback('输入天数必须为大于零的整数！')
                        }
                        callback()
                      },message: '输入天数必须为大于零的整数！'
                    }
                  ],
                  })(
                    <Input />
                  )}
                  </FormItem>)
              } 
            </Col>
            <Col span={24}>
                 <FormItem
                  {...searchFormItemLayout24}
                  label="修改原因"
                >
                  {getFieldDecorator('remark', {
                    initialValue: '',
                    rules:[{
                      required: true,message:'请输入修改原因！'
                    }]
                  })(
                    <TextArea/>
                  )}
                </FormItem>
            </Col>
            </Row>
          </Form>
        );
        break;
        case 'Record':
        let extendButtons = [];

        extendButtons.push(<Button onClick={ ()=>{this.onCancelBack()} } icon="rollback" >返回</Button>);
        let b ='';
        let c = 0;
         block_content = (
                <Form
                  className="search-form"
                >
                  <Row justify="center" gutter={24} align="middle" type="flex">
                      <Col span={12}>
                            <FormItem
                            {...searchFormItemLayout}
                            label='课程名称'
                            >
                            {
                              this.props.currentDataModel.courseName
                            }
                            </FormItem>
                      </Col>
                      <Col span={12}></Col>
                  </Row>
                </Form>
              )
        break;
    }
    return block_content;
  }

  render() {
    let title =this.props.editMode=='Time'?'特殊用户网课开通时间修改':'修改记录查看';
    let block_editModeView = this.renderEditModeOfView();
    return (
      this.props.editMode=='Time'?
       <ContentBox titleName={title} bottomButton={this.renderBtnControl()}>
          {block_editModeView}
       </ContentBox>:
        <div>
          <ContentBox titleName={title} bottomButton={this.renderBtnControl()}>
            {block_editModeView}
          </ContentBox>
          <div className="space-default"></div>
          <div className="search-result-list">
            <Table columns={this.columns} //列定义
              loading={this.state.loading}
              rowKey={'studentCourseApplyId'}
              pagination={false}
              dataSource={this.state.data}//数据
              bordered
              scroll={{ x: 800 }}
            />
          </div>
          <div className="space-default"></div>
          <div className="search-paging">
            <Row justify="space-between" align="middle" type="flex">
            </Row>
            <Row justify="end" align="right" type="flex">
              <Col span={14} className={'search-paging-control'} align="right">
                <Pagination showSizeChanger
                  current={this.state.pagingSearch.currentPage}
                  defaultPageSize={this.state.pagingSearch.pageSize}      pageSizeOptions = {['10','20','30','50','100','200']}
                  onShowSizeChange={this.onShowSizeChange}
                  onChange={this.onPageIndexChange}
                  showTotal={(total) => { return `共${total}条数据`; }}
                  total={this.state.totalRecord} />
              </Col>
            </Row>
           </div>
        </div>
    );
  }
}

const WrappedDetailView = Form.create()(History);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    loadDictionary: bindActionCreators(loadDictionary, dispatch),
    ModifyTheRecord: bindActionCreators(ModifyTheRecord, dispatch),//查看修改记录的接口
    ModifiedTimeSearch: bindActionCreators(ModifiedTimeSearch, dispatch),//修改时长的查询接口
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedDetailView);
