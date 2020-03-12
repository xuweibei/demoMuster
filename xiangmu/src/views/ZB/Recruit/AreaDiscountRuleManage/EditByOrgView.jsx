import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Tree, Card, Checkbox, DatePicker, InputNumber } from 'antd';
import moment from 'moment';
import { getDictionaryTitle, getEditByOrgViewEditModeTitle, dataBind, timestampToTime, split, formatMoney, formatMoment } from '@/utils';
import ContentBox from '@/components/ContentBox';
import SelectItem from '@/components/BizSelect/SelectItem';
import { searchFormItemLayout } from '@/utils/componentExt';
import { getByItemOrg, editByItemOrg } from '@/actions/recruit';


const FormItem = Form.Item;
const { TextArea } = Input;
const { RangePicker } = DatePicker;
const btnsearchFormItemLayout = {
  wrapperCol: { span: 24 },
};



const CheckboxGroup = Checkbox.Group;


const dateFormat = 'YYYY-MM-DD';

/*
必要属性输入
editMode [Create/Edit/EditByOrgView/Delete]
currentDataModel [数据模型]
viewCallback [回调]
*/
class EditByOrgView extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      dataModel: props.currentDataModel,//数据模型
      data: [],
    };

  }
  onCancel = () => {
    this.props.viewCallback();
  }
  componentWillMount() {
   // this.fetch()

  }
  columns = [
    {
      title: '大区',
      dataIndex: 'orgName',
    },
    {
      title: '特殊优惠限额',
      dataIndex: 'discountPrice',
      render: (text, record, index) => {

        return <InputNumber value={record.discountPrice} min={0} defaultValue={0} onChange={(value) => {
          this.state.data.filter(a => { return a.orgId == record.orgId }).map(item=> item.discountPrice =value)
          this.setState({ data: this.state.data })
        }} />;
      }
    },
  ];

  onSubmit = () => {
    //表单验证后，合并数据提交
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({ loading: true });
        setTimeout(() => {
          this.setState({ loading: false });
        }, 3000);//合并保存数据

        var data = this.state.data.map((item, i) => {
          return { orgId: item.orgId, discountPrice: item.discountPrice }
        });

        var postData = {
          itemId: values.itemId,
          json: JSON.stringify(data),
        }
        this.props.viewCallback({ ...postData });//合并保存数据
      }
    });
  }
  fetch = (value) => {
    this.setState({ loading: true });
    var condition = { itemId: value };

    this.props.getByItemOrg(condition).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.result === false) {
        this.setState({ loading: false })
        message.error(data.message);
      }
      else {
        this.setState({ ...data, loading: false })
      }
    })
  }
  onEditDiscountPrice = () => {
    this.props.form.validateFields((err, values) => {

      this.state.data.map((item) => {
        item.discountPrice = values.discountPrice
      })
      this.setState({ data: this.state.data })
    })

  }

  //标题
  getTitle() {
    let op = '按大区设置'
    return op;
  }
  //表单按钮处理
  renderBtnControl() {
    if (this.props.editMode != 'View') {
      var button_title = '确定'
      return <FormItem
        className='btnControl'
        {...btnsearchFormItemLayout}
      >
        <Button type="primary" loading={this.state.loading} icon="save" onClick={this.onSubmit}>{button_title}</Button><span className="split_button"></span><Button icon="rollback" onClick={this.onCancel} >取消</Button>
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
  renderEditModeOfEditByOrgView() {
    let block_content = <div></div>
    const { getFieldDecorator } = this.props.form;

    JSON.stringify(this.state.dataModel)

    block_content = <Form className="search-form">
      <Row gutter={24}>
        <Col span={12}>
          <FormItem
            {...searchFormItemLayout}

            label="项目"
          >
            {getFieldDecorator('itemId', {
              initialValue: '',

            })(
              <SelectItem scope='my' hideAll={true} onSelectChange={(value) => {
                this.fetch(value)
              }} />
              )}
          </FormItem>
        </Col>
        <Col span={12}>
          <FormItem
            {...searchFormItemLayout}

            label="特殊优惠限额"
          >
            {getFieldDecorator('discountPrice', {
              initialValue: 0,

            })(
              <InputNumber min={0} defaultValue={0}/>
              )}<Button onClick={this.onEditDiscountPrice} icon="tool" style={{marginLeft:10}}>统一设置</Button>
          </FormItem>
        </Col>
      </Row>
    </Form>


    return block_content;
  }
  renderOrgPriceListView() {
    let block_content = <div></div>
    block_content = <div>
      <div className="space-default"></div>
      <div className="search-result-list">
        <Table columns={this.columns} //列定义
          loading={this.state.loading}
          pagination={false}
          rowKey={record => record.orgId}
          dataSource={this.state.data}//数据
          bordered
        />
      </div>
    </div>
    return block_content;
  }

  render() {
    let title = this.getTitle();
    let block_editModeEditByOrgView = this.renderEditModeOfEditByOrgView();
    let block_orgPricelistView = this.renderOrgPriceListView();
    return (
      <div>
        <ContentBox titleName={title} bottomButton={this.renderBtnControl()}>
          <div className="dv_split"></div>
          {block_editModeEditByOrgView}
          <div className="dv_split"></div>
        </ContentBox>
        {block_orgPricelistView}
      </div>
    );
  }
}

const WrappedEditByOrgView = Form.create()(EditByOrgView);

const mapStateToProps = (state) => {
  return {};
};

function mapDispatchToProps(dispatch) {
  return {
    getByItemOrg: bindActionCreators(getByItemOrg, dispatch),
    editByItemOrg: bindActionCreators(editByItemOrg, dispatch),

  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedEditByOrgView);
