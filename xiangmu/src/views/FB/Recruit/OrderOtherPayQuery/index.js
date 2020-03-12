/*
未匹配订单快捷支付查询 列表
*/
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import {
  message, Modal, Form, Row, Col, Input, Select, Button, Icon,
  Table, Pagination, Divider, DatePicker
} from 'antd';
const FormItem = Form.Item;
const { TextArea } = Input;
import ContentBox from '@/components/ContentBox';
import FileDownloader from '@/components/FileDownloader';
import SelectItem from '@/components/BizSelect/SelectItem';
import SelectClassType from '@/components/BizSelect/SelectClassType';
import SelectRecruitBatch from '@/components/BizSelect/SelectRecruitBatch';
import ProductView from '@/views/ZB/Product/ProductView/view'

const Option = Select.Option;
//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import {
  loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange,
   searchFormItemLayout24,
  onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons
} from '@/utils/componentExt';
//数据转字典标题
import { getDictionaryTitle, timestampToTime, split, formatMoney, dataBind, formatMoment } from '@/utils';
import moment from 'moment';
import {
  getOtherPayList,
  delOtherPayList,
  recoveryOtherPayList
} from '@/actions/recruit';

const dateFormat = 'YYYY-MM-DD';
const { RangePicker } = DatePicker;
const searchFormItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 16 },
}
class OrderOtherPayQuery extends React.Component {
  constructor(props) {
    super(props);
    //扩展方法用于本组件实例
    this.loadBizDictionary = loadBizDictionary.bind(this);
    this.onSearch = onSearch.bind(this);
    this.onPageIndexChange = onPageIndexChange.bind(this);
    this.onShowSizeChange = onShowSizeChange.bind(this);
    this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
    this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
    this.onToggleSearchOption = onToggleSearchOption.bind(this);

    const {auth} = this.props;
    var currentUser = auth.currentUser;
 
    this.state = {
      currentDataModel: null,
      editMode: '',//Edit,Create,View,Delete
      pagingSearch: {
        currentPage: 1,
        pageSize: 10,
        productType: '', //公司
        branchId: currentUser.userType.orgId,//分部ID
        startDate: '',
        endDate: '',
        operationType: 2,
        delFlag: '0',
        userName:''
      },
      data: [],
      totalRecord: 0,
      loading: false,
      UserSelecteds: [],
      startValue: null,
      endValue: null,
      endOpen: false,
      isShowDelete: false,
      studentOtherPayId: ''
    };
  }
  componentWillMount() {
    //载入需要的字典项: 
    this.loadBizDictionary(['dic_Status', 'product_branch_price_status', 'producttype', 'dic_Allow', 'payee_type']);
    //首次进入搜索-->由默认选择第一个招生季时触发
    this.onSearch();
    
  }
  componentWillUnMount() {
  }

  //班型	商品名称	商品属性	商品定价(¥)	已设分项总价(¥)	发布状态	操作
  columns = [
    {
      title: '公司',
      fixed: 'left',
      width: 120,
      dataIndex: 'posAccountType',
      render: text => <span>{getDictionaryTitle(this.state.payee_type, text)}</span>
    },{
      title: '分部',
      width: 120,
      dataIndex: 'branchName',
    },
    {
      title: '支付流水号',
      width: 200,
      dataIndex: 'otherPayNo',
    },
    {
      title: '缴费金额',
      width: 140,
      dataIndex: 'money',
      render: (text, record, index) => (`${formatMoney(record.money)}`)
    },
    {
      title: '缴费日期',
      width: 120,
      dataIndex: 'createDate',
      render: (text, record, index) => (`${timestampToTime(record.createDate)}`)
    },
    {
      title: 'POS机名称',
      dataIndex: 'posName',
    },
    {
      title: 'POS机编号',
      dataIndex: 'posCode', //自定义显示
    },
    {
      title: '员工工号',
      dataIndex: 'userNumber',
    },
    {
      title: '员工姓名',
      dataIndex: 'userName',
      width: 120
    },
    {
      title: '操作',
      fixed: 'right',
      width: 120,
      render: (text, record, index) => {
        if(record.delFlag){
          return <Button onClick={() => { this.onRecovery(record.studentOtherPayId) }}>恢复</Button>
        }
        return <Button onClick={() => { this.onDeltet(record.studentOtherPayId) }}>删除</Button>
      }
    }
  ];
  //检索数据
  fetch(params = {}) {
    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch;
    let startDate = condition.startDate;
    if(startDate){
      condition.startDate = startDate[0] ? formatMoment(startDate[0])+' 00:00:00':'';
      condition.endDate = startDate[1] ? formatMoment(startDate[1])+' 23:59:59':'';
    }
    this.props.getOtherPayList(condition).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.state === 'success') {
        this.setState({
          pagingSearch: condition,
          ...data,
          loading: false
        })
      }
      else {
        this.setState({ loading: false })
        message.error(data.message);
      }
    })
  }

  //删除操作
  onDeltet = (studentOtherPayId) => {
      // Modal.confirm({
      //     title: '是否删除当前流水?',
      //     content: '点击确认删除当前流水!否则点击取消！',
      //     onOk: () => {
      //         let params = { studentOtherPayId: studentOtherPayId }
      //         this.props.delOtherPayList(params).payload.promise.then((response) => {
      //             let data = response.payload.data;
      //             if (data.state != 'success') {
      //                 this.setState({ loading: false })
      //                 message.error(data.message);
      //             }
      //             else {
      //                 message.success('删除成功！');
      //                 this.onSearch();
      //             }
      //         })
      //     }
      // })
      this.setState({ isShowDelete: true, studentOtherPayId: studentOtherPayId })
  }
  //恢复
  onRecovery = (studentOtherPayId) => {
      Modal.confirm({
            title: '是否恢复当前流水?',
            content: '点击确认恢复当前流水!否则点击取消！',
            onOk: () => {
                let params = { studentOtherPayId: studentOtherPayId }
                this.props.recoveryOtherPayList(params).payload.promise.then((response) => {
                    let data = response.payload.data;
                    if (data.state != 'success') {
                        this.setState({ loading: false })
                        message.error(data.message);
                    }
                    else {
                        message.success('恢复成功！');
                        this.onSearch();
                    }
                })
            }
        })
    }
  onChangeDate=()=>{
      this.props.form.validateFields((err, values) => {
          let params = { studentOtherPayId: this.state.studentOtherPayId, delReason:values.delReason }
          this.props.delOtherPayList(params).payload.promise.then((response) => {
              let data = response.payload.data;
              if (data.state != 'success') {
                  this.setState({ loading: false })
                  message.error(data.message);
              }
              else {
                  message.success('删除成功！');
                  this.setState({
                    isShowDelete: false
                  })
                  this.onSearch();
              }
          })
      })
  }

  onHideModal=()=> {
      this.setState({
        isShowDelete: false
      })
  }

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
  onChange = (field, value) => {
      this.setState({
          [field]: value,
      });
  }

  onStartChange = (value) => {
      this.onChange('startValue', value);
  }

  onEndChange = (value) => {
      this.onChange('endValue', value);
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
  }
  render() {
    let block_content = <div></div>
    switch (this.state.editMode) {
      case 'ProductView':
        block_content = <ProductView
          viewCallback={this.onViewCallback}
          currentDataModel={this.state.currentDataModel}
          editMode={'View'}
        />
        break;
      case 'Manage':
      default:
        const { getFieldDecorator } = this.props.form;
        let extendButtons = [];
        extendButtons.push(<FileDownloader
          apiUrl={'/edu/studentOtherPay/exportOtherPayList'}//api下载地址
          method={'get'}//提交方式
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
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'公司'} >
                        {getFieldDecorator('posAccountType', { initialValue: '' })(
                          <Select>
                            <Option value="">全部</Option>
                            {this.state.payee_type.filter((a)=>a.title!='全部').filter((a)=>a.title!='大客户收费').filter((a)=>a.title!='共管账户').map((item, index) => {
                              return <Option value={item.value} key={index}>{item.title}</Option>
                            })}
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'支付流水号'} >
                        {getFieldDecorator('otherPayNo', { initialValue: this.state.pagingSearch.otherPayNo })(
                          <Input placeholder="请输入流水号" />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'POS机名称'} >
                        {getFieldDecorator('posName', { initialValue: this.state.pagingSearch.posName })(
                          <Input placeholder="请输入POS机名称" />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem
                            {...searchFormItemLayout}
                            label="缴费日期">
                            {getFieldDecorator('startDate', { initialValue: (this.state.pagingSearch.startDate&&this.state.pagingSearch.startDate.indexOf('n')==-1)?[moment(this.state.pagingSearch.startDate,dateFormat),moment(this.state.pagingSearch.endDate,dateFormat)]:[]})(
                                <RangePicker style={{width:220}}/>
                            )}
                        </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'是否删除'} >
                        {getFieldDecorator('delFlag', { initialValue: this.state.pagingSearch.delFlag })(
                          <Select>
                            <Option value="1" key="1">是</Option>
                            <Option value="0" key="0">否</Option>
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'员工姓名'} >
                        {getFieldDecorator('userName', { initialValue: this.state.pagingSearch.userName })(
                            <Input placeholder = '请输入员工姓名'/>
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
                scroll={{ x: 1500 }}
              //rowSelection={rowSelection}
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
            {
              this.state.isShowDelete &&
                <Modal
                visible={this.state.isShowDelete}
                onOk={this.onChangeDate}
                onCancel={this.onHideModal}
                closable={false}
                //okText="确认"
                //cancelText="取消"
                >
                    <Form>
                        <Row gutter={24}>
                        <Col span={24}><span style={{marginLeft:'44px',marginBottom:'18px',display:'inline-block'}}>是否确定删除当前流水？</span></Col>
                        <Col span={24}>
                                <FormItem {...searchFormItemLayout} label="删除原因">
                                {getFieldDecorator('delReason', {
                                        initialValue:'',
                                    })(
                                        <TextArea rows={4}  placeholder='请输入删除原因'/>
                                    )}
                                </FormItem>
                            </Col>
                        <Col span={24}>
                                <span style={{marginLeft:'44px'}}>请确认</span>
                        </Col>
                        </Row>
                    </Form>
                </Modal>
            }
          </div>
        );
        break;
    }
    return block_content;
  }
}
//表单组件 封装
const WrappedManage = Form.create()(OrderOtherPayQuery);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  const { auth } = state;
  return { 
    Dictionarys,
    auth: auth ? auth : null,
  };
};

function mapDispatchToProps(dispatch) {
  return {
    //基本字典接口
    loadDictionary: bindActionCreators(loadDictionary, dispatch),

    getOtherPayList: bindActionCreators(getOtherPayList, dispatch),
    delOtherPayList: bindActionCreators(delOtherPayList, dispatch),
    recoveryOtherPayList: bindActionCreators(recoveryOtherPayList, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
