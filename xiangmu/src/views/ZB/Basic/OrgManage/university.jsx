//标准组件环境
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Form, Row, Col, Input, Select, Button, Icon, Table,
  Pagination, Divider, Modal, Card } from 'antd';
const FormItem = Form.Item;

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import { loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange,
  searchFormItemLayout,
  onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons
} from '@/utils/componentExt';
//数据转字典标题
import { getDictionaryTitle, transformListToTree } from '@/utils';

//业务接口方法引入
import { orgUniversityList, orgUniversityNotInList, orgAddUniversitys, orgDeleteUniversity } from '@/actions/admin';
//业务数据视图（增、删、改、查)
import ContentBox from '@/components/ContentBox';

class OrgUniversityManage extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            orgId: props.orgId,
            orgName: props.orgName,
            //currentDataModel: null,
            editMode: '',//Edit,Create,View,Delete
            pagingSearch: {
                currentPage: 1,
                pageSize: 10,
            },
            university_list: [],
            university_not_in_list: [],
            totalRecord: 0,
            loading: false,
            UserSelecteds: [],
        };
        //扩展方法用于本组件实例
        this.loadBizDictionary = loadBizDictionary.bind(this);
        this.onSearch = onSearch.bind(this);
        this.onPageIndexChange = onPageIndexChange.bind(this);
        this.onShowSizeChange = onShowSizeChange.bind(this);
        this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
        this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
        this.onToggleSearchOption = onToggleSearchOption.bind(this);
    }
    componentWillMount() {
        //载入需要的字典项
        this.loadBizDictionary(['dic_Status', 'university_level']);
        //首次进入搜索，加载服务端字典项内容
        this.onSearch();
    }
    componentWillUnMount() {
    }

    onCancel = () => {
      if(this.state.editMode == 'AddUniversitys'){
        this.setState({
          editMode: 'Manage'
        })
      }else {
        this.props.viewCallback();
      }
    }
    //table 输出列定义
    columns = [{
        title: '院校名称',
        width: 150,//可预知的数据长度，请设定固定宽度
        dataIndex: 'universityName',
        //自定义显示
        //render: (text, record, index) => {
        //    return <a onClick={() => { this.onLookView('View', record) }}>{record.universityName}</a>
        //}
    },
    {
        title: '高校类别',
        width: 100,//可预知的数据长度，请设定固定宽度
        dataIndex: 'universityLevel',
        //自定义显示
        render: (text, record, index) => {
            return getDictionaryTitle(this.state.university_level, record.universityLevel)
        }
    },
    {
        title: '所在省市',
        width: 150,//可预知的数据长度，请设定固定宽度
        dataIndex: 'areaName',
    },
    {
        title: '操作',
        width: 180,//可预知的数据长度，请设定固定宽度
        key: 'action',
        render: (text, record) => (
            <span>
                <a onClick={() => {
                  this.onDelete(record.universityId);
                }}>删除</a>
            </span>
        ),
    }];
    columnsAdd = [{
        title: '院校名称',
        width: 150,//可预知的数据长度，请设定固定宽度
        dataIndex: 'universityName',
        //自定义显示
        //render: (text, record, index) => {
        //    return <a onClick={() => { this.onLookView('View', record) }}>{record.universityName}</a>
        //}
    },
    {
        title: '高校类别',
        width: 100,//可预知的数据长度，请设定固定宽度
        dataIndex: 'universityLevel',
        //自定义显示
        render: (text, record, index) => {
            return getDictionaryTitle(this.state.university_level, record.universityLevel)
        }
    },
    {
        title: '所在省市',
        width: 150,//可预知的数据长度，请设定固定宽度
        dataIndex: 'areaName',
    }];

    //检索数据
    fetch = (params = {}) => {
        this.setState({ loading: true });
        //var condition = this.state.pagingSearch;
        if(this.state.editMode == 'AddUniversitys'){
          this.props.orgUniversityNotInList(this.state.orgId, params.universityName).payload.promise.then((response) => {
              let data = response.payload.data;
              if (data.state === 'success') {
                  //condition.currentPage = data.currentPage;
                  var list = [];
                  data.data.map(a => {
                    a.key = a.universityId;
                    list.push(a);
                  });
                  this.setState({
                    //pagingSearch: condition,
                    university_not_in_list: list,
                    totalRecord: data.totalRecord,
                    loading: false
                  })
              }
              else {
                  this.setState({ loading: false })
                  message.error(data.message);
              }
          })
        }else {
          this.props.orgUniversityList(this.state.orgId).payload.promise.then((response) => {
              let data = response.payload.data;
              if (data.state === 'success') {
                  //condition.currentPage = data.currentPage;
                  var list = [];
                  data.data.map(a => {
                    a.key = a.universityId;
                    list.push(a);
                  });
                  this.setState({
                    //pagingSearch: condition,
                    university_list: list,
                    totalRecord: data.totalRecord,
                    loading: false
                  })
              }
              else {
                  this.setState({ loading: false })
                  message.error(data.message);
              }
          })
        }
    }

    //浏览视图
    onLookView = (op, item) => {
        this.setState({
            editMode: op,//编辑模式
            currentDataModel: item,//编辑对象
        });
        if(op == 'AddUniversitys'){
          var that = this;
          setTimeout(function(){
            that.onSearch();
          }, 100);
        }
    };
    //视图回调
    onViewCallback = (dataModel) => {
        if (!dataModel) {
            this.setState({ currentDataModel: null, editMode: 'Manage' })
        }
        else {
            switch (this.state.editMode) {
                case "Create":
                case "Edit": //提交
                    if(dataModel.orgType == 2){
                      delete dataModel.parentOrgid;
                    }
                    this.props.saveOrgInfo(dataModel).payload.promise.then((response) => {
                        let data = response.payload.data;
                        if (data.state === 'error') {
                            message.error(data.message);
                        }
                        else {
                            this.onSearch();
                            if(dataModel.orgType == 2){
                              this.getConditionData();
                            }
                            //进入管理页
                            this.onLookView("Manage", null);
                        }
                    })
                    //提交
                    break;
                case "Delete":
                    //提交
                    this.props.deleteOrgInfo(this.state.currentDataModel.orgId).payload.promise.then((response) => {
                        let data = response.payload.data;
                        if (data.state === 'error') {
                            message.error(data.message);
                        }
                        else {
                            this.onSearch();
                            if(dataModel.orgType == 2){
                              this.getConditionData();
                            }
                            //进入管理页
                            this.onLookView("Manage", null);
                        }
                    })
                    break;
            }
        }
    }
    onBatchAdd = () => {
      this.props.orgAddUniversitys(this.state.orgId, this.state.UserSelecteds.join(',')).payload.promise.then((response) => {
          let data = response.payload.data;
          if (data.result === false) {
              message.error(data.message);
          }
          else {
              this.setState({ UserSelecteds: [] })
              this.onSearch();
          }
      })
    }
    onDelete = (universityId) => {
      this.props.orgDeleteUniversity(this.state.orgId, universityId).payload.promise.then((response) => {
          let data = response.payload.data;
          if (data.result === false) {
              message.error(data.message);
          }
          else {
              this.onSearch();
          }
      })
    }
    //渲染，根据模式不同控制不同输出
    render() {
        let block_content = <div></div>
        const { getFieldDecorator } = this.props.form;
        const searchFormItemLayout = { labelCol: { span: 10 }, wrapperCol: { span: 14 } };
        let extendButtons = [];
        switch (this.state.editMode) {
            case "Create":
            case "Edit":
            case "View":
            case "AddUniversitys":
              var rowSelection = {
                selectedRowKeys: this.state.UserSelecteds,
                onChange: (selectedRowKeys, selectedRows) => {
                  this.setState({ UserSelecteds: selectedRowKeys })
                },
                getCheckboxProps: record => ({
                  //disabled: record.name === 'Disabled User', // Column configuration not to be checked
                  name: record.orgName,
                }),
              }
              block_content = (
                  <div>
                    {/* 搜索表单 */}
                    <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
                      {!this.state.seachOptionsCollapsed &&
                      <Form className="search-form" >
                          <Row justify="center" align="middle" type="flex">
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="高校名称"
                                    style={{marginBottom:0}}
                                >
                                  {getFieldDecorator('universityName', { initialValue: '' })(
                                    <Input placeholder="高校名称" />
                                  )}
                                </FormItem>
                            </Col>
                            <Col span={12}></Col>
                          </Row>
                      </Form>
                      }
                    </ContentBox>
                    {/* 内容分割线 */}
                    <div className="space-default"></div>
                      <div className="search-result-list">
                          <Table columns={this.columnsAdd} //列定义
                              loading={this.state.loading}
                              pagination={false}
                              dataSource={this.state.university_not_in_list}//数据
                              onChange={this.handleTableChange}
                              bordered
                              rowSelection={rowSelection}
                          />
                          {<div className="search-paging">
                              <Row justify="space-between" align="middle" type="flex">
                                  <Col span={6}>
                                    {this.state.UserSelecteds.length > 0 ?
                                      <Button onClick={this.onBatchAdd} icon="delete">确定</Button> :
                                      <Button disabled icon="delete">确定</Button>
                                    }
                                  </Col>
                                  <Col span={18} className={'search-paging-control'}>

                                  </Col>
                              </Row>
                          </div>}
                      </div>
                  </div>
              );
              break;
            case "Manage":
            default:

              extendButtons = [];
              extendButtons.push(<Button onClick={() => { this.onLookView('AddUniversitys') }} icon="plus" className="button_dark">负责高校</Button>);
              block_content = (
                  <div>
                    {/* 搜索表单 */}
                    <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
                      {!this.state.seachOptionsCollapsed &&
                      <Form className="search-form" >
                          <Row justify="center" align="middle" type="flex">
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="分部名称"
                                    style={{marginBottom:0}}
                                >
                                  <span>{this.props.orgName}</span>
                                </FormItem>
                            </Col>
                            <Col span={12}></Col>
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
                              dataSource={this.state.university_list}//数据
                              onChange={this.handleTableChange}
                              bordered
                          />
                          {/*<div className="search-paging">
                              <Row justify="space-between" align="middle" type="flex">
                                  <Col span={6}>
                                  </Col>
                                  <Col span={18} className={'search-paging-control'}>
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
                          </div>*/}
                      </div>
                  </div>
              );
              break;
        }
        //return block_content;

        return (
            <Card title="添加高校" extra={<a onClick={() => { this.onCancel() }}><Icon type="rollback" />返回列表</a>}>
              { block_content }
            </Card>
        )
    }
}
//表单组件 封装
const WrappedManage = Form.create()(OrgUniversityManage);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
        //基本字典接口
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
        //各业务接口
        orgUniversityList: bindActionCreators(orgUniversityList, dispatch),
        orgUniversityNotInList: bindActionCreators(orgUniversityNotInList, dispatch),
        orgAddUniversitys: bindActionCreators(orgAddUniversitys, dispatch),
        orgDeleteUniversity: bindActionCreators(orgDeleteUniversity, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
