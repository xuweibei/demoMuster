import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Tree, Card, InputNumber, Radio } from 'antd';
const RadioGroup = Radio.Group;

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import { searchFormItemLayout, searchFormItemLayout24, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';


import { getDictionaryTitle, getViewEditModeTitle, dataBind, timestampToTime, split } from '@/utils';
import { getBindProductInfo, getCourseProductInfo } from '@/actions/product';
import ContentBox from '@/components/ContentBox';

import CourseProductView from './courseView';
const FormItem = Form.Item;
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
class ProductView extends React.Component {
    constructor(props) {
        super(props)
        //扩展方法用于本组件实例
        this.loadBizDictionary = loadBizDictionary.bind(this);

        this.state = {
            dataModel: props.currentDataModel,//数据模型
            editMode: props.editMode,//编辑模式
            loading: true,
            data: [],
        };
    }

    componentWillMount() {
        //载入需要的字典项
        this.loadBizDictionary(['dic_Status', 'dic_YesNo', 'dic_Allow', 'rehear_type', 'producttype', 'teachmode','category_scope']);

        //动态根据商品类型加载数据
        if (this.state.dataModel.productType == 1) {
            this.props.getBindProductInfo(this.state.dataModel.productId).payload.promise.then((response) => {
                let data = response.payload.data;
                if (data.result === false) {
                    this.setState({ loading: false })
                    message.error(data.message);
                }
                else {
                    let product = data.data.product;//合并商品数据
                    product = { ...data.data, ...product };
                    this.setState({
                        loading: false,
                        dataModel: product,
                        data: data.data.productVoLst || [],
                    })
                }
            })
        }
        else {
            this.props.getCourseProductInfo(this.state.dataModel.productId).payload.promise.then((response) => {
                let data = response.payload.data;
                if (data.result === false) {
                    this.setState({ loading: false })
                    message.error(data.message);
                }
                else {
                    let product = data.data.product;//合并商品数据
                    product = { ...data.data, ...product };
                    this.setState({
                        loading: false,
                        dataModel: product,
                        data: data.data.courseLst || [],
                    })
                }
            })
        }
    }
    onCancel = () => {
        this.props.viewCallback();
    }

    //标题
    getTitle() {
        return '商品详细信息'
    }

    //表单按钮处理
    renderBtnControl() {
        if (this.props.editMode != 'View') {
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

    //多种模式视图处理
    renderEditModeOfView() {
        console.log(this.state.dataModel)
        let block_content = <div></div>
        const { getFieldDecorator } = this.props.form;
        switch (this.state.editMode) {
            case "CourseProductView":
                block_content = <CourseProductView
                    currentDataModel={this.state.currentDataModel_CourseProduct}
                    viewCallback={() => {
                        this.setState({ editMode: 'View', currentDataModel_CourseProduct: null });
                    }}
                    editMode="View"
                />
                break;
            case "View":
                {
                    let columns = [];
                    //table 输出列定义
                    if (this.state.dataModel.productType == 1) {
                        columns = [
                            {
                                title: '商品名称',
                                render: (text, record, index) => {
                                    return <a onClick={() => {
                                        this.setState({ currentDataModel_CourseProduct: record.product, editMode: 'CourseProductView' })
                                    }}>{record.product.productName}</a>
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
                                title: '授课方式',
                                render: (text, record, index) => {
                                    return getDictionaryTitle(this.state.teachmode, record.product.teachMode);
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
                    }
                    else {
                        columns = [
                            {
                                title: '课程名称	',
                                dataIndex: 'courseName',
                            },
                            {
                                title: '授课方式',
                                render: (text, record, index) => {
                                    return getDictionaryTitle(this.state.teachmode, record.teachMode);
                                }
                            }];
                    }

                    block_content = (
                        <div style={{ width: '90%' }}>
                            <Form >
                                <Row gutter={24}>
                                    <Col span={12}>
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="商品名称"
                                        >
                                            {this.state.dataModel.productName}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="商品属性"
                                        >
                                            {getDictionaryTitle(this.state.producttype, this.state.dataModel.productType)}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="班型"
                                        >
                                            {this.state.dataModel.classTypeName}
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
                                    <Col span={12}>
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="所属项目"
                                        >
                                            {this.state.dataModel.itemName}
                                        </FormItem>
                                    </Col>

                                    {this.state.dataModel.productType == 2 && <Col span={12}>
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="所属科目"
                                        >
                                            {this.state.dataModel.courseCategryName}
                                        </FormItem>
                                    </Col>
                                    }
                                    {this.state.dataModel.productType == 2 && <Col span={12}>
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="授课方式"
                                        >
                                            {getDictionaryTitle(this.state.teachmode, this.state.dataModel.teachMode)}
                                        </FormItem>
                                    </Col>
                                    }
                                    {this.state.dataModel.productType == 2 &&this.state.dataModel.teachMode==2 && <Col span={12}>
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="网络激活方式"
                                        >
                                             {this.state.dataModel.onlineCourseActiveType?(this.state.dataModel.onlineCourseActiveType==1?'按课程商品':'按课程'):''}
                                        </FormItem>
                                    </Col>
                                    }
                                    <Col span={12}>
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="重听"
                                        >
                                            {getDictionaryTitle(this.state.dic_Allow, this.state.dataModel.isRehear)}
                                        </FormItem>
                                    </Col>
                                    {(false && this.state.dataModel.productType == 2 && this.state.dataModel.teachMode == 2) && <Col span={12}>
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="网课激活方式"
                                        >
                                            {getDictionaryTitle(this.state.rehear_type, this.state.dataModel.onlineCourseActiveType)}
                                        </FormItem>
                                    </Col>
                                    }
                                    {(this.state.dataModel.productType == 2 && this.state.dataModel.teachMode == 2) && <Col span={12}>
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="网课有效天数"
                                        >
                                            {this.state.dataModel.onlineCourseDays}
                                        </FormItem>
                                    </Col>
                                    }
                                    {this.state.dataModel.productType == 2 && <Col span={12}>
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="参考价格"
                                        >
                                            {this.state.dataModel.courseStandardPrice}
                                        </FormItem>
                                    </Col>
                                    }
                                    {this.state.dataModel.productType == 2 && <Col span={12}>
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="参考课时"
                                        >
                                            {this.state.dataModel.classStandardHour}
                                        </FormItem>
                                    </Col>
                                    }
                                    <Col span={12}>
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="状态"
                                        >
                                            {getDictionaryTitle(this.state.dic_Status, this.state.dataModel.state)}
                                        </FormItem>
                                    </Col>
                                    <Col span={24}>
                                        <FormItem
                                            {...searchFormItemLayout24}
                                            style={{ paddingRight: 18 }}

                                            label="说明"
                                        >
                                            {this.state.dataModel.remark}
                                        </FormItem>
                                    </Col>
                                </Row>
                            </Form>
                            {/* 内容分割线 */}
                            <div className="space-default"></div>
                            {/* 数据表格 */}
                            <div className="search-result-list">
                                <Table columns={columns} //列定义
                                    loading={this.state.loading}
                                    pagination={false}
                                    dataSource={this.state.data}//数据
                                    bordered

                                />
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
        let block_editModeView = this.renderEditModeOfView();
        if (this.state.editMode == 'View') {

            return (
                <ContentBox titleName={title} bottomButton={this.renderBtnControl()}>
                    <div className="dv_split"></div>
                    {block_editModeView}
                    <div className="dv_split"></div>
                </ContentBox>
                // <Card title={title} extra={<a onClick={() => { this.onCancel() }}><Icon type="rollback" />返回列表</a>}>
                //     {block_editModeView}
                // </Card>

            );
        }
        else {
            return block_editModeView;
        }
    }
}

const WrappedProductView = Form.create()(ProductView);

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
        getCourseProductInfo: bindActionCreators(getCourseProductInfo, dispatch),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedProductView);
