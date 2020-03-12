/*
学生转账上报
wangwenjun
2018-05-09
*/
import React from 'react';
import PropTypes from 'prop-types'
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {Route, Redirect} from 'react-router-dom';
import {
  message, Modal, Form, Row, Col, Input, Select, Button, Icon,
  Table, Pagination, Divider,DatePicker
} from 'antd';
const FormItem = Form.Item;
const dateFormat = 'YYYY-MM-DD';
import moment from 'moment';
import ContentBox from '@/components/ContentBox';
import SelectItem from '@/components/BizSelect/SelectItem';
import SelectArea from '@/components/BizSelect/SelectArea';
import DropDownButton from '@/components/DropDownButton';
import ChoiceStudentOrder from './ChoiceStudentOrder';
import StudentTransferReportView from './view';
//基本字典接口方法引入
import {loadDictionary} from '@/actions/dic';
//组件实例模板方法引入
import {
  loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange,
   searchFormItemLayout24,
  onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons
} from '@/utils/componentExt';
//数据转字典标题
import {getDictionaryTitle, timestampToTime, split, formatMoment} from '@/utils';

const { RangePicker } = DatePicker;
import {
    getStudentPayfeeByTransfer,studentPayfeeUpdateByTransfer,studentPayfeeDeleteTransferById
} from '@/actions/finance';
const searchFormItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};
class StudentTransferReport extends React.Component {
  constructor() {
    super();
    (this:any).fetch = this.fetch.bind(this);
    //扩展方法用于本组件实例
    this.loadBizDictionary = loadBizDictionary.bind(this);
    this.onSearch = onSearch.bind(this);
    this.onPageIndexChange = onPageIndexChange.bind(this);
    this.onShowSizeChange = onShowSizeChange.bind(this);
    this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
    this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
    this.onToggleSearchOption = onToggleSearchOption.bind(this);

    this.state = {
      currentDataModel: null,
      editMode: '',//Edit,Create,View,Delete
      pagingSearch: {
        currentPage: 1,
        pageSize: 10,
        benefitRegionId:'',
        financeStatus:'',
        transferMan:'',
      },
      data: [],
      totalRecord: 0,
      loading: false,
      UserSelecteds: [],
      payDateStart:'',
      payDateEnd:'',
      createDateStart:'',
      createDateEnd:'',
    };
  }

  componentWillMount() {
    //载入需要的字典项:
    this.loadBizDictionary(['dic_Status', 'finance_status', 'payee_type']);
    //首次进入搜索-->
    this.onSearch();
  }

  componentWillUnMount() {

  }

  //学生姓名	所属区域	学号	证件号	转账缴费总金额(¥)	附件		状态  转账日期  操作
  columns = [
    {
      title: '学生姓名',
      fixed: 'left',
      width: 120,
      dataIndex: 'realName',
    },
    {
      title: '所属区域',
      dataIndex: 'regRegionName',
    },
    {
      title: '学号',
      dataIndex: 'studentNo'
    },
    {
      title: '证件号',
      dataIndex: 'certificateNo',
      render: (text, record, index) => {
        return record.certificateNo;
      }
    },
    {
      title: '转账人',
      dataIndex: 'transferMan'
    },
    {
      title: '转账缴费总金额(¥)',
      dataIndex: 'money',
      render: (text, record, index) => {
        return record.money;
      }
    },
    {
      title: '附件',
      dataIndex: 'isHaveFile',
      render: (text, record, index) => {
        return record.isHaveFile
      }
    },
    {
      title: '状态',
      dataIndex: 'financeStatus',
      render: (text, record, index) => {
        return getDictionaryTitle(this.state.finance_status, record.financeStatus);
      }
    },
    {
        title: '转账日期',
        dataIndex: 'payDateStr',
        render: (text, record, index) => {
          return record.payDateStr
       }
     },
     {
        title: '确认日期',
        dataIndex: 'confirmDateStr',
    },
     {
      title: '创建日期',
      dataIndex: 'createDateStr',
      render: (text, record, index) => {
        return record.createDateStr
     }
   },
    {
      title: '操作',
      fixed: 'right',
      width: 120,
      key: 'action',
      render:  (text, record) => {
        return <DropDownButton>
            {record.financeStatus != 3 && <Button onClick={() => {  this.onLookView('Edit', record); }}>编辑</Button>}
            {record.financeStatus == 1 && <Button onClick={() => {  this.onDelete(record.studentPayfeeId) }}>删除</Button>}
            {(record.financeStatus == 2 || record.financeStatus == 3) && <Button onClick={() => {  this.onLookView('View', record); }}>查看</Button>}
        </DropDownButton>
    },
    }
  ];

  //删除数据
  onDelete = (studentPayfeeId) => {
    this.props.studentPayfeeDeleteTransferById({payfeeId:studentPayfeeId}).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'error') {
              message.error(data.message, 5);
            }
            else {
              message.success('修改成功')
              this.onSearch();
            }
          })
  };

  //检索数据
  fetch(params = {}) {
    this.setState({loading: true});
    var condition = params || this.state.pagingSearch;
    let payDateStart = condition.payDateStart;
    let createDateStart = condition.createDateStart;
    if(payDateStart){
      condition.payDateStart = formatMoment(payDateStart[0])
      condition.payDateEnd = formatMoment(payDateStart[1])
    }
    if(createDateStart){
      condition.createDateStart = formatMoment(createDateStart[0])
      condition.createDateEnd = formatMoment(createDateStart[1])
    }
    this.props.getStudentPayfeeByTransfer(condition).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.state === 'success') {
        this.setState({
          pagingSearch: condition,
          ...data,
          loading: false
        })
      }
      else {
        this.setState({loading: false})
        message.error(data.message);
      }
    })
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
      this.setState({currentDataModel: null, editMode: 'Manage'})
    } else {
      switch (this.state.editMode) {
        case 'Create':
            this.onSearch();
              //进入管理页
            this.onLookView("Manage", dataModel);

          break;
        case 'Edit':
          this.props.studentPayfeeUpdateByTransfer(dataModel).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'error') {
              message.error(data.message, 5);
            }
            else {
              message.success('修改成功')
              this.onSearch();
              //进入管理页
              this.onLookView("Manage", dataModel);
            }
          })
          break;
          default:
          this.onSearch();
          //进入管理页
          this.onLookView("Manage", dataModel);
          break;
      }
    }
  }

  disabledPayStartDate = (startValue) => {
    const endValue = this.state.payDateEnd;
    if (!startValue || !endValue) {
      return false;
    }
    return startValue.valueOf() > endValue.valueOf();
  }

  disabledCreateStartDate = (startValue) => {
    const endValue = this.state.createDateEnd;
    if (!startValue || !endValue) {
      return false;
    }
    return startValue.valueOf() > endValue.valueOf();
  }

  disabledCreateEndDate = (endValue) => {
    const startValue = this.state.createDateStart;
    if (!endValue || !startValue) {
      return false;
    }
    return endValue.valueOf() <= startValue.valueOf();
  }

  disabledPayEndDate = (endValue) => {
    const startValue = this.state.payDateStart;
    if (!endValue || !startValue) {
      return false;
    }
    return endValue.valueOf() <= startValue.valueOf();
  }

  onChange = (field, value) => {
    this.setState({
      [field]: value,
    });
  }

  onStartPayDateChange = (value) => {
    this.onChange('payDateStart', value);
  }

  onEndPayDateChange = (value) => {
    this.onChange('payDateEnd', value);
  }

  onStartCreateDateChange = (value) => {
    this.onChange('createDateStart', value);
  }

  onEndCreateDateChange = (value) => {
    this.onChange('createDateEnd', value);
  }

  render() {
    let block_content = <div></div>
    switch (this.state.editMode) {
      case 'Create':
        block_content = <ChoiceStudentOrder
          viewCallback={this.onViewCallback}
          {...this.state}/>
        break;
      case 'Edit':
      case 'View':
        block_content = <StudentTransferReportView
        viewCallback={this.onViewCallback}
        refresh={this.onSearch}
        {...this.state}/>
      break;
      default:

        const {getFieldDecorator} = this.props.form;
        let extendButtons = [];

        // 按钮拿出去单独作为一个功能菜单
        // extendButtons.push(<Button onClick={() => {
        //   this.onLookView('Create', {...this.state.dataModel})
        // }} icon="plus" className="button_dark">新增转账</Button>);
        
        block_content = (
          <div>
            {/* 搜索表单 */}
            <ContentBox topButton={this.renderSearchTopButtons(extendButtons)}
                        bottomButton={this.renderSearchBottomButtons(extendButtons)}>
              {!this.state.seachOptionsCollapsed &&
              <Form className="search-form">
                <Row gutter={24}>
                  <Col span={12}>
                    <FormItem {...searchFormItemLayout} label={'区域'} >
                        {getFieldDecorator('benefitRegionId', { initialValue: this.state.pagingSearch.benefitRegionId })(
                            <SelectArea scope='my' hideAll={false} />
                        )}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem {...searchFormItemLayout} label="状态">
                      {getFieldDecorator('financeStatus', {initialValue: this.state.pagingSearch.financeStatus})(
                        <Select>
                          <Option value="">全部</Option>
                          {this.state.finance_status.map((item, index) => {
                            return <Option value={item.value} key={index}>{item.title}</Option>
                          })}
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem {...searchFormItemLayout} label={'转账人'}>
                      {getFieldDecorator('transferMan', {initialValue: this.state.pagingSearch.transferMan})(
                        <Input placeholder="转账人"/>
                      )}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                      <FormItem
                          {...searchFormItemLayout}
                          label="转账日期">
                          {getFieldDecorator('payDateStart', { initialValue:this.state.pagingSearch.payDateStart?[moment(this.state.pagingSearch.payDateStart,dateFormat),moment(this.state.pagingSearch.payDateEnd,dateFormat)]:[]})(
                              <RangePicker
                              disabledDate={this.disabledStartDate}
                              format={dateFormat}
                              onChange={this.onStartChange}
                              onOpenChange={this.handleStartOpenChange}
                              style={{width:220}}  
                              />
                          )}
                      </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem {...searchFormItemLayout} label={'学生姓名'}>
                      {getFieldDecorator('studentName', {initialValue: this.state.pagingSearch.studentName})(
                        <Input placeholder="学生姓名"/>
                      )}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                     <FormItem
                          {...searchFormItemLayout}
                          label="创建日期">
                          {getFieldDecorator('createDateStart', { initialValue:this.state.pagingSearch.createDateStart?[moment(this.state.pagingSearch.createDateStart,dateFormat),moment(this.state.pagingSearch.createDateEnd,dateFormat)]:[]})(
                              <RangePicker
                              disabledDate={this.disabledStartDate}
                              format={dateFormat}
                              onChange={this.onStartChange}
                              onOpenChange={this.handleStartOpenChange}
                              style={{width:220}}  
                              />
                          )}
                      </FormItem>
                  </Col>
                </Row>
              </Form>
              }
            </ContentBox>
            {/* 内容分割线 */}
            <div className="space-default"></div>
            <div className="search-result-list">
              <Table columns={this.columns} //列定义
                     loading={this.state.loading}
                     pagination={false}
                     dataSource={this.state.data}//数据
                     rowKey={record => record.productPriceId}//主键
                     bordered
                     scroll={{x: 1600}}
                     // rowSelection={rowSelection}
              />
              <div className="space-default"></div>
              <div className="search-paging">
                <Row justify="space-between" align="middle" type="flex">
                  {/* <Col span={10}>
                    <div className='flex-row'>
                    </div>
                  </Col> */}
                  <Col span={24} className={'search-paging-control'}>
                    <Pagination showSizeChanger
                                current={this.state.pagingSearch.currentPage}
                                defaultPageSize={this.state.pagingSearch.pageSize}      pageSizeOptions = {['10','20','30','50','100','200']}
                                pageSize={this.state.pagingSearch.pageSize}
                                onShowSizeChange={this.onShowSizeChange}
                                onChange={this.onPageIndexChange}
                                showTotal={(total) => {
                                  return `共${total}条数据`;
                                }}
                                total={this.state.totalRecord}/>
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
const WrappedManage = Form.create()(StudentTransferReport);

const mapStateToProps = (state) => {
  //基本字典数据
  let {Dictionarys} = state.dic;
  return {Dictionarys};
};

function mapDispatchToProps(dispatch) {
  return {
    //基本字典接口
    loadDictionary: bindActionCreators(loadDictionary, dispatch),
    getStudentPayfeeByTransfer: bindActionCreators(getStudentPayfeeByTransfer, dispatch),
    studentPayfeeUpdateByTransfer: bindActionCreators(studentPayfeeUpdateByTransfer, dispatch),
    studentPayfeeDeleteTransferById:bindActionCreators(studentPayfeeDeleteTransferById, dispatch),
  };
}

//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
