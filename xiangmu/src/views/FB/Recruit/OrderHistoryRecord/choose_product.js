//选择商品
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Divider, Checkbox } from 'antd';
const FormItem = Form.Item;
const CheckboxGroup = Checkbox.Group;
//组件实例模板方法引入
import { searchFormItemLayout,searchFormItemLayout24, loadBizDictionary, onSearch
  , onPageIndexChange, onShowSizeChange, onToggleSearchOption
  , renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
//数据转字典标题
import { getDictionaryTitle, timestampToTime, formatMoney } from '@/utils';

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//业务接口方法引入
import { getProductList, addProductInfo, editProductInfo, deleteProductInfo, getBindProductInfo, getCourseProductInfo } from '@/actions/product';
import { getClassList, getItemListByUser } from '@/actions/base';
import { queryProductPriceForOrder, productForOrderByRecruitBatchId } from '@/actions/recruit';
import ProductView from '@/components/ProductDetail/view'

import ContentBox from '@/components/ContentBox';

class ChooseProduct extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentDataModel: null,
            editMode: '',//Edit,Create,View,Delete
            pagingSearch: {
                currentPage: 1,
                pageSize: 10,

                productName: '',
                classTypeId: '',
                productType: '',
                itemIds: '',
                orgId: props.partnerId,
                partnerClassTypeId: props.partnerClassTypeId,
                //partnerInfo: props.partnerInfo,
                payeeType: props.payeeType, //个人订单会直接传入 收费方为中博教育
            },
            data: [],
            dic_ClassTypes: [],//班型
            dic_MyItems: [],//我的项目
            totalRecord: 0,
            loading: false,
            UserSelecteds: [],//用户选择
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
        this.loadBizDictionary(['dic_Status', 'dic_Allow', 'rehear_type', 'producttype', 'teachmode']);
        //载入班型列表
        this.fetchClassTypeList();
        //载入我负责的项目列表
        this.fetchMyItemList();
        //首次进入搜索，加载服务端字典项内容
        this.onSearch();
    }
    componentWillUnMount() {
    }

    //table 输出列定义
    columns = [
        {
            title: '班型',
            dataIndex: 'classTypeName',
              width: 160,//可预知的数据长度，请设定固定宽度
        },
        {
            title: '商品名称',
            
            dataIndex: 'productName',
            render: (text, record, index) => {
                return <div><a onClick={() => { this.onLookView('ProductView', record) }}>{record.productName}</a></div>
            }
        },
        {
            title: '商品属性',
            render: (text, record, index) => {
                return getDictionaryTitle(this.state.producttype, record.productType);
            }
        },
        {
            title: '商品/课程数',
            dataIndex: 'courseCount',
        },
        {
            title: '分期数',
            dataIndex: 'terms',
            render: (text, record, index) => {
                return <span>{ record.terms?record.terms:1 }</span>;
            }
        },
        {
            title: '重听',
            render: (value, record) => {
              return getDictionaryTitle(this.state.dic_Allow, record.isRehear.toString())
            }
        },
        {
            title: '价格（¥）',
            dataIndex: 'productTotalPrice',
            width: 120,//可预知的数据长度，请设定固定宽度
            render: value => <span>{formatMoney(value)}</span>
        }];


    //检索数据
    fetch = (params = {}) => {
        this.setState({ loading: true });
        var condition = params || this.state.pagingSearch;
        condition.orgId = this.props.partnerId;
        condition.productIds = this.props.choosedProductIds;
        condition.orderCreateDate = this.props.createDate;
        if(typeof(condition.itemIds) == "string"){

        }else {
          condition.itemIds = condition.itemIds.join(',');
        }
        // this.props.queryProductPriceForOrder(condition).payload.promise.then((response) => {
        //     let data = response.payload.data;
        //     if (data.result === false) {
        //         this.setState({ loading: false })
        //         message.error(data.message, 3);
        //     }
        //     else {
        //         data.data.map(i => {
        //           i.key = i.productId
        //         });
        //         this.setState({ pagingSearch: condition, ...data, loading: false })
        //     }
        // })

        this.props.productForOrderByRecruitBatchId(condition).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.result === false) {
                this.setState({ loading: false })
                message.error(data.message, 3);
            }
            else {
                data.data.map(i => {
                    //   i.key = i.productId
                    i.key = i.productPriceId
                });
                this.setState({ pagingSearch: condition, ...data, loading: false })
            }
        })
    }
    //检索我的项目数据列表
    fetchMyItemList = (params = {}) => {
        this.props.getItemListByUser(this.props.userId).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'success') {
                var list = [];
                data.data.map(i => {
                    list.push({
                        value: i.itemId.toString(),
                        title: i.itemName,
                    })
                })
                this.setState({ dic_MyItems: list })
            }
            else {
                message.error(data.message);
            }
        })

    };

    //检索班型列表数据
    fetchClassTypeList = (params = {}) => {
        var condition = { pageSize: 999, currentPage: 1, state: 1 };
        this.props.getClassList(condition).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.result === false) {
                message.error(data.message, 3);
            }
            else {
                this.setState({
                    dic_ClassTypes: data.data.map((a) => {
                        return { title: a.classTypeName, value: a.classTypeId.toString(), itemIds: a.itemIds, itemNames: a.itemName }
                    })
                })
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
    onBatchAdd = () => {
      var isCanSubmit = true;
      if(this.state.UserSelecteds.length){
        var list = [];
        this.state.UserSelecteds.map(id => {
          this.state.data.map(item => {
            // if(item.productId == id){
            //   list.push(item);
            // }
            if(item.productPriceId == id){
                list.push(item);
            }
          })
        })

        //判断是否为同一个商品
        if(this.props.partnerClassTypeId){
            for(var i=0; i<list.length; i++){
                var productLen = list.filter(a => { return a.productId == list[i].productId }).length;
                if(productLen > 1){
                    message.error("已选商品存在重复,请确认后重新选择！");
                    return;
                }
            }
        }

        var choosedPayeeType = "";
        var payeeList = [];
        //判断收费方是否是同一个
        if(this.props.partnerInfo){
          //方向班 业余班
          (this.props.partnerInfo.payeeTypeLst || []).map(item => {
            var isExist = false;
            for(var i = 0; i < payeeList.length; i++){
              if(payeeList.itemId == item.itemId && payeeList.payeeType == item.payeeType){
                isExist = true;
                break;
              }
            }
            if(item.partnerClassType == this.props.partnerClassTypeId){
              payeeList.push({ itemId: item.itemId, payeeType: item.payeeType })
            }
          })
          if(this.props.choosedProductList.length){
            for(var i = 0; i < this.props.choosedProductList.length; i++){
              var p = this.props.choosedProductList[i];
              if(!p.itemIds){
                continue;
              }
                p.itemIds.split(',').map(id => {
                  for(var j = 0; j < payeeList.length; j++){
                    if(id == payeeList[j].itemId){
                      if(!choosedPayeeType){
                        choosedPayeeType = payeeList[j].payeeType;
                      }else{
                        if(payeeList[j].payeeType != choosedPayeeType){
                          message.error("已选商品有多个收费方，所以无法再添加新商品")
                          isCanSubmit = false;
                          return;
                        }
                      }
                    }
                  }
                })
            }
            for(var i = 0; i < list.length; i++){
              if(!list[i].itemIds){
                continue;
              }
              list[i].itemIds.split(',').map(id => {
                for(var j = 0; j < payeeList.length; j++){
                  if(id == payeeList[j].itemId){
                    if(payeeList[j].payeeType != choosedPayeeType){
                      message.error("所选商品与已选商品的收费方不一致，请重新选择！")
                      isCanSubmit = false;
                      return;
                    }
                  }
                }
              })
            }
          }else {
            for(var i = 0; i < list.length; i++){
              if(!list[i].itemIds){
                continue;
              }
              list[i].itemIds.split(',').map(id => {
                for(var j = 0; j < payeeList.length; j++){
                  if(id == payeeList[j].itemId){
                    if(!choosedPayeeType){
                      choosedPayeeType = payeeList[j].payeeType;
                    }else{
                      if(payeeList[j].payeeType != choosedPayeeType){
                        message.error("新增商品存在多个收费方，所以无法再添加！")
                        isCanSubmit = false;
                        return;
                      }
                    }
                  }
                }
              })
            }
          }

          if(isCanSubmit){
            if(list && choosedPayeeType){
              this.props.onCallback(list, choosedPayeeType);
            }else {
              message.error("所选商品对应项目在大客户对应项目下没有收费方");
            }
          }
        }else if(this.props.payeeType){
          //个人版  payeeType == 1 默认中博教育，不用也没法判断商品的收费方
          if(list){
            this.props.onCallback(list, this.props.payeeType);
          }
        }else {
          message.error("没有选大客户或没有设置收费方");
        }

      }
    }
    onViewCallback = (dataModel) => {
        this.setState({ editMode: 'Manage' })
    }
    //渲染，根据模式不同控制不同输出
    render() {
        const { getFieldDecorator } = this.props.form;
        let block_content = <div></div>

        switch (this.state.editMode) {
            case 'ProductView':
              block_content = <ProductView
                viewCallback={this.onViewCallback}
                editMode={'View'}
                currentDataModel={this.state.currentDataModel} />
              break;

            default:
            //除查询外，其他扩展按钮数组
            var rowSelection = {
                selectedRowKeys: this.state.UserSelecteds,
                onChange: (selectedRowKeys, selectedRows) => {
                    //console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
                    this.setState({ UserSelecteds: selectedRowKeys })
                },
                getCheckboxProps: record => ({
                    //disabled: record.name === 'Disabled User', // Column configuration not to be checked
                    name: record.orgName,
                }),
            }

            var extendButtons = []
            block_content = (<div>
                {/* 搜索表单 */}
                <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
                    {!this.state.seachOptionsCollapsed &&
                        <Form
                            className="search-form"
                        >
                            <Row justify="center" gutter={24} align="middle" type="flex">
                                <Col span={12} >
                                    <FormItem
                                        {...searchFormItemLayout}
                                        label="班型"
                                    > {getFieldDecorator('classTypeId', { initialValue: this.state.pagingSearch.classTypeId })(
                                        <Select>
                                            <Option value="">全部</Option>
                                            {this.state.dic_ClassTypes.map((item, index) => {
                                                return <Option value={item.value} key={index}>{item.title}</Option>
                                            })}
                                        </Select>
                                    )}

                                    </FormItem>
                                </Col>
                                <Col span={12} >
                                    <FormItem
                                        {...searchFormItemLayout}
                                        label="商品属性"
                                    > {getFieldDecorator('productType', { initialValue: this.state.pagingSearch.productType })(
                                        <Select>
                                            <Option value="">全部</Option>
                                            {this.state.producttype.map((item, index) => {
                                                return <Option value={item.value} key={index}>{item.title}</Option>
                                            })}
                                        </Select>
                                    )}

                                    </FormItem>
                                </Col>
                                <Col span={12} >
                                    <FormItem
                                        {...searchFormItemLayout}
                                        label="商品名称"
                                    >
                                        {getFieldDecorator('productName', { initialValue: this.state.pagingSearch.productName })(
                                            <Input placeholder="商品名称" />
                                        )}
                                    </FormItem>
                                </Col>
                                <Col span={12} >
                                </Col>
                                <Col span={24} >
                                    <FormItem
                                        {...searchFormItemLayout24}
                                        style={{ paddingRight: 18 }}
                                        label="相关项目"
                                    >
                                        {getFieldDecorator('itemIds', {
                                            initialValue: '',
                                        })(
                                            <CheckboxGroup>
                                                {
                                                    this.state.dic_MyItems.map((item, index) => {
                                                        return <Checkbox value={item.value}>{item.title}</Checkbox>
                                                    })
                                                }
                                            </CheckboxGroup>
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
                        rowSelection={rowSelection}

                    />
                    <div className="space-default"></div>
                    <div className="search-paging">
                        <Row justify="end" align="middle" type="flex">
                            <Col span={6}>
                                {this.state.UserSelecteds.length > 0 ?
                                    <Button onClick={this.onBatchAdd} icon="save">确定</Button> :
                                    <Button disabled icon="save">确定</Button>
                                }
                            </Col>
                            <Col span={18} className={'search-paging-control'}>
                                <Pagination showSizeChanger
                                    current={this.state.pagingSearch.currentPage}
                                    defaultPageSize={this.state.pagingSearch.PageSize}
                                    onShowSizeChange={this.onShowSizeChange}
                                    onChange={this.onPageIndexChange}
                                    showTotal={(total) => { return `共${total}条数据`; }}
                                    total={this.state.totalRecord} />
                            </Col>
                        </Row>
                    </div>
                </div>
            </div>)
            break;

        }
        
            
        return block_content;
    }
}
//表单组件 封装
const WrappedProductManage = Form.create()(ChooseProduct);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    let { userId } = state.auth.currentUser.user
    return { Dictionarys, userId };
};

function mapDispatchToProps(dispatch) {
    return {
        //基本字典接口
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
        queryProductPriceForOrder: bindActionCreators(queryProductPriceForOrder, dispatch),
        productForOrderByRecruitBatchId: bindActionCreators(productForOrderByRecruitBatchId, dispatch),

        //各业务接口
        getItemListByUser: bindActionCreators(getItemListByUser, dispatch),
        getProductList: bindActionCreators(getProductList, dispatch),
        getClassList: bindActionCreators(getClassList, dispatch),
        addProductInfo: bindActionCreators(addProductInfo, dispatch),
        editProductInfo: bindActionCreators(editProductInfo, dispatch),
        deleteProductInfo: bindActionCreators(deleteProductInfo, dispatch),
        getBindProductInfo: bindActionCreators(getBindProductInfo, dispatch),
        getCourseProductInfo: bindActionCreators(getCourseProductInfo, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedProductManage);
