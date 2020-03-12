
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import {
    Modal, Form, Row, Col, Input, Select, Button, Icon,
    Table, Pagination, Card, Radio, message, Checkbox, Cascader,Upload,InputNumber 
} from 'antd';
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const { TextArea } = Input;
//详细金额类表
import ChangeDetailInfo from './changeDetailInfoIndex';
import Info from './info';

import { loadBizDictionary, searchFormItemLayout, searchFormItemLayout24,onSearch } from '@/utils/componentExt';
import ContentBox from '@/components/ContentBox';
import { dataBind, split, formatMoney, timestampToTime,convertTextToHtml } from '@/utils';

import { loadDictionary } from '@/actions/dic'; 
import SelectItem from '@/components/BizSelect/SelectItem';
import { getStudySituationInfo,DataApplicationViewList,DetailsOfEdit } from '@/actions/base'; 
import Information from './Information';

const btnformItemLayout = {
    wrapperCol: { span: 24 },
};



class StudentStudyDetail extends React.Component {
    constructor(props) {
        super(props)

        this.loadBizDictionary = loadBizDictionary.bind(this);
        this.onSearch = onSearch.bind(this);
        this.state = { 
          visible:false,
          pagingSearch:{
            isAllow:''
          },
          dataModel: { ...props.currentDataModel, stageList: [] },
          webCourseList:[], 
        };
    }
    componentWillMount() {
      //载入需要的字典项
      this.loadBizDictionary([ 'category_state','dic_sex','teach_class_type','express']); 
      let {studentId,itemId,courseCategoryId} = this.props.currentDataModel;
        this.onSearch()
    }

  fetch = (params = {}) => { 
   if(!this.props.currentDataModel.materialApplyId)return;
      this.setState({ loading: true });
      var condition = params || this.state.pagingSearch;
      condition.materialApplyId = this.props.currentDataModel.materialApplyId; 
      this.props.DataApplicationViewList(condition).payload.promise.then((response) => {
        let data = response.payload.data;
        if (data.state === 'success') { 
          data.data.materialApplyArr.push({})
          this.setState({
            pagingSearch: condition,
            dataModel:data.data,
            webCourseList: data.data.materialApplyArr,  
            loading: false
          })
        }
        else {
          this.setState({ loading: false })
          message.error(data.message);
        }
      })
    }
    onCancel = () => {
        this.props.viewCallback();
    }

    //点击选择资料
    SelectionInformation = () =>{
      this.setState({
          visible:true, 
      })
    }
    handleCancel = () =>{ 
        this.setState({
            visible:false, 
        })
    }
    renderContent = (value, row, index) => { 
      const obj = {
          children: value,
          props: {},
      };
      if (index == this.state.webCourseList.length - 1) {//汇总
          obj.props.colSpan = 0;
      }
      return obj;
    };
    //编辑列表
    columnC= [
      {
        title: '资料名称',  
        dataIndex: 'materialName', 
        render: (text, record, index) => {
          if (index < this.state.webCourseList.length - 1) {
              return  <span>{record.materialName}</span>;
          }
          return {
              children: <span style={{float:'right',marginRight:'16%'}}>合计：</span>,
              props: {
                  colSpan: 4,
              },
          }
        }
      },
      {
        title: '资料类型',
        dataIndex: 'materialType',
        render: this.renderContent
      },
      {
        title: '是否为打包资料',
        dataIndex: 'isPack',  
        render: this.renderContent
      },
      {
        title: '教师',
        dataIndex: 'teacher', 
        render: this.renderContent
      },
      {
        title: <div>申请数量<span style={{ color: 'red' }}>*</span></div>, 
        dataIndex: 'applyNum',  
        render: (text, record, index) => {   
          if(index<this.state.webCourseList.length-1){  
                return <InputNumber value={record.applyNum} onChange={(value) => {
                  if (isNaN(value) || value == '') {
                      record.applyNum = 0;
                  }
                  else {
                    if(parseInt(value)<0){
                      record.applyNum = 0;
                    }else{ 
                      record.applyNum = parseInt(value)
                    }
                  }
                  //更新价格
                  this.setState({ data: this.state.data }); 
                  }} /> 
          }  
          return this.renderTd('applyNum', record, index)
          } 
      },
      {
        title: '操作', 
        render:(text,record,index)=>{
          if(index < this.state.webCourseList.length - 1){
            return <Button onClick={()=>{this.Delete(record.materialId)}}>删除</Button>
          }
        }
      }
    ];
    renderTd = (val, row, index) => {
      var amount = 0; 
      this.state.webCourseList.map(item => {
          amount += parseFloat(item[val] || 0);
      }) 
      return <span>{parseInt(formatMoney(amount))}</span>
    }
    Delete = (value) => { 
      let { webCourseList } = this.state;
      if(webCourseList.length<3){
        webCourseList.length = 0
        return this.setState({webCourseList})
      }
      let arr = webCourseList.filter(item=>{
            return item.materialId !== value
      })
      this.setState({
        webCourseList:arr
      })
    }
    onSubmit = () => {
        var that = this;
        //表单验证后，合并数据提交
        this.props.form.validateFields((err, values) => {
            if (!err) { 
              let onOff = true;
              let name = '';
              this.state.webCourseList.slice(0,this.state.webCourseList.length-1).forEach(item=>{
                if(!item.applyNum && onOff){   
                  name = item.materialName
                  onOff = false
                  return
                }
              }) 
              if(!onOff)return message.warning('资料:'+name+'申请数量未设置！') 
              let arrMid = []; 
              let appNum = [];
              if(this.state.webCourseList.length<2)return message.warning('请选择资料进行操作')
              this.state.webCourseList.forEach((item,index)=>{ 
                arrMid.push(item.materialId); 
                appNum.push(item.applyNum)
              }) 
              that.setState({ loading: true });
              let condition = {};
              condition = {...values}
              if(Array.isArray(condition.itemIds)){
                condition.itemIds = condition.itemIds[0]
              }
              condition.materialIds = arrMid.join(',').slice(0,arrMid.join(',').length-1);
              condition.applyNums = appNum.join(',').slice(0,appNum.join(',').length-1);
              condition.branchId = this.props.branchId;
              condition.materialApplyId = this.state.dataModel.materialApplyId; 
              this.props.DetailsOfEdit(condition).payload.promise.then((response) => {
                let data = response.payload.data; 
                if(data.state=='success'){
                  message.success('修改成功！')
                  this.props.viewCallback(true)
                }else{
                  message.error(data.msg)
                  this.setState({
                    loading:false
                  })
                }
              }) 
            }
        });
    }
    //标题
    getTitle() { 
        if(this.props.editMode == 'View'){
          return '资料申请详细信息'
        }else if(this.props.editMode == 'Edit'){
          return '资料编辑'
        }
    }
    //表单按钮处理
    renderBtnControl() { 
        if (this.props.editMode != 'View' && this.props.editMode !='ViewInfo') {
            return <FormItem
                className='btnControl'
                {...btnformItemLayout}
            >
                <Button type="primary" loading={this.state.loading} icon="save" onClick={this.onSubmit}>保存</Button><span className="split_button"></span><Button icon="rollback" onClick={this.onCancel} >返回</Button>
            </FormItem>
        }
        else {
            return <FormItem
                className='btnControl'
                {...btnformItemLayout}
            >
                <Button onClick={this.onCancel} icon="rollback">返回</Button>
            </FormItem>
        }
    } 
  //查看列表
    columnweb= [
    {
      title: '资料名称', 
      dataIndex: 'materialName', 
      render: (text, record, index) => {
        if (index < this.state.webCourseList.length - 1) {
            return  <a onClick={() => {
              this.onLookView('ViewS',record)
            }}>{record.materialName}</a>;
        }
        return {
            children: <span style={{float:'right',marginRight:'16%'}}>合计：</span>,
            props: {
                colSpan: 4,
            },
        }
      }
    },
    {
      title: '资料类型',
      dataIndex: 'materialType',
      render: this.renderContent
    },
    {
      title: '是否为打包资料',
      dataIndex: 'isPack',  
      render: this.renderContent
    },
    {
      title: '教师',
      dataIndex: 'teacher', 
      render: this.renderContent
    },
    {
      title: '申请数量',
      dataIndex: 'applyNum', 
      render: (text, record, index) => {   
        if(index<this.state.webCourseList.length-1){  
              return record.applyNum
        }  
        return this.renderTd('applyNum', record, index)
        } 
    }];
    onLookView = (op, item) => {
      this.setState({
        editMode: op,//编辑模式
        currentDataModel: item,//编辑对象
      });
    };
    onViewCallback = (value,data) => {  
      if(value == 'Edit'){ 
        let { webCourseList } = this.state;
        webCourseList.pop();
        data.forEach(item=>item.applyNum = 0); 
        webCourseList.push(...data) 
        webCourseList.push({});
        this.setState({ currentDataModel: null, editMode: 'Edit', visible:false,webCourseList }) 
      }else{
        this.setState({ currentDataModel: null, editMode: 'View' })
      } 
    }
    
    render() {
        let title = this.getTitle();
        let block_content = <div></div>
        const { getFieldDecorator } = this.props.form; 
        if(this.state.editMode =='ViewS') return <Info  viewCallback={this.onViewCallback} {...this.state} />
            switch (this.props.editMode) {  
                case "View":
                    block_content = (
                        <Form>
                            <Row gutter={24}>
                                <Col span={12}>
                                    <FormItem {...searchFormItemLayout} label="分部">
                                        {this.state.dataModel.branchName}
                                    </FormItem>
                                </Col>
                                <Col span={12}>
                                    <FormItem {...searchFormItemLayout} label="负责人">
                                        {this.state.dataModel.chargeMan}
                                    </FormItem>
                                </Col>
                              <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="申请名称">
                                  {this.state.dataModel.materialApplyName}
                                </FormItem>
                              </Col>
                              <Col span={24}>
                                <FormItem {...searchFormItemLayout24} label="相关项目">
                                  {this.state.dataModel.itemNames}
                                </FormItem>
                              </Col>
                              <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="收件人">
                                  {this.state.dataModel.receiver}
                                </FormItem>
                              </Col>
                              <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="手机号">
                                  {this.state.dataModel.mobile}
                                </FormItem>
                              </Col>
                              <Col span={24}>
                                <FormItem {...searchFormItemLayout24} label="快递地址">
                                  {this.state.dataModel.sendAddress}
                                </FormItem>
                              </Col>
                              <Col span={24}>
                                <FormItem {...searchFormItemLayout24} label="备注">
                                  {this.state.dataModel.applyReason}
                                </FormItem>
                              </Col>
                              <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="申请人">
                                  {this.state.dataModel.applicant}
                                </FormItem>
                              </Col>
                              <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="申请日期">
                                  {timestampToTime(this.state.dataModel.submitDate)}
                                </FormItem>
                              </Col>
                              <Col span={24}>
                                <FormItem {...searchFormItemLayout24} label="审核意见"> 
                                  <span className="ant-form-text" dangerouslySetInnerHTML={{ __html: convertTextToHtml(this.state.dataModel.auditReason) }}></span>
                                </FormItem>
                              </Col>
                              <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="寄件情况">
                                  {this.state.dataModel.sendStatus}
                                </FormItem>
                              </Col>
                              <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="寄件人">
                                  {this.state.dataModel.sender}
                                </FormItem>
                              </Col>
                              <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="寄件日期">
                                  {timestampToTime(this.state.dataModel.sendDate)}
                                </FormItem>
                              </Col>
                              <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="快递公司">
                                  {this.state.dataModel.express}
                                </FormItem>
                              </Col>
                              <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="快递号">
                                  {this.state.dataModel.expressNum}
                                </FormItem>
                              </Col>
                              <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="寄件备注">
                                  { this.state.dataModel.sendRemark}
                                </FormItem>
                              </Col>
                              <Col span={12}> 
                                  <FormItem {...searchFormItemLayout} label="收件情况">
                                    {this.state.dataModel.receiveStatus}
                                  </FormItem>
                              </Col>
                              <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="收件日期">
                                  {timestampToTime(this.state.dataModel.receiveDate)}
                                </FormItem>
                              </Col>
                              <Col span={24}>
                                <FormItem {...searchFormItemLayout24} label="到件反馈"> 
                                  <span className="ant-form-text" dangerouslySetInnerHTML={{ __html: convertTextToHtml(this.state.dataModel.feedbackRemark) }}></span>
                                </FormItem>
                              </Col>
                            </Row>
                            <Row>
                              <div className="search-result-list" style={{padding:'0 20px'}}>
                                <div className="space-default"></div>
                                  <p style={{paddingBottom:20}}>申请资料：</p>
                                  <Table columns={this.columnweb} //列定义
                                        loading={this.state.loading}
                                        pagination={false}
                                        dataSource={this.state.webCourseList}//数据
                                        bordered 
                                  /> 
                              </div>
                            </Row>
                        </Form>
                    );
                    break;
                    case 'Edit':
                    block_content = (
                      <Form>
                          <Row gutter={24}>
                              <Col span={12}>
                                  <FormItem
                                  {...searchFormItemLayout}
                                  label = '申请名称'
                                  >
                                    {
                                      getFieldDecorator('materialApplyName',{
                                        initialValue:this.state.dataModel.materialApplyName,
                                        rules: [{
                                          required: true, message: '请输入申请名称!',
                                        }]
                                      })(
                                        <Input />
                                      )
                                    }
                                  </FormItem>
                              </Col>
                              <Col span={24}>
                                  <FormItem
                                      {...searchFormItemLayout24}
                                      style={{ paddingRight: 18 }}

                                      label={'相关项目'} >
                                      {getFieldDecorator('itemIds',
                                          {
                                              initialValue: dataBind(split(this.state.dataModel.itemId,'、')),//this.state.dic_item_ids
                                              rules: [{
                                                required: true, message: '请选择项目!',
                                              }]
                                          }
                                      )(
                                          <SelectItem scope='my' hideAll={false} showCheckBox={true} />
                                          )}
                                  </FormItem>
                              </Col>
                              <Col span={12}>
                                  <FormItem
                                  {...searchFormItemLayout}
                                  label = '收件人'
                                  >
                                    {
                                      getFieldDecorator('receiver',{
                                        initialValue:this.state.dataModel.receiver,
                                        rules: [{
                                          required: true, message: '请输入收件人名称!',
                                        }]
                                      })(
                                        <Input />
                                      )
                                    }
                                  </FormItem>
                              </Col>
                              <Col span={12}>
                                  <FormItem
                                  {...searchFormItemLayout}
                                  label = '手机号'
                                  >
                                    {
                                      getFieldDecorator('mobile',{ 
                                        initialValue:this.state.dataModel.mobile,
                                        rules: [{
                                          required: true, message: '请输入手机号!',
                                        }]})(
                                        <Input />
                                      )
                                    }
                                  </FormItem>
                              </Col>
                              <Col span={24}>
                                  <FormItem
                                  {...searchFormItemLayout24}
                                  label = '快递地址'
                                  >
                                    {
                                      getFieldDecorator('sendAddress',{
                                        initialValue:this.state.dataModel.sendAddress,
                                        rules: [{
                                          required: true, message: '请输入快递地址!',
                                        }]})(
                                        <Input />
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
                                      getFieldDecorator('applyReason',{ initialValue:this.state.dataModel.applyReason})( 
                                        <TextArea/>
                                      )
                                    }
                                  </FormItem>
                              </Col>
                          </Row> 
                       {
                         this.state.visible && <Modal 
                            title='资料选择'
                            visible={this.state.visible}
                            onOk={this.handleOk}
                            onCancel={this.handleCancel}
                            okButtonProps={{ disabled: true }}
                            cancelButtonProps={{ disabled: true }}
                            width = '1020' 
                            footer={null}
                            >
                           <Information viewCallback={this.onViewCallback} handleCancel = {this.handleCancel} {...this.state}/>
                        </Modal>
                       }
                          <Row>
                            <div className="search-result-list" style={{padding:'0 20px'}}>
                              <div className="space-default"></div>
                              <p style={{paddingBottom:20}}>申请资料设置：</p>
                              <Button style={{margin:'10 0'}} onClick={this.SelectionInformation} icon='calendar'>选择资料</Button>
                              <Table columns={this.columnC} //列定义
                                  loading={this.state.loading}
                                  pagination={false}
                                  dataSource={this.state.webCourseList}//数据
                                  bordered 
                              />  
                          </div>
                          </Row> 
                          
                      </Form>)
                      break;
            } 

        return (
            <div>
                {!this.state.showList && <ContentBox titleName={title} bottomButton={this.renderBtnControl()}>
                    <div className="dv_split"></div>
                    {block_content}
                    <div className="dv_split"></div>
                </ContentBox>
                }
                {this.state.showList &&
                    <Row>
                        <Col span={24}>
                            <ChangeDetailInfo studentChangeId={this.state.dataModel.studentChangeId} />
                        </Col>
                        <Col span={24} className="center">
                            <Button onClick={() => {
                                this.setState({ showList: false })
                            }} icon="rollback">返回</Button>
                        </Col>
                    </Row>
                }
            </div>
        );
    }

}

//表单组件 封装
const WrappedManage = Form.create()(StudentStudyDetail);

const mapStateToProps = (state) => {
    //基本字典数据 
    let { Dictionarys } = state.dic;
    let branchId = state.auth.currentUser.userType.orgId
    return { Dictionarys,branchId };
};

function mapDispatchToProps(dispatch) {
    return {
        //基本字典接口
      loadDictionary: bindActionCreators(loadDictionary, dispatch), 
      //查看
      DataApplicationViewList: bindActionCreators(DataApplicationViewList, dispatch),
      //编辑
      DetailsOfEdit: bindActionCreators(DetailsOfEdit, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
