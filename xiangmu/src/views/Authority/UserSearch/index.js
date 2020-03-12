
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Divider,Tooltip } from 'antd';
const FormItem = Form.Item;

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import { searchFormItemLayout, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
//数据转字典标题
import { getDictionaryTitle,dataBind } from '@/utils';

import ContentBox from '@/components/ContentBox';

import SelectRecruitUser from '@/components/BizSelect/SelectRecruitUser';

import {
  GetPartnerInfoList,LargeAreaDepartmentalDropDown
} from '@/actions/partner';
import {
  postSearchRecruitUser, addFProductPricePriceApply, updateFProductPricePriceApply
} from '@/actions/recruit';
class UserSearch extends React.Component {
    constructor() {
        super();
        this.state = {
            BranchArr:[],
            pagingSearch: {
              currentPage: 1,
              pageSize: 10,
              realName: '',
              loginName: '',
              isAdmin:'',
              branchId:''
            },
            data: [],
            totalRecord: 0,
            loading: false
        };
        //扩展方法用于本组件实例
        this.loadBizDictionary = loadBizDictionary.bind(this);
        this.onToggleSearchOption = onToggleSearchOption.bind(this);
        this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
        this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
        this.onSearch = onSearch.bind(this);
        this.onPageIndexChange = onPageIndexChange.bind(this);
        this.onShowSizeChange = onShowSizeChange.bind(this);
    }
    componentWillMount() {
        //载入需要的字典项
        this.loadBizDictionary(['dic_Status','dic_YesNo']);
        //首次进入搜索，加载服务端字典项内容
        this.onSearch(); 
        this.GetBranchNew()
       
    }
    componentWillUnMount() {
    }

    GetBranchNew = (parentId) =>{
      let condition = {};
      condition.parentId = this.props.currentUser.userType.orgId;
      this.props.LargeAreaDepartmentalDropDown(condition).payload.promise.then((response) => {
          let data = response.payload.data; 
              if(data.state == 'success'){
                this.setState({
                  BranchArr:data.data
                })
              }else{
                message.error(data.msg);
              }
          }
      )
    }
    //table 输出列定义
    columns = [
          {
            title: '分部',
            width: 120,//可预知的数据长度，请设定固定宽度
            fixed: 'left',
            dataIndex: 'orgName',
          },
          {
            title: '工号',
            dataIndex: 'loginName',
            width: 120,
            
          },
          {
            title: '姓名',
            dataIndex: 'realName',
            width: 120,
          },
          {
            title: '部门',
            dataIndex: 'department',
            width: 120,
          },
          {
            title: '角色',
            dataIndex: 'role',
          },
          {
            title: '负责人',
            dataIndex: 'isAdmin',
            width: 60,
            render:(record)=>{
              return getDictionaryTitle(this.state.dic_YesNo,record)
            }
          },
          {
            title: '手机',
            dataIndex: 'mobile',
            width: 120,
          },
          {
            title: '办公电话',
            dataIndex: 'otherPhone',
            width: 120,
          },
          {
            title: '邮箱',
            width: 180,
            dataIndex: 'email',
          },
          {
            title: '状态',
            dataIndex: 'state',
            width: 60,
            render: (text, record, index) => {
              return getDictionaryTitle(this.state.dic_Status, record.state);
            }
          },
          {
            title: '创建日期',
            dataIndex: 'createDate',
            width: 120,//可预知的数据长度，请设定固定宽度
            fixed: 'right',
            render: (text, record, index) => {
               return this.timestampToTime(record.createDate)
          }
          },
        ];
    timestampToTime(timestamp) {
      var date = new Date(timestamp);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
      var Y = date.getFullYear() + '-';
      var M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
      var D = date.getDate() + ' ';
      return Y+M+D;
    }

    //检索数据
    fetch(params = {}) {
          this.setState({ loading: true });
          var condition = params || this.state.pagingSearch;
          this.props.postSearchRecruitUser(condition).payload.promise.then((response) => {
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
    render() {
        const {auth} = this.props;
        const { getFieldDecorator } = this.props.form;
        let block_content = <div></div>
                block_content = (<div>
                    {/* 搜索表单 */}
                    <ContentBox topButton={this.renderSearchTopButtons()} bottomButton={this.renderSearchBottomButtons()}>
                    {!this.state.seachOptionsCollapsed &&
                          <Form className="search-form" >
                            <Row gutter={24}>
                              {
                                this.props.currentUser.userType.usertype == 2?<Col span={12}>
                                <FormItem {...searchFormItemLayout} label="分部">
                                  {getFieldDecorator('branchId', {
                                    initialValue: this.state.pagingSearch.branchId
                                  })(
                                      <Select>
                                        <Option value=''>全部</Option>
                                        {
                                          this.state.BranchArr.map(item=>{
                                            return <Option value={item.orgId}>{item.orgName}</Option>
                                          })
                                        }
                                      </Select>
                                    )}
                                </FormItem>
                              </Col>:<Col span={12}>
                                <FormItem {...searchFormItemLayout} label="分部">
                                  {getFieldDecorator('branchId', {
                                    initialValue: this.state.pagingSearch.branchId
                                  })(
                                    <SelectRecruitUser hideAll={false} isFirstSelected={true} onSelectChange={(value, selectOptions) => {
                                      this.setState({ currentRecruitBatchIndex: selectOptions.key, currentbranchId: value })
                                      //变更时自动加载数据
                                      this.onSearch();
                                    }} />
                                    )}
                                </FormItem>
                              </Col>
                              }
                              <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="是否为负责人" >
                                  {
                                    getFieldDecorator('isAdmin', {
                                        initialValue: dataBind(this.state.pagingSearch.isAdmin)
                                    })(
                                        <Select onChange={(value) => {
                                            if (value == 1) {
                                                this.setState({ isUniversity: true })
                                            } else {
                                                this.setState({ isUniversity: false })
                                            }
                                        }}>
                                            <Option value=''>全部</Option>
                                            {this.state.dic_YesNo.map((item, index) => {
                                                return <Option value={item.value} key={index}>{item.title}</Option>
                                            })}
                                        </Select>
                                    )}
                                </FormItem>
                              </Col>
                              <Col span={12}>
                                <FormItem {...searchFormItemLayout} label={'姓名'} >
                                  {getFieldDecorator('realName', { initialValue: this.state.pagingSearch.realName })(
                                    <Input placeholder="请输入姓名" />
                                  )}
                                </FormItem>
                              </Col>
                              <Col span={12}>
                                <FormItem {...searchFormItemLayout} label={'工号'} >
                                  {getFieldDecorator('loginName', { initialValue: this.state.pagingSearch.loginName })(
                                    <Input placeholder="请输入工号" />
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
                            dataSource={this.state.data}//数据
                            bordered
                            scroll={{ x: 1400 }}
                        />
                        <div className="space-default"></div>
                        <div className="search-paging">
                            <Row justify="end" align="middle" type="flex">
                                <Col span={24} className='search-paging-control'>
                                    <Pagination showSizeChanger
                                        current={this.state.pagingSearch.currentPage}
                                        defaultPageSize={this.state.pagingSearch.pageSize}      pageSizeOptions = {['10','20','30','50','100','200']}
                                        // defaultPageSize={10}
                                        onShowSizeChange={this.onShowSizeChange}
                                        onChange={this.onPageIndexChange}
                                        showTotal={(total) => { return `共${total}条数据`; }}
                                        total={this.state.totalRecord} />
                                </Col>
                            </Row>
                        </div>
                    </div>
                </div>);
        return block_content;
    }
}
//表单组件 封装
const WrappedUserSearch = Form.create()(UserSearch);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    let { currentUser } = state.auth;
    return { Dictionarys, currentUser };
};

function mapDispatchToProps(dispatch) {
    return {
        //基本字典接口
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
        //各业务接口
        postSearchRecruitUser: bindActionCreators(postSearchRecruitUser, dispatch),
        addFProductPricePriceApply: bindActionCreators(addFProductPricePriceApply, dispatch),
        updateFProductPricePriceApply: bindActionCreators(updateFProductPricePriceApply, dispatch),
        LargeAreaDepartmentalDropDown: bindActionCreators(LargeAreaDepartmentalDropDown, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedUserSearch);
