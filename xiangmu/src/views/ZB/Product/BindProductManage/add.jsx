import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Tree, Card, InputNumber, Radio } from 'antd';
const RadioGroup = Radio.Group;
import { searchPageForNotBind, getCourseCategoryListByItemIds, addBindProductCourse,VerificationTeachingMethod } from '@/actions/product';
import ContentBox from '@/components/ContentBox';
//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import { searchFormItemLayout, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
//数据转字典标题
import { getDictionaryTitle, timestampToTime, split } from '@/utils';


import ProductView from '../ProductView/view';
const FormItem = Form.Item;
const Search = Input.Search;
const TreeNode = Tree.TreeNode;
const { TextArea } = Input;
const btnformItemLayout = {
    wrapperCol: { span: 24 },
};

/*
必要属性输入
editMode [Create/Edit/View/Delete]
currentDataModel [数据模型]
viewCallback [回调]
*/
class BindProductAdd extends React.Component {
    constructor(props) {
        super(props)
        //扩展方法用于本组件实例
        this.loadBizDictionary = loadBizDictionary.bind(this);
        this.onToggleSearchOption = onToggleSearchOption.bind(this);
        this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
        this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
        this.onSearch = onSearch.bind(this);
        this.onPageIndexChange = onPageIndexChange.bind(this);
        this.onShowSizeChange = onShowSizeChange.bind(this);

        this.state = {
            dataModel: props.currentDataModel,//数据模型
            data: [],
            courseCategryList: [],
            UserSelecteds: [],//勾选
            pagingSearch: {
                currentPage: 1,
                pageSize: 10,
                productId: props.currentDataModel.product.productId,
                productName: '',
                subjectId: '',
            },
        };
    }

    componentWillMount() {
        //载入需要的字典项
        this.loadBizDictionary(['dic_Status', 'dic_YesNo', 'teachmode', 'producttype', 'dic_Allow']);

        //检索所以项目对应的全部科目
        this.fetchAllCourseCategoryList();
        //检索课程商品最全数据
        this.onSearch();
    }

    //检索所以项目对应的全部科目
    fetchAllCourseCategoryList = () => {
        if (split(this.state.dataModel.itemIds).length == 0) { return; }
        this.props.getCourseCategoryListByItemIds({ itemIds: this.state.dataModel.itemIds }).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.result === false) {
                message.error(data.message);
            }
            else {
                this.setState({
                    courseCategryList: data.data.map((item, index) => {
                        return { title: item.name, value: `${item.courseCategoryId}` };
                    })
                })
            }
        })
    }

    //检索课程商品最全数据
    fetch = (params = {}) => {
        this.setState({ loading: true });
        var condition = params || this.state.pagingSearch;
        this.props.searchPageForNotBind(condition).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.result === false) {
                this.setState({ loading: false })
                message.error(data.message);
            }
            else {
                this.setState({ loading: false, ...data })
            }
        })
    }
    //视图回调
    onBatchAdd = () => {
        let arr = [];
        let num  = 0 ;  
        let options = {
            productId: this.state.dataModel.product.productId,
            productIds: this.state.UserSelecteds.join(','),
        }  
        this.state.commodity.forEach(item=>{
            if(item.product.teachMode){ 
                arr.push(item.product.teachMode) 
            }
        })   
        if(this.props.currentDataModel.productVoLst){ 
                this.props.currentDataModel.productVoLst.forEach(item=>{ 
                if(item.product.teachMode){ 
                    arr.push(item.product.teachMode); 
                }
            }) 
        }
        Array.from(new Set(arr)).forEach(item=>{
            num += item;
        })   
        let condition = {
            productId: this.state.dataModel.product.productId,
            teachMode:num
        } 
        this.props.VerificationTeachingMethod(condition).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.result === false) {
                message.error(data.message);
            }
            else {  
                this.props.addBindProductCourse(options.productId, options.productIds).payload.promise.then((response) => {
                    let data = response.payload.data;
                    if (data.result === false) {
                        message.error(data.message, 3);
                    }
                    else {
                        this.setState({ batchAddState: true, UserSelecteds: [] });
                        message.success('批量添加成功,您可以继续添加。', 3);
                        //刷新数据
                        this.onSearch();
                    }
                })
            }
        })
       
    }

    //table 输出列定义
    columns = [
        {
            title: '商品名称',
            dataIndex: 'product.productName',
            render: (text, record, index) => {
                return <a onClick={() => { this.onLookView('View', record.product) }}>{record.product.productName}</a>
            }
        },
        {
            title: '班型',
            dataIndex: 'classTypeName',
        },
        {
            title: '授课方式',
            render: (text, record, index) => {
                return getDictionaryTitle(this.state.teachmode, record.product.teachMode);
            }
        },
        {
            title: '重听',
            render: (text, record, index) => {
                return getDictionaryTitle(this.state.dic_Allow, record.product.isRehear.toString());
            }
        },
        {
            title: '商品属性',
            render: (text, record, index) => {
                return getDictionaryTitle(this.state.producttype, record.product.productType);
            }
        },
        {
            title: '课程数',
            dataIndex: 'courseCount',
        }];


    onCancel = () => {
        this.props.viewCallback(this.state.batchAddState ? {} : null);
    }

    //标题
    getTitle() {
        let op = getViewEditModeTitle(this.props.editMode, '管理');
        return `捆绑商品${op}`;
    }

    //表单按钮处理
    renderBtnControl() {
        if (this.props.editMode != 'View' && this.props.editMode != 'Manage') {
            return <FormItem
                className='btnControl'
                {...btnformItemLayout}
            >
                <Button type="primary" loading={this.state.loading} icon="save" onClick={this.onSubmit}>{getViewEditModeTitle(this.props.editMode, '')}</Button><span className="split_button"></span><Button icon="rollback" onClick={this.onCancel} >取消</Button>
            </FormItem>
        }
        else {
            return <FormItem
                className='btnControl'
                {...btnformItemLayout}
            >
                <Button onClick={this.onCancel} icon="rollback">返回</Button>
            </FormItem>
        }
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
            //进入管理页
            this.onLookView("Manage", null);
        }
    }
    //渲染，根据模式不同控制不同输出
    render() {
        console.log(this.props)
        const { getFieldDecorator } = this.props.form;
        let block_content = <div></div>

        switch (this.state.editMode) {
            case "View":
                block_content = <ProductView viewCallback={this.onViewCallback} {...this.state} />
                break;
            default:
                //除查询外，其他扩展按钮数组
                var rowSelection = {
                    selectedRowKeys: this.state.UserSelecteds,
                    onChange: (selectedRowKeys, selectedRows) => {
                        //console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
                        this.setState({ UserSelecteds: selectedRowKeys,commodity:selectedRows })
                    },
                    getCheckboxProps: record => ({
                        //disabled: record.name === 'Disabled User', // Column configuration not to be checked
                        name: record.orgName,
                    }),
                }

                let extendButtons = [];
                extendButtons.push(<Button onClick={this.onCancel} icon="rollback" className="button_dark">返回</Button>);
                block_content = (<div>
                    {/* 搜索表单 */}
                    <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
                        {!this.state.seachOptionsCollapsed &&
                            <Form
                                className="search-form"
                            >
                                <Row gutter={24}>
                                    <Col span={12} >
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="相关项目"
                                        > {this.state.dataModel.itemName}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="科目"
                                        >
                                            {getFieldDecorator('subjectId', { initialValue: '' })(
                                                <Select>
                                                    <Option value=''>全部</Option>
                                                    {this.state.courseCategryList.map((item, index) => {
                                                        return <Option value={item.value} key={index}>{item.title}</Option>
                                                    })}
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="授课方式"
                                        >
                                            {getFieldDecorator('teachMode', {
                                                initialValue: '',
                                                rules: [{
                                                    required: false, message: '请选择授课方式!',
                                                }],
                                            })(
                                                <Select>
                                                    <Option value="">全部</Option>
                                                    {this.state.teachmode.map((item, index) => {
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
                                            {getFieldDecorator('productName', { initialValue: '' })(
                                                <Input placeholder="请输入商品名称" />
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
                            rowKey={(record) => (record.product.productId)}
                            rowSelection={rowSelection}
                        />
                        <div className="space-default"></div>
                        <div className="search-paging">
                            <Row justify="end" align="middle" type="flex">
                                <Col span={6}>
                                    {this.state.UserSelecteds.length > 0 ?
                                        <Button style={{ marginRight: 10 }} onClick={this.onBatchAdd}>确认添加</Button> :
                                        <Button style={{ marginRight: 10 }} disabled >确认添加</Button>
                                    }
                                </Col>
                                <Col span={18} className={'search-paging-control'}>
                                    <Pagination showSizeChanger
                                        current={this.state.pagingSearch.currentPage}
                                        defaultPageSize={this.state.pagingSearch.pageSize}      
                                        pageSizeOptions = {['10','20','30','50','100','200']}
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

const WrappedBindProductAdd = Form.create()(BindProductAdd);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
        //基本字典接口
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
        searchPageForNotBind: bindActionCreators(searchPageForNotBind, dispatch),
        getCourseCategoryListByItemIds: bindActionCreators(getCourseCategoryListByItemIds, dispatch),
        addBindProductCourse: bindActionCreators(addBindProductCourse, dispatch),
        VerificationTeachingMethod: bindActionCreators(VerificationTeachingMethod, dispatch),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedBindProductAdd);
