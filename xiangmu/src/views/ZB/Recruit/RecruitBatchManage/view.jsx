/*
招生季编辑
*/
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Input, Button, Icon, DatePicker } from 'antd';
import ContentBox from '@/components/ContentBox';
import {searchFormItemLayout, searchFormItemLayout24,} from '@/utils/componentExt';

const FormItem = Form.Item;
const btnformItemLayout = {
    wrapperCol: { span: 24 },
};

import { getViewEditModeTitle, dataBind, timestampToTime, formatMoment } from '@/utils';
const dateFormat = 'YYYY-MM-DD';
import moment from 'moment';
const { RangePicker } = DatePicker;

/*
必要属性输入
editMode [Create/Edit/View/Delete]
currentDataModel [数据模型]
viewCallback [回调]
*/
class RecruitBatchView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            dataModel: props.currentDataModel,//数据模型
            endOpen: false,
        };
        (this: any).onBeginChange = this.onBeginChange.bind(this);
        (this: any).onEndChange = this.onEndChange.bind(this);
        (this: any).onSubmit = this.onSubmit.bind(this);
    }

    componentWillMount() {
    }

    onCancel = () => {
        this.props.viewCallback();
    }
    onSubmit = () => {
        var that = this;
        //表单验证后，合并数据提交
        this.props.form.validateFields((err, values) => {
            if (!err) {
                that.setState({ loading: true });
                setTimeout(() => {
                    that.setState({ loading: false });
                }, 3000);//合并保存数据
                //delete that.state.dataModel.createDate;
                //delete that.state.dataModel.createUid;
                //delete that.state.dataModel.state;
                var postData = {
                  recruitBatchId: that.state.dataModel.recruitBatchId,
                  recruitBatchName: values.recruitBatchName,
                  beginDate: formatMoment(values.beginDate),
                  endDate: formatMoment(values.endDate)
                }

                //适用定价时间
                let priceBeginDate = values.priceBeginDate;
                if(priceBeginDate){
                    postData.priceBeginDate = formatMoment(priceBeginDate[0]);
                    postData.priceEndDate = formatMoment(priceBeginDate[1]);
                }

                //that.props.viewCallback({ ...that.state.dataModel, ...values, ...postData });//合并保存数据
                that.props.viewCallback({ ...postData });
            }
        });
    }
    onCheck = (checkedKeys, info) => {
        //this.setState({ roleFuns: checkedKeys });
    }
    //标题
    getTitle() {
        let op = getViewEditModeTitle(this.props.editMode);
        return `${op}招生批次`;
    }
    //表单按钮处理
    renderBtnControl() {
        return <FormItem
            className='btnControl'
            {...btnformItemLayout}
            span={24}
        >
            <Button type="primary" loading={this.state.loading} icon="save" onClick={this.onSubmit}>{getViewEditModeTitle(this.props.editMode)}</Button>
            <Button icon="rollback" onClick={this.onCancel} style={{ marginLeft: 8 }} >取消</Button>
        </FormItem>

    }
    onBeginChange(date, dateString) {
      //console.log(date, dateString);
      //this.state.dataModel.beginDateStr = dateString;
      this.state.beginDate = dateString;
    }
    onEndChange(date, dateString) {
      //console.log(date, dateString);
      //this.state.dataModel.endDateStr = dateString;
      this.state.endDate = dateString;
    }
    disabledBeginDate = (startValue) => {
      const endValue = this.state.endDate;
      var d = ((new Date()).getTime() - 24*60*60*1000).valueOf();
      if(startValue < d){
        return true;
      }
      if (!startValue || !endValue) {
        return false;
      }
      return startValue.valueOf() > (new Date(endValue)).valueOf();
    }
    disabledEndDate = (endValue) => {
      const startValue = this.state.beginDate;
      if (!endValue || !startValue) {
        return false;
      }
      return endValue.valueOf() <= (new Date(startValue)).valueOf();
    }
    handleBeginOpenChange = (open) => {
      if (!open) {
        this.setState({ endOpen: true });
      }
    }
    handleEndOpenChange = (open) => {
      this.setState({ endOpen: open });
    }
    //多种模式视图处理
    renderEditModeOfView() {
        let block_content = <div></div>
        const { getFieldDecorator } = this.props.form;
        switch (this.props.editMode) {
            case "Create":
            case "Edit":
                block_content = (
                    <Form>
                      <Row gutter={24}>
                        <Col span={12}>
                          <FormItem
                            {...searchFormItemLayout}
                            label="招生季名称"
                          >
                              {getFieldDecorator('recruitBatchName', {
                                  initialValue: this.state.dataModel.recruitBatchName,
                                  rules: [{
                                      required: true, message: '请输入招生季名称!',
                                  }],
                              })(
                                  <Input placeholder='请输入招生季名称'/>
                              )}
                          </FormItem>
                        </Col>
                        <Col span={12}></Col>
                      </Row>
                      <Row gutter={24}>
                        <Col span={12}>
                          <FormItem
                              {...searchFormItemLayout}
                              label="招生季开始时间"
                          >
                            {
                              getFieldDecorator("beginDate", {
                                initialValue: dataBind(timestampToTime(this.state.dataModel.beginDate), true),
                                rules: [{
                                  required: true, message: '请输入招生季开始时间!',
                                }]
                              })(
                                <DatePicker
                                  disabledDate={this.disabledBeginDate}
                                  format={dateFormat}
                                  onChange={this.onBeginChange}
                                  onOpenChange={this.handleBeginOpenChange}
                                  placeholder='开始时间'
                                />
                              )
                            }
                          </FormItem>
                        </Col>
                        <Col span={12}>
                          <FormItem
                              {...searchFormItemLayout}
                              label="招生季结束时间"
                          >
                            {
                              getFieldDecorator("endDate", {
                                initialValue: dataBind(timestampToTime(this.state.dataModel.endDate), true),
                                rules: [{
                                  required: true, message: '请输入招生季结束时间!',
                                }]
                              })(
                                <DatePicker
                                  disabledDate={this.disabledEndDate}
                                  format={dateFormat}
                                  onChange={this.onEndChange}
                                  onOpenChange={this.handleEndOpenChange}
                                   placeholder='结束时间'
                                />
                              )
                            }
                          </FormItem>
                        </Col>

                        <Col span={12}>
                          <FormItem
                              {...searchFormItemLayout}
                              label="适用定价时间">
                              {getFieldDecorator('priceBeginDate', { 
                                initialValue: this.state.dataModel.priceBeginDate?[moment(timestampToTime(this.state.dataModel.priceBeginDate),dateFormat),moment(timestampToTime(this.state.dataModel.priceEndDate),dateFormat)]:[],
                                rules: [{
                                  required: true, message: '请选择适用定价时间!',
                                }]
                               })(
                                  <RangePicker style={{width:220}}/>
                              )}
                          </FormItem>
                        </Col>
                        <Col span={12}></Col>
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

const WrappedView = Form.create()(RecruitBatchView);

const mapStateToProps = (state) => {
    return {
        menus: state.menu.items
    }
};

function mapDispatchToProps(dispatch) {
    return {
//        getRoleFunList: bindActionCreators(getRoleFunList, dispatch),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedView);
