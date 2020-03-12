//标准组件环境
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Divider, Checkbox, Modal } from 'antd';
const FormItem = Form.Item;
const CheckboxGroup = Checkbox.Group;
//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import { searchFormItemLayout, searchFormItemLayout24, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
//数据转字典标题
import { getDictionaryTitle, timestampToTime, formatMoney } from '@/utils';

//业务接口方法引入
import { getProductList, addProductInfo, editProductInfo, deleteProductInfo, getBindProductInfo, getCourseProductInfo } from '@/actions/product';
import { getClassList, getItemListByUser, productCopy } from '@/actions/base';
//业务数据视图（增、删、改、查)
import ProductEditView from '../ProductView/edit';
import ProductView from '../ProductView/view';
import Applicable from '../ProductView/Applicable';
import CourseProductManage from '../CourseProductManage';
import BindProductManage from '../BindProductManage';
import ContentBox from '@/components/ContentBox';
import DropDownButton from '@/components/DropDownButton';
import SelectItem from '@/components/BizSelect/SelectItem';
import SelectClassType from '@/components/BizSelect/SelectClassType';



class ProductManage extends React.Component {
    constructor() {
        super();
        this.state = {
            currentDataModel: null,
            editMode: '',//Edit,Create,View,Delete
            pagingSearch: {
                currentPage: 1,
                pageSize: 10,
                categoryScope:'',
                teachMode:'',
                classTypeType:'',
                productName: '',
                classTypeId: '',
                productType: '',
                itemIds: '',
                state:'1',
                teachMode: '',
                remoteType:''
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
        this.loadBizDictionary(['dic_Status', 'dic_Allow', 'rehear_type', 'producttype', 'teachmode','remote_type','class_type_type','category_scope','teachmode']);
        //首次进入搜索，加载服务端字典项内容
        this.onSearch();
    }
    componentWillUnMount() {
    }

    //table 输出列定义
    columns = [
        {
            title: '商品名称',
            width: 250,//可预知的数据长度，请设定固定宽度
            fixed: 'left',
            render: (text, record, index) => {
                return <div className='textleft'><a onClick={() => { this.onLookView('View', record.product) }}>{record.product.productName}</a></div>
            }
        },
        {
            title: '班型类型',
            dataIndex: 'classTypeTypeName',
        },
        {
            title: '班型',
            dataIndex: 'classTypeName',
        },
        {
            title: '商品属性',
            render: (text, record, index) => {
                return getDictionaryTitle(this.state.producttype, record.product.productType);
            }
        },
        {
            title: '授课方式',
            dataIndex: 'teachMode',
            render:(text,record)=>{
                return getDictionaryTitle(this.state.teachmode,record.product.teachMode)
            }
        },
        {
            title: '科目范围',
            dataIndex: 'categoryScope',
            render:(text,record)=>{
                return getDictionaryTitle(this.state.category_scope,record.product.categoryScope)
            }
        },
        {
            title: '商品/课程数',
            dataIndex: 'courseCount',
        },
        {
            title: '参考价格',
            dataIndex: 'product.courseStandardPrice',
            render: (text, record, index) => {
              return <span>{formatMoney(record.product.courseStandardPrice)}</span>
            }
        },
        {
            title: '重听',
            render: (text, record, index) => {
                return getDictionaryTitle(this.state.dic_Allow, record.product.isRehear);
            }
        },
        {
            title: '状态',
            dataIndex: 'state',
            render: (text, record, index) => {
                return getDictionaryTitle(this.state.dic_Status, record.product.state);
            }
        },
        {
            title: '创建日期',
            render: (text, record, index) => {
                return timestampToTime(record.product.createDate, false);
            }
        },
        {
            title: '异地上课',
            dataIndex: 'remoteType',
            render: (text, record, index) => {
                return record.product.remoteType==1?'全国': record.product.remoteType==2?'本省':''
            }
        },
        {
            title: '适用分部数',
            dataIndex: 'createUid',
            render:(text,record)=>{
                return record.product.createUid == 0? '全部' : record.product.createUid
            }
        },
        {
            title: '操作',
            width: 120,//可预知的数据长度，请设定固定宽度
            fixed: 'right',
            key: 'action',
            render: (text, record) => {
                record.product.itemIds = (record.itemIds || '').toString()
                if (record.hasPrice === true) {
                    return <DropDownButton>
                        <Button onClick={() => { this.onLookView('Edit2', record.product) }}>编辑</Button>
                        <Button onClick={() => { this.onCopy(record.product.productId) }}>复制</Button>
                        <Button onClick={() => { this.onLookView('View', record.product) }}>查看</Button>
                        <Button onClick={() => { this.onLookView('Applicable', record.product) }}>适用分部</Button>
                    </DropDownButton>
                }
                return <DropDownButton>
                    <Button onClick={() => { this.onLookView('Edit', record.product) }}>编辑</Button>
                    {/* 捆绑商品还没有被定价时才可以修改 */}
                    {(!record.hasPrice && record.product.productType == 1) && <Button onClick={() => { this.onLookView('BindProductManage', record) }}>商品</Button>}
                    {record.product.productType == 2 && <Button onClick={() => { this.onLookView('CourseProductManage', record) }}>课程</Button>}
                    <Button onClick={() => { this.onCopy(record.product.productId) }}>复制</Button>
                    <Button onClick={() => { this.onLookView('View', record.product) }}>查看</Button>
                        <Button onClick={() => { this.onLookView('Applicable', record.product) }}>适用分部</Button>
                </DropDownButton>
            }

        }];

    onCopy = (productId) => {
        Modal.confirm({
            title: '是否复制此商品?',
            content: '点击确认复制此商品!否则点击取消！',
            onOk: () => {
                let params = { productId: productId }
                this.props.productCopy(params).payload.promise.then((response) => {
                    let data = response.payload.data;
                    if (data.state != 'success') {
                        this.setState({ loading: false })
                        message.error(data.message);
                    }
                    else {
                        message.success('复制成功！');
                        this.onSearch();
                    }
                })
            }
        })
    }
    //检索数据
    fetch = (params = {}) => {
        this.setState({ loading: true });
        var condition = params || this.state.pagingSearch;
        this.props.getProductList(condition).payload.promise.then((response) => {
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
        if (op === 'Edit' || op === 'Edit2') {
            if (item.productType == 1) {
                this.props.getBindProductInfo(item.productId).payload.promise.then((response) => {
                    let data = response.payload.data;
                    if (data.result === false) {
                        message.error(data.message);
                    }
                    else {
                        let product = { ...item, ...data.data, ...data.data.product };//合并商品数据
                        product.itemIds = data.data.itemIds;
                        this.setState({
                            editMode: op,//编辑模式
                            currentDataModel: product,//编辑对象
                        })
                    }
                })
            }
            else {
                this.props.getCourseProductInfo(item.productId).payload.promise.then((response) => {
                    let data = response.payload.data;
                    if (data.result === false) {
                        message.error(data.message);
                    }
                    else {
                        let product = { ...item, ...data.data, ...data.data.product };//合并商品数据
                        product.itemIds = data.data.itemIds;
                        this.setState({
                            editMode: op,//编辑模式
                            currentDataModel: product,//编辑对象
                        })
                    }
                })
            }
        }
        else {
            this.setState({
                editMode: op,//编辑模式
                currentDataModel: item,//编辑对象
            });
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
                    //提交
                    var params = {
                        productName: dataModel.productName,
                        productType: dataModel.productType,
                        classTypeId: dataModel.classTypeId,
                        itemIds: dataModel.productType == '1' ? dataModel.itemIds.join(',') : dataModel.itemIds,
                        courseCategoryId: dataModel.courseCategoryId,
                        teachMode: dataModel.teachMode,
                        isRehear: dataModel.isRehear,
                        onlineCourseActiveType: dataModel.onlineCourseActiveType,
                        onlineCourseDays: dataModel.onlineCourseDays,
                        remark: dataModel.remark,
                        state: dataModel.state,
                        remoteType: dataModel.remoteType,
                        categoryScope: dataModel.categoryScope,
                    }

                    if(dataModel.productType == '2'){
                        params.courseStandardPrice = dataModel.courseStandardPrice;
                        params.classStandardHour = dataModel.classStandardHour;
                    }

                    this.props.addProductInfo(params).payload.promise.then((response) => {
                        let data = response.payload.data;
                        if (data.result === false) {
                            message.error(data.message, 3);
                        }
                        else {
                            this.onSearch();
                            //进入管理页
                            this.onLookView("Manage", null);
                        }
                    })
                    break;
                case "Edit":
                case "Edit2":
                    //提交
                    var itemIds = '';

                    if(typeof(dataModel.itemIds) == 'string'){
                        itemIds = dataModel.itemIds;
                    }else{
                        itemIds = dataModel.itemIds.join(',');
                    }

                    var params = {
                        productId: dataModel.productId,
                        productName: dataModel.productName,
                        productType: dataModel.productType,
                        classTypeId: dataModel.classTypeId,
                        itemIds: itemIds,
                        courseCategoryId: dataModel.courseCategoryId,
                        teachMode: dataModel.teachMode,
                        isRehear: dataModel.isRehear,
                        onlineCourseActiveType: dataModel.onlineCourseActiveType,
                        onlineCourseDays: dataModel.onlineCourseDays,
                        remark: dataModel.remark,
                        state: dataModel.state,
                        remoteType: dataModel.remoteType,
                        categoryScope: dataModel.categoryScope,
                    }

                    if(dataModel.productType == '2'){
                        params.courseStandardPrice = dataModel.courseStandardPrice;
                        params.classStandardHour = dataModel.classStandardHour;
                    }

                    this.props.editProductInfo(params).payload.promise.then((response) => {
                        let data = response.payload.data;
                        if (data.result === false) {
                            message.error(data.message, 3);
                        }
                        else {
                            this.onSearch();
                            //进入管理页
                            this.onLookView("Manage", null);
                        }
                    })
                    break;
                default://其他模式返回时候处理
                    this.onSearch();
                    //进入管理页
                    this.onLookView("Manage", null);
                    break;
            }
        }
    }
    onBatchDelete = () => {
        Modal.confirm({
            title: '是否删除所选商品吗?',
            content: '请确认',
            onOk: () => {
                this.props.deleteProductInfo(this.state.UserSelecteds.join(',')).payload.promise.then((response) => {
                    let data = response.payload.data;
                    if (data.result === false) {
                        message.error(data.message);
                    }
                    else {
                        this.setState({ UserSelecteds: [] })
                        this.onSearch();
                    }
                })
            },
            onCancel: () => {
                console.log('Cancel');
            },
        });

    }
    //渲染，根据模式不同控制不同输出
    render() { 
        const { getFieldDecorator } = this.props.form;
        let block_content = <div></div> 
        switch (this.state.editMode) {
            case 'Applicable':
                block_content = <Applicable viewCallback={this.onViewCallback} {...this.state} />
            break;
            case "View":
                block_content = <ProductView viewCallback={this.onViewCallback} {...this.state} />
                break;
            case "Create":
            case "Edit":
            case "Edit2":
            case "Delete":
                block_content = <ProductEditView viewCallback={this.onViewCallback} {...this.state} />
                break;
            case "BindProductManage":
                block_content = <BindProductManage viewCallback={this.onViewCallback} currentDataModel={this.state.currentDataModel} editMode={'Manage'} />
                break;
            case "CourseProductManage":
                block_content = <CourseProductManage viewCallback={this.onViewCallback} currentDataModel={this.state.currentDataModel} editMode={'Edit'} />
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
                        disabled: record.hasPrice === true, // Column configuration not to be checked                        
                    }),
                }

                let extendButtons = [];
                extendButtons.push(<Button onClick={() => { this.onLookView('Create', { itemIds: '', productType: 1, state: 1 }) }} icon="plus" className="button_dark">捆绑商品</Button>);
                extendButtons.push(<Button onClick={() => { this.onLookView('Create', { itemIds: '', productType: 2, state: 1 }) }} icon="plus" className="button_dark">课程商品</Button>);
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
                                            <SelectClassType hideAll={false} />
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
                                                <Input placeholder="请输入商品名称" />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12} >
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="状态"
                                        >
                                            {getFieldDecorator('state', { initialValue: this.state.pagingSearch.state })(
                                                <Select>
                                                    <Option value="">全部</Option>
                                                    {this.state.dic_Status.map((item, index) => {
                                                        return <Option value={item.value} key={index}>{item.title}</Option>
                                                    })}
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12} >
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="异地上课"
                                        >
                                            {getFieldDecorator('remoteType', { 
                                                initialValue: this.state.pagingSearch.remoteType,
                                             })(
                                                <Select>
                                                    <Option value="">全部</Option>
                                                    {this.state.remote_type.map((item, index) => {   
                                                        return <Option value={item.value} key={index}>{item.title}</Option>
                                                    })}
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12} >
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="班型类型"
                                        >
                                            {getFieldDecorator('classTypeType', { initialValue: this.state.pagingSearch.classTypeType })(
                                                <Select>
                                                    <Option value="">全部</Option>
                                                    {this.state.class_type_type.map((item, index) => {
                                                        return <Option value={item.value} key={index}>{item.title}</Option>
                                                    })}
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12} >
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="授课方式"
                                        >
                                            {getFieldDecorator('teachMode', { initialValue: this.state.pagingSearch.teachMode })(
                                                <Select>
                                                    <Option value="">全部</Option>
                                                    { this.state.teachmode.map((item, index) => {  
                                                        return <Option value={item.value} key={index}>{item.title}</Option>
                                                    })}
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col> 
                                    <Col span={12} >
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="科目范围"
                                        >
                                            {getFieldDecorator('categoryScope', { initialValue: this.state.pagingSearch.categoryScope })(
                                                <Select>
                                                    <Option value="">全部</Option>
                                                    {this.state.category_scope.map((item, index) => {
                                                        return <Option value={item.value} key={index}>{item.title}</Option>
                                                    })}
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={24} >
                                        <FormItem
                                            {...searchFormItemLayout24}
                                            style={{ paddingRight: 18 }}
                                            label="相关项目"
                                        >
                                            {getFieldDecorator('itemIds', {
                                                initialValue: this.state.pagingSearch.itemIds,
                                            })(

                                                <SelectItem showCheckBox={true} scope='my' hideAll={false} />
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
                            rowKey={(record) => record.product.productId}
                            rowSelection={rowSelection}
                            scroll={{ x: 1800 }}
                        />
                        <div className="space-default"></div>
                        <div className="search-paging">
                            <Row justify="end" align="middle" type="flex">
                                <Col span={6}>
                                    {this.state.UserSelecteds.length > 0 ?
                                        <Button onClick={this.onBatchDelete} icon="delete">删除</Button> :
                                        <Button disabled icon="delete">删除</Button>
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
                </div>);
                break;
        }
        return block_content;
    }
}
//表单组件 封装
const WrappedProductManage = Form.create()(ProductManage);

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
        //各业务接口
        getItemListByUser: bindActionCreators(getItemListByUser, dispatch),
        getProductList: bindActionCreators(getProductList, dispatch),
        getClassList: bindActionCreators(getClassList, dispatch),
        addProductInfo: bindActionCreators(addProductInfo, dispatch),
        editProductInfo: bindActionCreators(editProductInfo, dispatch),
        deleteProductInfo: bindActionCreators(deleteProductInfo, dispatch),

        getBindProductInfo: bindActionCreators(getBindProductInfo, dispatch),
        getCourseProductInfo: bindActionCreators(getCourseProductInfo, dispatch),
        productCopy: bindActionCreators(productCopy, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedProductManage);
