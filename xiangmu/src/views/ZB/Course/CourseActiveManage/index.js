
/**
 * 总部-学服学务-网络课程管理-激活管理
 */
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { Route, Redirect } from 'react-router-dom';
import {
  message, Form, Row, Col, Input, Select, Button, Icon, Table, DatePicker,
  Pagination, Divider, Modal, Card,
  Checkbox, InputNumber
} from 'antd';
import { env } from '@/api/env';
import SelectFBOrg from '@/components/BizSelect/SelectFBOrg'
import SelectPartnerOrg from '@/components/BizSelect/SelectPartnerOrg'
import ContentBox from '@/components/ContentBox';
import FileDownloader from '@/components/FileDownloader';
import moment from 'moment';



//操作按钮
import DropDownButton from '@/components/DropDownButton';

const FormItem = Form.Item;
const { RangePicker } = DatePicker;
const { TextArea } = Input;
const dateFormat = 'YYYY-MM-DD';
const searchFormItemLayoutDate24 = {
  labelCol: { span: 4 },
  wrapperCol: { span: 17 },
};

//数据转字典标题
import { getDictionaryTitle, getViewEditModeTitle, dataBind, timestampToTime, split, formatMoment } from '@/utils';
//组件实例模板方法引入
import {
  loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange,
  searchFormItemLayout24, searchFormItemLayout,
  onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons
} from '@/utils/componentExt';

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
import { getCourseActiveList, courseActiveOperationCourseActive, courseActiveOperationCourseCancelActive, courseActiveOperationCourseUpdateEndTime } from '@/actions/course';
import SelectItem from '@/components/BizSelect/SelectItem';
import SelectItemCourseCategory from '@/components/BizSelect/SelectItemCourseCategory';
//订单详情
import OrderDetailView from '@/components/DetailOrderContentBox/TabsOrderContents';

//业务数据视图（增、删、改、查)
import CourseActiveManageView from './view'

class CourseActiveManage extends React.Component {

  constructor() {
    super()
    //扩展方法用于本组件实例
    this.loadBizDictionary = loadBizDictionary.bind(this);
    this.onSearch = onSearch.bind(this);
    this.onPageIndexChange = onPageIndexChange.bind(this);
    this.onShowSizeChange = onShowSizeChange.bind(this);
    this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
    this.onHideModal = this.onHideModal.bind(this);
    this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
    this.onToggleSearchOption = onToggleSearchOption.bind(this);

    this.state = {
      //currentDataModel: null,
      editMode: '',//Edit,Create,View,Delete
      textKey: '',
      isShowUpRecord: false, //是否显示修改记录列表
      isShowCancelActive: false, //是否显示取消激活
      isShowUpTime: false, //是否显示取消激活
      confirmLoading: false, //确定按钮加载
      pagingSearch: {
        currentPage: 1,
        pageSize: env.defaultPageSize,
        courseState: '',
        courseSourceType:'',
        orderSource:'',
        orderType:'',
        rehearOrNot:'',
        giveOrNot:'',
        activeState:'',
        itemId: '',//下拉菜单非自定义字典的空值代表
        courseCategoryId: '',//下拉菜单非自定义字典的空值代表
      },
      data_list: [],
      totalRecord: 0,
      loading: false,
      UserSelecteds: [],
      signStartValue: null,
      signEndValue: null,
      signEndOpen: false,
      startValue: null,
      endValue: null,
      endOpen: false,
    };
  }
  componentWillMount() {
    //载入需要的字典项: 招生状态，签约情况， 大客户类型， 项目合作方式
    this.loadBizDictionary(['course_state', 'course_source_type', 'order_source', 'order_type', 'dic_YesNo', 'active_state']);
    //首次进入搜索，加载服务端字典项内容
    // this.onSearch();
  }


  //table 输出列定义
  columns = [{
    title: '学生姓名',
    dataIndex: 'realName',
    fixed: 'left',
    width: 100,
    render: (text, record, index) => {
      return <div>{text}</div>
    }
  },
  {
    title: '手机号',
    dataIndex: 'mobile',
  },
  {
    title: '课程名称',
    dataIndex: 'courseName',
  },
  {
    title: '订单号',
    dataIndex: 'orderSn',
    render: (text, record, index) => {
      return <span>
        <a href="javascript:;" onClick={() => { this.onLookView('ViewOrderDetail', record); }}>{text}</a>
      </span>
    }
  },
  {
    title: '所属商品名称',
    dataIndex: 'courseProductName',
  },
  {
    title: '赠送',
    dataIndex: 'giveOrNotName',
  },
  {
    title: '允许重修',
    dataIndex: 'rehearOrNotName',
  },
  {
    title: '分部/区域',
    dataIndex: 'branchName',
  },
  {
    title: '学籍情况',
    dataIndex: 'studyStatusName',
  },
  {
    title: '激活状态',
    dataIndex: 'activeStateName',
  },
  {
    title: '激活时间',
    dataIndex: 'activeTime',
    render: text => <span>{timestampToTime(text)}</span>
  },
  {
    title: '结束时间',
    dataIndex: 'endTime',
    render: text => <span>{timestampToTime(text)}</span>
  },
  {
    title: '考试时间',
    dataIndex: 'examTime',
    render: text => <span>{timestampToTime(text)}</span>
  },
  {
    title: '操作',
    width: 120,//可预知的数据长度，请设定固定宽度
    fixed: 'right',
    key: 'action',
    render: (text, record) => {
      return <DropDownButton>

        {(record.acitveState == 0) &&
          <Button onClick={() => {
            this.onActive(record)
          }}>激活</Button>
        }
        {(record.acitveState == 2) &&
          <Button onClick={() => {
            this.onCancelActive(record)
          }}>取消激活</Button>
        }
        {(record.acitveState == 3 || record.acitveState == 2) &&
          <Button onClick={() => {
            this.onUpTime(record)
          }}>设置时间</Button>
        }

        {(record.acitveState == 3) &&
          <Button onClick={() => {

          }}>修改时间</Button>
        }

        {(record.termState == 1 || record.acitveState == 3 || record.acitveState == 2) &&
          <Button onClick={() => {
            this.onUpRecord(record)
          }}>修改记录</Button>
        }
      </DropDownButton>
    }
  }];
  //获取条件列表
  fetch(params) {
    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch;
    let activeTimeStart = condition.activeTimeStart;
    let examTimeStart = condition.examTimeStart;
    if(activeTimeStart){
      condition.activeTimeStart = formatMoment(activeTimeStart[0]);
      condition.activeTimeEnd = formatMoment(activeTimeStart[1]);
    }
    if(examTimeStart){
      condition.examTimeStart = formatMoment(examTimeStart[0]);
      condition.examTimeEnd = formatMoment(examTimeStart[1]);
    }
    this.props.getCourseActiveList(condition).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.state === 'success') {
        this.setState({
          pagingSearch: condition,
          data_list: data.data,
          totalRecord: data.totalRecord,
          loading: false,
        })
      }
      else {
        this.setState({ loading: false })
        message.error(data.message);
      }
    })
  };
  //签约日期限制
  disabledSignStartDate = (signStartValue) => {
    const signEndValue = this.state.signEndValue;
    if (!signStartValue || !signEndValue) {
      return false;
    }
    return signStartValue.valueOf() > signEndValue.valueOf();
  }

  disabledSignEndDate = (signEndValue) => {
    const signStartValue = this.state.signStartValue;
    if (!signEndValue || !signStartValue) {
      return false;
    }
    return signEndValue.valueOf() <= signStartValue.valueOf();
  }
  handleSignStartOpenChange = (open) => {
    if (!open) {
      this.setState({ signEndOpen: true });
    }
  }

  handleSignEndOpenChange = (open) => {
    this.setState({ signEndOpen: open });
  }

  onSignStartChange = (value) => {
    this.onChange('signStartValue', value);
  }

  onSignEndChange = (value) => {
    this.onChange('signEndValue', value);
  }

  //截止日期限制
  disabledStartDate = (startValue) => {
    const endValue = this.state.endValue;
    if (!startValue || !endValue) {
      return false;
    }
    return startValue.valueOf() > endValue.valueOf();
  }

  disabledEndDate = (endValue) => {
    const startValue = this.state.startValue;
    if (!endValue || !startValue) {
      return false;
    }
    return endValue.valueOf() <= startValue.valueOf();
  }
  handleStartOpenChange = (open) => {
    if (!open) {
      this.setState({ endOpen: true });
    }
  }

  handleEndOpenChange = (open) => {
    this.setState({ endOpen: open });
  }

  onStartChange = (value) => {
    this.onChange('startValue', value);
  }

  onEndChange = (value) => {
    this.onChange('endValue', value);
  }

  onChange = (field, value) => {
    this.setState({
      [field]: value,
    });
  }

  //验证选择结束时间不能大于返回激活结束时间
  disabledEndActiveDate = (endValue) => {
    const startValue = this.state.currentDataModel.endTime;
    if (!endValue) {
      return false;
    }
    return endValue.valueOf() <= startValue.valueOf();
  }

  onEndActiveChange = (value) => {

    if (value != null && value != '') {
      let oldTime = new Date(value);
      let activeEndTime = oldTime.getFullYear() + "-" + (oldTime.getMonth() + 1) + "-" + oldTime.getDate();
      let formatTimeS = new Date(activeEndTime).getTime();
      //获得激活日期
      let intervalTime = formatTimeS - this.state.currentDataModel.activeTime;   //时间差的毫秒数      
      //计算出相差天数
      let days = Math.floor(intervalTime / (24 * 3600 * 1000));
      if(intervalTime % (24 * 3600 * 1000)>0){
        days+=1;
      }
      //计算延期天数
      //获得结束日期
      let intervalEndTime = formatTimeS - this.state.currentDataModel.endTime;
      let currDay = Math.floor(intervalEndTime / (24 * 3600 * 1000));
      if(intervalEndTime % (24 * 3600 * 1000)>0){
        currDay+=1;
      }
      this.setState({
        days: days,
        day: currDay,
      });
      if (currDay != 0) {
        this.props.form.resetFields(['day']);
      }
    }

  }

  //延期天数
  onDay = (value) => {
    value=parseInt(value);
    if (value <= 10000) {
      let endDate = this.state.currentDataModel.endTime;
      let endDateTime = endDate + value * 24 * 60 * 60 * 1000;
      //计算间隔天数
      let intervalTime = endDateTime - this.state.currentDataModel.activeTime;   //时间差的毫秒数      
      //计算出相差天数
      let days = Math.floor(intervalTime / (24 * 3600 * 1000))
      if(intervalTime % (24 * 3600 * 1000)>0){
        days+=1;
      }
      this.setState({
        days: days,
        currEndTime: endDateTime
      });
      //初始化结束时间
      this.props.form.resetFields(['endTime']);
      //this.disabledEndActiveDate;
    }
    else {
      this.setState({
        currEndTime: this.state.currentDataModel.endTime
      });
      //计算间隔天数
      let intervalTime = this.state.currentDataModel.endTime - this.state.currentDataModel.activeTime;   //时间差的毫秒数      
      //计算出相差天数
      let days = Math.floor(intervalTime / (24 * 3600 * 1000));
      if(intervalTime % (24 * 3600 * 1000)>0){
        days+=1;
      }
      this.setState({
        days: days
      });
    }
  }

  //激活课程点击事件
  onActive = (item) => {
    Modal.confirm({
      title: '是否要激活当前课程',
      content: '请确认',
      onOk: () => {
        this.props.courseActiveOperationCourseActive(item.courseActiveId).payload.promise.then((response) => {
          let data = response.payload.data;
          if (data.result === false) {
            message.error(data.message);
          }
          else {
            message.success('激活成功');
            this.onSearch();
          }
        })
      },
      onCancel: () => {
        console.log('Cancel');
      },
    })
  }
  //不允许显示弹出框
  onHideModal() {
    this.setState({
      isShowUpRecord: false,
      isShowCancelActive: false,
      isShowUpTime: false,
      confirmLoading: false,
    })
  }

  //修改记录按钮点击事件
  onUpRecord = (item) => {
    this.setState({
      isShowUpRecord: true,
      currentDataModel: item,//编辑对象
    })
  }

  //取消激活按钮点击事件
  onCancelActive = (item) => {
    this.setState({
      isShowCancelActive: true,
      currentDataModel: item,//编辑对象
    })
  }

  //设置时间按钮点击事件
  onUpTime = (item) => {
    this.setState({
        day:'',
      });
    //计算间隔天数
    var intervalTime = item.endTime - item.activeTime;   //时间差的毫秒数      
    //计算出相差天数
    var days = Math.floor(intervalTime / (24 * 3600 * 1000))
    if(intervalTime % (24 * 3600 * 1000)>0){
        days+=1;
      }
    this.setState({
      isShowUpTime: true,
      currentDataModel: item,//编辑对象
      days: days,
      currEndTime: item.endTime
    });
  }

  //取消激活弹出框取消按钮点击事件
  handleCancel = () => {
    this.setState({
      isShowCancelActive: false,
      isShowUpTime: false
    });
  }

  //设置时间确定按钮点击事件
  handleUpTiemOk = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({
          confirmLoading: true,
        });
        this.props.courseActiveOperationCourseUpdateEndTime({ courseActiveId: this.state.currentDataModel.courseActiveId, remark: values.remark, day: values.day }).payload.promise.then((response) => {
          let data = response.payload.data;
          if (data.result === false) {
            message.error(data.message);
            this.setState({
              confirmLoading: false,
            });
          }
          else {
            message.success('修改时间成功');
            setTimeout(() => {
              this.setState({
                isShowUpTime: false,
                confirmLoading: false,
              });
            }, 2000);
            this.onSearch();
          }
        });
      }
    });

  }

  //取消激活弹出框确定按钮点击事件
  handleCancelActiveOk = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({
          confirmLoading: true,
        });
        this.props.courseActiveOperationCourseCancelActive({ courseActiveId: this.state.currentDataModel.courseActiveId, remark: values.remark }).payload.promise.then((response) => {
          let data = response.payload.data;
          if (data.result === false) {
            message.error(data.message);
            this.setState({
              confirmLoading: false,
            });
          }
          else {
            message.success('取消激活成功');
            setTimeout(() => {
              this.setState({
                isShowCancelActive: false,
                confirmLoading: false,
              });
            }, 2000);
            this.onSearch();
          }
        });

      }
    });

  }

  //浏览视图
  onLookView = (op, item) => {
    this.setState({
      editMode: op,//编辑模式
      currentDataModel: item,//编辑对象
    });
  };
  //视图回调
  onViewCallback = (dataModel) => {
    if (!dataModel) {
      this.setState({ currentDataModel: null, editMode: 'Manage' })
    }
    else {
      switch (this.state.editMode) {
        case "Edit": //提交
          this.props.updateParterContractInfo(dataModel).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'error') {
              message.error(data.message);
            }
            else {
              this.onSearch();
              //进入管理页
              this.onLookView("Manage", null);
            }
          })
          //提交
          break;

      }
    }
  }

  render() {
    let block_content = <div></div>
    switch (this.state.editMode) {
      case 'ViewOrderDetail':
        block_content = <OrderDetailView viewCallback={this.onViewCallback}
          studentId={this.state.currentDataModel.studentId}
          orderId={this.state.currentDataModel.orderId}
          tab={3}
        />
        break;
      case "Create":
      case "Edit":
      case "Manage":
      default:
        const { getFieldDecorator } = this.props.form;
        const prefixSelector = getFieldDecorator('textKey', {
          initialValue: dataBind(this.state.pagingSearch.textKey || 'loginName'),
        })(
          <Select style={{ width: 86 }} onChange={this.onCountryChange}>
            <Option value='loginName'>用户名</Option>
            <Option value='realName'>姓名</Option>
            <Option value='mobile'>手机号</Option>
            <Option value='qq'>QQ</Option>
            <Option value='orderSn'>订单号</Option>
          </Select>
          );
        let extendButtons = [];
        extendButtons.push(
          <FileDownloader
            apiUrl={'/edu/courseActive/exportList'}//api下载地址
            method={'post'}//提交方式
            options={this.state.pagingSearch}//提交参数
            title={'导出'}
          >
          </FileDownloader>);
        block_content = (
          <div>
            {/* 搜索表单 */}
            <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
              {!this.state.seachOptionsCollapsed &&
                <Form className="search-form" >
                  <Row gutter={24}>
                    <Col span={12}><FormItem
                      {...searchFormItemLayout}
                      label="多条件查询"
                    >
                      {getFieldDecorator('textValue', {
                        initialValue: this.state.pagingSearch.textValue,
                      })(
                        <Input addonBefore={prefixSelector}
                        />
                        )}
                    </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="学籍情况">
                        {getFieldDecorator('courseState', {
                          initialValue: dataBind(this.state.pagingSearch.courseState || '1')
                        })(
                          <Select >
                            <Option value="">全部</Option>
                            {this.state.course_state.map((item, index) => {
                              return <Option value={item.value} key={index}>{item.title}</Option>
                            })}
                          </Select>
                          )}
                      </FormItem>
                    </Col>

                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="课程来源">
                        {getFieldDecorator('courseSourceType', {
                          initialValue: this.state.pagingSearch.courseSourceType,
                        })(
                          <Select >
                            <Option value="">全部</Option>
                            {this.state.course_source_type.map((item, index) => {
                              return <Option value={item.value} key={index}>{item.title}</Option>
                            })}
                          </Select>
                          )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="订单分部">
                        {getFieldDecorator('orderBranchId', {
                          initialValue: this.state.pagingSearch.orderBranchId,
                        })(
                          <SelectFBOrg scope={'my'} hideAll={false} />
                          )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="订单来源">
                        {getFieldDecorator('orderSource', {
                          initialValue: this.state.pagingSearch.orderSource,
                        })(
                          <Select >
                            <Option value="">全部</Option>
                            {this.state.order_source.map((item, index) => {
                              return <Option value={item.value} key={index}>{item.title}</Option>
                            })}
                          </Select>
                          )}
                      </FormItem>
                    </Col>

                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="订单类型">
                        {getFieldDecorator('orderType', {
                          initialValue: this.state.pagingSearch.orderType,
                        })(
                          <Select >
                            <Option value="">全部</Option>
                            {this.state.order_type.map((item, index) => {
                              return <Option value={item.value} key={index}>{item.title}</Option>
                            })}
                          </Select>
                          )}
                      </FormItem>
                    </Col>

                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'所属项目'} style={{ marginBottom: 20 }}>
                        {getFieldDecorator('itemId', { initialValue: this.state.pagingSearch.itemId })(
                          <SelectItem
                            scope={'all'}
                            hideAll={false}
                            onSelectChange={(value) => {
                              this.state.pagingSearch.courseCategoryId = '';
                              this.state.pagingSearch.itemId = value;
                              this.setState({ pagingSearch: this.state.pagingSearch });
                              setTimeout(() => {
                                {/* 重新重置才能绑定这个科目值 */ }
                                this.props.form.resetFields(['courseCategoryId']);
                              }, 500);
                            }} />
                        )}
                      </FormItem>
                    </Col>

                    <Col span={12} >
                      <FormItem
                        style={{ marginBottom: 20 }}
                        {...searchFormItemLayout}
                        label="所属科目"
                      >
                        {getFieldDecorator('courseCategoryId', { initialValue: this.state.pagingSearch.courseCategoryId })(
                          <SelectItemCourseCategory itemId={this.state.pagingSearch.itemId} hideAll={false} />
                        )}
                      </FormItem>
                    </Col>

                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="是否允许重修">
                        {getFieldDecorator('rehearOrNot', {
                          initialValue: this.state.pagingSearch.rehearOrNot,
                        })(
                          <Select >
                            <Option value="">全部</Option>
                            {this.state.dic_YesNo.map((item, index) => {
                              return <Option value={item.value} key={index}>{item.title}</Option>
                            })}
                          </Select>
                          )}
                      </FormItem>
                    </Col>

                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="是否赠送">
                        {getFieldDecorator('giveOrNot', {
                          initialValue: this.state.pagingSearch.giveOrNot,
                        })(
                          <Select >
                            <Option value="">全部</Option>
                            {this.state.dic_YesNo.map((item, index) => {
                              return <Option value={item.value} key={index}>{item.title}</Option>
                            })}
                          </Select>
                          )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="激活状态">
                        {getFieldDecorator('activeState', {
                          initialValue: this.state.pagingSearch.activeState,
                        })(
                          <Select >
                            <Option value="">全部</Option>
                            {this.state.active_state.map((item, index) => {
                              return <Option value={item.value} key={index}>{item.title}</Option>
                            })}
                          </Select>
                          )}
                      </FormItem>
                    </Col>


                    <Col span={12}>
                       <FormItem
                            {...searchFormItemLayout}
                            label="激活时间">
                            {getFieldDecorator('activeTimeStart', { initialValue: this.state.pagingSearch.activeTimeStart?[moment(this.state.pagingSearch.activeTimeStart,dateFormat),moment(this.state.pagingSearch.activeTimeEnd,dateFormat)]:[] })(
                                <RangePicker style={{width:220}}/>
                            )}
                        </FormItem>
                    </Col>

                    <Col span={12}>
                       <FormItem
                            {...searchFormItemLayout}
                            label="考试时间">
                            {getFieldDecorator('examTimeStart', { initialValue: '' })(
                                <RangePicker style={{width:220}}/>
                            )}
                        </FormItem>
                    </Col>
                  </Row>
                  {
                    this.state.isShowUpRecord &&
                    <Modal
                      title="历史记录"
                      visible={this.state.isShowUpRecord}
                      onCancel={this.onHideModal}
                      footer={null}
                      width={900}
                    >
                      <CourseActiveManageView viewCallback={this.onViewCallback}
                        {...this.state}
                      />
                    </Modal>
                  }

                  {
                    this.state.isShowCancelActive &&
                    <Modal
                      title="取消激活"
                      visible={this.state.isShowCancelActive}
                      onOk={this.handleCancelActiveOk}
                      onCancel={this.onHideModal}
                      confirmLoading={this.state.confirmLoading}
                      onCancel={this.handleCancel}
                      width={500}
                    >
                      <Form>
                        <Row gutter={24}>
                          <Col span={24}>
                            <FormItem {...searchFormItemLayout24} label="商品名称">
                              <span>{this.state.currentDataModel.courseProductName}</span>
                            </FormItem>
                          </Col>
                          <Col span={24}>
                            <FormItem {...searchFormItemLayout24} label="课程名称">
                              <span>{this.state.currentDataModel.courseName}</span>
                            </FormItem>
                          </Col>
                          <Col span={24}>
                            <FormItem
                              {...searchFormItemLayout24}
                              label="备注"
                            >
                              {getFieldDecorator('remark', {
                                initialValue: '',
                                rules: [{ required: true, message: '请输入备注!' }],
                              })(
                                <TextArea
                                  rows={4}
                                />

                                )}
                            </FormItem>
                          </Col>
                        </Row>
                      </Form>
                    </Modal>
                  }
                  {
                    this.state.isShowUpTime &&
                    <Modal
                      title="设置时间"
                      visible={this.state.isShowUpTime}
                      onOk={this.handleUpTiemOk}
                      onCancel={this.onHideModal}
                      confirmLoading={this.state.confirmLoading}
                      onCancel={this.handleCancel}
                      width={700}
                    >
                      <Form>
                        <Row gutter={24}>
                          <Col span={24}>
                            <FormItem {...searchFormItemLayout24} label="商品名称">
                              <span>{this.state.currentDataModel.courseProductName}</span>
                            </FormItem>
                          </Col>
                          <Col span={24}>
                            <FormItem {...searchFormItemLayout24} label="课程名称">
                              <span>{this.state.currentDataModel.courseName}</span>
                            </FormItem>
                          </Col>
                          <Col span={24}>
                            <FormItem {...searchFormItemLayout24} label="激活日期">
                              <span>{timestampToTime(this.state.currentDataModel.activeTime)}</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                              <span >(间隔时长：{this.state.days}天)</span>
                            </FormItem>
                          </Col>

                          <Col span={24}>
                            <FormItem
                              {...searchFormItemLayoutDate24}
                              label="激活到期日期"
                            >
                              {getFieldDecorator('endTime', {
                                initialValue: dataBind(timestampToTime(this.state.currEndTime), true),

                                rules: [{ required: true, message: '请输激活确认日期!' }],
                              })(
                                <DatePicker
                                  // disabledDate={this.disabledEndActiveDate}
                                  format={dateFormat}
                                  onChange={this.onEndActiveChange}

                                />

                                )}
                            </FormItem>
                          </Col>

                          <Col span={24}>
                            <FormItem
                              {...searchFormItemLayout24}
                              label="延期天数"
                            >
                              {getFieldDecorator('day', {
                                initialValue: this.state.day,
                                rules: [{ required: true, message: '请输入延期天数!' }],
                              })(
                                <InputNumber max={10000}
                                  onChange={(value) => this.onDay(value)}
                                />

                                )}
                            </FormItem>
                          </Col>

                          <Col span={24}>
                            <FormItem
                              {...searchFormItemLayout24}
                              label="备注"
                            >
                              {getFieldDecorator('remark', {
                                initialValue: '',
                                rules: [{ required: true, message: '请输入备注!' }],
                              })(
                                <TextArea
                                  rows={4}
                                />

                                )}
                            </FormItem>
                          </Col>
                        </Row>
                      </Form>
                    </Modal>
                  }

                </Form>
              }
            </ContentBox>
            <div className="space-default"></div>
            <div className="search-result-list">
              <Table columns={this.columns} //列定义
                loading={this.state.loading}
                pagination={false}
                dataSource={this.state.data_list}//数据
                bordered
                rowKey={record => record.partnerContractId}//主键
                scroll={{ x: 1600 }}
              />
              <div className="space-default"></div>
              <div className="search-paging">
                <Row justify="space-between" align="middle" type="flex">
                  
                  <Col span={24} className={'search-paging-control'}>
                    <Pagination showSizeChanger
                      current={this.state.pagingSearch.currentPage}
                      defaultPageSize={this.state.pagingSearch.pageSize}      pageSizeOptions = {['10','20','30','50','100','200']}
                      pageSize={this.state.pagingSearch.pageSize}
                      onShowSizeChange={this.onShowSizeChange}
                      onChange={this.onPageIndexChange}
                      showTotal={(total) => { return `共${total}条数据`; }}
                      total={this.state.totalRecord} />
                  </Col>
                </Row>
              </div>
            </div>
          </div>
        );
        break;
    }
    return block_content;
  }
}

//表单组件 封装
const WrappedManage = Form.create()(CourseActiveManage);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    //基本字典接口
    loadDictionary: bindActionCreators(loadDictionary, dispatch),
    getCourseActiveList: bindActionCreators(getCourseActiveList, dispatch),
    courseActiveOperationCourseActive: bindActionCreators(courseActiveOperationCourseActive, dispatch),
    courseActiveOperationCourseCancelActive: bindActionCreators(courseActiveOperationCourseCancelActive, dispatch),
    courseActiveOperationCourseUpdateEndTime: bindActionCreators(courseActiveOperationCourseUpdateEndTime, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
