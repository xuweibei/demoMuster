/* 
*/
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import {
  message, Modal, Form, Row, Col, Input, Select, Button, Icon,
  Table, Pagination, Divider
} from 'antd';
const FormItem = Form.Item;

import ContentBox from '@/components/ContentBox';
import FileDownloader from '@/components/FileDownloader';
import SelectItem from '@/components/BizSelect/SelectItem';
import SelectFBOrg from '@/components/BizSelect/SelectFBOrg'; 
//大客户查看详情模块
import KeyAccount from '@/components/KeyAccount';
import ProductView from '@/views/ZB/Product/ProductView/view'
import ProductPriceApplyView from './view';
import DropDownButton from '@/components/DropDownButton';

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import {
  loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange,
  searchFormItemLayout, searchFormItemLayout24,
  onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons
} from '@/utils/componentExt';
//数据转字典标题
import { getDictionaryTitle, timestampToTime, split, formatMoney } from '@/utils';

import {
  IntentionalCollegesUniversitiesList, partnerProductPriceApplyAdd, partnerProductPriceApplyUpdate, partnerProductPriceApplyBatchCopy, partnerProductPriceApplyDelete, partnerProductPriceApplyAudit, partnerProductPriceApplyBatchSubmit
} from '@/actions/partner';
import EditablePowerPartnerTagGroup from '@/components/EditablePowerPartnerTagGroup';
import Export from './export';
class ProductPriceApplyManage extends React.Component {
  constructor() {
    super();
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
        universityName: '',
        branchId: '',
        intentionDepartment: '',
        universityLevel: '',
        universityCategory: '',
        developUserName: ''
      },
      data: [],
      partnerData: [],
      totalRecord: 0,
      loading: false,
      UserSelecteds: [],
    };
  }
  componentWillMount() {
    //载入需要的字典项: 
    this.loadBizDictionary(['dic_Status', 'product_partner_price_status', 'producttype', 'partner_class_type','parter_university_level','university_category']);
    //首次进入搜索-->由默认选择第一个招生季时触发
    this.onSearch();
  }
  componentWillUnMount() {
  }

  //班型	商品名称	商品属性	商品定价(¥)	已设分项总价(¥)	发布状态	操作
  columns = [
    {
      title: '所属省/直辖市/自治区',
      fixed: 'left',
      width: 200,
      dataIndex: 'provinceName',
    },
    {
      title: '所在城市',
      width: 180,
      dataIndex: 'cityName', 
    },
    {
      title: '所属分公司',
      width: 180,
      dataIndex: 'branchName',
    },
    {
      title: '高校名称',
      width: 180,
      dataIndex: 'intentionUniversityName',
    },
    {
      title: '合作/意向学院',
      width: 180,
      dataIndex: 'intentionDepartment',
      //自定义显示
      // render: (text, record, index) => (`${formatMoney(record.productTotalPriceApply)}`)
    },
    {
      title: '高校层次',
      width: 180,
      dataIndex: 'universityLevelName',
      //自定义显示
      // render: (text, record, index) =>(`${formatMoney(record.partnerBalancePrice)}`)
      
    },
    {
      title: '高校类别',
      width: 180,
      dataIndex: 'universityCategoryName',
    },
    {
      title: '对口专业人数规模',
      dataIndex: 'counterpartMajorNum',
    },
    {
      title: '消费能力判断',
      width: 180,
      dataIndex: 'consumeAbilityName',
    },
    {
      title: '学习能力判断',
      width: 180,
      dataIndex: 'studyAbilityName',
    },
    {
      title: '年营业额',
      width: 180,
      dataIndex: 'yearAmount',
    },
    {
      title: '开发/维护负责人',
      width: 180,
      dataIndex: 'developUserName',
    },
    {
      title: '备注',
      width: 180,
      dataIndex: 'remark',
    }, 
    {
      title: '操作',
      fixed: 'right',
      width: 120,
      key: 'action',
      render: (text, record) => (
         <DropDownButton>
          <Button onClick={() => { this.onLookView('Edit', record); }}>编辑</Button>
          <Button onClick={() => { this.onLookView('View', record); }}>查看</Button>
        </DropDownButton>
      )

    }
  ];
  //检索数据
  fetch(params = {}) {
    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch; 
    this.props.IntentionalCollegesUniversitiesList(condition).payload.promise.then((response) => {
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
    } else { 
      this.onSearch();
      this.setState({ currentDataModel: null, editMode: 'Manage' })
    }
  }
  render() { 
    let block_content = <div></div>
    switch (this.state.editMode) {
      case 'export':
        block_content = <Export
          viewCallback={this.onViewCallback}
          currentDataModel={this.state.currentDataModel} 
          {...this.state}
        />
        break;
      case 'ProductView':
        block_content = <ProductView
          viewCallback={this.onViewCallback}
          currentDataModel={this.state.currentDataModel}
          editMode={'View'}
        />
        break; 
      case 'View': 
        block_content = <KeyAccount
          viewCallback={this.onViewCallback}
          {...this.state}
        />
        break;
      case 'Edit':
        block_content = <ProductPriceApplyView
          viewCallback={this.onViewCallback}
          {...this.state}
        />
        break;
      case 'Manage':
      default:
        var rowSelection = {
          selectedRowKeys: this.state.UserSelecteds,
          onChange: (selectedRowKeys, selectedRows) => {
            this.setState({ UserSelecteds: selectedRowKeys })
          },
          getCheckboxProps: record => ({
            disabled: !(record.auditStatus == 0 || record.auditStatus == 3), // 暂存或审核未通过的可以提交审核            
          }),
        }
        const { getFieldDecorator } = this.props.form;
        let extendButtons = [];
        extendButtons.push(<Button icon='export' onClick={()=>this.setState({editMode:'export'})}>导入</Button>);
        block_content = (
          <div>
            {/* 搜索表单 */}
            <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
              {!this.state.seachOptionsCollapsed &&
                <Form className="search-form" >
                  <Row gutter={24}>
                    <Col span={12}>
                        <FormItem {...searchFormItemLayout} label="所属分公司">
                            {getFieldDecorator('branchId', {
                                initialValue: ''
                            })(
                                <SelectFBOrg scope={'my'} hideAll={false} />
                                )}
                        </FormItem>
                    </Col> 
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'高校名称'} >
                        {getFieldDecorator('universityName', { initialValue: this.state.pagingSearch.universityName })(
                          <Input placeholder="请输入高校名称" />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'合作/意向学院'} >
                        {getFieldDecorator('intentionDepartment', { initialValue: this.state.pagingSearch.intentionDepartment })(
                          <Input placeholder="请输入合作/意向学院" />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'高校层次'} >
                        {getFieldDecorator('universityLevel', { initialValue: this.state.pagingSearch.universityLevel })(
                          <Select>
                              <Option value='' key=''>全部</Option>
                              {
                                this.state.parter_university_level.map(item=>{
                                  return <Option value={item.value} >{item.title}</Option>
                                })
                              }
                              
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'高校类别'} >
                        {getFieldDecorator('universityCategory', { initialValue: this.state.pagingSearch.universityCategory })(
                          <Select>
                              <Option value='' key=''>全部</Option>
                              {
                                this.state.university_category.map(item=>{
                                  return <Option value={item.value} >{item.title}</Option>
                                })
                              }
                              
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'开发/维护负责人'} >
                        {getFieldDecorator('developUserName', { initialValue: this.state.pagingSearch.developUserName })(
                          <Input placeholder="请输入开发/维护负责人" />
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
                rowKey={record => record.productPriceApplyId}//主键
                bordered
                scroll={{ x: 2500 }}
              />
              <div className="space-default"></div>
              <div className="search-paging">
                <Row justify="space-between" align="middle" type="flex">
                  <Col span={2}>
                    <FileDownloader
                      apiUrl={'/edu/intentionUniversities/exportList'}//api下载地址
                      method={'post'}//提交方式
                      options={this.state.pagingSearch}//提交参数
                      title={'导出'}
                    >
                    </FileDownloader>
                  </Col>
                  <Col span={22} className={'search-paging-control'}> 
                    <Pagination showSizeChanger
                      current={this.state.pagingSearch.currentPage}
                      defaultPageSize={this.state.pagingSearch.pageSize}      
                      pageSizeOptions = {['10','20','30','50','100','200']}
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
const WrappedManage = Form.create()(ProductPriceApplyManage);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    //基本字典接口
    loadDictionary: bindActionCreators(loadDictionary, dispatch),

    IntentionalCollegesUniversitiesList: bindActionCreators(IntentionalCollegesUniversitiesList, dispatch),
    partnerProductPriceApplyAdd: bindActionCreators(partnerProductPriceApplyAdd, dispatch),
    partnerProductPriceApplyUpdate: bindActionCreators(partnerProductPriceApplyUpdate, dispatch),
    partnerProductPriceApplyDelete: bindActionCreators(partnerProductPriceApplyDelete, dispatch),
    partnerProductPriceApplyBatchCopy: bindActionCreators(partnerProductPriceApplyBatchCopy, dispatch),


    partnerProductPriceApplyBatchSubmit: bindActionCreators(partnerProductPriceApplyBatchSubmit, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
