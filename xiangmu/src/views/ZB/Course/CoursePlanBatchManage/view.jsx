/*
开课计划编辑
*/
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Input, Button, Icon, DatePicker,
  Checkbox, message, Table, Select } from 'antd';
import moment from 'moment';
import ContentBox from '@/components/ContentBox';
const FormItem = Form.Item;
const { TextArea } = Input;
import NumericInput from '@/components/NumericInput';
import {searchFormItemLayout, searchFormItemLayout24 } from '@/utils/componentExt';

const btnformItemLayout = {
    wrapperCol: { span: 24 },
};

const dateFormat = 'YYYY-MM-DD';
import { getViewEditModeTitle, dataBind, timestampToTime, formatMoment } from '@/utils';
import { loadBizDictionary } from '@/utils/componentExt';
import { getCoursePlanBatchById } from '@/actions/course';
import { loadDictionary } from '@/actions/dic';
//import { getItemList } from '@/actions/base';

/*
必要属性输入
editMode [Create/Edit/View/Delete]
currentDataModel [数据模型]
viewCallback [回调]
*/
class CoursePlanBatchView extends React.Component {
    constructor(props) {
        super(props)
        //var temp_list = [];
        //props.dic_item_list.map(item => {
        //  temp_list.push({ itemId: item.itemId, teachWay: 1 })
        //})
        this.state = {
            dataModel: props.currentDataModel,//数据模型
            endOpen: false,
            //item_list: temp_list,  //为提交项目列表数据用
            //dic_item_list: props.dic_item_list, //是为显示 下拉列表用
            dic_item_list: []
        };
        (this: any).onSubmit = this.onSubmit.bind(this);
        (this: any).getCoursePlanBatchInfo = this.getCoursePlanBatchInfo.bind(this);
        this.loadBizDictionary = loadBizDictionary.bind(this);
    }

    componentWillMount() {
      this.loadBizDictionary(['teach_way']);
      this.getCoursePlanBatchInfo();
      //this.getConditionData();
    }
    /*columns = [
      {
        title: '项目',
        width: 150,//可预知的数据长度，请设定固定宽度
        dataIndex: 'itemName',
      },
      {
          title: '最低开班人数大客户方向班',
          dataIndex: 'minStudentNum1',
          render: (text, record, index) => {
            return <NumericInput value={record.minStudentNum1} type="int"
              onChange={(value, type, id) => this.onChange(value, 1, record.itemId)} />
          }
      },
      {
          title: '最低开班人数大客户精英班',
          dataIndex: 'minStudentNum2',
          //自定义显示
          render: (text, record, index) => {
            return <NumericInput value={record.minStudentNum2} type="int"
              onChange={(value, type, id) => this.onChange(value, 2, record.itemId)} />
          }
      },
      {
          title: '最低开班人数中博精英班',
          dataIndex: 'minStudentNum3',
          render: (text, record, index) => {
            return <NumericInput value={record.minStudentNum3} type="int"
              onChange={(value, type, id) => this.onChange(value, 3, record.itemId)} />
          }
      },
      {
          title: '开课方式',
          width: 100,//可预知的数据长度，请设定固定宽度
          dataIndex: 'state',
          render: (text, record, index) => {
            if(record.teachWay >= 0){
              return <Select defaultValue={dataBind(record.teachWay)}
                  disabled
                >
                  {
                    this.state.teach_way.map((item, index) => {
                    return <Option value={item.value}>{item.title}</Option>
                  })}
                </Select>
            }
          }
      }
    ];*/
    inputOnChange = (e, type, itemId) => {
      var value = e.target.value;
      if(type == 1){
        this.state.dataModel.minStudentNum1 = value;
      }else if(type == 2){
        this.state.minStudentNum2 = value;
      }else if(type == 3){
        this.state.minStudentNum3 = value;
      }
      /*var list = this.state.item_list;
      for(var i = 0; i < list.length; i++){
        if(list[i].itemId == itemId){
        if(type == 1){
            list[i].minStudentNum1 = value;
          }else if(type == 2){
            list[i].minStudentNum2 = value;
          }else if(type == 3){
            list[i].minStudentNum3 = value;
          }
          break;
        }
      }*/
      //this.setState({ dic_item_list: list })
    }
    /*getConditionData() {
        var that = this;
        //1. 合作项目 【查全部项目，只是为了取项目名称，原因是按数据范围查的项目只有id，只有项目id】
        var condition = { currentPage: 1, pageSize: 99, state: 1, itemName: '' }
        this.props.getItemList(condition).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'success') {
                that.props.dic_item_list.map(item1 => {
                  data.data.map(item2 => {
                    if(item1.itemId == item2.itemId){
                      item1.itemName = item2.itemName;
                    }
                  })
                })
                //this.setState({ dic_item_list: data.data })
            }
            else {
                message.error(data.message);
            }
        })
    };*/
    getCoursePlanBatchInfo(){
      var that = this;
      if(this.state.dataModel.courseplanBatchId){
        this.props.getCoursePlanBatchById(this.state.dataModel.courseplanBatchId).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'success') {
              data.data.startDate = timestampToTime(data.data.startDate);
              data.data.endDate = timestampToTime(data.data.endDate);
              that.setState({
                dataModel: data.data
              });
              //var item_list = data.data.courseplanBatchItems;
              //把设置好的 填充到 this.state.dic_item_list 中去
              /*that.state.dic_item_list.map(item => {
                item.teachWay = 1;
                var setted_item = setted_item_list.filter(i => {
                  return i.itemId === item.itemId
                });
                if(setted_item && setted_item.length > 0){
                  item.choosed = true;
                  item.minStudentNum1 = setted_item[0].minStudentNum1;
                  item.minStudentNum2 = setted_item[0].minStudentNum2;
                  item.minStudentNum3 = setted_item[0].minStudentNum3;
                  item.teachWay = setted_item[0].teachWay;
                }
              })*/
              /*this.state.item_list.map(item1 => {
                item_list.map(item2 => {
                  if(item2.itemId == item1.itemId){
                    item1 = item2;
                  }
                })
              })
              item_list.map(i => {
                delete i.createDate;
                delete i.createUid
              });
              this.setState({
                //course_plan_batch_item_list: setted_item_list,
                //dic_item_list: that.state.dic_item_list
                item_list: item_list
              })*/
            }
            else {
                message.error(data.message);
            }
        })
      }
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
                //that.props.viewCallback({ ...that.state.dataModel, ...values, ...postData });//合并保存数据
                //values.startDate = that.state.dataModel.startDate;
                //values.endDate = that.state.dataModel.endDate;
                values.startDate = formatMoment(values.startDate);
                values.endDate = formatMoment(values.endDate);
                //values.minStudentNum1;
                //values.minStudentNum2;
                //values.minStudentNum3;
                //values.itemId;
                //values.techWay;
                that.props.viewCallback({ ...values, courseplanBatchId: that.state.dataModel.courseplanBatchId });
            }
        });
    }
    onCheck = (checkedKeys, info) => {
        //this.setState({ roleFuns: checkedKeys });
    }
    //标题
    getTitle() {
        let op = getViewEditModeTitle(this.props.editMode);
        return `${op}开课批次`;
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
    onStartChange = (date, dateString) => {
      this.state.startDate = dateString;
    }
    onEndChange = (date, dateString) => {
      this.state.endDate = dateString;
    }
    disabledBeginDate = (startValue) => {
      const endValue = this.state.endDate;
      if (!startValue || !endValue) {
        return false;
      }
      var r = startValue.valueOf() > (new Date(endValue)).valueOf();
      return r;
    }
    disabledEndDate = (endValue) => {
      const startValue = this.state.startDate;
      if (!endValue || !startValue) {
        return false;
      }
      var r = endValue.valueOf() <= (new Date(startValue)).valueOf();
      return r;
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
                /*var rowSelection = {
                    selectedRowKeys: this.state.UserSelecteds,
                    onChange: (selectedRowKeys, selectedRows) => {
                        this.setState({ UserSelecteds: selectedRowKeys })
                    },
                    getCheckboxProps: record => ({
                        name: record.orgName,
                    }),
                }*/
                block_content = (
                    <Form>
                      <Row gutter={24}>
                        <Col span={12}>
                          <FormItem
                            {...searchFormItemLayout}
                            label="开课批次名称"
                          >
                              {getFieldDecorator('courseplanBatchName', {
                                  initialValue: this.state.dataModel.courseplanBatchName,
                                  rules: [{
                                      required: true, message: '请输入开课批次名称!',
                                  }],
                              })(
                                  <Input />
                              )}
                          </FormItem>
                        </Col>
                        <Col span={12}>
                          <FormItem {...searchFormItemLayout} label="项目">
                            {getFieldDecorator('itemId', {
                              initialValue: dataBind(this.state.dataModel.itemId),
                              rules: [{ required: true, message: '请选择合作项目!' }],
                            })(
                              <Select>
                                  <Option value={""} key={-1}>请选择</Option>
                                  {this.props.dic_item_list.map((item, index) => {
                                      return <Option value={dataBind(item.itemId)} key={index}>{item.itemName}</Option>
                                  })}
                              </Select>
                            )}
                          </FormItem>
                        </Col>
                      </Row>
                      <Row gutter={24}>
                        <Col span={12}>
                          <FormItem {...searchFormItemLayout} label="开课计划开始日期">
                             {
                               getFieldDecorator('startDate', {
                                 initialValue: dataBind(timestampToTime(this.state.dataModel.startDate), true),
                                 rules: [{
                                   required: true, message: '请选择开始日期!',
                                 }]
                               })(
                                 <DatePicker
                                   onChange={this.onStartChange}
                                   disabledDate={this.disabledBeginDate}
                                   format={dateFormat}
                                   placeholder='开始日期'
                                   onOpenChange={this.handleBeginOpenChange}
                                 />
                               )
                             }
                          </FormItem>
                        </Col>
                        <Col span={12}>
                          <FormItem {...searchFormItemLayout} label="开课计划截止日期" >
                            {
                               getFieldDecorator('endDate', {
                                 initialValue: dataBind(timestampToTime(this.state.dataModel.endDate), true),
                                 rules: [{
                                   required: true, message: '请选择截止日期!',
                                 }]
                               })(
                                 <DatePicker
                                   onChange={this.onEndChange}
                                   disabledDate={this.disabledEndDate}
                                   placeholder='结束日期'
                                   format={dateFormat}
                                   onOpenChange={this.handleEndOpenChange}
                                 />
                               )
                             }
                          </FormItem>
                        </Col>
                      </Row>
                      <Row gutter={24}>
                        <Col span={12}>
                          <FormItem {...searchFormItemLayout} label="大客户方向班">
                              {getFieldDecorator('minStudentNum1', {
                                  initialValue: this.state.dataModel.minStudentNum1,
                                  rules: [{ required: true, message: '请输入最低开班人数大客户方向班!' },
                                  { validator: (rule, value, callback) => {
                                    var regex = /^[1-9][0-9]*$/;
                                    if(value && !regex.test(value)){
                                      callback('不是有效的数字！')
                                    } else {
                                      callback();
                                    }
                                  }
                                }
                                ],
                              })(
                                  <Input placeholder='最低开班人数大客户方向班' style={{width:220}} onChange={(e) => this.inputOnChange(e, 1, this.state.dataModel.itemId)} />
                              )}
                          </FormItem>
                        </Col>
                        <Col span={12}>
                          <FormItem {...searchFormItemLayout} label="大客户精英班">
                              {getFieldDecorator('minStudentNum2', {
                                  initialValue: this.state.dataModel.minStudentNum2,
                                  rules: [
                                    { required: true, message: '请输入最低开班人数大客户精英班!' },
                                    { validator: (rule, value, callback) => {
                                      var regex = /^[1-9][0-9]*$/;
                                      if(value && !regex.test(value)){
                                        callback('不是有效的数字！')
                                      } else {
                                        callback();
                                      }
                                    }
                                  }
                                ],
                              })(
                                  <Input placeholder='最低开班人数大客户精英班' style={{width:220}} onChange={(e) => this.inputOnChange(e, 2, this.state.dataModel.itemId)} />
                              )}
                          </FormItem>
                        </Col>
                      </Row>
                      <Row gutter={24}>
                        <Col span={12}>
                          <FormItem {...searchFormItemLayout} label="中博精英班">
                              {getFieldDecorator('minStudentNum3', {
                                  initialValue: this.state.dataModel.minStudentNum3,
                                  rules: [{ required: true, message: '请输入最低开班人数中博精英班!' },
                                  { validator: (rule, value, callback) => {
                                      var regex = /^[1-9][0-9]*$/;
                                      if(value && !regex.test(value)){
                                        callback('不是有效的数字！')
                                      } else {
                                        callback();
                                      }
                                    }
                                  }
                                ],
                              })(
                                  <Input placeholder='最低开班人数中博精英班' style={{width:220}} onChange={(e) => this.inputOnChange(e, 3, this.state.dataModel.itemId)} />
                              )}
                          </FormItem>
                        </Col>
                        <Col span={12}>
                          <FormItem {...searchFormItemLayout} label="开课方式">
                            {getFieldDecorator('teachWay', {
                              //initialValue: dataBind(this.state.item_list[0].techWay),
                              initialValue: "1",
                            })(
                              <Select defaultValue="1"
                                disabled
                              >
                                {
                                  this.state.teach_way.map((item, index) => {
                                    return <Option value={item.value}>{item.title}</Option>
                                  })}
                              </Select>
                            )}
                          </FormItem>
                        </Col>
                      </Row>
                      {/*<div className="search-result-list">
                        <Table columns={this.columns} //列定义
                            loading={this.state.loading}
                            pagination={false}
                            dataSource={this.props.dic_item_list}//数据
                            bordered
                            rowSelection={rowSelection}
                        />
                      </div>*/}
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

const WrappedView = Form.create()(CoursePlanBatchView);

const mapStateToProps = (state) => {
    let { Dictionarys } = state.dic;
    return {
        Dictionarys,
        menus: state.menu.items
    }
};

function mapDispatchToProps(dispatch) {
    return {
      loadDictionary: bindActionCreators(loadDictionary, dispatch),
      getCoursePlanBatchById: bindActionCreators(getCoursePlanBatchById, dispatch),
      //getItemList: bindActionCreators(getItemList, dispatch),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedView);
