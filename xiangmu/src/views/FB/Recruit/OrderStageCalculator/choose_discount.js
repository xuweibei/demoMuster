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
import { queryProductPriceForOrder } from '@/actions/recruit';
import { queryDiscountBySingle, queryDiscountByFold } from '@/actions/recruit';

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
        this.loadBizDictionary(['dic_Status', 'dic_Allow', 'rehear_type', 'producttype', 'teachmode', 'discount_type']);
        
        //首次进入搜索，加载服务端字典项内容
        this.onSearch();
    }
    componentWillUnMount() {
    }

    //table 输出列定义
    columns = [
        {
            title: '优惠名称',
            dataIndex: 'productDiscountName',
        },{
            title: '优惠类型',
            dataIndex: 'productDiscountType',
            render: (value, record, index) => {
                return <span>{getDictionaryTitle(this.state.discount_type, value)}</span>
            }
        },{
            title: '优惠金额',
            dataIndex: 'productDiscountPrice',
            render: (value, record, index) => {
                return <span>{formatMoney(value || 0)}</span>
            }
        }
    ];


    //检索数据
    fetch = (params = {}) => {
        this.setState({ loading: true });
        var condition = params || this.state.pagingSearch;
        condition.productIds = this.props.choosedProductIds;
        condition.discountElimIds = this.props.choosedDiscountIds;
        
        this.props.queryDiscountBySingle(condition).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.result === false) {
                this.setState({ loading: false })
                message.error(data.message, 3);
            }
            else {
                
                this.setState({ pagingSearch: condition, ...data, loading: false })
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
    
        var list = [];
        this.state.UserSelecteds.map((item,index) => {
            list.push(this.state.data[item])
        })
        
        var isMutex = false;
        for(var i=0; i<list.length; i++){
            for(var j=0; j<list.length; j++){
                if(list[i].discountMutexIds){
                    if(list[i].discountMutexIds.indexOf(list[j].productDiscountId) > -1){
                        isMutex = true;
                        break;
                    }
                }
                
            }
        }

        if(isMutex){
            message.error("已选优惠存在互斥，请重新选择！");
        }

        this.props.onCallback(list);
        
    return;

      var isCanSubmit = true;
      if(this.state.UserSelecteds.length){
        var list = [];
        this.state.UserSelecteds.map(id => {
          this.state.data.map(item => {
            if(item.productId == id){
              list.push(item);
            }
          })
        })

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
    //渲染，根据模式不同控制不同输出
    render() {
        const { getFieldDecorator } = this.props.form;
        let block_content = <div></div>
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

            block_content = (<div>
                
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
                                    defaultPageSize={this.state.pagingSearch.pageSize}      pageSizeOptions = {['10','20','30','50','100','200']}
                                    onShowSizeChange={this.onShowSizeChange}
                                    onChange={this.onPageIndexChange}
                                    showTotal={(total) => { return `共${total}条数据`; }}
                                    total={this.state.totalRecord} />
                            </Col>
                        </Row>
                    </div>
                </div>
            </div>)
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

        //各业务接口
        getItemListByUser: bindActionCreators(getItemListByUser, dispatch),
        getProductList: bindActionCreators(getProductList, dispatch),
        getClassList: bindActionCreators(getClassList, dispatch),
        addProductInfo: bindActionCreators(addProductInfo, dispatch),
        editProductInfo: bindActionCreators(editProductInfo, dispatch),
        deleteProductInfo: bindActionCreators(deleteProductInfo, dispatch),
        getBindProductInfo: bindActionCreators(getBindProductInfo, dispatch),
        getCourseProductInfo: bindActionCreators(getCourseProductInfo, dispatch),
        queryDiscountBySingle: bindActionCreators(queryDiscountBySingle, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedProductManage);
