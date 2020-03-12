//标准组件环境
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Form, Row, Col, Input, InputNumber, Select, Button, Icon, Table, Pagination, Divider, Modal } from 'antd';
const FormItem = Form.Item;

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import { searchFormItemLayout, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
//数据转字典标题
import { getDictionaryTitle, timestampToTime ,getViewEditModeTitle} from '@/utils';

//业务接口方法引入
import { getProtectionInfo, updateProtection} from '@/actions/recruit';
//业务数据视图（增、删、改、查)
import ContentBox from '@/components/ContentBox';
const btnsearchFormItemLayout = {
  wrapperCol: { span: 24 },
};

const formItemLayout24 = {
  labelCol: { span: 10 },
  wrapperCol: { span:8 }
};
class UpdateProtectionView extends React.Component {
  constructor(props) {
    super(props)
    console.log(props)
    this.state = {
      dataModel: props.currentDataModel,//数据模型
      value:props.data.value,
    };
  }
  onCancel = () => {
    this.setState({ loading: false });
    this.props.viewCallback();
  }
  componentWillMount() {

  }
  onSubmit = () => {
    //表单验证后，合并数据提交
    this.props.form.validateFields((err, values) => {
      var regu = /^[1-9]\d*$/;
      if (!regu.test(values.protection)){
        message.error("参数错误");
        return;
      }
      if (!err) {
        this.setState({ loading: true });
        setTimeout(() => {
          this.setState({ loading: false });
        }, 3000);//合并保存数据
        this.props.viewCallback({ ...values });//合并保存数据
      }
    });
  }


  //标题
  getTitle() {
    let op = getViewEditModeTitle(this.props.editMode);
    return `${op}学生市场保护期`;
  }
  //表单按钮处理
  renderBtnControl() {

      return <FormItem
        className='btnControl'
        {...btnsearchFormItemLayout}
      >
        <Button type="primary" loading={this.state.loading} icon="save" onClick={this.onSubmit}>{"保存"}</Button>
        <span className="split_button"></span>
        <Button onClick={this.onCancel} icon="rollback">返回</Button>
      </FormItem>

  }



  //多种模式视图处理
  renderEditModeOfView() {
    let block_content = <div></div>
    const { getFieldDecorator } = this.props.form;

    JSON.stringify(this.state.dataModel)
    switch (this.props.editMode) {
      case "Create":
      case "Edit":
        block_content = (
          <Form className="search-form">
            <Row gutter={24}>
              <Col span={24}>
                <FormItem
                  {...formItemLayout24}
                  label="市场保护期"
                >
                  {getFieldDecorator('protection', {
                    initialValue: this.state.value,
                  })(
                    <Input type="number" min="0" step="1"/>
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
        <div className="dv_split"></div>
        {block_editModeView}
        <div className="dv_split"></div>
      </ContentBox>
    );
  }
}

const WrappedUpdateProtectionView = Form.create()(UpdateProtectionView);

const mapStateToProps = (state) => {
  return {};
};

function mapDispatchToProps(dispatch) {
  return {

  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedUpdateProtectionView);
