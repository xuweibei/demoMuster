import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Tree, Card, Checkbox, DatePicker, InputNumber } from 'antd';
import moment from 'moment';
import { getDictionaryTitle, getViewEditModeTitle, dataBind, timestampToTime, split, formatMoment, convertTextToHtml, formatMoney } from '@/utils';
import { searchFormItemLayout, loadBizDictionary, searchFormItemLayout24 } from '@/utils/componentExt';
import ContentBox from '@/components/ContentBox';
import SelectFBOrg from '@/components/BizSelect/SelectFBOrg';
import SelectArea from '@/components/BizSelect/SelectArea';
import SelectTeachCenterByUser from '@/components/BizSelect/SelectTeachCenterByUser'


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
class View extends React.Component {
  constructor(props) {
    super(props)
    this.loadBizDictionary = loadBizDictionary.bind(this);
    this.state = {
    
      dataModel: props.currentDataModel,//数据模型
      regRegions: [],
    };

  }
  onCancel = () => {
    this.props.viewCallback();
  }
  componentWillMount() {
    this.loadBizDictionary(['order_payee_change_status']);
  }

  //标题
  getTitle() {
    let op = '';
    if (this.props.editMode == 'AuditEdit') {
      op = getViewEditModeTitle(this.props.editMode);
      return `请对所选的${this.props.UserSelecteds.length}个申请进行审核`;
    }

  }
  onSubmit = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({ loading: true });
        setTimeout(() => {
          this.setState({ loading: false });
        }, 3000);//合并保存数据

        this.props.viewCallback({ orderPayeeChangeIds: this.state.dataModel.ids.join(","), ...values });//合并保存数据
      }
    });



  }
  //表单按钮处理
  renderBtnControl() {
      var button_title = '确定审核'
      return <FormItem
        className='btnControl'
        {...btnsearchFormItemLayout}
      >

        <Button type="primary" loading={this.state.loading} icon="ok" onClick={this.onSubmit}>{button_title}</Button><span className="split_button"></span><Button icon="rollback" onClick={this.onCancel} >取消</Button>
      </FormItem>
    
  }

  //多种模式视图处理
  renderEditModeOfView() {
    let block_content = <div></div>
    const { getFieldDecorator } = this.props.form;

    switch (this.props.editMode) {
      case "AuditEdit":
        let lable = '请对所选的' + `${this.state.dataModel.ids.length}` + '个申请进行审核：';
        block_content = (
          <Form className="search-form">
            <div style={{marginBottom:20}}>{lable}</div>
            <Row gutter={24}>
              <Col span={24}>
                <FormItem
                  {...searchFormItemLayout24}
                  style={{ paddingRight: 18 }}
                  label="审核结果"
                >
                  {getFieldDecorator('auditStatus', {
                    initialValue: '',
                    rules: [{
                      required: true, message: '请选择审核结果!',
                    }],
                  })(
                    <Select style={{width:220}}>
                      <Option value=''>--请选择审核结果--</Option>
                      {this.state.order_payee_change_status.filter(a=> a.value != '1').map((item, index) => {
                        return <Option value={item.value} key={index}>{item.title}</Option>
                      })}
                    </Select>

                    )}
                </FormItem>
              </Col>
              <Col span={24}>
                <FormItem
                  {...searchFormItemLayout24}
                  style={{ paddingRight: 18 }}
                  label="审核意见"
                >
                  {getFieldDecorator('auditReason', {
                    initialValue: ''
                  })(
                    <TextArea　placeholder='请填写审核意见' rows={3} />
                    )}
                </FormItem>
              </Col>
            </Row>
          </Form>
        )
        break;


    }
    return block_content;
  }

  render() {
    let title = this.getTitle();
    let block_editModeView = this.renderEditModeOfView();
    return (
      <ContentBox titleName={title} bottomButton={this.renderBtnControl()}>
        {block_editModeView}
      </ContentBox>
    );
  }
}

const WrappedView = Form.create()(View);

const mapStateToProps = (state) => {
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
  };
}
//redux 组件 封装

export default connect(mapStateToProps, mapDispatchToProps)(WrappedView);
