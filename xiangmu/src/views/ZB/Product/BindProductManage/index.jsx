import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Tree, Card, InputNumber, Radio } from 'antd';
const RadioGroup = Radio.Group;
import { getDictionaryTitle, getViewEditModeTitle, dataBind, timestampToTime, split } from '@/utils';
import { getBindProductInfo, updateBindProductCourseIsGiveYes, updateBindProductCourseIsGiveNo, deleteBindProductCource, VerificationTeachingMethod } from '@/actions/product';
import ContentBox from '@/components/ContentBox';
import BindProductAdd from './add';
import ProductView from '../ProductView/view';

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import { searchFormItemLayout, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';


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
class BindProductManage extends React.Component {
    constructor(props) {
        super(props)
        //扩展方法用于本组件实例
        this.loadBizDictionary = loadBizDictionary.bind(this);

        this.state = {
            editMode: props.editMode || 'Manage',
            dataModel: props.currentDataModel,//数据模型
            data: [],
            UserSelecteds: [],//勾选
        };
    }

    componentWillMount() {
        //载入需要的字典项
        this.loadBizDictionary(['dic_Status', 'dic_YesNo', 'teachmode', 'dic_Allow','category_scope']);
        //检索课程商品最全数据
        this.fetchBindProductInfo(this.state.dataModel.product.productId);
    }

    //检索课程商品最全数据
    fetchBindProductInfo = (productId) => {
        this.setState({ loading: true });
        this.props.getBindProductInfo(productId).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.result === false) {
                this.setState({ loading: false })
                message.error(data.message);
            }
            else {
                this.setState({ dataModel: data.data, loading: false, data: data.data.productVoLst || [] })
            }
        })
    }
    //table 输出列定义
    columns = [
        {
            title: '商品名称',
            render: (text, record, index) => {
                return <a onClick={() => { this.onLookView('View', record.product) }}>{record.product.productName}</a>
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
            title: '科目范围',
            dataIndex: 'categoryScope',
            render:(text,record)=>{
                return getDictionaryTitle(this.state.category_scope,record.product.categoryScope)
            }
        },
        {
            title: '授课方式',
            render: (text, record, index) => {
                return getDictionaryTitle(this.state.teachmode, record.product.teachMode);
            }
        },
        {
            title: '激活方式',
            dataIndex: 'state',
            render: (text, record, index) => {
                if(record.product.teachMode==2){
                    return record.product.onlineCourseActiveType==1?'按课程商品':'按课程'
                }
                return '--'
            }
        },
        {
            title: '重听',
            render: (text, record, index) => {
                return getDictionaryTitle(this.state.dic_Allow, record.product.isRehear.toString());
            }
        },
        {
            title: '包含科目',
            dataIndex: 'courseCategryName',
        },
        {
            title: '课程数',
            dataIndex: 'courseCount',
        },
        {
            title: '状态',
            dataIndex: 'state',
            render: (text, record, index) => {
                return getDictionaryTitle(this.state.dic_Status, record.product.state);
            }
        },
        {
            title: '是否赠送',
            render: (text, record, index) => {
                return getDictionaryTitle(this.state.dic_YesNo, record.isGive);
            }
        }];


    onCancel = () => {
        this.props.viewCallback({});//返回后，强制刷新
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

    onBatchDelete = () => { 
        Modal.confirm({
            title: '是否删除所选课程商品?',
            content: '请您确认！',
            onOk: () => {
                let arr = [];
                let num  = 0 ;  
                let productCourseIds = this.state.UserSelecteds.join(',');
                this.state.commodity.forEach(item=>{
                    if(item.product.teachMode){ 
                        arr.push(item.product.teachMode) 
                    }
                })  
                Array.from(new Set(arr)).forEach(item=>{
                    num += item;
                })   
                let condition = {
                    productId:this.state.dataModel.product.productId,
                    teachMode:num
                };
                this.props.VerificationTeachingMethod(condition).payload.promise.then((response) => {
                    let data = response.payload.data;
                    if (data.result === false) {
                        message.error(data.message);
                    }
                    else {  
                    this.props.deleteBindProductCource(productCourseIds).payload.promise.then((response) => {
                        let data = response.payload.data;
                        if (data.result === false) {
                            message.error(data.message);
                        }
                        else {
                            this.setState({ UserSelecteds: [] })
                            //检索课程商品最全数据
                            this.fetchBindProductInfo(this.state.dataModel.product.productId);
                        }
                    })
                }})
            },
            onCancel: () => {
                console.log('Cancel');
            },
        });

    }

    onBatchGiveYes = () => {
        Modal.confirm({
            title: '是否赠送所选课程商品?',
            content: '请您确认！',
            onOk: () => {
                let productCourseIds = this.state.UserSelecteds.join(',');
                this.props.updateBindProductCourseIsGiveYes(productCourseIds).payload.promise.then((response) => {
                    let data = response.payload.data;
                    if (data.result === false) {
                        message.error(data.message);
                    }
                    else {
                        this.setState({ UserSelecteds: [] })
                        //检索课程商品最全数据
                        this.fetchBindProductInfo(this.state.dataModel.product.productId);
                    }
                })
            },
            onCancel: () => {
                console.log('Cancel');
            },
        });
    }
    onBatchGiveNo = () => {
        Modal.confirm({
            title: '是否取消赠送所选课程商品?',
            content: '请您确认！',
            onOk: () => {
                let productCourseIds = this.state.UserSelecteds.join(',');
                this.props.updateBindProductCourseIsGiveNo(productCourseIds).payload.promise.then((response) => {
                    let data = response.payload.data;
                    if (data.result === false) {
                        message.error(data.message);
                    }
                    else {
                        this.setState({ UserSelecteds: [] })
                        //检索课程商品最全数据
                        this.fetchBindProductInfo(this.state.dataModel.product.productId);
                    }
                })
            },
            onCancel: () => {
                console.log('Cancel');
            },
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
            this.fetchBindProductInfo(this.state.dataModel.product.productId);
            //进入管理页
            this.onLookView("Manage", null);
        }
    }

    //多种模式视图处理
    renderEditModeOfView() {
        console.log(this.state)
        let block_content = <div></div>
        const { getFieldDecorator } = this.props.form;
        switch (this.state.editMode) {
            case "View":
                block_content = <ProductView viewCallback={this.onViewCallback} {...this.state} />
                break;
            case "Manage":
            default:
                {
                    var rowSelection = {
                        selectedRowKeys: this.state.UserSelecteds,
                        onChange: (selectedRowKeys, selectedRows) => {
                            this.setState({ UserSelecteds: selectedRowKeys,commodity:selectedRows })
                        },
                        getCheckboxProps: record => ({
                            disabled: false,    // Column configuration not to be checked
                        }),
                    };
                    block_content = (
                        <div className="block_content">
                            <Form layout="Vertical">
                                <Row gutter={24}>
                                    <Col span={12}>
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="商品名称"
                                        >
                                            {this.state.dataModel.product.productName}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="商品属性"
                                        >
                                            {'捆绑商品'}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="所属班型"
                                        >
                                            {this.state.dataModel.classTypeName}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="相关项目"
                                        >
                                            {this.state.dataModel.itemName}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="班型类型"
                                        >
                                            {this.state.dataModel.classTypeTypeName}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="科目范围"
                                        >
                                            {getDictionaryTitle(this.state.category_scope,this.state.dataModel.categoryScope) }
                                        </FormItem>
                                    </Col>
                                </Row>
                            </Form>
                            {/* 内容分割线 */}
                            <div className="space-default"></div>
                            {/* 数据表格 */}
                            <div className="search-result-list">
                                <Table columns={this.columns} //列定义
                                    loading={this.state.loading}
                                    pagination={false}
                                    dataSource={this.state.data}//数据
                                    bordered
                                    rowKey={'productCourseId'}
                                    rowSelection={rowSelection}
                                />
                                <div className="space-default"></div>
                                <div className="search-paging">
                                    <Row justify="end" align="middle" type="flex">
                                        <Col span={24}>
                                            <div className='flex-row'>
                                                {this.state.UserSelecteds.length > 0 ?
                                                    <Button style={{ marginRight: 10 }} onClick={this.onBatchDelete} icon="delete">删除</Button> :
                                                    <Button style={{ marginRight: 10 }} disabled icon="delete">删除</Button>
                                                }
                                                {this.state.UserSelecteds.length > 0 ?
                                                    <Button style={{ marginRight: 10 }} onClick={this.onBatchGiveYes} icon="pay-circle">赠送</Button> :
                                                    <Button style={{ marginRight: 10 }} disabled icon="delete">赠送</Button>
                                                }
                                                {this.state.UserSelecteds.length > 0 ?
                                                    <Button style={{ marginRight: 10 }} onClick={this.onBatchGiveNo} icon="pay-circle-o">取消赠送</Button> :
                                                    <Button style={{ marginRight: 10 }} disabled icon="delete">取消赠送</Button>
                                                }
                                                <Button style={{ marginRight: 10 }} onClick={() => { this.onLookView('AddCourseProduct') }} icon="plus">添加商品</Button>
                                                <Button style={{ marginRight: 10 }} onClick={this.onCancel} icon="rollback">返回</Button>
                                            </div>
                                        </Col>
                                    </Row>
                                </div>
                            </div>
                        </div>
                    )
                }
                break;
        }
        return block_content;
    }

    render() {
        let title = this.getTitle();
        if (this.state.editMode == 'AddCourseProduct') {
            let block_editModeView = <BindProductAdd editMode={'Edit'} currentDataModel={this.state.dataModel} viewCallback={this.onViewCallback} />
            return block_editModeView;
        }
        else {
            let block_editModeView = this.renderEditModeOfView();
            if (this.state.editMode == 'View') {
                return block_editModeView;
            }
            return (
                <ContentBox titleName={title} >
                    <div className="dv_split"></div>
                    {block_editModeView}
                    <div className="dv_split"></div>
                </ContentBox>
                // <Card title={title} extra={<a onClick={() => { this.onCancel() }}><Icon type="rollback" />返回列表</a>}>
                //     {block_editModeView}
                // </Card>

            );
        }
    }
}

const WrappedBindProductManage = Form.create()(BindProductManage);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
        //基本字典接口
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
        getBindProductInfo: bindActionCreators(getBindProductInfo, dispatch),
        updateBindProductCourseIsGiveYes: bindActionCreators(updateBindProductCourseIsGiveYes, dispatch),
        updateBindProductCourseIsGiveNo: bindActionCreators(updateBindProductCourseIsGiveNo, dispatch),
        deleteBindProductCource: bindActionCreators(deleteBindProductCource, dispatch),
        VerificationTeachingMethod: bindActionCreators(VerificationTeachingMethod, dispatch),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedBindProductManage);
