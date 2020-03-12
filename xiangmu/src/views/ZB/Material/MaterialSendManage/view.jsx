import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Tree, Card, Checkbox, DatePicker, InputNumber, message } from 'antd';
import moment from 'moment';
import { getDictionaryTitle, getViewEditModeTitle, dataBind, timestampToTime, split, formatMoment, convertTextToHtml, formatMoney } from '@/utils';
import { loadBizDictionary, searchFormItemLayout,searchFormItemLayout24} from '@/utils/componentExt';
import ContentBox from '@/components/ContentBox';
import { queryMaterialApplyVoInfo, sendInfoUpdata } from '@/actions/material';
import { loadDictionary } from '@/actions/dic';
const FormItem = Form.Item;
const { TextArea } = Input;
const { RangePicker } = DatePicker;
const btnsearchFormItemLayout = {
  wrapperCol: { span: 24 },
};
const dateFormat = 'YYYY-MM-DD';

const CheckboxGroup = Checkbox.Group;

/*
必要属性输入
editMode [Create/Edit/View/Delete]
currentDataModel [数据模型]
viewCallback [回调]
*/
class AuditView extends React.Component {
  constructor(props) {
    super(props)
    this.loadBizDictionary = loadBizDictionary.bind(this);
    this.state = {
      dataModel: props.currentDataModel,//数据模型
      dic_discountStatus: [],
      data: []
    };
    this.index_last = 0;
  }
  onCancel = () => {
    this.props.viewCallback();
  }
  componentWillMount() {
      this.loadBizDictionary(['express']);
      this.fetch();
  }
  fetch = () => {
    this.setState({ loading: true })
    let condition = { materialApplyId: this.state.dataModel.materialApplyId };
    this.props.queryMaterialApplyVoInfo(condition).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.state != 'success') {
        message.error(data.message);
      }
      else {
        if (data.data.materialApplyArr) {
          let materialApplyArr = data.data.materialApplyArr;
          materialApplyArr.push({})
          this.index_last = materialApplyArr.length - 1;
          this.setState({ data: materialApplyArr });
        }
        this.setState({ dataModel: { ...data.data }, data: data.data.materialApplyArr, loading: false })
      }
    })
  }

  renderContent = (value, row, index) => {
      const obj = {
          children: value,
          props: {},
      };
      if (index == this.index_last) {//汇总
          obj.props.colSpan = 0;
      }
      return obj;
  };
  renderTd = (val,row,index) => {
    var amount = 0;
    if (index < this.index_last) {
        return <span>{row[val]}</span>
    }else{
      this.state.data.map(item => {
          amount += (item[val] || 0);
      })
    }
    return <span>{amount}</span>
  }

  viewColumns = [
    {
        title: '资料名称',
        dataIndex: 'materialName',
        render: (text, record, index) => {
          if (index < this.index_last) {
              return <span>{record.materialName}</span>
          }
          return {
              children: <span>合计：</span>,
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
          return this.renderTd('applyNum', record, index)
        }
    },
  ];


  //标题
  getTitle() {
    let op = '';
    if (this.props.editMode == 'View') {
      op = '资料寄件信息查看'
      return `${op}`
    } else {
      op = '资料寄件信息确认'
      return `${op}`
    }

  }

  //表单按钮处理
  renderBtnControl() {
      return <FormItem
        className='btnControl'
        {...btnsearchFormItemLayout}
      >
        { this.props.editMode == 'Audit' && <Button onClick={this.onAudit} icon="save">确定</Button>}
        <span className="split_button"></span>
        <Button onClick={this.onCancel} icon="rollback">返回</Button>
      </FormItem>
  }

  onAudit = () => {
      var that = this;
      this.props.form.validateFields((err, values) => {
        if(!err){
          
          that.setState({ loading: true });
          values.materialApplyId = that.state.dataModel.materialApplyId;
          values.sendDate = formatMoment(values.sendDate);//寄件时间
          
          if(!values.sendStatus.length){
            values.sendStatus = 1;//待寄件
            Modal.confirm({
              title: '快递情况修改为未寄出，将删除寄件相关信息，确认此修改吗?',
              content: '请确认',
              onOk: () => {
                that.sendInfoUpdata(values);
              },
              onCancel: () => {
                that.setState({ loading: false });
              }
            })
          }else{
            values.sendStatus = 2;//已寄件
            that.sendInfoUpdata(values);
          }
          
        }
      });
    }
  
  sendInfoUpdata = (values) => {
    
    this.props.sendInfoUpdata(values).payload.promise.then((response) => {
        let data = response.payload.data;
        this.setState({ loading: false });
        if (data.state === 'error') {
            message.error(data.message);
        }
        else {
            message.success("资料寄件修改成功！");
            //this.fetch();
            this.props.viewCallback();
        }
    })
    
  }
  

  //多种模式视图处理
  renderEditModeOfView() {
    let block_content = <div></div>
    const { getFieldDecorator } = this.props.form;

    switch (this.props.editMode) {
      case "Audit":
        block_content = (
          <Form className="search-form">
            <Row gutter={24}>
            <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="分部"
                >
                  {this.state.dataModel.branchName}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="负责人"
                >
                  {this.state.dataModel.chargeMan}
                </FormItem>
              </Col>
              <Col span={24}>
                <FormItem
                  {...searchFormItemLayout24}
                  label='申请名称'
                >
                  {this.state.dataModel.materialApplyName}
                </FormItem>
              </Col>

              <Col span={24}>
                <FormItem
                  {...searchFormItemLayout24}
                  label="相关项目"
                >
                  {this.state.dataModel.itemNames}
                </FormItem>
              </Col>

              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="收件人"
                >
                  {this.state.dataModel.receiver}
                </FormItem>
              </Col>

              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="手机号"
                >
                  {this.state.dataModel.mobile}
                </FormItem>
              </Col>

              <Col span={24} >
                <FormItem
                  {...searchFormItemLayout24}
                  label="快递地址"
                >
                  {this.state.dataModel.sendAddress}
                </FormItem>
              </Col>
              <Col span={24}>
                <FormItem
                  {...searchFormItemLayout24}
                  label="备注"
                >
                  {this.state.dataModel.applyReason}
                </FormItem>
              </Col>

              
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="申请人"
                >
                  {this.state.dataModel.applicant}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="申请日期"
                >
                  {timestampToTime(this.state.dataModel.submitDate)}
                </FormItem>
              </Col>
              <Col span={24}>
                <FormItem
                  {...searchFormItemLayout24}
                  style={{ paddingRight: 18 }}
                  label="审核意见"
                >
                  <span className="ant-form-text" dangerouslySetInnerHTML={{ __html: convertTextToHtml(this.state.dataModel.auditReason) }}></span>

                </FormItem>
              </Col>
              <Col span={24}>
                <FormItem
                  {...searchFormItemLayout24}
                  style={{ paddingRight: 18 }}
                  label="寄件情况"
                >
                  {getFieldDecorator('sendStatus', {
                    initialValue: this.state.dataModel.sendStatusFlag ? [this.state.dataModel.sendStatusFlag] : [],
                  })(
                    <CheckboxGroup>
                      <Checkbox value={2} key={2}>已寄</Checkbox>
                    </CheckboxGroup>
                    )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="寄件人"
                >
                  {getFieldDecorator('sender', {
                    initialValue: this.state.dataModel.sender ? this.state.dataModel.sender : this.props.realName,
                  })(
                    <Input placeholder='请输入寄件人' />
                    )}
                </FormItem>
              </Col>
              <Col span={12}>
                  <FormItem {...searchFormItemLayout} label="寄件日期">
                  {getFieldDecorator('sendDate', {
                          initialValue: this.state.dataModel.sendDate ? dataBind(timestampToTime(this.state.dataModel.sendDate), true) : dataBind(timestampToTime(new Date().getTime()), true),
                      })(
                          <DatePicker
                            format={dateFormat}
                            placeholder='寄件日期'
                          />
                      )}
                  </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="快递公司"
                >
                  {getFieldDecorator('express', {
                    initialValue: this.state.dataModel.express ? this.state.dataModel.express : '',
                  })(
                    <Select style={{width:220}}>
                      <Option value=''>--请选择--</Option>
                      {this.state.express.map((item, index) => {
                        return <Option value={item.value} key={index}>{item.title}</Option>
                      })}
                    </Select>

                    )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="快递号"
                >
                  {getFieldDecorator('expressNum', {
                    initialValue: this.state.dataModel.expressNum,
                  })(
                    <Input placeholder='请输入快递号' />
                    )}
                </FormItem>
              </Col>
              <Col span={24}>
                <FormItem
                  {...searchFormItemLayout24}
                  style={{ paddingRight: 18 }}
                  label="寄件备注"
                >
                  {getFieldDecorator('sendRemark', {
                    initialValue: this.state.dataModel.sendRemark,
                  })(
                    <TextArea　placeholder='请填写寄件备注' rows={3} />
                    )}
                </FormItem>
              </Col>
            </Row>
          </Form>
        );
        break;
      case "View":
        block_content = (
          <Form className="search-form">
            <Row gutter={24}>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="分部"
                >
                  {this.state.dataModel.branchName}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="负责人"
                >
                  {this.state.dataModel.chargeMan}
                </FormItem>
              </Col>
              <Col span={24}>
                <FormItem
                  {...searchFormItemLayout24}
                  label='申请名称'
                >
                  {this.state.dataModel.materialApplyName}
                </FormItem>
              </Col>

              <Col span={24}>
                <FormItem
                  {...searchFormItemLayout24}
                  label="相关项目"
                >
                  {this.state.dataModel.itemNames}
                </FormItem>
              </Col>

              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="收件人"
                >
                  {this.state.dataModel.receiver}
                </FormItem>
              </Col>

              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="手机号"
                >
                  {this.state.dataModel.mobile}
                </FormItem>
              </Col>

              <Col span={24} >
                <FormItem
                  {...searchFormItemLayout24}
                  label="快递地址"
                >
                  {this.state.dataModel.sendAddress}
                </FormItem>
              </Col>
              <Col span={24}>
                <FormItem
                  {...searchFormItemLayout24}
                  label="备注"
                >
                  {this.state.dataModel.applyReason}
                </FormItem>
              </Col>

              
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="申请人"
                >
                  {this.state.dataModel.applicant}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="申请日期"
                >
                  {timestampToTime(this.state.dataModel.submitDate)}
                </FormItem>
              </Col>
              {
                this.state.dataModel.auditReason && <Col span={24}>
                  <FormItem
                    {...searchFormItemLayout24}
                    style={{ paddingRight: 18 }}
                    label="审核意见"
                  >
                    <span className="ant-form-text" dangerouslySetInnerHTML={{ __html: convertTextToHtml(this.state.dataModel.auditReason) }}></span>

                  </FormItem>
                </Col>
              }
              {
                this.state.dataModel.sendStatus && <Col span={24}>
                  <FormItem
                    {...searchFormItemLayout24}
                    style={{ paddingRight: 18 }}
                    label="寄件情况"
                  >
                    {this.state.dataModel.sendStatus}
                  </FormItem>
                </Col>
              }
              {
                this.state.dataModel.sender && <Col span={12}>
                  <FormItem
                    {...searchFormItemLayout}
                    label="寄件人"
                  >
                    {this.state.dataModel.sender}
                  </FormItem>
                </Col>
              }
              {
                this.state.dataModel.sendDate && <Col span={12}>
                  <FormItem
                    {...searchFormItemLayout}
                    label="寄件日期"
                  >
                    {timestampToTime(this.state.dataModel.sendDate)}
                  </FormItem>
                </Col>
              }
              {
                this.state.dataModel.express && <Col span={12}>
                  <FormItem
                    {...searchFormItemLayout}
                    label="快递公司"
                  >
                    {this.state.dataModel.express}
                  </FormItem>
                </Col>
              }
              {
                this.state.dataModel.expressNum && <Col span={12}>
                  <FormItem
                    {...searchFormItemLayout}
                    label="快递号"
                  >
                    {this.state.dataModel.expressNum}
                  </FormItem>
                </Col>
              }
              {
                this.state.dataModel.sendRemark && <Col span={24}>
                  <FormItem
                    {...searchFormItemLayout24}
                    style={{ paddingRight: 18 }}
                    label="寄件备注"
                  >
                    {this.state.dataModel.sendRemark}
                  </FormItem>
                </Col>
              }
              {
                this.state.dataModel.receiveStatus && <Col span={12}>
                  <FormItem
                    {...searchFormItemLayout}
                    label="收件情况"
                  >
                    {this.state.dataModel.receiveStatus}
                  </FormItem>
                </Col>
              }
              {
                this.state.dataModel.receiveDate && <Col span={12}>
                  <FormItem
                    {...searchFormItemLayout}
                    label="收件日期"
                  >
                    {timestampToTime(this.state.dataModel.receiveDate)}
                  </FormItem>
                </Col>
              }
              {
                this.state.dataModel.feedbackRemark && <Col span={24}>
                  <FormItem
                    {...searchFormItemLayout24}
                    style={{ paddingRight: 18 }}
                    label="到件反馈"
                  >
                    <span className="ant-form-text" dangerouslySetInnerHTML={{ __html: convertTextToHtml(this.state.dataModel.feedbackRemark) }}></span>

                  </FormItem>
                </Col>
              }
            </Row>
            <Row>
                {/* 内容分割线 */}
                <div className="search-result-list" style={{padding:'0 20px'}}>
                  <div className="space-default"></div>
                  <p style={{paddingBottom:20}}>申请资料：</p>
                  <Table columns={this.viewColumns} //列定义
                    loading={this.state.loading}
                    pagination={false}
                    dataSource={this.state.data}//数据
                    bordered
                  />
                </div>
            </Row>
          </Form>
        );
        break;

    }
    return block_content;
  }

  render() {
    let title = this.getTitle();
    let block_editModeView = this.renderEditModeOfView();
    return (<div>
        <ContentBox titleName={title} bottomButton={this.renderBtnControl()}>
          {block_editModeView}
        </ContentBox>
        {/* 内容分割线 */}
        { this.props.editMode == 'Audit' ? <div className="search-result-list" style={{padding:'0 20px'}}>
            <div className="space-default"></div>
            <p style={{paddingBottom:20}}>申请资料信息：</p>
            <Table columns={this.viewColumns} //列定义
              loading={this.state.loading}
              pagination={false}
              dataSource={this.state.data}//数据
              bordered
            />
          </div>
          : ''
        }
        
      </div>
    );
  }
}

const WrappedAuditView = Form.create()(AuditView);

const mapStateToProps = (state) => {
  let { Dictionarys } = state.dic;
  let { realName } = state.auth.currentUser.user;
  return { Dictionarys, realName };
};

function mapDispatchToProps(dispatch) {
  return {
    queryMaterialApplyVoInfo: bindActionCreators(queryMaterialApplyVoInfo, dispatch),
    sendInfoUpdata: bindActionCreators(sendInfoUpdata, dispatch),
    loadDictionary: bindActionCreators(loadDictionary, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedAuditView);
