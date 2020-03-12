import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Input, Select, Button,Radio, Icon, Table, Pagination, Tree, InputNumber, Checkbox, DatePicker, message } from 'antd';
import moment from 'moment';
//基本字典接口方法引入
import { systemCommonChild } from '@/actions/dic';
import { getDictionaryTitle, getViewEditModeTitle, dataBind, timestampToTime, split, formatMoment } from '@/utils';
import ContentBox from '@/components/ContentBox';
import SelectItem from '@/components/BizSelect/SelectItem';
import { queryUserByBranchId } from '@/actions/enrolStudent';
import SelectItemCourseCategory from '@/components/BizSelect/SelectItemCourseCategory';
import SelectArea from '../../../../components/BizSelect/SelectArea';
import { NewNetClassSure } from '@/actions/course';
import { NetAuditBatchApply,OutGoingTaskBatcNohArrive,NetAuditApply,getCourseCategoryList } from '@/actions/base';
import { NewNetClassList } from '@/actions/course';
import {searchFormItemLayout,searchFormItemLayout24,renderSearchBottomButtons,onSearch,onShowSizeChange,onPageIndexChange} from '@/utils/componentExt';

const FormItem = Form.Item;
const { TextArea } = Input;
const { RangePicker } = DatePicker;
const RadioGroup = Radio.Group;
const btnsearchFormItemLayout = {
  wrapperCol: { span: 24 },
};

const CheckboxGroup = Checkbox.Group;


const dateFormat = 'YYYY-MM-DD';

/*
必要属性输入
editMode [Create/Edit/View/Delete]
currentDataModel [数据模型]
viewCallback [回调]
*/
class StudentAskfaceView extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      applyNew:[],
      taskMan:[],
      isShowChooseProduct:false,  
      result:'1',
      dataModel: props.currentDataModel,//数据模型  
      endValue: null,
      endOpen: false,  
      totalRecord:0,
      pagingSearch: {
        currentPage: 1,
        pageSize: 10,
        // itemId:'',
        itemId:'',
        courseCategoryId:'',
        courseName:''
      }, 
      data:[],
      coursetype: []
    };

    (this: any).fetch = this.fetch.bind(this);
    this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
    this.onSearch = onSearch.bind(this);
    this.onShowSizeChange = onShowSizeChange.bind(this);
    this.onPageIndexChange = onPageIndexChange.bind(this);
  }
  onCancel = () => {
    this.props.viewCallback();
  }
  componentWillMount() {

    //授课类型改为查二级字典
    this.props.systemCommonChild(['coursetype']).payload.promise.then((response) => {
        let data = response.payload.data;
        if (data.result === false) {
            message.error(data.message);
        }
        else {
            this.setState({ coursetype: data.data.coursetype })
        }
    })
    
    if(this.props.editMode=='NewNet'){
      this.fetch();
    }
  }

//检索数据
  fetch = (params = {}) => {
    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch;
    let newL = this.state.pagingSearch;
    condition.studentId = this.props.dataModal.userId;
    this.props.NewNetClassList(condition).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.result === false) {
        this.setState({ loading: false })
        message.error(data.message);
      }
      else {
        this.setState({ pagingSearch: {...condition,...data}, ...data, loading: false })
      }
    })
  }

  onCancelBack = () => {
    this.props.viewCallback();
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
        condition.date = formatMoment(values.date);
        condition.remark = values.remark;
        let arr = [];
        this.props.taskMan.forEach(e=>{
            arr.push(e.courseActiveId)
        })
        condition.courseActiveIds = arr.join(',')
        this.props.viewCallback({ ...condition });//合并保存数据
      }
    });
  }

  columns = [
    {
      title: '课程名称',
      dataIndex: 'courseName'
    },
    {
      title: '授课类型',
      dataIndex: 'courseType',
      render: (text, record, index) => {
          return getDictionaryTitle(this.state.coursetype, record.courseType);
      }
    },
    {
        title: '科目',
        dataIndex: 'courseCategoryFullname'
    },
    {
        title: '开通天数',
        dataIndex: 'studyPeriod',
        render: (text, record, index) => {
            return <InputNumber  min={0} step={1} defaultValue=''  value={record.standardPrice} onChange={(value) => {
              if (isNaN(value) || value == '') {
                  record.standardPrice = 0;
              }
              else {
                  record.standardPrice = parseInt(value);
              }
              //更新价格
              this.setState({ data: this.state.data });
          }}  className="studyPeriod"/>
        }
    }

  ];
  //标题
  getTitle() {
    let op = '';
    if (this.props.editMode == 'EditDate') {
      op = `批量${this.props.UserSelecteds.length}修改`
      return `${op}有效期`
    }
    if (this.props.editMode == 'Edit') {
      op = getViewEditModeTitle(this.props.editMode);
      return `修改业绩人员`;
    }
    if (this.props.editMode == 'editmUser') {
      // let length=`${this.props.UserSelecteds.length};`
      // if(length==0){
      //   alert('没有选择要修改的订单');
      // }
      op = getViewEditModeTitle(this.props.editMode);
      return `您选择了${this.props.UserSelecteds.length}名学员进行修改面咨人员`;
    }
    if (this.props.editMode == 'editpUser') {
      op = getViewEditModeTitle(this.props.editMode);
      // return `您选择了${this.props.UserSelecteds.length}名学员进行修改面咨人员`;
      return '特殊用户网课开通时间批量修改';
    }
    if (this.props.editMode == 'editfUser') {
      op = getViewEditModeTitle(this.props.editMode);
      return `您选择了${this.props.UserSelecteds.length}名学员进行修改面咨人员`;
    }
    if (this.props.editMode == 'editArea') {
      op = getViewEditModeTitle(this.props.editMode);
      return `您选择了${this.props.UserSelecteds.length}个订单进行所属区域的调整`;
    }else{
      return '特殊用户新增网课'
    }

  }
//最终确定开通
  onChangeNetClass=()=>{
        this.setState({
          isShowChooseProduct: false
        })
        let params = [];
            let hasPeriod = true;
            this.state.taskMan.forEach((item,index)=>{
              let ruleObj = {
                  'courseId': item.courseId,
                  'activeDay': Number(item.standardPrice),
              };
              params.push(ruleObj);
            
            })
            if(!hasPeriod) return;
            this.props.form.validateFields((err, values) => {
              if (!err) {
                  this.setState({ loading: true });
                  setTimeout(() => {
                      this.setState({ loading: false });
                  }, 3000);//合并保存数据
                  let condition = {};
                  condition.userId = this.props.dataModal.userId;
                  condition.courseJson = JSON.stringify(params);
                  this.props.viewCallback(condition);
              }
            });
      }


  
  //点击确定开通
  onStudentView = (record) => {
    if(this.state.taskMan.length){
      this.state.taskMan.forEach((item,index)=>{
        if(!Number(item.standardPrice)){
            message.error('所选科目的开通天数不能为空！');
            hasPeriod  = false;
            return;
        }
      })
      this.setState({
        isShowChooseProduct:true
      })
    }else{
      message.error('请选择开课科目！');
      return;
    }
  }
  //点击确认后的提示弹框
  countDown = () => {
    let cont = this.state.applyNew.errorList.map(e=><p>{e}</p>);
    let success = this.state.applyNew.successCount;
    Modal.warning({
      title:'成功修改数据: '+ success+'条 '+' 失败:'+this.state.applyNew.errorCount+'条',
      content: cont,
    });
  }



  onHideModal=()=> {
    this.setState({
      isShowChooseProduct: false
    })
  }

  handleEndOpenChange = (open) => {
      this.setState({ endOpen: open });
  }
  onChange = (field, value) => {
      this.setState({
          [field]: value,
      });
  }


  onEndChange = (value) => {
      this.onChange('endValue', value);
  }
  //表单按钮处理
  renderBtnControl() {
    if(this.props.editMode == 'NewNet'){
      var button_title = '查询';
      return  <FormItem
            className='btnControl'
            {...btnsearchFormItemLayout}
          >
            <Button type="primary" loading={this.state.loading} icon="search" onClick={this.onSubmit}>{button_title}</Button><span className="split_button"></span><Button icon="rollback" onClick={this.onCancel} >返回</Button>
          </FormItem>
    }
    if (this.props.editMode != 'View') {
      var button_title = '确定'
      return <FormItem
        className='btnControl'
        {...btnsearchFormItemLayout}
      >
        <Button type="primary" loading={this.state.loading} icon="save" onClick={this.onSubmit}>{button_title}</Button><span className="split_button"></span><Button icon="rollback" onClick={this.onCancel} >返回</Button>
      </FormItem>
    }
    else {
      return <FormItem
        className='btnControl'
        {...btnsearchFormItemLayout}
      >
        <Button onClick={this.onCancel} icon="rollback">返回</Button>
      </FormItem>
    }
  }

  //批量设置
  BatchSetUp=()=>{
      if(this.state.taskMan.length){
        this.props.form.validateFields((err, values) => {
          let re = /^\d+$/;
          if(re.test(values.day)){
            this.state.taskMan.forEach(e=>{
              e.standardPrice = values.day;
            })
            this.setState({
              data:this.state.data
            })
          }else{
            message.error('输入的内容必须为大于零的整数！');
          }
        })
      }else{
        message.error('请选择需要设置的课程！')
      }
  }

  //多种模式视图处理
  renderEditModeOfView() {
    let block_content = <div></div>
    const { getFieldDecorator } = this.props.form;

    JSON.stringify(this.state.dataModel)
    switch (this.props.editMode) {
      case "editpUser":
        block_content = (
          <Form className="search-form">
             <Col span={12}>
                  <FormItem
                  {...searchFormItemLayout}
                  label='姓名'
                  >
                  {
                    this.props.dataModal.realName
                  }
                  </FormItem>
             </Col>
             <Col span={12}>
                  <FormItem
                  {...searchFormItemLayout}
                  label='手机号'
                  >
                   {
                    this.props.dataModal.mobile
                  }
                  </FormItem>
             </Col>
             <Col span={12}>
                  <FormItem
                  {...searchFormItemLayout}
                  label='邮箱'
                  >
                   {
                    this.props.dataModal.email
                  }
                  </FormItem>
             </Col>
             <Col span={12}></Col>
            <Row gutter={24}>
                <Col span={24}>
                    <FormItem {...searchFormItemLayout24}>
                        选择了<span style={{color:'red',margin:'0 10'}}>{this.props.taskMan.length}</span>个课程进行开通时间批量修改
                    </FormItem>
                </Col>
            </Row>
            <Row gutter={24}>
            <Col span={24}>
              <FormItem {...searchFormItemLayout24} label="开通时间修改">
                  修改结束日期
              </FormItem>
            </Col>
            <Col span={12}>
                <FormItem {...searchFormItemLayout} label=' '>
                  {getFieldDecorator('date', {
                    initialValue: '',
                    rules: [{
                      required: true, message: '请选择修改结束日期!',
                    }],
                  })(
                    <DatePicker
                      format={dateFormat}
                      onChange={this.onEndChange}
                      open={this.state.endOpen}
                      onOpenChange={this.handleEndOpenChange}
                      placeholder='结束日期'
                    />
                  )}
                  </FormItem>
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
      case 'NewNet':
          
          block_content = (
            <Form className="search-form">
               <Row justify="center" gutter={24} align="middle" type="flex">
                
                     <Col span={12}>
                          <FormItem {...searchFormItemLayout} label={'项目'}>
                              {getFieldDecorator('itemId', {
                                  initialValue: this.state.pagingSearch.itemId
                              })(
                                  
                                  <SelectItem
                                      scope={'my'}
                                      hideAll={false}
                                      isFirstSelected={true}
                                      onSelectChange={(value) => {
                                        this.state.pagingSearch.itemId = value;
                                        this.setState({ pagingSearch: this.state.pagingSearch });
                                      }}
                                  />
                              )}
                          </FormItem>
                    </Col>
                    <Col span={12}>
                          <FormItem {...searchFormItemLayout} label={'科目'}>
                              {getFieldDecorator('courseCategoryId', {
                                  initialValue: ''
                              })(
                                <SelectItemCourseCategory isMain={true} itemId={this.state.pagingSearch.itemId} hideAll={false} />
                              )}
                          </FormItem>
                    </Col>
                    <Col span={12}>
                          <FormItem {...searchFormItemLayout} label={'课程名称'}>
                              {getFieldDecorator('courseName', {
                                  initialValue: ''
                              })(
                                <Input />
                              )}
                          </FormItem>
                    </Col>
                    <Col span={12}></Col>
                </Row>
            </Form>)
        break
    }
    return block_content;
  }

  render() { 
    let title =this.getTitle();
    let block_editModeView = this.renderEditModeOfView();
    const { getFieldDecorator } = this.props.form;
    let extendButtons = [];

    extendButtons.push(<Button onClick={ ()=>{this.onCancelBack()} } icon="rollback" >返回</Button>);
    var rowSelection = {
      selectedRowKeys: this.state.UserSelecteds,
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({ UserSelecteds: selectedRowKeys,taskMan:selectedRows })
      },
      getCheckboxProps: record => {
        return ({
          disabled:false,    // Column configuration not to be checked
        })
      },
    };
    return (
      this.props.editMode=='NewNet'?<div>
         <ContentBox titleName={title} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
        <div className="dv_split"></div>
        {block_editModeView}
        <div className="dv_split"></div>
      </ContentBox>
      {
        this.state.isShowChooseProduct &&
        <Modal
          // title="订单商品选择"
          visible={this.state.isShowChooseProduct}
          onOk={this.onChangeNetClass}
          onCancel={this.onHideModal}
          closable={false}
          // okText="确认"
          // cancelText="取消"
          // footer={null}
        >
            <p style={{fontSize:16}}>确定开通后，系统自动激活网课，您确定为用户开通所选网课吗？</p>
        </Modal>
      }
      <div className="space-default"></div>
          <div className="search-result-list">
            <Table columns={this.columns} //列定义
              loading={this.state.loading}
              rowKey={'studentCourseApplyId'}
              pagination={false}
              rowSelection = {rowSelection}
              dataSource={this.state.data}//数据
              bordered
              // scroll={{ x: 1300 }}
            />
          </div>
          <div>
          <Form className="search-form">
               <Row justify="center" gutter={24} align="middle" type="flex">
                     <Col span={16}>
                          <FormItem  {...searchFormItemLayout} label={'开通天数'}>
                          {getFieldDecorator('day', {
                              initialValue: '',
                            })(
                              <Input style={{width:100}}/>
                          )}
                          </FormItem>
                    </Col>
               </Row>
               <Row justify="end" align="right" type="flex">
                <Col span={24}>
                      <Button onClick={this.BatchSetUp} style={{marginLeft:'52%',marginTop:-48}}>批量设置</Button>
                </Col>
                <Col span={4}>
                      <Button icon='save' onClick={this.onStudentView}>确定开通</Button>
                </Col>
                <Col span={20} className={'search-paging-control'} align="right">
                    <Pagination showSizeChanger
                      current={this.state.pagingSearch.currentPage}
                      defaultPageSize={this.state.pagingSearch.pageSize}      pageSizeOptions = {['10','20','30','50','100','200']}
                      onShowSizeChange={this.onShowSizeChange}
                      onChange={this.onPageIndexChange}
                      showTotal={(total) => { return `共${total}条数据`; }}
                      total={this.state.totalRecord} />
                  </Col>
                </Row>
          </Form>
         
          </div>
          
         
      </div>:
      <ContentBox titleName={title} bottomButton={this.renderBtnControl()}>
        <div className="dv_split"></div>
        {block_editModeView}
        <div className="dv_split"></div>
      </ContentBox>
    );
  }
}

const WrappedStudentAskfaceView = Form.create()(StudentAskfaceView);

const mapStateToProps = (state) => {
  return {};
};

function mapDispatchToProps(dispatch) {
  return {
    NewNetClassList: bindActionCreators(NewNetClassList, dispatch),//列表
    systemCommonChild: bindActionCreators(systemCommonChild, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedStudentAskfaceView);
