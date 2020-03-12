//用户负责大客户管理
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { Route, Redirect } from 'react-router-dom';
import {
  message, Form, Row, Col, Input, Select, Button, Icon, Table, DatePicker,
  Pagination, Divider, Modal, Card,
  Checkbox,
} from 'antd';
import { env } from '@/api/env';
import SelectFBOrg from '@/components/BizSelect/SelectFBOrg'
import SelectPartnerOrg from '@/components/BizSelect/SelectPartnerOrg'
import ContentBox from '@/components/ContentBox';
import FileDownloader from '@/components/FileDownloader';

//操作按钮
import DropDownButton from '@/components/DropDownButton';

const FormItem = Form.Item;
const { RangePicker } = DatePicker;
const dateFormat = 'YYYY-MM-DD';

//数据转字典标题
import { getDictionaryTitle, getViewEditModeTitle, dataBind, timestampToTime, split, formatMoment } from '@/utils';
//组件实例模板方法引入
import {
  loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange,
  searchFormItemLayout24, searchFormItemLayout,
  onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons
} from '@/utils/componentExt';
import moment from 'moment';
//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
import { getPartnerContractList, batchDeletePartnerContract, addParterContractInfo, updateParterContractInfo } from '@/actions/partner';
import SelectItem from '@/components/BizSelect/SelectItem';

//业务数据视图（增、删、改、查)
import PartnerContractView from './view'

class PartnerContractManage extends React.Component {

  constructor() {
    super()
    //扩展方法用于本组件实例
    this.loadBizDictionary = loadBizDictionary.bind(this);
    this.onSearch = onSearch.bind(this);
    this.onPageIndexChange = onPageIndexChange.bind(this);
    this.onShowSizeChange = onShowSizeChange.bind(this);
    this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
    this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
    this.onToggleSearchOption = onToggleSearchOption.bind(this);

    this.state = {
      //currentDataModel: null,
      editMode: '',//Edit,Create,View,Delete
      pagingSearch: {
        branchId: '',
        currentPage: 1,
        pageSize: env.defaultPageSize,
        contractTypes: '',
        status: '',
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
    this.loadBizDictionary(['dic_Status', 'signstate', 'partnertype', 'partner_class_type', 'contracttype', 'contractstatus']);
    //首次进入搜索，加载服务端字典项内容
    this.onSearch();
  }


  //table 输出列定义
  columns = [{
    title: '合同名称',
    dataIndex: 'partnerContractName',
    fixed: 'left',
    width: 240,
    render: (text, record, index) => {
      return <div className='textleft'>{text}</div>
    }
  },
  {
    title: '签约项目',
    dataIndex: 'itemNames',
  },
  {
    title: '合同类型',
    dataIndex: 'contractTypeNames',
  },
  {
    title: '签约日期',
    dataIndex: 'signDate',
    render: text => <span>{timestampToTime(text)}</span>
  },
  {
    title: '合同截止日期',
    dataIndex: 'endDate',
    render: text => <span>{timestampToTime(text)}</span>
  },
  {
    title: '合同状态',
    dataIndex: 'statusName',
  },
  {
    title: '创建人',
    dataIndex: 'createUName',
  },
  {
    title: '操作',
    width: 120,//可预知的数据长度，请设定固定宽度
    fixed: 'right',
    key: 'action',
    render: (text, record) => {
      return <DropDownButton>
        <Button onClick={() => {
          this.onLookView('Edit', record)
        }}>编辑</Button>
        {(record.contractFile || record.contractFile != '') && <FileDownloader
          apiUrl={'/edu/file/getFile'}//api下载地址
          method={'post'}//提交方式
          options={{ filePath: record.contractFile }}//提交参数
          title={'完整合同'}
        >
        </FileDownloader>
        }


        {(record.shortContractFile || record.shortContractFile != '') && <FileDownloader
          apiUrl={'/edu/file/getFile'}//api下载地址
          method={'post'}//提交方式
          options={{ filePath: record.shortContractFile }}//提交参数
          title={'简版合同'}
        >
        </FileDownloader>
        }
      </DropDownButton>
    }
  }];
  //获取条件列表
  fetch(params) {
    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch;
    let askDate = condition.signDateStart;
    let endDate = condition.endDateStart;
    if(askDate){
      condition.signDateStart = formatMoment(askDate[0]);
      condition.signDateEnd = formatMoment(askDate[1]);
    }
    if(endDate){
      condition.endDateStart = formatMoment(endDate[0]);
      condition.endDateEnd = formatMoment(endDate[1]);
    }
    this.props.getPartnerContractList(condition).payload.promise.then((response) => {
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

  //合同截止日期限制
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
        case "Create":
          this.props.addParterContractInfo(dataModel).payload.promise.then((response) => {
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

  onDelete = () => {
    Modal.confirm({
      title: '是否删除所选大客户合同吗?',
      content: '请确认',
      onOk: () => {
        this.props.batchDeletePartnerContract({ partnerContractIds: this.state.UserSelecteds.join(',') }).payload.promise.then((response) => {
          let data = response.payload.data;
          if (data.result === false) {
            message.error(data.message);
          }
          else {
            message.success('删除成功');
            this.setState({ UserSelecteds: [] })
            this.onSearch();
          }
        })
      },
      onCancel: () => {
        console.log('Cancel');
      },
    })
  }

  render() {
    let block_content = <div></div>
    switch (this.state.editMode) {
      case "Create":
      case "Edit":
      case "View":
        block_content = <PartnerContractView viewCallback={this.onViewCallback}

          {...this.state}
        />
        break;
      case "Manage":
      default:
        var rowSelection = {
          selectedRowKeys: this.state.UserSelecteds,
          onChange: (selectedRowKeys, selectedRows) => {
            this.setState({ UserSelecteds: selectedRowKeys })
          },
          getCheckboxProps: record => ({
            disabled: (record.auditStatus == 0 || record.auditStatus == 3), // 暂存或审核未通过的可以提交审核
          }),
        }
        const { getFieldDecorator } = this.props.form;
        let extendButtons = [];
        extendButtons.push(<Button onClick={() => { this.onLookView('Create', { ...this.state.pagingSearch }) }} icon="plus" className="button_dark">新增大客户合同</Button>);
        block_content = (
          <div>
            {/* 搜索表单 */}
            <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
              {!this.state.seachOptionsCollapsed &&
                <Form className="search-form" >
                  <Row gutter={24}>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="所属分部">
                        {getFieldDecorator('branchId', {
                          initialValue: this.state.pagingSearch.branchId,
                        })(
                          <SelectFBOrg scope={'my'} hideAll={false} />
                          )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="大客户名称">
                        {getFieldDecorator('partnerId', {
                          initialValue: this.state.pagingSearch.partnerId,
                        })(
                          <SelectPartnerOrg scope={'my'} hideAll={false} />
                          )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="合同类型">
                        {getFieldDecorator('contractTypes', {
                          initialValue: this.state.pagingSearch.contractTypes,
                        })(
                          <Select >
                            <Option value="">全部</Option>
                            {this.state.contracttype.map((item, index) => {
                              return <Option value={item.value} key={index}>{item.title}</Option>
                            })}
                          </Select>
                          )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="合同状态">
                        {getFieldDecorator('status', {
                          initialValue: this.state.pagingSearch.status,
                        })(
                          <Select >
                            <Option value="">全部</Option>
                            {this.state.contractstatus.map((item, index) => {
                              return <Option value={item.value} key={index}>{item.title}</Option>
                            })}
                          </Select>
                          )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                     <FormItem
                          {...searchFormItemLayout}
                          label="签约日期">
                          {getFieldDecorator('signDateStart', { initialValue: this.state.pagingSearch.signDateStart?[moment(this.state.pagingSearch.signDateStart,dateFormat),moment(this.state.pagingSearch.signDateEnd,dateFormat)]:[] })(
                              <RangePicker style={{width:220}}/>
                          )}
                      </FormItem>
                    </Col>

                    <Col span={12}>
                      <FormItem
                            {...searchFormItemLayout}
                            label="合同截止日期">
                            {getFieldDecorator('endDateStart', { initialValue: this.state.pagingSearch.endDateStart?[moment(this.state.pagingSearch.endDateStart,dateFormat),moment(this.state.pagingSearch.endDateEnd,dateFormat)]:[] })(
                                <RangePicker style={{width:220}}/>
                            )}
                        </FormItem>
                    </Col>


                    <Col span={24}>
                      <FormItem
                        {...searchFormItemLayout24}
                        style={{ paddingRight: 18 }}

                        label={'合作项目'} >
                        {getFieldDecorator('itemIds',
                          {
                            initialValue: this.state.pagingSearch.itemIds,
                          }
                        )(
                          <SelectItem scope='my' hideAll={false} showCheckBox={true} />
                          )}
                      </FormItem>
                    </Col>
                  </Row>
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
                scroll={{ x: 1300 }}
                rowSelection={rowSelection}
              />
              <div className="space-default"></div>
              <div className="search-paging">
                <Row justify="space-between" align="middle" type="flex">
                  <Col span={10}>
                    <div className='flex-row'>
                      {(this.state.data_list.length > 0 && this.state.UserSelecteds.length > 0) ?
                        <Button onClick={this.onDelete} icon='delete'>删除</Button> :
                        <Button disabled icon='delete'>删除</Button>
                      }
                    </div>
                  </Col>
                  <Col span={14} className={'search-paging-control'}>
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
const WrappedManage = Form.create()(PartnerContractManage);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    //基本字典接口
    loadDictionary: bindActionCreators(loadDictionary, dispatch),
    getPartnerContractList: bindActionCreators(getPartnerContractList, dispatch),
    batchDeletePartnerContract: bindActionCreators(batchDeletePartnerContract, dispatch),
    addParterContractInfo: bindActionCreators(addParterContractInfo, dispatch),
    updateParterContractInfo: bindActionCreators(updateParterContractInfo, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
