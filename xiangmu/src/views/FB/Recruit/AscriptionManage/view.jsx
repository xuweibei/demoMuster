import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Tree, Card, Checkbox, DatePicker, InputNumber } from 'antd';
import moment from 'moment';
import { getDictionaryTitle, getViewEditModeTitle, dataBind, timestampToTime, split, formatMoment, convertTextToHtml, formatMoney } from '@/utils';
import { searchFormItemLayout } from '@/utils/componentExt';
import ContentBox from '@/components/ContentBox';
import { queryUserByBranchId } from '@/actions/enrolStudent';
import SelectFBOrg from '@/components/BizSelect/SelectFBOrg';
import SelectArea from '@/components/BizSelect/SelectArea';
import SelectTeachCenterByUser from '@/components/BizSelect/SelectTeachCenterByUser';


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
    this.state = {
      dataModel: props.currentDataModel,//数据模型
      regRegions: [],
      user_list: [],
      areaId:'',
    };

  }
  onCancel = () => {
    this.props.viewCallback();
  }
  componentWillMount() {
    this.fetchUser();
  }
  fetchUser = (params = {}) => {
    let areaId=this.props.currentDataModel.results;
    this.props.queryUserByBranchId({areaId:areaId}).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.result === false) {
        message.error(data.message);
      }
      else {
        this.setState({ user_list: data.data })
      }
    })
  }
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
      return `您选择了${this.props.UserSelecteds.length}名学员进行修改市场人员：`;
    }
    if (this.props.editMode == 'editpUser') {
      op = getViewEditModeTitle(this.props.editMode);
      return `您选择了${this.props.UserSelecteds.length}名学员进行修改电咨人员：`;
    }
    if (this.props.editMode == 'editfUser') {
      op = getViewEditModeTitle(this.props.editMode);
      return `您选择了${this.props.UserSelecteds.length}名学员进行修改面咨人员：`;
    }
    if (this.props.editMode == 'editArea') {
      op = getViewEditModeTitle(this.props.editMode);
      return `您选择了${this.props.UserSelecteds.length}名学员进行修改区域调整：`;
    } 
    if (this.props.editMode == 'editTeachCenter') {
      op = getViewEditModeTitle(this.props.editMode);
      return `您选择了${this.props.UserSelecteds.length}名学员进行修改教学点调整：`;
    }
  }
  onSubmit = () => {
    //表单验证后，合并数据提交
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({ loading: true });
        setTimeout(() => {
          this.setState({ loading: false });
        }, 3000);//合并保存数据
        if (this.props.editMode == 'Edit') {
          var postData = {
            orderIds: this.state.dataModel.orderId,
            benefitUserId: values.marketUserId,
          }
        }
        else {
          var postData = {
            ids: this.props.UserSelecteds.join(','),
           // branchId: values.branchId,
            regionId: values.areaId,
           // marketUserId: values.marketUserId,
           // pconsultUserId: values.pconsultUserId,
           // fconsultUserId: values.fconsultUserId,
            type:this.state.dataModel.type,
          }
        }
        this.props.viewCallback({ ...values, ...postData, });//合并保存数据
      }
    });
  }
  //表单按钮处理
  renderBtnControl() {
    if (this.props.editMode != 'View') {
      var button_title = this.props.editMode == 'editmUser' ? getViewEditModeTitle('Edit', '修改') : getViewEditModeTitle(this.props.editMode, '修改')
      return <FormItem
        className='btnControl'
        {...btnsearchFormItemLayout}
      >
        <Button type="primary" loading={this.state.loading} icon="edit" onClick={this.onSubmit}>{button_title}</Button><span className="split_button"></span><Button icon="rollback" onClick={this.onCancel} >取消</Button>
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

  //多种模式视图处理
  renderEditModeOfView() {
    let block_content = <div></div>
    const { getFieldDecorator } = this.props.form;

    switch (this.props.editMode) {
      case "editArea":
        block_content = (
          <Form className="search-form">
            <Row gutter={24}>
              <Col span={18}>
              <FormItem
                  {...searchFormItemLayout}
                  label="请选择区域:"
                >
                  {
                    getFieldDecorator('areaId', {
                      //initialValue: this.state.pagingSearch.benefitRegionId 
                      rules: [{
                        required: true, message: '请选择区域!',
                      }],
                    })
                      (
                      <SelectArea scope='my'  hideAll={true} showCheckBox={false} />
                      )
                  }

                </FormItem>
              </Col>
            </Row>
          </Form>
        );
        break;
      case "Create":
        break;
        case "editmUser":
        block_content = (
          <Form className="search-form">
            <Row gutter={24}>
              <Col span={18}>
                <FormItem
                  {...searchFormItemLayout}
                  label="请选择市场人员:"
                >
                  {getFieldDecorator('benefitUserId', {
                    initialValue: ''
                  })(
                    <Select>
                      <Option value=''>空</Option>
                      {this.state.user_list.map((item, index) => {
                        return <Option value={item.userId} key={index}>{item.realName}</Option>
                      })}
                    </Select>
                  )}
                </FormItem>
              </Col>
            </Row>
          </Form>
        );
        break;
      case "editpUser":
        block_content = (
          <Form className="search-form">
            <Row gutter={24}>
              <Col span={18}>
                <FormItem
                  {...searchFormItemLayout}
                  label="请选择电咨人员:"
                >
                  {getFieldDecorator('benefitUserId', {
                    initialValue: ''
                  })(
                    <Select>
                      <Option value=''>空</Option>
                      {this.state.user_list.map((item, index) => {
                        return <Option value={item.userId} key={index}>{item.realName}</Option>
                      })}
                    </Select>
                  )}
                </FormItem>
              </Col>
            </Row>
          </Form>
        );
        break;
      case "editfUser":
        block_content = (
          <Form className="search-form">
            <Row gutter={24}>
              <Col span={18}>
                <FormItem
                  {...searchFormItemLayout}
                  label="请选择面资人员:"
                >
                  {getFieldDecorator('benefitUserId', {
                    initialValue: ''
                  })(
                    <Select>
                      <Option value=''>空</Option>
                      {this.state.user_list.map((item, index) => {
                        return <Option value={item.userId} key={index}>{item.realName}</Option>
                      })}
                    </Select>
                  )}
                </FormItem>
              </Col>
            </Row>
          </Form>
        );
        break;
   
    case "editTeachCenter":
        block_content = (
          <Form className="search-form">
            <Row gutter={24}>
              <Col span={18}>
                <FormItem
                  {...searchFormItemLayout}
                  label="请选择教学点:"
                >
                  {getFieldDecorator('teachCenterId', {
                    initialValue: '',
                    rules: [{
                      required: true, message: '请输入选择的教学点!',
                    }],
                  })(
                    <SelectTeachCenterByUser scope='my'  hideAll={true} showCheckBox={false} />
                  )}
                </FormItem>
              </Col>
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
    return (
      <ContentBox titleName={title} bottomButton={this.renderBtnControl()}>
        {block_editModeView}
      </ContentBox>
    );
  }
}

const WrappedView = Form.create()(View);

const mapStateToProps = (state) => {
  return {};
};

function mapDispatchToProps(dispatch) {
  return {
    queryUserByBranchId: bindActionCreators(queryUserByBranchId, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedView);
