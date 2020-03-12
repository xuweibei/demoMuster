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

import { getByIdsForOrderView } from '@/actions/recruit';

import { getDictionaryTitle, getViewEditModeTitle, dataBind, timestampToTime, split, formatMoney } from '@/utils';
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
            total: 0 
        };
    }

    componentWillMount() {
        //载入需要的字典项
        this.loadBizDictionary(['dic_Status', 'dic_YesNo', 'dic_Allow', 'rehear_type', 'producttype', 'teachmode']);

        //动态根据商品类型加载数据
        this.props.getByIdsForOrderView({productPriceIds:this.props.productPriceIds}).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.result === false) {
                this.setState({ loading: false })
                message.error(data.message);
            }
            else {
                let product = data.data.productCoursePriceLst;//合并商品数据
                product = { ...data.data, ...product };
                this.setState({
                    loading: false,
                    dataModel: product,
                    data: data.data || [],
                })

                var total = 0;
                data.data.map((item) => {
                    total += item.coursePrice
                })
                total = Math.round(total*100)/100;
                this.setState({ total: total })
            }
        })
    
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
                    columns = [
                        {
                            title: '商品名称',
                            dataIndex: 'courseName',
                        },
                        {
                            title: '班型',
                            dataIndex: 'classTypeName',
                        },
                        {
                            title: '授课方式',
                            dataIndex: 'teachModeName',
                        },
                        {
                            title: '包含科目',
                            dataIndex: 'courseCategoryName',
                        },
                        {
                            title: '课程数',
                            dataIndex: 'courseCount',
                        },
                        {
                            title: '状态',
                            dataIndex: 'state',
                            render: (text, record, index) => {
                                return getDictionaryTitle(this.state.dic_Status, record.state);
                            }
                        },
                        {
                            title: '是否赠送',
                            render: (text, record, index) => {
                                return getDictionaryTitle(this.state.dic_YesNo, record.is_give);
                            }
                        },{
                            title: '标准课时',
                            dataIndex: 'classHour'
                        },{
                            title: '价格（¥）',
                            dataIndex: 'coursePrice',
                            render: (text, record, index) => {
                                return <span>{formatMoney(record.coursePrice)}</span>
                            }
                        }];
                    

                    block_content = (
                        <div style={{ width: '90%' }}>
                            {/* 数据表格 */}
                            <div className="search-result-list">
                                <Table columns={columns} //列定义
                                    loading={this.state.loading}
                                    pagination={false}
                                    dataSource={this.state.data}//数据
                                    bordered

                                />

                                <div style={{color:'#f00',float:'right',paddingTop:'20px',fontWeight:'bold'}}>合计：{ formatMoney(this.state.total) } 元</div>

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
        getByIdsForOrderView: bindActionCreators(getByIdsForOrderView, dispatch),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedProductView);
