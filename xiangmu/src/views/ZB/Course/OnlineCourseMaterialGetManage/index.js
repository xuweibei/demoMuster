/*
优播网课讲义领取信息管理
2018-12-12
zhujunying
*/
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, message, Form, Row, Col, Input, Select, Button, Icon,
  Table, Pagination, Divider, DatePicker } from 'antd';
const FormItem = Form.Item;
const {  RangePicker } = DatePicker;
import { formatMoney, timestampToTime, getDictionaryTitle, formatMoment, dataBind } from '@/utils';
import { env } from '@/api/env';
import { loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, searchFormItemLayout, searchFormItemLayout24,
  onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
import moment from 'moment';
const dateFormat = 'YYYY-MM-DD';
import { loadDictionary } from '@/actions/dic';
import { onlineCourseMaterialGetManageList, onlineCourseMaterialGetBatchUpdate, EditAndDeleteInterfaces } from '@/actions/material';

import EditView from './view';
import ContentBox from '@/components/ContentBox';
import DropDownButton from '@/components/DropDownButton';
import FileDownloader from '@/components/FileDownloader';
import SelectItem from '@/components/BizSelect/SelectItem';
import SelectFBOrg from '@/components/BizSelect/SelectFBOrg';
import EditableCourseName from '@/components/EditableCourseName';
import SelectItemCourseCategory from '@/components/BizSelect/SelectItemCourseCategory';

class OnlineCourseMaterialGetManage extends React.Component {
  state= {
    editMode: '',
    pagingSearch: {
      currentPage: 1,
      pageSize: env.defaultPageSize,
      sendStatus: '',
      studyMsg: '',
      itemId: '',
      courseCategoryId: '',
      rehearMsg: '',
      giveMsg: '',
      activeState: '',
      courseSourceType: '',
      orderSource: '',
      express: '',
      courseId: '',
    },
    data: [],
    loading: false,
    totalRecord: 0,
    currentDataModel: {},
    UserSelecteds: [],
    branchId: '',
    courseIdData: [],
  };
  constructor(){
    super();
    this.loadBizDictionary = loadBizDictionary.bind(this);
    (this: any).fetch = this.fetch.bind(this);
    this.onSearch = onSearch.bind(this);
    this.onToggleSearchOption = onToggleSearchOption.bind(this);
    this.onPageIndexChange = onPageIndexChange.bind(this);
    this.onShowSizeChange = onShowSizeChange.bind(this);
    this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
    this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
  }
  componentWillMount(){
    this.loadBizDictionary(['dic_YesNo','study_status','order_source','active_state','course_source_type','express']);
    this.onSearch();
  }

  columns = [
    {
        title: '分部',
        width:150,
        fixed:'left',
        dataIndex: 'orgName'
    },
    {
        title: '学生姓名',
        width:120,
        dataIndex: 'realName'
    },
    {
        title: '手机号',
        width: 120,
        dataIndex: 'mobile'
    },
    {
        title: '课程名称',
        width: 150,
        dataIndex: 'courseName',
    },
    {
        title: '订单号',
        width: 150,
        dataIndex: 'orderSn',
    },
    {
        title: '资料名称',
        dataIndex: 'materialName',
        render: (text, record, index) => {
          return <span>
                  <a href="javascript:;" onClick={() => { this.onLookView('View', record); }}>{text}</a>
              </span>
        }
    },
    {
        title: '领取日期',
        width: 120,
        dataIndex: 'receiveDate',
        render: (text, record, index) => {
          return timestampToTime(record.receiveDate);
        }
    },
    {
        title: '快递名称',
        width: 120,
        dataIndex: 'express',
    },
    {
        title: '快递编号',
        width: 150,
        dataIndex: 'expressNum',
    },
    {
        title: '快递地址',
        width: 150,
        dataIndex: 'sendAddress',
    },
    {
        title: '收件人',
        width: 120,
        dataIndex: 'receiver',
    },
    {
        title: '收件人电话',
        width: 150,
        dataIndex: 'receiverMobile',
    },
    {
        title: '赠送',
        width: 80,
        dataIndex: 'giveMsg',
    },
    {
      title: '允许重修',
      width: 100,
      dataIndex: 'rehearMsg',
    },
    {
        title: '操作',
        key: 'action',
        width:120,
        fixed:'right',
        render: (text, record) => (
          <DropDownButton>
              <Button onClick={() => { this.onLookView('Edit', record); }}>编辑</Button>
          </DropDownButton>
        ),
    }
  ];
  //检索数据
  fetch(params){
      
      var condition = params || this.state.pagingSearch;
      let activeStartTime = condition.activeStartTime;
      let sendStartDate = condition.sendStartDate;
      if(activeStartTime){
        condition.activeStartTime = formatMoment(activeStartTime[0])
        condition.activeEndTime = formatMoment(activeStartTime[1])
      }
      if(sendStartDate){
        condition.sendStartDate = formatMoment(sendStartDate[0])
        condition.sendEndDate = formatMoment(sendStartDate[1])
      }

      this.setState({ courseIdData: condition.courseId }); 

      condition.courseId = condition.courseId.length ? condition.courseId[0].id : '';
      
      this.setState({ loading: true });
      this.props.onlineCourseMaterialGetManageList(condition).payload.promise.then((response) => {
          let data = response.payload.data;
          if (data.state === 'success') {
            var list = data.data;
            //list.push(data.data);
            this.setState({
              data: list,
              totalRecord: data.totalRecord,
              loading: false,
              pagingSearch: condition,
              UserSelecteds: []
            })
          }
          else {
              this.setState({ loading: false })
              message.error(data.message);
          }
      })
  }

  onBatchSend = () => {
      this.onLookView('SetPatch', { studentMaterialIds: this.state.UserSelecteds })
  }

  //浏览视图
  onLookView = (op, item) => {
    this.setState({
        editMode: op,//编辑模式
        currentDataModel: item || {},//编辑对象
    });
  };
  //视图回调
  onViewCallback = (dataModel) => {
    if (!dataModel) {
        this.setState({ currentDataModel: null, editMode: 'Manage' })
    }
    else {
        switch (this.state.editMode) {
            case "Edit":
                this.props.EditAndDeleteInterfaces(dataModel).payload.promise.then((response) => {
                    let data = response.payload.data;
                    if (data.result === false) {
                        message.error(data.message);
                    }
                    else {
                        message.success('修改成功！');
                        this.onSearch();
                        this.onLookView("Manage", null);
                    }
                })
                //提交
                break;

            case "SetPatch":
                this.props.onlineCourseMaterialGetBatchUpdate(dataModel).payload.promise.then((response) => {
                    let data = response.payload.data;
                    if (data.result === false) {
                        message.error(data.message);
                    }
                    else {
                        message.success('批量修改成功！');
                        this.onSearch();
                        this.onLookView("Manage", null);
                    }
                })
                //提交
                break;
            default:
              this.onSearch();
              break;
        }
    }
}

  render(){
    let block_content = <div></div>
    
    switch (this.state.editMode) {
      case 'View':
      case 'Edit':
      case "SetPatch":
        block_content = <EditView 
            viewCallback={this.onViewCallback}
            {...this.state}
        />
        break;
      case 'Manage':
      default:
        
        const { getFieldDecorator } = this.props.form;
        //除查询外，其他扩展按钮数组
        let extendButtons = [];
        extendButtons.push(
          <FileDownloader
            apiUrl={'/edu/materialOnlineCourseApply/exportMaterialOnlineVos2'}//api下载地址
            method={'post'}//提交方式
            options={this.state.pagingSearch}//提交参数
            title={'导出'}
          >
          </FileDownloader>);

        var rowSelection = {
          selectedRowKeys: this.state.UserSelecteds,
          onChange: (selectedRowKeys, selectedRows) => {
              this.setState({ UserSelecteds: selectedRowKeys })
          },
          getCheckboxProps: record => ({
              disabled: false,    // Column configuration not to be checked
          }),
        };

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

        block_content = (<div>
          {/* 搜索表单 */}
          <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
            {!this.state.seachOptionsCollapsed &&
            <Form
              className="search-form"
            >
              <Row gutter={24}  type="flex">
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
                    {getFieldDecorator('studyMsg', { initialValue: this.state.pagingSearch.studyMsg })(
                      <Select>
                        <Option value="">全部</Option>
                        {this.state.study_status.map((item, index) => {
                          return <Option value={item.value} key={index}>{item.title}</Option>
                        })}
                      </Select>
                    )}
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem {...searchFormItemLayout} label="订单分部">
                    {getFieldDecorator('branchId', {
                      initialValue: this.state.pagingSearch.branchId,
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
                  <FormItem {...searchFormItemLayout} label={'项目'} style={{ marginBottom: 20 }}>
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
                    label="科目"
                  >
                    {getFieldDecorator('courseCategoryId', { initialValue: this.state.pagingSearch.courseCategoryId })(
                      <SelectItemCourseCategory 
                        itemId={this.state.pagingSearch.itemId} 
                        hideAll={false}
                        onSelectChange={(value) => {
                          this.state.pagingSearch.courseCategoryId = value;
                          this.setState({ pagingSearch: this.state.pagingSearch });
                        }}
                      />
                    )}
                  </FormItem>
                </Col>

                <Col span={12} >
                    <FormItem
                        {...searchFormItemLayout}
                        label="课程名称"
                    >
                        {getFieldDecorator('courseId', { initialValue: (!this.state.courseIdData.length ? [] : [{
                            id: this.state.courseIdData[0].id,
                            name: this.state.courseIdData[0].name
                        }]) })(
                            <EditableCourseName itemId={this.state.pagingSearch.itemId} courseCategoryId={this.state.pagingSearch.courseCategoryId} maxTags={1} />
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
                  <FormItem {...searchFormItemLayout} label="是否允许重修">
                    {getFieldDecorator('rehearMsg', {
                      initialValue: this.state.pagingSearch.rehearMsg,
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
                    {getFieldDecorator('giveMsg', {
                      initialValue: this.state.pagingSearch.giveMsg,
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
                        label="激活日期">
                        {getFieldDecorator('activeStartTime', { initialValue: this.state.pagingSearch.activeStartTime?[moment(this.state.pagingSearch.activeStartTime,dateFormat),moment(this.state.pagingSearch.activeEndTime,dateFormat)]:[] })(
                            <RangePicker style={{width:220}}/>
                        )}
                    </FormItem>
                </Col>
                <Col span={12}>
                    <FormItem {...searchFormItemLayout} label={'资料名称'} >
                        {getFieldDecorator('materialName', { initialValue: this.state.pagingSearch.materialName })(
                        <Input placeholder="资料名称" />
                        )}
                    </FormItem>
                </Col>
                <Col span={12}>
                    <FormItem {...searchFormItemLayout} label={'学生姓名'} >
                        {getFieldDecorator('realName', { initialValue: this.state.pagingSearch.realName })(
                        <Input placeholder="学生姓名" />
                        )}
                    </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem
                    {...searchFormItemLayout}
                    label="快递名称"
                  >
                    {getFieldDecorator('express', {
                      initialValue: this.state.pagingSearch.express,
                    })(
                      <Select>
                        <Option value=''>全部</Option>
                        {this.state.express.map((item, index) => {
                          return <Option value={item.value} key={index}>{item.title}</Option>
                        })}
                      </Select>

                      )}
                  </FormItem>
                </Col>

                <Col span={12}>
                    <FormItem {...searchFormItemLayout} label={'快递编号'} >
                        {getFieldDecorator('expressNum', { initialValue: this.state.pagingSearch.expressNum })(
                        <Input placeholder="快递编号" />
                        )}
                    </FormItem>
                </Col>

                <Col span={12} >
                  <FormItem
                    {...searchFormItemLayout}
                    label="快递日期"
                  >
                    {getFieldDecorator('sendStartDate', { initialValue: this.state.pagingSearch.sendStartDate?[moment(this.state.pagingSearch.sendStartDate,dateFormat),moment(this.state.pagingSearch.sendEndDate,dateFormat)]:[]  })(
                     <RangePicker style={{width:220}}/>
                    )}
                  </FormItem>
                </Col>


                <Col span={12}>
                    <FormItem {...searchFormItemLayout} label={'收件人'} >
                        {getFieldDecorator('receiver', { initialValue: this.state.pagingSearch.receiver })(
                        <Input placeholder="收件人" />
                        )}
                    </FormItem>
                </Col>
                <Col span={12}>
                    <FormItem {...searchFormItemLayout} label={'收件人电话'} >
                        {getFieldDecorator('receiverMobile', { initialValue: this.state.pagingSearch.receiverMobile })(
                        <Input placeholder="收件人电话" />
                        )}
                    </FormItem>
                </Col>


              </Row>
            </Form>
            }
          </ContentBox>
          {/* 内容分割线 */}
          <div className="space-default"></div>
          {/* 数据表格 */}
          <div className="search-result-list">
            <Table columns={this.columns} //列定义
                   loading={this.state.loading}
                   pagination={false}
                   rowKey={'studentMaterialId'}
                   dataSource={this.state.data}//数据
                   rowSelection={rowSelection}
                   bordered
                   scroll={{ x: 2200 }}
            />
            <div className="space-default"></div>
            <div className="search-paging">
              <Row justify="end" align="middle" type="flex">
                <Col span={4}>
                    <div className='flex-row'>
                        {this.state.UserSelecteds.length > 0 ? <Button onClick={this.onBatchSend} icon="database">批量设置</Button> : <Button disabled icon="database">批量设置</Button>}
                    </div>
                </Col>
                <Col span={20} className='search-paging-control'>
                  <Pagination showSizeChanger
                              current={this.state.pagingSearch.currentPage}
                              defaultPageSize={this.state.pagingSearch.pageSize}      pageSizeOptions = {['10','20','30','50','100','200']}
                              onShowSizeChange={this.onShowSizeChange}
                              onChange={this.onPageIndexChange}
                              showTotal={(total) => { return `共${total}条数据`; }}
                              total={this.state.totalRecord} />
                </Col>
              </Row>
            </div>
          </div>
        </div>);
        break;
    }
    return  block_content;
  }
}
//表单组件 封装
const WrappedManage = Form.create()(OnlineCourseMaterialGetManage);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    //1 总部；2 大区；3 分部
    let orgType = state.auth.currentUser.userType.usertype;
    return { Dictionarys, orgType };
};

function mapDispatchToProps(dispatch) {
    return {
        onlineCourseMaterialGetManageList: bindActionCreators(onlineCourseMaterialGetManageList, dispatch),
        onlineCourseMaterialGetBatchUpdate: bindActionCreators(onlineCourseMaterialGetBatchUpdate, dispatch),
        EditAndDeleteInterfaces: bindActionCreators(EditAndDeleteInterfaces, dispatch),
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
